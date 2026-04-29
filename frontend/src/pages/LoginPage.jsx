import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate("/", { replace: true });
    } catch (err) {
      /* handle common Firebase popup issues gracefully */
      if (err.code === "auth/popup-blocked") {
        setError("Popup was blocked by your browser. Please allow popups for this site and try again.");
      } else if (err.code === "auth/cancelled-popup-request") {
        /* user clicked sign-in again before first popup resolved — ignore */
      } else if (err.code === "auth/popup-closed-by-user") {
        /* user closed the popup — do nothing */
      } else {
        setError(err.message || "Sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <section className="login-panel">
        <span className="eyebrow">Production-Grade Estimation</span>
        <h1>Secure AWS Cost Modeling</h1>
        <p>
          Sign in with Firebase to access authenticated estimation, compare scenarios, and
          optimization guidance.
        </p>
        {error && <p className="login-error">{error}</p>}
        <button
          type="button"
          className="primary-button"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
      </section>
    </div>
  );
}
