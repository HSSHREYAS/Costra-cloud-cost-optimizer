import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useAuth } from "../auth/AuthContext.jsx";

/* ── scroll-reveal hook ── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.12 },
    );
    root.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ── animated counter ── */
function AnimatedCounter({ end, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        let start = 0;
        const step = Math.max(1, Math.floor(end / 40));
        const id = setInterval(() => {
          start += step;
          if (start >= end) { setVal(end); clearInterval(id); }
          else setVal(start);
        }, 30);
        io.disconnect();
      },
      { threshold: 0.5 },
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [end]);

  return <span ref={ref}>{val}{suffix}</span>;
}

/* ── data ── */
const FEATURES = [
  {
    icon: "⚡",
    gradient: "linear-gradient(135deg, #0f6d64 0%, #0ea5e9 100%)",
    title: "Cost Estimator",
    desc: "Instantly model AWS costs with transparent, line-item breakdowns. Gauges, charts, and hourly projections — all in real time.",
    cta: "Launch Estimator",
    to: "/estimator",
  },
  {
    icon: "🌐",
    gradient: "linear-gradient(135deg, #f4b942 0%, #f97316 100%)",
    title: "Region Comparator",
    desc: "Deploy smarter. Pit multiple AWS regions against each other and discover the cheapest option for your workload in seconds.",
    cta: "Compare Now",
    to: "/compare",
  },
  {
    icon: "🧠",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
    title: "AI Recommendations",
    desc: "Our engine analyzes your config and suggests right-sizing, reserved instances, and storage optimizations with projected savings.",
    cta: "Get Insights",
    to: "/estimator",
  },
];

const STATS = [
  { value: 10, suffix: "+", label: "AWS Services" },
  { value: 15, suffix: "+", label: "Global Regions" },
  { value: 99, suffix: "%", label: "Accuracy" },
  { value: 24, suffix: "/7", label: "Live Pricing" },
];

const STEPS = [
  { num: "01", title: "Configure", desc: "Pick your AWS service, region, instance type, and usage duration." },
  { num: "02", title: "Estimate", desc: "Get an instant, detailed cost breakdown with interactive visualizations." },
  { num: "03", title: "Optimize", desc: "Review AI recommendations and slash your monthly cloud spend." },
];

export default function LandingPage() {
  const { user, authReady, signOutUser } = useAuth();
  const navigate = useNavigate();
  const wrapperRef = useReveal();
  const [scrolled, setScrolled] = useState(false);

  const isLoggedIn = authReady && !!user;
  const firstName = user?.displayName?.split(" ")[0] || "Cloud User";
  const currentYear = new Date().getFullYear();

  const initials = user?.displayName
    ? user.displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  /* scroll detection for navbar */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* smart navigation — go to page if logged in, else go to login */
  function goTo(path) {
    if (isLoggedIn) {
      navigate(path);
    } else {
      navigate("/login");
    }
  }

  return (
    <div className="landing" ref={wrapperRef}>
      {/* ── animated grid background ── */}
      <div className="landing-grid-bg" aria-hidden="true" />

      {/* ── floating orbs ── */}
      <div className="landing-orb landing-orb--1" aria-hidden="true" />
      <div className="landing-orb landing-orb--2" aria-hidden="true" />
      <div className="landing-orb landing-orb--3" aria-hidden="true" />
      <div className="landing-orb landing-orb--4" aria-hidden="true" />

      {/* ══════════ NAVBAR ══════════ */}
      <header className={`topnav ${scrolled ? "topnav--scrolled" : ""}`}>
        <div className="topnav-inner">
          <Link to="/" className="topnav-brand">
            <span className="topnav-logo">☁️</span>
            <span className="topnav-brand-text">
              Smart Cost<strong>Advisor</strong>
            </span>
          </Link>

          {isLoggedIn ? (
            <>
              <nav className="topnav-links">
                <Link to="/" className="topnav-link topnav-link--active">Home</Link>
                <Link to="/estimator" className="topnav-link">Estimator</Link>
                <Link to="/compare" className="topnav-link">Compare</Link>
              </nav>
              <div className="topnav-right">
                <div className="topnav-user">
                  <span className="topnav-avatar">{initials}</span>
                  <button type="button" className="topnav-signout" onClick={signOutUser}>
                    Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="topnav-right">
              <Link to="/login" className="topnav-get-started">
                Get Started →
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ══════════ HERO ══════════ */}
      <section className="landing-hero reveal">
        <div className="landing-badge">
          <span className="landing-badge-dot" />
          Smart Cost Advisor — Live
        </div>

        <h1 className="landing-headline">
          {isLoggedIn ? (
            <>Welcome back,<br /><span className="landing-highlight">{firstName}</span></>
          ) : (
            <>Optimize Your<br /><span className="landing-highlight">Cloud Costs</span></>
          )}
        </h1>

        <p className="landing-subline">
          Real-time AWS cost estimation, cross-region comparison, and
          AI-powered optimization — engineered for cloud-native teams.
        </p>

        <div className="landing-cta-row">
          <button
            type="button"
            className="landing-btn landing-btn--primary"
            onClick={() => goTo("/estimator")}
          >
            <span className="landing-btn-glow" />
            {isLoggedIn ? "🚀 Launch Estimator" : "🚀 Get Started"}
          </button>
          <button
            type="button"
            className="landing-btn landing-btn--glass"
            onClick={() => goTo("/compare")}
          >
            🌍 Compare Regions
          </button>
        </div>

        {/* trust badges */}
        <div className="landing-trust">
          <span>🔒 Firebase Auth</span>
          <span>⚡ Sub-second Estimates</span>
          <span>🧠 AI-Powered</span>
        </div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <section className="landing-stats reveal">
        {STATS.map((s) => (
          <div className="landing-stat" key={s.label}>
            <strong><AnimatedCounter end={s.value} suffix={s.suffix} /></strong>
            <span>{s.label}</span>
          </div>
        ))}
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section className="landing-features">
        <span className="landing-section-eyebrow reveal">Capabilities</span>
        <h2 className="landing-section-title reveal">
          Everything you need to<br /><span className="landing-highlight">master cloud costs</span>
        </h2>
        <div className="landing-feature-grid">
          {FEATURES.map((f, i) => (
            <article
              key={f.title}
              className="landing-feature-card reveal"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="landing-feature-card-glow" style={{ background: f.gradient }} />
              <span className="landing-feature-icon" style={{ background: f.gradient }}>
                {f.icon}
              </span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <button
                type="button"
                className="landing-feature-cta"
                onClick={() => goTo(f.to)}
              >
                {f.cta}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="landing-steps">
        <span className="landing-section-eyebrow reveal">Workflow</span>
        <h2 className="landing-section-title reveal">
          Three steps to <span className="landing-highlight">savings</span>
        </h2>
        <div className="landing-steps-grid">
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              className="landing-step reveal"
              style={{ transitionDelay: `${i * 140}ms` }}
            >
              <span className="landing-step-num">{s.num}</span>
              <div className="landing-step-connector" />
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ CTA BANNER ══════════ */}
      <section className="landing-cta-banner reveal">
        <h2>Ready to optimize your cloud spend?</h2>
        <p>Start estimating costs and discover savings opportunities in under 30 seconds.</p>
        <button
          type="button"
          className="landing-btn landing-btn--primary landing-btn--lg"
          onClick={() => goTo("/estimator")}
        >
          <span className="landing-btn-glow" />
          {isLoggedIn ? "Open Estimator →" : "Get Started Free →"}
        </button>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="landing-footer reveal">
        <div className="landing-footer-brand">
          <span className="landing-footer-logo">☁️</span>
          <strong>Smart Cost Advisor</strong>
        </div>
        <div className="landing-footer-divider" />
        <p className="landing-footer-credits">
          Built by <strong>Shreyas</strong> &amp; <strong>Chaithanya</strong>
        </p>
        <p className="landing-footer-legal">
          © {currentYear} Smart Cost Advisor. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
