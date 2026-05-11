import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

export default function MonthlySalesChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="h-80 flex items-center justify-center text-textMuted">
        No monthly sales data available
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="month" stroke="#5A6A8A" />
          <YAxis stroke="#5A6A8A" />
          <Tooltip
            contentStyle={{
              background: "#0D1525",
              border: "1px solid rgba(0,212,255,0.12)",
              borderRadius: "14px",
              color: "#F0F4FF"
            }}
          />
          <Bar
            dataKey="sales"
            fill="#00D4FF"
            radius={[10, 10, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}