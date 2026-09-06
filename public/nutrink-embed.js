/**
 * NutrinK Universal Embed SDK & Bridge (v1.0.0)
 * Compatível com Hostinger, WordPress e os seguintes frameworks:
 * Frontend: Angular, Astro, Gatsby, Next.js, Nitro, Nuxt, Parcel, React, React Router, Svelte, SvelteKit, Vite, Vue.js
 * Backend: Astro, Express, Fastify, Hono, NestJS, Next.js, Nitro, Nuxt, React Router, SvelteKit
 * Node.js: 18.x, 20.x, 22.x, 24.x | Package Managers: npm, yarn, pnpm
 */
(function (global) {
  'use strict';

  var NutrinK = {
    version: '1.0.0',
    supportedNodeVersions: ['18.x', '20.x', '22.x', '24.x'],
    supportedPackageManagers: ['npm', 'yarn', 'pnpm'],
    compatibleFrontendFrameworks: [
      'Angular', 'Astro', 'Gatsby', 'Next.js', 'Nitro', 'Nuxt',
      'Parcel', 'React', 'React Router', 'Svelte', 'SvelteKit', 'Vite', 'Vue.js'
    ],
    compatibleBackendFrameworks: [
      'Astro', 'Express', 'Fastify', 'Hono', 'NestJS', 'Next.js', 'Nitro', 'Nuxt', 'React Router', 'SvelteKit'
    ],

    /**
     * Monta o Iframe do NutrinK dentro de um container HTML
     */
    init: function (options) {
      options = options || {};
      var containerId = options.containerId || 'nutrink-app';
      var src = options.url || window.location.origin;
      var container = document.getElementById(containerId);

      if (!container) {
        console.error('[NutrinK Embed] Container #' + containerId + ' não foi encontrado na página.');
        return null;
      }

      var iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.title = 'NutrinK Copiloto Clínico';
      iframe.style.width = options.width || '100%';
      iframe.style.height = options.height || '100vh';
      iframe.style.minHeight = options.minHeight || '700px';
      iframe.style.border = 'none';
      iframe.style.display = 'block';
      iframe.setAttribute('allow', 'camera; microphone; geolocation; clipboard-write;');
      iframe.setAttribute('loading', 'lazy');

      container.innerHTML = '';
      container.appendChild(iframe);

      // Ouvir mensagens do NutrinK
      window.addEventListener('message', function (event) {
        if (!event.data || typeof event.data !== 'object') return;
        if (event.data.type === 'NUTRINK_APP_READY' && typeof options.onReady === 'function') {
          options.onReady(event.data);
        }
        if (event.data.type === 'NUTRINK_STATE_RESPONSE' && typeof options.onState === 'function') {
          options.onState(event.data);
        }
      });

      return {
        iframe: iframe,
        navigate: function (tab) {
          iframe.contentWindow.postMessage({ type: 'NUTRINK_NAVIGATE', tab: tab }, '*');
        },
        openModal: function (modalName) {
          iframe.contentWindow.postMessage({ type: 'NUTRINK_OPEN_MODAL', modal: modalName }, '*');
        },
        requestState: function () {
          iframe.contentWindow.postMessage({ type: 'NUTRINK_REQUEST_STATE' }, '*');
        }
      };
    }
  };

  global.NutrinK = NutrinK;
})(typeof window !== 'undefined' ? window : this);
