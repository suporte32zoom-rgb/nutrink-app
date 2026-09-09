import React, { useEffect, useRef } from 'react';
import { getGoogleClientId, getGoogleLoginUri, parseGoogleJwt, GoogleProfile, loadGoogleGsiScript } from '../services/googleAuth';

interface GoogleLoginButtonProps {
  onSuccess: (profile: GoogleProfile) => void;
  onError?: (error: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: string;
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  className?: string;
  uxMode?: 'redirect' | 'popup';
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  text = 'continue_with',
  theme = 'outline',
  size = 'large',
  width = '100%',
  shape = 'rectangular',
  className = '',
  uxMode = 'redirect'
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function setupGsi() {
      await loadGoogleGsiScript();

      if (!isMounted || !window.google?.accounts?.id || !buttonRef.current) return;

      const clientId = getGoogleClientId();
      const loginUri = getGoogleLoginUri();

      try {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const effectiveUxMode = uxMode === 'redirect' || isMobile ? 'redirect' : 'popup';

        const initConfig: any = {
          client_id: clientId,
          ux_mode: effectiveUxMode,
          auto_select: false,
          cancel_on_tap_outside: true,
        };

        if (effectiveUxMode === 'redirect') {
          initConfig.login_uri = loginUri;
        } else {
          initConfig.callback = (response: { credential?: string; select_by?: string }) => {
            if (response.credential) {
              const profile = parseGoogleJwt(response.credential);
              if (profile) {
                onSuccess(profile);
              } else if (onError) {
                onError('Não foi possível processar as credenciais retornadas pelo Google.');
              }
            } else if (onError) {
              onError('Nenhuma credencial retornada pelo Google.');
            }
          };
        }

        window.google.accounts.id.initialize(initConfig);

        // Clear container before re-rendering
        if (buttonRef.current) {
          buttonRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(buttonRef.current, {
            type: 'standard',
            theme: theme,
            size: size,
            text: text,
            shape: shape,
            logo_alignment: 'left',
            width: typeof width === 'number' ? width : undefined,
            locale: 'pt-BR'
          });
        }
      } catch (err: any) {
        console.warn('[NutrinK GIS Button Error]:', err);
      }
    }

    setupGsi();

    return () => {
      isMounted = false;
    };
  }, [onSuccess, onError, text, theme, size, width, shape, uxMode]);

  return (
    <div className={`google-login-container w-full flex justify-center ${className}`}>
      <div ref={buttonRef} className="w-full flex justify-center min-h-[44px]" />
    </div>
  );
};

export default GoogleLoginButton;

