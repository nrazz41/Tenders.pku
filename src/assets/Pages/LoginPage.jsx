// src/Pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await login(username, password);

    if (result?.success) {
      if (result.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } else {
navigate("/");    }

    setIsLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* ---- LEFT PANEL ---- */
        .login-left {
          position: relative;
          background: #1a0a00;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          overflow: hidden;
        }

        .left-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
          pointer-events: none;
        }
        .left-blob-1 {
          width: 400px; height: 400px;
          background: #f97316;
          top: -100px; left: -100px;
          animation: blobPulse 7s ease-in-out infinite alternate;
        }
        .left-blob-2 {
          width: 300px; height: 300px;
          background: #dc2626;
          bottom: -80px; right: -80px;
          animation: blobPulse 9s ease-in-out infinite alternate-reverse;
        }
        .left-blob-3 {
          width: 200px; height: 200px;
          background: #ea580c;
          top: 50%; left: 60%;
          transform: translate(-50%, -50%);
          animation: blobPulse 5s ease-in-out infinite alternate;
        }

        @keyframes blobPulse {
          from { transform: scale(1) translate(0, 0); }
          to   { transform: scale(1.15) translate(10px, -15px); }
        }

        /* Noise texture overlay */
        .left-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.4;
        }

        .left-content {
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .logo-ring {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 3px solid rgba(249, 115, 22, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 32px;
          position: relative;
          animation: ringRotate 12s linear infinite;
        }
        .logo-ring::before {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 1px solid rgba(249, 115, 22, 0.2);
          animation: ringRotate 8s linear infinite reverse;
        }
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .logo-ring img {
          width: 82px;
          height: 82px;
          border-radius: 50%;
          object-fit: cover;
          animation: ringRotate 12s linear infinite reverse;
        }

        .brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 52px;
          font-weight: 900;
          color: #fff;
          line-height: 1;
          letter-spacing: -1px;
        }
        .brand-name span {
          color: #f97316;
        }

        .brand-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-top: 8px;
        }

        .brand-divider {
          width: 48px;
          height: 2px;
          background: linear-gradient(90deg, #f97316, #dc2626);
          margin: 28px auto;
          border-radius: 2px;
        }

        .brand-tagline {
          font-size: 15px;
          color: rgba(255,255,255,0.6);
          font-weight: 300;
          line-height: 1.6;
          max-width: 280px;
        }
        .brand-tagline strong {
          color: #fb923c;
          font-weight: 500;
        }

        /* Floating chips */
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(249,115,22,0.12);
          border: 1px solid rgba(249,115,22,0.25);
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 12px;
          color: #fb923c;
          margin: 4px;
          font-weight: 500;
        }
        .chip-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #f97316;
          animation: chipPulse 2s ease-in-out infinite;
        }
        @keyframes chipPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        .chips-row {
          margin-top: 28px;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }

        /* ---- RIGHT PANEL ---- */
        .login-right {
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
          position: relative;
        }

        .login-right::before {
          content: '';
          position: absolute;
          top: 0; bottom: 0; left: 0;
          width: 1px;
          background: linear-gradient(to bottom, transparent, #f97316 30%, #dc2626 70%, transparent);
          opacity: 0.4;
        }

        /* subtle grid bg */
        .login-right::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(249,115,22,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .form-wrapper {
          width: 100%;
          max-width: 380px;
          position: relative;
          z-index: 1;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s;
        }
        .form-wrapper.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        .form-heading {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 700;
          color: #111;
          line-height: 1.1;
          margin-bottom: 6px;
        }
        .form-heading em {
          font-style: italic;
          color: #f97316;
        }

        .form-subheading {
          font-size: 14px;
          color: #888;
          font-weight: 300;
          margin-bottom: 36px;
        }

        /* Error */
        .error-box {
          background: #fff5f5;
          border: 1px solid #fecaca;
          border-left: 3px solid #dc2626;
          border-radius: 8px;
          padding: 12px 14px;
          color: #dc2626;
          font-size: 13px;
          margin-bottom: 20px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          animation: shakeError 0.4s ease;
        }
        @keyframes shakeError {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
        .error-icon {
          width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px;
          background: #dc2626;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 10px; font-weight: 700;
        }

        /* Field group */
        .field-group {
          margin-bottom: 18px;
        }
        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #555;
          margin-bottom: 8px;
        }
        .field-input-wrap {
          position: relative;
        }
        .field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #ccc;
          pointer-events: none;
          transition: color 0.2s;
        }
        .field-input {
          width: 100%;
          padding: 14px 14px 14px 44px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: #111;
          background: #fafafa;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .field-input:focus {
          border-color: #f97316;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
        }
        .field-input:focus + .field-focus-line {
          transform: scaleX(1);
        }
        .field-input:focus ~ .field-icon-left {
          color: #f97316;
        }
        .field-input-wrap:focus-within .field-icon {
          color: #f97316;
        }
        .field-input::placeholder {
          color: #ccc;
        }

        /* Password toggle */
        .pw-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #bbb;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .pw-toggle:hover { color: #f97316; }

        /* Submit button */
        .submit-btn {
          width: 100%;
          padding: 15px;
          background: #111;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: 0.5px;
          cursor: pointer;
          margin-top: 8px;
          position: relative;
          overflow: hidden;
          transition: background 0.3s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #f97316, #dc2626);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .submit-btn:hover::before { opacity: 1; }
        .submit-btn:hover { transform: translateY(-1px); }
        .submit-btn:active { transform: translateY(0); }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .submit-btn span { position: relative; z-index: 1; }

        /* Spinner */
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          position: relative; z-index: 1;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Or divider */
        .or-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
          color: #ddd;
          font-size: 12px;
        }
        .or-divider::before,
        .or-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }

        /* Sign up link */
        .signup-row {
          text-align: center;
          font-size: 14px;
          color: #888;
        }
        .signup-link {
          color: #f97316;
          font-weight: 500;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s;
        }
        .signup-link:hover { border-color: #f97316; }

        /* Demo box */
        .demo-box {
          margin-top: 28px;
          padding: 14px 16px;
          background: #fffbf7;
          border: 1px dashed #fed7aa;
          border-radius: 10px;
        }
        .demo-box-title {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #f97316;
          margin-bottom: 8px;
        }
        .demo-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #666;
          padding: 4px 0;
          border-bottom: 1px solid #fde8d0;
        }
        .demo-row:last-child { border-bottom: none; }
        .demo-role {
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 20px;
          font-weight: 500;
          letter-spacing: 0.5px;
        }
        .demo-role.admin {
          background: #fef2f2;
          color: #dc2626;
        }
        .demo-role.customer {
          background: #f0fdf4;
          color: #16a34a;
        }
        .demo-creds {
          font-family: monospace;
          font-size: 12px;
          color: #555;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .login-root {
            grid-template-columns: 1fr;
          }
          .login-left {
            padding: 40px 24px 32px;
            min-height: 260px;
          }
          .brand-name { font-size: 38px; }
          .logo-ring { width: 72px; height: 72px; margin-bottom: 20px; }
          .logo-ring img { width: 58px; height: 58px; }
          .chips-row { display: none; }
          .login-right { padding: 32px 24px; }
          .form-heading { font-size: 28px; }
        }
      `}</style>

      <div className="login-root">

        {/* ===== LEFT PANEL ===== */}
        <div className="login-left">
          <div className="left-blob left-blob-1" />
          <div className="left-blob left-blob-2" />
          <div className="left-blob left-blob-3" />
          <div className="left-noise" />

          <div className="left-content">
            <div className="logo-ring">
              <img
                src="/images/Logo.png"
                alt="Tenders PKU"
                onError={(e) => {
                  e.target.src = "https://placehold.co/82x82/f97316/ffffff?text=T";
                }}
              />
            </div>

            <div className="brand-name">
              TENDERS<br />
              <span>PKU</span>
            </div>
            <div className="brand-sub">First Street Nashville Hot Chicken</div>

            <div className="brand-divider" />

            <p className="brand-tagline">
              Chicken tender <strong>crispy</strong> dengan bumbu khas Nashville.<br />
              Pesan online, nikmati <strong>di mana saja</strong>.
            </p>

            <div className="chips-row">
              <span className="chip"><span className="chip-dot" />GoFood</span>
              <span className="chip"><span className="chip-dot" />ShopeeFood</span>
              <span className="chip"><span className="chip-dot" />Pekanbaru</span>
            </div>
          </div>
        </div>

        {/* ===== RIGHT PANEL ===== */}
        <div className="login-right">
          <div className={`form-wrapper ${mounted ? "mounted" : ""}`}>

            <div className="form-heading">
              Selamat<br /><em>Datang</em> Kembali
            </div>
            <p className="form-subheading">
              Masuk untuk melanjutkan pesanan Anda
            </p>

            {/* Error */}
            {error && (
              <div className="error-box">
                <div className="error-icon">!</div>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} autoComplete="off">

              {/* Username */}
              <div className="field-group">
                <label className="field-label">Username atau Email</label>
                <div className="field-input-wrap">
                  <span className="field-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="admin atau email@kamu.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field-group">
                <label className="field-label">Password</label>
                <div className="field-input-wrap">
                  <span className="field-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="field-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="spinner" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk Sekarang</span>
                    <span style={{ position: "relative", zIndex: 1 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </span>
                  </>
                )}
              </button>
            </form>

            <div className="or-divider">Belum punya akun?</div>

            <div className="signup-row">
              <Link to="/signup" className="signup-link">
                Daftar Sekarang →
              </Link>
            </div>

            {/* Demo credentials */}
            <div className="demo-box">
              <div className="demo-box-title">Demo Akun</div>
              <div className="demo-row">
                <span className="demo-creds">admin / admin123</span>
                <span className="demo-role admin">Admin</span>
              </div>
              <div className="demo-row">
                <span className="demo-creds">daftar sendiri</span>
                <span className="demo-role customer">Customer</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
};

export default LoginPage;