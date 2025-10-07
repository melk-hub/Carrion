"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "../../contexts/LanguageContext";
import Loading from "../../components/Loading";

function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const handleCallback = () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        const authSuccess = searchParams.get("auth");

        if (errorParam) {
          console.error("OAuth2 Error:", errorParam, errorDescription);
          setError(errorDescription || errorParam);
          setLoading(false);
          return;
        }

        if (authSuccess === "success") {
          setTimeout(() => {
            router.replace("/home");
          }, 1000);
          setLoading(false);
          return;
        }

        if (state) {
          const storedState = sessionStorage.getItem("microsoft_oauth_state");
          if (state !== storedState) {
            console.error("State mismatch - possible CSRF attack");
            setError("Authentication failed: Invalid state parameter");
            setLoading(false);
            return;
          }
          sessionStorage.removeItem("microsoft_oauth_state");
        }
        if (code) {
          router.replace("/home");
        } else {
          setError("No authorization code or success parameter received");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Callback handling error:", err);
          setError(err.message || "Authentication failed");
        } else {
          console.error("Unknown error in callback handling:", err);
          setError("Unknown authentication error");
        }
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="auth-callback-container">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-callback-container">
        <div className="error-message">
          <h2>{t("auth.authenticationFailed") as string}</h2>
          <p>{error}</p>
          <button onClick={() => router.push("/")}>
            {t("auth.backToLogin") as string}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-callback-container">
      <div className="success-message">
        <h2>{t("auth.authenticationSuccess") as string}</h2>
        <p>{t("auth.redirecting") as string}</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AuthCallback />
    </Suspense>
  );
}
