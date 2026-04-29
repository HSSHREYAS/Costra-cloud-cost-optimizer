import { useState, useEffect } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";

import { useAuth } from "../auth/AuthContext.jsx";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/estimator", label: "Estimator" },
  { to: "/compare", label: "Compare" },
];

export default function AppShell() {
  const { user, signOutUser } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initials = user?.displayName
    ? user.displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="app-layout">
      <header className={`topnav ${scrolled ? "topnav--scrolled" : ""}`}>
        <div className="topnav-inner">
          <Link to="/" className="topnav-brand">
            <span className="topnav-logo">☁️</span>
            <span className="topnav-brand-text">
              Smart Cost<strong>Advisor</strong>
            </span>
          </Link>

          <nav className="topnav-links">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  isActive ? "topnav-link topnav-link--active" : "topnav-link"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="topnav-right">
            <div className="topnav-user">
              <span className="topnav-avatar">{initials}</span>
              <button type="button" className="topnav-signout" onClick={signOutUser}>
                Sign out
              </button>
            </div>

            <button
              type="button"
              className={`topnav-hamburger ${menuOpen ? "topnav-hamburger--open" : ""}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        <div className={`topnav-mobile ${menuOpen ? "topnav-mobile--open" : ""}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                isActive
                  ? "topnav-mobile-link topnav-mobile-link--active"
                  : "topnav-mobile-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
          <button type="button" className="topnav-mobile-signout" onClick={signOutUser}>
            Sign out
          </button>
        </div>
      </header>

      <main className="page-main">
        <Outlet />
      </main>
    </div>
  );
}
