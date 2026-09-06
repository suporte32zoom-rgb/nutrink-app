/**
 * Safe API Client for NutrinK
 * Prevents "Unexpected token '<', '<!DOCTYPE '... is not valid JSON" errors
 * by validating status, checking content-type, and inspecting raw text before parsing.
 */

export interface SafeFetchResponse<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
  isHtml?: boolean;
}

/**
 * Safely executes a fetch request and parses JSON response without crashing if the server returns HTML.
 */
export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<SafeFetchResponse<T>> {
  const urlString = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : (input as Request).url);

  try {
    const response = await fetch(input, init);
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    const rawText = await response.text();

    const trimmedText = rawText.trim();
    const isHtmlResponse =
      trimmedText.startsWith('<!DOCTYPE') ||
      trimmedText.startsWith('<!doctype') ||
      trimmedText.startsWith('<html') ||
      trimmedText.startsWith('<HTML') ||
      contentType.includes('text/html');

    if (isHtmlResponse) {
      console.warn(
        `[NutrinK API Warn] Endpoint '${urlString}' retornou HTML (Status: ${response.status}) em vez de JSON estruturado.`,
        `Preview: ${trimmedText.slice(0, 120)}...`
      );

      return {
        ok: false,
        status: response.status,
        data: null,
        isHtml: true,
        error: response.status === 404
          ? `Rota não encontrada (${response.status}) no servidor. Verifique a configuração da hospedagem.`
          : `O servidor retornou uma página HTML (${response.status}) em vez de uma resposta JSON estruturada.`
      };
    }

    // Try parsing JSON
    let parsedData: T | null = null;
    if (trimmedText.length > 0) {
      try {
        parsedData = JSON.parse(trimmedText);
      } catch (parseError) {
        console.warn(
          `[NutrinK API Warn] Não foi possível converter a resposta de '${urlString}' em JSON.`,
          `Conteúdo: ${trimmedText.slice(0, 100)}`
        );
        return {
          ok: false,
          status: response.status,
          data: null,
          error: 'A resposta do servidor continha um formato inválido de dados.'
        };
      }
    }

    if (!response.ok) {
      const errorMessage =
        (parsedData as any)?.error ||
        (parsedData as any)?.message ||
        `Falha na requisição com código de status HTTP ${response.status}.`;

      return {
        ok: false,
        status: response.status,
        data: parsedData,
        error: errorMessage
      };
    }

    return {
      ok: true,
      status: response.status,
      data: parsedData
    };
  } catch (networkError: any) {
    console.error(`[NutrinK API Error] Falha de comunicação de rede ao acessar '${urlString}':`, networkError);
    return {
      ok: false,
      status: 0,
      data: null,
      error: networkError?.message || 'Sem conexão com o servidor. Verifique sua internet.'
    };
  }
}
