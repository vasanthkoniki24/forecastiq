import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from "recharts";

export default function AccuracyGauge({ value = 0 }) {
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100);

  const data = [
    {
      name: "Accuracy",
      value: safeValue,
      fill: "#00E5A0"
    }
  ];

  return (
    <div className="h-64 relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />

          <RadialBar
            background
            dataKey="value"
            cornerRadius={20}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex items-center justify-center pt-12">
        <div className="text-center">
          <p className="text-4xl font-display text-success">
            {safeValue}%
          </p>

          <p className="text-sm text-textMuted">
            Forecast Accuracy
          </p>
        </div>
      </div>
    </div>
  );
}