import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { formatCurrency, toINR } from "../../utils/currency.js";

export default function HourlyCostChart({ breakdown = [], durationHours = 0, currency = "USD", liveRate }) {
    if (!breakdown.length || !durationHours) {
        return (
            <div className="empty-chart" style={{ minHeight: 160 }}>
                Run an estimate to see the hourly cost profile.
            </div>
        );
    }

    const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(t * durationHours));

    const data = ticks.map((hour) => {
        const point = { hour };
        breakdown.forEach((item) => {
            const hourlyRate =
                item.unit === "hours" || item.unit === "hour"
                    ? item.rate
                    : item.amount / durationHours;
            const cumUsd = hourlyRate * hour;
            point[item.label] =
                currency === "INR"
                    ? +toINR(cumUsd, liveRate).toFixed(4)
                    : +cumUsd.toFixed(4);
        });
        return point;
    });

    const COLORS = ["#0f6d64", "#f4b942", "#de6b48", "#2f3c7e", "#9b5de5"];

    return (
        <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                    {breakdown.map((item, i) => (
                        <linearGradient key={item.label} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.02} />
                        </linearGradient>
                    ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(21,32,51,0.07)" />
                <XAxis dataKey="hour" tickFormatter={(v) => `${v}h`} tick={{ fontSize: 11, fill: "#5f6c7b" }} />
                <YAxis
                    tick={{ fontSize: 11, fill: "#5f6c7b" }}
                    tickFormatter={(v) => (currency === "INR" ? `₹${v}` : `$${v}`)}
                    width={56}
                />
                <Tooltip
                    formatter={(value, name) => [
                        formatCurrency(
                            currency === "INR" ? value / (liveRate ?? 84.5) : value,
                            currency,
                            4,
                            liveRate
                        ),
                        name,
                    ]}
                    labelFormatter={(v) => `Hour ${v}`}
                />
                {breakdown.map((item, i) => (
                    <Area
                        key={item.label}
                        type="monotone"
                        dataKey={item.label}
                        stackId="1"
                        stroke={COLORS[i % COLORS.length]}
                        fill={`url(#grad-${i})`}
                        strokeWidth={2}
                    />
                ))}
            </AreaChart>
        </ResponsiveContainer>
    );
}
