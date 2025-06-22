import { useCallback } from 'react';

const useOutlookAuth = () => {
  const initiateOutlookLogin = useCallback(() => {
    try {
      // Get environment variables
      const clientId = process.env.REACT_APP_MICROSOFT_CLIENT_ID;
      const redirectUri = process.env.REACT_APP_MICROSOFT_REDIRECT_URI;
      
      if (!clientId) {
        console.error('Microsoft Client ID not configured');
        return;
      }
      
      if (!redirectUri) {
        console.error('Microsoft Redirect URI not configured');
        return;
      }

      // OAuth2 parameters
      const scope = 'openid profile offline_access User.Read Mail.Read';
      const responseType = 'code';
      const state = Math.random().toString(36).substring(2, 15);
      const responseMode = 'query';

      // Store state in sessionStorage for validation
      sessionStorage.setItem('microsoft_oauth_state', state);

      // Build authorization URL
      const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
      authUrl.searchParams.append('client_id', clientId);
      authUrl.searchParams.append('response_type', responseType);
      authUrl.searchParams.append('redirect_uri', redirectUri);
      authUrl.searchParams.append('scope', scope);
      authUrl.searchParams.append('state', state);
      authUrl.searchParams.append('response_mode', responseMode);

      // Redirect to Microsoft OAuth2
      window.location.href = authUrl.toString();
    } catch (error) {
      console.error('Error initiating Outlook login:', error);
    }
  }, []);

  return {
    initiateOutlookLogin,
  };
};

export default useOutlookAuth; 