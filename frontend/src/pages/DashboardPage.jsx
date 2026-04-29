import { useState } from "react";

import CostBreakdownChart from "../components/charts/CostBreakdownChart.jsx";
import CostGauge from "../components/charts/CostGauge.jsx";
import HourlyCostChart from "../components/charts/HourlyCostChart.jsx";
import MetadataPanel from "../components/charts/MetadataPanel.jsx";
import RecommendationCard from "../components/charts/RecommendationCard.jsx";
import DynamicEstimateForm from "../components/forms/DynamicEstimateForm.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { useCurrencyRate } from "../hooks/useCurrencyRate.js";
import { estimateCost, fetchRecommendations } from "../services/costAdvisorApi.js";
import { formatCurrency } from "../utils/currency.js";

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { rate, loading: rateLoading, error: rateError, lastUpdated, isLive } = useCurrencyRate();

  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [lastPayload, setLastPayload] = useState(null);

  async function handleEstimate(payload) {
    setLoading(true);
    setError("");
    setLastPayload(payload);

    try {
      const estimateData = await estimateCost(getToken, payload);
      setEstimate(estimateData);

      const recommendationData = await fetchRecommendations(getToken, {
        service: payload.service,
        region: payload.region,
        duration_hours: payload.duration_hours,
        current_cost: estimateData.total_cost,
        configuration: payload.configuration,
      });
      setRecommendations(recommendationData.recommendations);
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || "Unable to estimate cost right now.");
      setEstimate(null);
      setRecommendations([]);
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

  const currencyLabel = currency === "INR" ? `₹ INR` : "$ USD";

  const hourlyRate =
    estimate && lastPayload?.duration_hours
      ? estimate.total_cost / lastPayload.duration_hours
      : null;

  const totalSavings = recommendations.reduce((sum, r) => sum + r.estimated_savings, 0);

  return (
    <div className="page-grid">
      <DynamicEstimateForm onSubmit={handleEstimate} loading={loading} />

      <section className="panel results-panel">
        {/* ── Header ── */}
        <div className="panel-header">
          <span className="eyebrow">Dashboard</span>
          <div className="panel-header__row">
            <h2>Cost Breakdown &amp; Why This Configuration</h2>
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
          <p>Each estimate shows the pricing source, assumptions, and optimization opportunities.</p>
          {currency === "INR" && (
            <p className={`inr-rate-note ${!isLive && !rateLoading ? "inr-rate-note--warn" : ""}`}>
              {isLive ? "🟢" : rateError ? "🟡" : "⏳"} {rateNote}
            </p>
          )}
        </div>

        {error ? <div className="error-banner">{error}</div> : null}

        {/* ── Top stat bar ── */}
        <div className="stats-grid stats-grid--4">
          <article className="stat-card">
            <span>Total Cost</span>
            <strong className="stat-card__value">
              {estimate ? fmt(estimate.total_cost) : "--"}
            </strong>
          </article>
          <article className="stat-card">
            <span>Hourly Rate</span>
            <strong className="stat-card__value">
              {hourlyRate != null ? fmt(hourlyRate) + "/hr" : "--"}
            </strong>
          </article>
          <article className="stat-card">
            <span>Currency</span>
            <strong className="stat-card__value">{estimate ? currencyLabel : "--"}</strong>
          </article>
          <article className="stat-card stat-card--savings">
            <span>Potential Savings</span>
            <strong className="stat-card__value">
              {recommendations.length ? fmt(totalSavings) : "--"}
            </strong>
          </article>
        </div>

        {/* ── Gauge + Pie side-by-side ── */}
        <div className="viz-row">
          <div className="viz-card">
            <h4 className="viz-title">Cost Gauge</h4>
            <CostGauge totalCost={estimate?.total_cost ?? null} currency={currency} liveRate={rate} />
          </div>
          <div className="viz-card viz-card--grow">
            <h4 className="viz-title">Cost Composition</h4>
            <CostBreakdownChart data={estimate?.breakdown || []} currency={currency} liveRate={rate} />
          </div>
        </div>

        {/* ── Hourly area chart ── */}
        <div className="sub-panel">
          <h3>Cumulative Cost Over Time</h3>
          <p className="sub-panel__desc">How costs accumulate across the duration you specified.</p>
          <HourlyCostChart
            breakdown={estimate?.breakdown || []}
            durationHours={lastPayload?.duration_hours || 0}
            currency={currency}
            liveRate={rate}
          />
        </div>

        {/* ── Line Items ── */}
        <div className="insights-grid">
          <section className="sub-panel">
            <h3>Line Items</h3>
            <ul className="metric-list">
              {(estimate?.breakdown || []).map((item) => (
                <li key={item.label}>
                  <div className="line-item__header">
                    <strong>{item.label}</strong>
                    <span className="line-item__amount">{fmt(item.amount)}</span>
                  </div>
                  <span className="line-item__desc">{item.description}</span>
                  <div className="line-item__rate">
                    <span>{item.quantity} {item.unit}</span>
                    <span>@ {fmt(item.rate)}/{item.unit}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* ── Recommendations ── */}
          <section className="sub-panel">
            <h3>
              Recommendation Engine
              {recommendations.length > 0 && (
                <span className="rec-count-badge">{recommendations.length}</span>
              )}
            </h3>
            <ul className="rec-list">
              {recommendations.length
                ? recommendations.map((item) => (
                  <RecommendationCard
                    key={`${item.suggestion}-${item.type}`}
                    item={item}
                    currency={currency}
                    liveRate={rate}
                  />
                ))
                : <li className="rec-empty">Run an estimate to generate recommendations.</li>}
            </ul>
          </section>
        </div>

        {/* ── Metadata ── */}
        <section className="sub-panel">
          <h3>Why This Configuration?</h3>
          <MetadataPanel metadata={estimate?.metadata ?? null} />
        </section>
      </section>
    </div>
  );
}
