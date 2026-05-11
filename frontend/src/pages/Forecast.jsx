import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { BrainCircuit } from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ForecastLineChart from "../components/charts/ForecastLineChart";

import {
  trainForecast,
  predictForecast,
  createTrainingEventSource
} from "../api/forecastApi";

import { getApiError } from "../api/axios";
import { useDatasets } from "../hooks/useDatasets";
import { useAuthStore } from "../store/authStore";

export default function ForecastPage() {
  const token = useAuthStore((state) => state.token);
  const datasetsQuery = useDatasets();

  const [form, setForm] = useState({
    dataset_id: "",
    date_column: "",
    target_column: "",
    model_type: "auto",
    periods: 30
  });

  const [error, setError] = useState("");
  const [jobId, setJobId] = useState(null);
  const [trainingLogs, setTrainingLogs] = useState([]);
  const [trainingPercent, setTrainingPercent] = useState(0);
  const [prediction, setPrediction] = useState(null);

  const selectedDataset = (datasetsQuery.data || []).find(
    (item) => String(item.id) === String(form.dataset_id)
  );

  const columns = selectedDataset?.column_info
    ? Object.keys(selectedDataset.column_info)
    : [];

  const trainMutation = useMutation({
    mutationFn: trainForecast,
    onSuccess: (data) => {
      setJobId(data.job_id);
      setTrainingLogs([]);
      setTrainingPercent(0);
    },
    onError: (err) => {
      setError(getApiError(err, "Training failed"));
    }
  });

  const predictMutation = useMutation({
    mutationFn: predictForecast,
    onSuccess: (data) => {
      setPrediction(data);
    },
    onError: (err) => {
      setError(getApiError(err, "Prediction failed"));
    }
  });

  useEffect(() => {
    if (!jobId || !token) return;

    const eventSource = createTrainingEventSource(jobId, token);

    eventSource.onmessage = (event) => {
      const payload = JSON.parse(event.data);

      setTrainingLogs((prev) => [...prev, payload.step]);
      setTrainingPercent(payload.pct);

      if (payload.status === "done") {
        eventSource.close();

        predictMutation.mutate({
          dataset_id: Number(form.dataset_id),
          date_column: form.date_column,
          target_column: form.target_column,
          model_type: form.model_type,
          periods: Number(form.periods)
        });
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setError("Training stream disconnected. Please try again.");
    };

    return () => eventSource.close();
  }, [jobId]);

  const validateForm = () => {
    if (!form.dataset_id) return "Please select a dataset";
    if (!form.date_column) return "Please select a date column";
    if (!form.target_column) return "Please select a target column";
    if (!form.periods || Number(form.periods) < 1) {
      return "Prediction periods must be at least 1 day";
    }
    if (Number(form.periods) > 365) {
      return "Prediction periods cannot exceed 365 days";
    }

    return null;
  };

  const handleTrain = () => {
    setError("");
    setPrediction(null);

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    trainMutation.mutate({
      dataset_id: Number(form.dataset_id),
      date_column: form.date_column,
      target_column: form.target_column,
      model_type: form.model_type,
      periods: Number(form.periods)
    });
  };

  const forecastData = prediction?.results || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display">
            Real-Time Forecast Training
          </h1>

          <p className="text-textMuted mt-1">
            Upload CSV/XLS/XLSX datasets, train Linear Regression or Prophet models, and monitor SSE-based live training progress.
          </p>
        </div>
        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <BrainCircuit className="text-cyan" />
            <h2 className="text-xl font-semibold">
              Model Configuration
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <div>
              <label className="text-sm text-textMuted">
                Dataset
              </label>

              <select
                value={form.dataset_id}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    dataset_id: e.target.value,
                    date_column: "",
                    target_column: ""
                  }))
                }
                className="w-full mt-2 bg-secondaryBg border border-borderSubtle rounded-xl px-4 py-3 outline-none"
              >
                <option value="">Select dataset</option>

                {(datasetsQuery.data || []).map((dataset) => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.filename}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-textMuted">
                Date Column
              </label>

              <select
                value={form.date_column}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    date_column: e.target.value
                  }))
                }
                className="w-full mt-2 bg-secondaryBg border border-borderSubtle rounded-xl px-4 py-3 outline-none"
              >
                <option value="">Select date column</option>

                {columns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-textMuted">
                Target Column
              </label>

              <select
                value={form.target_column}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    target_column: e.target.value
                  }))
                }
                className="w-full mt-2 bg-secondaryBg border border-borderSubtle rounded-xl px-4 py-3 outline-none"
              >
                <option value="">Select target column</option>

                {columns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-textMuted">
                Model Type
              </label>

              <select
                value={form.model_type}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    model_type: e.target.value
                  }))
                }
                className="w-full mt-2 bg-secondaryBg border border-borderSubtle rounded-xl px-4 py-3 outline-none"
              >
                <option value="auto">Auto</option>
                <option value="linear_regression">
                  Linear Regression
                </option>
                <option value="prophet">Prophet</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-textMuted">
                Days
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={form.periods}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    periods: e.target.value
                  }))
                }
                className="w-full mt-2 bg-secondaryBg border border-borderSubtle rounded-xl px-4 py-3 outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleTrain}
              loading={trainMutation.isPending || predictMutation.isPending}
            >
              Train Model
            </Button>
          </div>
        </Card>

        {(trainingLogs.length > 0 || trainMutation.isPending) && (
          <Card>
            <div className="flex justify-between mb-3">
              <h2 className="text-xl font-semibold">
                Training Progress
              </h2>

              <Badge>{trainingPercent}%</Badge>
            </div>

            <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-cyan transition-all duration-500"
                style={{ width: `${trainingPercent}%` }}
              />
            </div>

            <div className="space-y-2 font-mono text-sm">
              {trainingLogs.map((log, index) => (
                <p key={`${log}-${index}`} className="text-textMuted">
                  → {log}
                </p>
              ))}
            </div>
          </Card>
        )}

        {prediction && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <Card>
                <p className="text-textMuted text-sm">
                  Model
                </p>
                <h2 className="text-xl font-semibold mt-2">
                  {prediction.model_type}
                </h2>
              </Card>

              <Card>
                <p className="text-textMuted text-sm">
                  MAE
                </p>
                <h2 className="text-2xl font-display mt-2">
                  {prediction.mae}
                </h2>
              </Card>

              <Card>
                <p className="text-textMuted text-sm">
                  RMSE
                </p>
                <h2 className="text-2xl font-display mt-2">
                  {prediction.rmse}
                </h2>
              </Card>

              <Card>
                <p className="text-textMuted text-sm">
                  MAPE
                </p>
                <h2 className="text-2xl font-display mt-2">
                  {prediction.mape}%
                </h2>
              </Card>
            </div>

            <Card>
              <h2 className="text-xl font-semibold mb-4">
                Forecast Results
              </h2>

              <ForecastLineChart data={forecastData} />
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}