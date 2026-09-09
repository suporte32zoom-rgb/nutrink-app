/**
 * Google Identity Services (GSI) & Google OAuth 2.0 Client Service
 * For NutrinK Clinical Health Platform
 */

export interface GoogleProfile {
  sub: string;
  id?: string;
  name: string;
  given_name?: string;
  family_name?: string;
  email: string;
  email_verified?: boolean;
  picture?: string;
  locale?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
          disableAutoSelect: () => void;
          revoke: (hint: string, done: () => void) => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              error_description?: string;
              expires_in?: number;
            }) => void;
            error_callback?: (err: any) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

// Configured or fallback Google Client ID
export const DEFAULT_GOOGLE_CLIENT_ID = '493300215926-9h58hp029m3fdbucbrhlt25ajh4miibs.apps.googleusercontent.com';

export function getGoogleClientId(): string {
  const envId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
  if (envId) return envId;
  return DEFAULT_GOOGLE_CLIENT_ID;
}

/**
 * Parses JWT ID Token issued by Google Accounts
 */
export function parseGoogleJwt(token: string): GoogleProfile | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return {
      sub: parsed.sub || parsed.id || '',
      id: parsed.sub || parsed.id,
      name: parsed.name || `${parsed.given_name || ''} ${parsed.family_name || ''}`.trim() || 'Profissional de Saúde',
      given_name: parsed.given_name,
      family_name: parsed.family_name,
      email: parsed.email || '',
      email_verified: parsed.email_verified,
      picture: parsed.picture || '',
      locale: parsed.locale
    };
  } catch (error) {
    console.error('Erro ao decodificar token Google JWT:', error);
    return null;
  }
}

/**
 * Loads the Google GSI script dynamically if not already loaded
 */
export function loadGoogleGsiScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.google?.accounts?.id || window.google?.accounts?.oauth2) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Não foi possível carregar o script oficial do Google GSI.');
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

/**
 * Fetches user profile from Google UserInfo endpoint with OAuth2 Access Token
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleProfile | null> {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Google UserInfo retornou status ${response.status}`);
    }

    const data = await response.json();
    return {
      sub: data.sub || data.id,
      id: data.sub || data.id,
      name: data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim() || 'Profissional de Saúde',
      given_name: data.given_name,
      family_name: data.family_name,
      email: data.email,
      email_verified: data.email_verified,
      picture: data.picture,
      locale: data.locale,
    };
  } catch (err) {
    console.error('Erro ao buscar dados do perfil do Google via Token:', err);
    return null;
  }
}

/**
 * Launches real Google OAuth 2.0 popup flow
 */
export async function initiateGoogleOAuthPopup(
  onSuccess: (profile: GoogleProfile) => void,
  onError: (errorMessage: string) => void
): Promise<void> {
  await loadGoogleGsiScript();

  const clientId = getGoogleClientId();

  // Helper to handle success response
  const handleProfileSuccess = (profile: GoogleProfile) => {
    onSuccess(profile);
  };

  // 1. Try Google Identity Services (GSI) Token Client if available in window
  if (window.google?.accounts?.oauth2) {
    try {
      let isSettled = false;

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (response) => {
          if (isSettled) return;
          if (response.error) {
            console.warn('Erro retornado pelo popup do Google:', response.error_description || response.error);
            // Ignore normal user dismissal gracefully without intrusive error banner
            if (response.error === 'popup_closed' || response.error === 'access_denied') {
              onError('');
            } else {
              onError(response.error_description || response.error || 'Autenticação Google cancelada.');
            }
            isSettled = true;
            return;
          }

          if (response.access_token) {
            isSettled = true;
            const profile = await fetchGoogleUserInfo(response.access_token);
            if (profile && profile.email) {
              handleProfileSuccess(profile);
            } else {
              onError('Não foi possível obter os dados do perfil Google.');
            }
          }
        },
        error_callback: (err) => {
          if (isSettled) return;
          console.warn('Google GSI OAuth notice:', err);
          const errType = (typeof err === 'string' ? err : err?.type || err?.message || '');
          if (errType.includes('closed') || errType.includes('cancel')) {
            // User closed the popup manually
            onError('');
          } else {
            onError(errType || 'Janela de autenticação fechada.');
          }
          isSettled = true;
        }
      });

      client.requestAccessToken({ prompt: 'select_account' });
      return;
    } catch (e: any) {
      console.warn('Falha ao instanciar initTokenClient, usando popup OAuth padrão:', e);
    }
  }

  // 2. Direct OAuth 2.0 Web Popup with PostMessage Listener
  const redirectUri = `${window.location.origin}/auth/google/callback`;
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=token%20id_token&scope=${encodeURIComponent(
    'openid email profile'
  )}&nonce=${Date.now()}&prompt=select_account`;

  try {
    const width = 500;
    const height = 650;
    const left = Math.max(0, (window.screen.width - width) / 2);
    const top = Math.max(0, (window.screen.height - height) / 2);

    const popup = window.open(
      googleAuthUrl,
      'google_login_popup',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
    );

    if (!popup || popup.closed) {
      onError('O bloqueador de popups do seu navegador impediu a abertura da janela do Google. Por favor, permita popups para este site.');
      return;
    }

    // Listen for postMessage from popup callback
    let messageReceived = false;
    const messageHandler = async (event: MessageEvent) => {
      // Security check
      if (event.origin !== window.location.origin && !event.origin.endsWith('.run.app') && !event.origin.includes('localhost')) {
        return;
      }

      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        messageReceived = true;
        window.removeEventListener('message', messageHandler);

        const { accessToken, idToken } = event.data;
        if (idToken) {
          const profile = parseGoogleJwt(idToken);
          if (profile) {
            handleProfileSuccess(profile);
            return;
          }
        }
        if (accessToken) {
          const profile = await fetchGoogleUserInfo(accessToken);
          if (profile) {
            handleProfileSuccess(profile);
            return;
          }
        }
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        messageReceived = true;
        window.removeEventListener('message', messageHandler);
        onError(event.data.error || 'Falha na autenticação com o Google.');
      }
    };

    window.addEventListener('message', messageHandler);

    // Watch for popup window closure
    const checkInterval = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkInterval);
        setTimeout(() => {
          window.removeEventListener('message', messageHandler);
          if (!messageReceived) {
            // User closed the popup window without completing auth
            onError('');
          }
        }, 800);
      }
    }, 500);

  } catch (err: any) {
    console.error('Erro ao abrir popup do Google:', err);
    onError('Não foi possível iniciar a autenticação do Google.');
  }
}
