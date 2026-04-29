import {
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
    PolarAngleAxis,
} from "recharts";
import { formatCurrency } from "../../utils/currency.js";

const GAUGE_MAX_MULTIPLIER = 2;

export default function CostGauge({ totalCost, currency = "USD", liveRate }) {
    if (totalCost == null) {
        return (
            <div className="gauge-empty">
                <span>Run an estimate to see your cost gauge</span>
            </div>
        );
    }

    const max = Math.max(totalCost * GAUGE_MAX_MULTIPLIER, 0.01);
    const percentage = Math.min((totalCost / max) * 100, 100);
    const data = [{ value: percentage }];
    const tier = percentage < 40 ? "low" : percentage < 75 ? "medium" : "high";
    const colors = { low: "#0f6d64", medium: "#f4b942", high: "#b43f3f" };

    return (
        <div className="cost-gauge-wrapper">
            <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart
                    cx="50%"
                    cy="80%"
                    innerRadius="60%"
                    outerRadius="90%"
                    startAngle={180}
                    endAngle={0}
                    data={data}
                    barSize={18}
                >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar
                        background={{ fill: "rgba(21,32,51,0.07)" }}
                        dataKey="value"
                        angleAxisId={0}
                        fill={colors[tier]}
                        cornerRadius={10}
                    />
                </RadialBarChart>
            </ResponsiveContainer>
            <div className="cost-gauge-label">
                <span className="gauge-value" style={{ color: colors[tier] }}>
                    {formatCurrency(totalCost, currency, 2, liveRate)}
                </span>
                <span className="gauge-sub">Total Estimated Cost</span>
                <span className={`gauge-tier gauge-tier--${tier}`}>
                    {tier === "low" ? "✅ Low cost" : tier === "medium" ? "⚠️ Moderate" : "🔴 High cost"}
                </span>
            </div>
        </div>
    );
}
