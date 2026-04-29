import { useState } from "react";

import ComparisonChart from "../components/charts/ComparisonChart.jsx";
import CompareForm from "../components/forms/CompareForm.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { useCurrencyRate } from "../hooks/useCurrencyRate.js";
import { compareConfigurations } from "../services/costAdvisorApi.js";
import { formatCurrency } from "../utils/currency.js";

const RANK_COLORS = ["#f4b942", "#5f6c7b", "#de6b48"];
const RANK_LABELS = ["🥇 Best", "🥈 2nd", "🥉 3rd"];
const SERVICE_ICONS = { EC2: "🖥️", S3: "🗄️", Lambda: "λ", default: "☁️" };

function SavingsBadge({ amount, currency, liveRate }) {
  if (amount <= 0) return null;
  return (
    <span className="savings-badge">
      Save {formatCurrency(amount, currency, 2, liveRate)}
    </span>
  );
}

export default function ComparePage() {
  const { getToken } = useAuth();
  const { rate, loading: rateLoading, error: rateError, lastUpdated, isLive } = useCurrencyRate();

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [bestOption, setBestOption] = useState(null);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState("USD");

  async function handleCompare(payload) {
    setLoading(true);
    setError("");

    try {
      const comparison = await compareConfigurations(getToken, payload);
      setResults(comparison.results);
      setBestOption(comparison.best_option);
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || "Unable to compare configurations right now.");
      setResults([]);
      setBestOption(null);
    } finally {
      setLoading(false);
    }
  }

  function fmt(usd) {
    return formatCurrency(usd, currency, 2, rate);
  }

  const rateNote = isLive
    ? `Live rate: 1 USD = ₹${rate.toFixed(2)} · as of ${lastUpdated?.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
    : rateError
      ? `Fallback rate: 1 USD = ₹${rate.toFixed(2)} (live fetch failed)`
      : `Fetching live rate…`;

  const worst = results.length ? results[results.length - 1]?.total_cost : null;
  const best = results.length ? results[0]?.total_cost : null;
  const spread = worst != null && best != null ? worst - best : null;
  const spreadPct = worst > 0 && spread != null ? ((spread / worst) * 100).toFixed(1) : null;

  return (
    <div className="page-grid compare-page">
      <CompareForm onSubmit={handleCompare} loading={loading} />

      <section className="panel results-panel">
        {/* ── Header ── */}
        <div className="panel-header">
          <span className="eyebrow">Comparison</span>
          <div className="panel-header__row">
            <h2>Cross-Region Cost Analysis</h2>
            <div className="currency-toggle">
              <button
                className={currency === "USD" ? "currency-btn active" : "currency-btn"}
                onClick={() => setCurrency("USD")}
              >
                $ USD
              </button>
              <button
                className={currency === "INR" ? "currency-btn active" : "currency-btn"}
                onClick={() => setCurrency("INR")}
                disabled={rateLoading}
              >
                {rateLoading ? "…" : "₹ INR"}
              </button>
            </div>
          </div>
          <p>Rank deployment regions by projected total cost. Pick the cheapest option for your workload.</p>
          {currency === "INR" && (
            <p className={`inr-rate-note ${!isLive && !rateLoading ? "inr-rate-note--warn" : ""}`}>
              {isLive ? "🟢" : rateError ? "🟡" : "⏳"} {rateNote}
            </p>
          )}
        </div>

        {error ? <div className="error-banner">{error}</div> : null}

        {/* ── Summary stat bar ── */}
        {results.length > 0 && (
          <div className="stats-grid stats-grid--4">
            <article className="stat-card">
              <span>Best Region</span>
              <strong className="stat-card__value">{results[0]?.region}</strong>
            </article>
            <article className="stat-card stat-card--savings">
              <span>Lowest Cost</span>
              <strong className="stat-card__value">{fmt(best)}</strong>
            </article>
            <article className="stat-card">
              <span>Highest Cost</span>
              <strong className="stat-card__value">{fmt(worst)}</strong>
            </article>
            <article className="stat-card">
              <span>Max Savings</span>
              <strong className="stat-card__value">
                {spread != null ? (
                  <>
                    {fmt(spread)}{" "}
                    <small style={{ fontSize: "0.7rem", color: "#0f6d64" }}>({spreadPct}% cheaper)</small>
                  </>
                ) : "--"}
              </strong>
            </article>
          </div>
        )}

        {/* ── Winner card ── */}
        {bestOption && (
          <div className="winner-card">
            <div className="winner-card__icon">🏆</div>
            <div className="winner-card__body">
              <span className="winner-card__label">Recommended Region</span>
              <strong className="winner-card__region">{bestOption.region}</strong>
              <span className="winner-card__service">
                {SERVICE_ICONS[bestOption.service] || "☁️"} {bestOption.service}
              </span>
            </div>
            <div className="winner-card__cost">
              <span>Total Cost</span>
              <strong>{fmt(bestOption.total_cost)}</strong>
            </div>
          </div>
        )}

        {/* ── Bar chart ── */}
        <div className="sub-panel" style={{ marginBottom: "1rem" }}>
          <h3>Cost by Region</h3>
          <p className="sub-panel__desc">Bars ranked lowest → highest. Hover for exact figures.</p>
          <ComparisonChart data={results} currency={currency} liveRate={rate} />
        </div>

        {/* ── Ranked result cards ── */}
        {results.length > 0 && (
          <section className="sub-panel">
            <h3>Ranked Results</h3>
            <ul className="compare-rank-list">
              {results.map((result, i) => {
                const savingsVsWorst = worst - result.total_cost;
                return (
                  <li
                    key={`${result.region}-${result.total_cost}`}
                    className={`rank-card ${i === 0 ? "rank-card--winner" : ""}`}
                  >
                    <span className="rank-card__position" style={{ color: RANK_COLORS[i] || "#5f6c7b" }}>
                      {RANK_LABELS[i] || `#${i + 1}`}
                    </span>
                    <div className="rank-card__info">
                      <strong className="rank-card__region">{result.region}</strong>
                      <span className="rank-card__service">
                        {SERVICE_ICONS[result.service] || "☁️"} {result.service}
                      </span>
                    </div>
                    <div className="rank-card__pricing">
                      <strong className="rank-card__cost">{fmt(result.total_cost)}</strong>
                      {i > 0 && <SavingsBadge amount={savingsVsWorst} currency={currency} liveRate={rate} />}
                      {i === 0 && results.length > 1 && (
                        <span className="rank-card__best-label">Lowest ✓</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {!results.length && !loading && (
          <div className="empty-chart" style={{ minHeight: 200 }}>
            Run a comparison to rank regions by cost.
          </div>
        )}
      </section>
    </div>
  );
}
