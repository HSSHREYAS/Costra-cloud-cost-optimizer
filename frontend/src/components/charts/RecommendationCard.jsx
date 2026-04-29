import { formatCurrency } from "../../utils/currency.js";

const RISK_CONFIG = {
    low: { label: "Low Risk", color: "#0f6d64", bg: "rgba(15,109,100,0.1)", icon: "✅" },
    medium: { label: "Medium Risk", color: "#b87d0e", bg: "rgba(244,185,66,0.15)", icon: "⚠️" },
    high: { label: "High Risk", color: "#b43f3f", bg: "rgba(180,63,63,0.1)", icon: "🔴" },
};

const TYPE_ICONS = {
    cost_optimization: "💰",
    reserved_pricing: "🔒",
    spot_pricing: "⚡",
    region_switch: "🌍",
    rightsizing: "📐",
    storage_class: "🗄️",
};

export default function RecommendationCard({ item, currency = "USD", liveRate }) {
    const risk = RISK_CONFIG[item.risk_level] || RISK_CONFIG.medium;
    const typeIcon = TYPE_ICONS[item.type] || "💡";

    return (
        <li className="rec-card">
            <div className="rec-card__header">
                <span className="rec-card__type-icon">{typeIcon}</span>
                <div className="rec-card__title-block">
                    <strong className="rec-card__title">{item.suggestion}</strong>
                    <span
                        className="rec-card__risk-badge"
                        style={{ color: risk.color, background: risk.bg }}
                    >
                        {risk.icon} {risk.label}
                    </span>
                </div>
                <div className="rec-card__savings">
                    <span className="rec-card__savings-label">Est. savings</span>
                    <strong className="rec-card__savings-value" style={{ color: "#0f6d64" }}>
                        {formatCurrency(item.estimated_savings, currency, 2, liveRate)}
                    </strong>
                </div>
            </div>
            <p className="rec-card__explanation">{item.explanation}</p>
        </li>
    );
}
