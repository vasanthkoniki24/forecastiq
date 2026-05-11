import { useQuery } from "@tanstack/react-query";
import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import MonthlySalesChart from "../components/charts/MonthlySalesChart";
import ForecastLineChart from "../components/charts/ForecastLineChart";
import AccuracyGauge from "../components/charts/AccuracyGauge";

import {
  getAnalyticsSummary,
  getMonthlySales,
  getTopProducts,
  getAccuracyMetrics
} from "../api/analyticsApi";

export default function Dashboard() {
  const summaryQuery = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: getAnalyticsSummary
  });

  const monthlyQuery = useQuery({
    queryKey: ["monthly-sales"],
    queryFn: getMonthlySales
  });

  const topProductsQuery = useQuery({
    queryKey: ["top-products"],
    queryFn: getTopProducts
  });

  const accuracyQuery = useQuery({
    queryKey: ["accuracy"],
    queryFn: getAccuracyMetrics
  });

  const summary = summaryQuery.data || {};
  const accuracy = accuracyQuery.data || {};

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display text-textMain">
            Demand Intelligence Dashboard
          </h1>

          <p className="text-textMuted mt-1">
            Real-time view of demand, forecast accuracy and product performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {summaryQuery.isLoading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <Card>
                <p className="text-textMuted text-sm">Total Sales</p>
                <h2 className="text-3xl font-display mt-3">
                  {summary.total_sales ?? 0}
                </h2>
              </Card>

              <Card>
                <p className="text-textMuted text-sm">MoM Growth</p>
                <h2 className="text-3xl font-display mt-3 text-success">
                  {summary.mom_growth ?? 0}%
                </h2>
              </Card>

              <Card>
                <p className="text-textMuted text-sm">MAPE</p>
                <h2 className="text-3xl font-display mt-3 text-warning">
                  {summary.mape ?? 0}%
                </h2>
              </Card>

              <Card>
                <p className="text-textMuted text-sm">Top Product</p>
                <h2 className="text-xl font-semibold mt-3">
                  {summary.top_product || "N/A"}
                </h2>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <Card>
            <h2 className="text-xl font-semibold mb-4">
              Monthly Sales
            </h2>

            {monthlyQuery.isLoading ? (
              <Skeleton className="h-80" />
            ) : (
              <MonthlySalesChart data={monthlyQuery.data || []} />
            )}
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">
              Forecast Accuracy
            </h2>

            {accuracyQuery.isLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <AccuracyGauge value={accuracy.accuracy ?? 0} />
            )}
          </Card>
        </div>

        <Card>
          <h2 className="text-xl font-semibold mb-4">
            Forecast Trend
          </h2>

          <ForecastLineChart data={summary.forecast_trend || []} />
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">
            Top Products
          </h2>
            {topProductsQuery.isLoading ? (
                <Skeleton className="h-52" />
            ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-textMuted border-b border-borderSubtle">
                        <th className="text-left py-3">Product</th>
                        <th className="text-left py-3">Volume</th>
                        <th className="text-left py-3">Share</th>
                    </tr>
                    </thead>

                    <tbody>
                    {(topProductsQuery.data || []).map((item, index) => (
                        <tr
                        key={`${item.product}-${index}`}
                        className="border-b border-white/5"
                        >
                        <td className="py-3">{item.product}</td>
                        <td className="py-3">{item.volume}</td>
                        <td className="py-3 text-cyan">{item.share}%</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}
            </Card>
        </div>
        </AppLayout>
    );
    }