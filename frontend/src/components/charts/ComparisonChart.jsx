import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency, toINR } from "../../utils/currency.js";

export default function ComparisonChart({ data, currency = "USD", liveRate }) {
  if (!data?.length) {
    return <div className="empty-chart">Comparison results will appear here.</div>;
  }

  const chartData =
    currency === "INR"
      ? data.map((item) => ({ ...item, total_cost: +toINR(item.total_cost, liveRate).toFixed(2) }))
      : data;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDashboard="3 3" vertical={false} />
        <XAxis dataKey="region" tick={{ fontSize: 11 }} />
        <YAxis
          tick={{ fontSize: 11, fill: "#5f6c7b" }}
          tickFormatter={(v) =>
            currency === "INR" ? `₹${v.toLocaleString("en-IN")}` : `$${v}`
          }
          width={70}
        />
        <Tooltip
          formatter={(value) => [
            formatCurrency(
              currency === "INR" ? value / (liveRate ?? 84.5) : value,
              currency,
              2,
              liveRate
            ),
            "Projected cost",
          ]}
        />
        <Bar dataKey="total_cost" fill="#0f6d64" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
