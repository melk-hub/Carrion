import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const authSuccess = searchParams.get('auth');

        // Handle OAuth2 errors
        if (error) {
          console.error('OAuth2 Error:', error, errorDescription);
          setError(errorDescription || error);
          setLoading(false);
          return;
        }

        // Handle successful authentication
        if (authSuccess === 'success') {
          setTimeout(() => {
            navigate('/home');
          }, 1000);
          setLoading(false);
          return;
        }

        // Validate state parameter for Microsoft OAuth2
        if (state) {
          const storedState = sessionStorage.getItem('microsoft_oauth_state');
          if (state !== storedState) {
            console.error('State mismatch - possible CSRF attack');
            setError('Authentication failed: Invalid state parameter');
            setLoading(false);
            return;
          }

          // Clean up stored state
          sessionStorage.removeItem('microsoft_oauth_state');
        }

        if (code) {
          // The backend will handle the code exchange
          // Since the backend redirects directly, we should not reach here
          // unless there's an error
          navigate('/home');
        } else {
          setError('No authorization code received');
        }
      } catch (err) {
        console.error('Callback handling error:', err);
        setError('Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="auth-callback-container">
        <div className="loading-spinner">
          <p>{t('auth.processing')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-callback-container">
        <div className="error-message">
          <h2>{t('auth.authenticationFailed')}</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/login')}>
            {t('auth.backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-callback-container">
      <div className="success-message">
        <h2>{t('auth.authenticationSuccess')}</h2>
        <p>{t('auth.redirecting')}</p>
      </div>
    </div>
  );
};

export default AuthCallback; 