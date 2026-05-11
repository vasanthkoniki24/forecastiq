import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Skeleton from "../components/ui/Skeleton";

import {
  generateReport,
  getReports,
  downloadReport
} from "../api/reportApi";

import { getApiError } from "../api/axios";

export default function ReportsPage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    prediction_id: "",
    format: "excel"
  });

  const [error, setError] = useState("");

  const reportsQuery = useQuery({
    queryKey: ["reports"],
    queryFn: getReports
  });

  const generateMutation = useMutation({
    mutationFn: generateReport,
    onSuccess: () => {
      setForm({
        prediction_id: "",
        format: "excel"
      });

      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (err) => {
      setError(getApiError(err, "Unable to generate report"));
    }
  });

  const handleGenerate = () => {
    setError("");

    if (!form.prediction_id) {
      setError("Prediction ID is required");
      return;
    }

    generateMutation.mutate({
      prediction_id: Number(form.prediction_id),
      format: form.format
    });
  };

  const handleDownload = async (report) => {
    try {
      setError("");

      const blob = await downloadReport({
        reportId: report.id,
        format: report.format
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = report.filename || `forecast-report-${report.id}.${report.format === "pdf" ? "pdf" : "xlsx"}`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(getApiError(err, "Download failed"));
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display">
            Reports
          </h1>

          <p className="text-textMuted mt-1">
            Generate and download Excel/PDF forecast reports.
          </p>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-cyan" />
            <h2 className="text-xl font-semibold">
              Generate Report
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-textMuted">
                Prediction ID
              </label>

              <input
                type="number"
                min="1"
                value={form.prediction_id}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    prediction_id: e.target.value
                  }))
                }
                placeholder="Example: 1"
                className="w-full mt-2 bg-secondaryBg border border-borderSubtle rounded-xl px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-textMuted">
                Format
              </label>

              <select
                value={form.format}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    format: e.target.value
                    }))
                }
                className="w-full mt-2 bg-secondaryBg border border-borderSubtle rounded-xl px-4 py-3 outline-none"
              >
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleGenerate}
                loading={generateMutation.isPending}
                className="w-full"
              >
                Generate Report
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">
            Generated Reports
          </h2>

          {reportsQuery.isLoading ? (
            <Skeleton className="h-52" />
          ) : (reportsQuery.data || []).length === 0 ? (
            <p className="text-textMuted">
              No reports generated yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-textMuted border-b border-borderSubtle">
                    <th className="text-left py-3">ID</th>
                    <th className="text-left py-3">Prediction</th>
                    <th className="text-left py-3">Format</th>
                    <th className="text-left py-3">Created</th>
                    <th className="text-left py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {(reportsQuery.data || []).map((report) => (
                    <tr
                      key={report.id}
                      className="border-b border-white/5"
                    >
                      <td className="py-3">{report.id}</td>
                      <td className="py-3">{report.prediction_id}</td>
                      <td className="py-3">
                        <Badge variant={report.format === "pdf" ? "danger" : "success"}>
                          {report.format.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {new Date(report.created_at).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDownload(report)}
                          className="text-cyan flex items-center gap-2 hover:underline"
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </td>
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
