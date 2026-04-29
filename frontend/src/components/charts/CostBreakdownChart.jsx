import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency, toINR } from "../../utils/currency.js";

const COLORS = ["#0f6d64", "#f4b942", "#de6b48", "#2f3c7e"];

export default function CostBreakdownChart({ data, currency = "USD", liveRate }) {
  if (!data?.length) {
    return <div className="empty-chart">Run an estimate to see the cost composition.</div>;
  }

  const chartData =
    currency === "INR"
      ? data.map((item) => ({ ...item, amount: +toINR(item.amount, liveRate).toFixed(2) }))
      : data;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="amount"
          nameKey="label"
          innerRadius={70}
          outerRadius={100}
          paddingAngle={4}
        >
          {chartData.map((entry, index) => (
            <Cell key={entry.label} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [
            formatCurrency(currency === "INR" ? value / (liveRate ?? 84.5) : value, currency, 2, liveRate),
            name,
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
