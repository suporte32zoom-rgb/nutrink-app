import React, { useEffect, useRef } from 'react';
import { getGoogleClientId, parseGoogleJwt, GoogleProfile, loadGoogleGsiScript } from '../services/googleAuth';

interface GoogleLoginButtonProps {
  onSuccess: (profile: GoogleProfile) => void;
  onError?: (error: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: string;
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  className?: string;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  text = 'continue_with',
  theme = 'outline',
  size = 'large',
  width = '100%',
  shape = 'rectangular',
  className = ''
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function setupGsi() {
      await loadGoogleGsiScript();

      if (!isMounted || !window.google?.accounts?.id || !buttonRef.current) return;

      const clientId = getGoogleClientId();

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential?: string; select_by?: string }) => {
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
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

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
  }, [onSuccess, onError, text, theme, size, width, shape]);

  return (
    <div className={`google-login-container w-full flex justify-center ${className}`}>
      <div ref={buttonRef} className="w-full flex justify-center min-h-[44px]" />
    </div>
  );
};

export default GoogleLoginButton;
