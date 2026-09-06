# 🚀 Guia de Publicação e Execução na Hostinger (Node.js)

O pacote **NutrinK** (`nutrink-app.zip`) está 100% configurado e **pré-compilado** para iniciar imediatamente em qualquer plano da Hostinger (Hospedagem Compartilhada, Business, Cloud ou VPS).

---

## 💡 Por que o ZIP não estava carregando antes?

1. **Falta da pasta `dist/` pré-compilada**: No gerenciador Node.js tradicional do hPanel da Hostinger, o servidor **não** roda comandos de compilação (`npm run build`) automaticamente; ele apenas executa o arquivo de inicialização (`server.js`). Sem a pasta `dist/` gerada, o site ficava em branco ou retornava erro 503.
2. **Pasta `dist/` agora incluída no ZIP**: O ZIP agora contém tanto os arquivos-fonte quanto a pasta `dist/` completa (com o frontend React e o servidor backend `dist/server.mjs` pré-compilados).
3. **Ponto de entrada universal (`server.js`)**: O arquivo `server.js` na raiz carrega automaticamente o servidor de produção compilado, garantindo compatibilidade com o seletor Node.js da Hostinger.
4. **Extração na pasta errada**: Ao extrair o ZIP no Gerenciador de Arquivos, certifique-se de que os arquivos fiquem diretamente dentro de `public_html` (e não dentro de uma subpasta `public_html/nutrink-app/...`).

---

## 🛠️ Passo a Passo para Publicar no hPanel da Hostinger

### Método Recomendado: Gerenciador de Arquivos + Seção Node.js

1. **Baixe o arquivo ZIP**:
   - Baixe o arquivo `nutrink-app.zip` (gerado na raiz do projeto).
2. **Envie para a Hostinger**:
   - No hPanel da Hostinger, abra o **Gerenciador de Arquivos** (File Manager).
   - Acesse a pasta do seu domínio (geralmente `public_html`).
   - Clique em **Enviar / Carregar (Upload)** e selecione o `nutrink-app.zip`.
3. **Extraia os arquivos na raiz**:
   - Clique com o botão direito no `nutrink-app.zip` e escolha **Extrair (Extract)**.
   - **IMPORTANTE**: No campo de destino da extração, digite apenas `.` (ponto) ou deixe para extrair na pasta atual (`public_html`).
   - Verifique se os arquivos `package.json`, `server.js` e a pasta `dist/` estão visíveis diretamente na pasta `public_html`.
4. **Configure o Node.js no hPanel**:
   - No menu lateral do hPanel, vá em **Avançado** > **Node.js** (ou pesquise por "Node.js").
   - Preencha os campos:
     - **Versão do Node.js**: Selecione **20.x** ou **22.x**
     - **Modo do aplicativo**: **Produção**
     - **Raiz do aplicativo (Application Root)**: `public_html`
     - **Arquivo de inicialização (Application Startup File)**: `server.js`
5. **Instale as dependências**:
   - Clique no botão **NPM Install** (ou **Instalar Dependências**) e aguarde a conclusão.
6. **Inicie o Aplicativo**:
   - Clique em **Iniciar Aplicativo** (ou **Reiniciar / Restart**).
   - Acesse o seu domínio. O NutrinK estará no ar imediatamente!

---

## 📦 Estrutura de Arquivos no ZIP

```text
/ (raiz de public_html)
├── dist/                  <-- Frontend React e Backend server.mjs já compilados e prontos
│   ├── index.html
│   ├── server.mjs
│   └── assets/
├── package.json           <-- Configurado com Node.js 20.x/22.x e scripts de produção
├── server.js              <-- Ponto de entrada oficial reconhecido pelo hPanel da Hostinger
├── server.ts              <-- Código-fonte do servidor Express em TypeScript
├── vite.config.ts         <-- Configuração do Vite
├── index.html             <-- Ponto de entrada HTML do cliente
├── tsconfig.json          <-- Configuração TypeScript
├── .htaccess              <-- Regras LiteSpeed/Apache para SPA e roteamento
├── .env.example           <-- Exemplo de variáveis de ambiente (.env)
├── src/                   <-- Código-fonte dos componentes React
└── public/                <-- Ícones, manifest PWA e assets estáticos
```

---

## ⚡ Comandos e Scripts do `package.json`

- `npm start`: Inicia o servidor Node.js de produção (`node server.js`).
- `npm run build`: Recompila o frontend com o Vite e o backend com o esbuild.
- `npm run dev`: Inicia o ambiente de desenvolvimento local (`tsx server.ts`).

