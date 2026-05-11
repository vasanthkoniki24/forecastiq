import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area
} from "recharts";

export default function ForecastLineChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="h-80 flex items-center justify-center text-textMuted">
        No forecast data available
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="date" stroke="#5A6A8A" />
          <YAxis stroke="#5A6A8A" />
          <Tooltip
            contentStyle={{
              background: "#0D1525",
              border: "1px solid rgba(0,212,255,0.12)",
              borderRadius: "14px",
              color: "#F0F4FF"
            }}
          />
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="rgba(0,212,255,0.08)"
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#5A6A8A"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#00D4FF"
            strokeWidth={3}
            strokeDasharray="6 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}