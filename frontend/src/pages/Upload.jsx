import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UploadCloud, Trash2, FileSpreadsheet } from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Skeleton from "../components/ui/Skeleton";

import {
  uploadDataset,
  deleteDataset,
  getDatasetPreview
} from "../api/datasetApi";

import { getApiError } from "../api/axios";
import { useDatasets } from "../hooks/useDatasets";

export default function UploadPage() {
  const queryClient = useQueryClient();

  const datasetsQuery = useDatasets();

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [uploadPercent, setUploadPercent] = useState(0);
  const [dragging, setDragging] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: uploadDataset,
    onSuccess: async (data) => {
      setSelectedFile(null);
      setUploadPercent(0);
      setSelectedDataset(data);
      queryClient.invalidateQueries({ queryKey: ["datasets"] });

      try {
        const previewData = await getDatasetPreview(data.id);
        setPreview(previewData);
      } catch {
        setPreview(null);
      }
    },
    onError: (err) => {
      setError(getApiError(err, "Dataset upload failed"));
      setUploadPercent(0);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDataset,
    onSuccess: () => {
      setSelectedDataset(null);
      setPreview(null);
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
    },
    onError: (err) => {
      setError(getApiError(err, "Unable to delete dataset"));
    }
  });

  const validateFile = (file) => {
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];

    const allowedExtensions = [".csv", ".xls", ".xlsx"];

    const hasValidExtension = allowedExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
      return "Only CSV, XLS, or XLSX files are allowed";
    }

    const maxSize = 50 * 1024 * 1024;

    if (file.size > maxSize) {
      return "File size must be less than 50MB";
    }

    return null;
  };

  const handleFileSelect = (file) => {
    setError("");
    setPreview(null);

    if (!file) return;

    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError("Please select a dataset file first");
      return;
    }

    uploadMutation.mutate({
      file: selectedFile,
      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );

        setUploadPercent(percent);
      }
    });
  };

  const handlePreview = async (dataset) => {
    try {
      setError("");
      setSelectedDataset(dataset);
      const previewData = await getDatasetPreview(dataset.id);
      setPreview(previewData);
    } catch (err) {
      setError(getApiError(err, "Unable to load preview"));
    }
  };

  const rows = preview?.rows || [];
  const columns = preview?.columns || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display">
            Upload Dataset
          </h1>

          <p className="text-textMuted mt-1">
            Upload historical sales data for AI-powered demand forecasting.
          </p>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}
        <Card>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFileSelect(e.dataTransfer.files[0]);
            }}
            className={`
              border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
              ${
                dragging
                  ? "border-cyan bg-cyan/10"
                  : "border-borderSubtle bg-white/5"
              }
            `}
          >
            <UploadCloud className="mx-auto text-cyan mb-4" size={56} />

            <h2 className="text-xl font-semibold">
              Drop your CSV or Excel file here
            </h2>

            <p className="text-textMuted mt-2">
              Supported formats: CSV, XLS, XLSX. Max size: 50MB.
            </p>

            <label className="inline-block mt-6">
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />

              <span className="cursor-pointer px-5 py-3 rounded-xl bg-cyan text-primaryBg font-semibold inline-block">
                Choose File
              </span>
            </label>

            {selectedFile && (
              <div className="mt-6 text-sm text-textMuted">
                Selected:{" "}
                <span className="text-textMain">
                  {selectedFile.name}
                </span>
              </div>
            )}
          </div>

          {uploadPercent > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-textMuted">Uploading</span>
                <span className="text-cyan">{uploadPercent}%</span>
              </div>

              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan transition-all duration-300"
                  style={{ width: `${uploadPercent}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleUpload}
              loading={uploadMutation.isPending}
              disabled={!selectedFile}
            >
              Upload Dataset
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">
            Your Datasets
          </h2>

          {datasetsQuery.isLoading ? (
            <Skeleton className="h-48" />
          ) : (datasetsQuery.data || []).length === 0 ? (
            <p className="text-textMuted">
              No datasets uploaded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {(datasetsQuery.data || []).map((dataset) => (
                <div
                  key={dataset.id}
                  className="flex items-center justify-between bg-white/5 border border-borderSubtle rounded-2xl p-4"
                >
                  <div className="flex items-center gap-4">
                    <FileSpreadsheet className="text-cyan" />

                    <div>
                      <h3 className="font-semibold">
                        {dataset.filename}
                      </h3>

                      <p className="text-sm text-textMuted">
                        {dataset.row_count} rows
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="info">
                      {dataset.status}
                    </Badge>
                    <button
                      onClick={() => handlePreview(dataset)}
                      className="text-cyan text-sm hover:underline"
                    >
                      Preview
                    </button>

                    <button
                      onClick={() => deleteMutation.mutate(dataset.id)}
                      className="text-danger hover:bg-danger/10 p-2 rounded-xl"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {selectedDataset && (
          <Card>
            <h2 className="text-xl font-semibold mb-2">
              Dataset Preview
            </h2>

            <p className="text-textMuted text-sm mb-4">
              Showing first 50 rows from {selectedDataset.filename}.
            </p>

            {columns.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {columns.map((column) => (
                  <Badge key={column.name}>
                    {column.name}: {column.dtype}
                  </Badge>
                ))}
              </div>
            )}

            {rows.length === 0 ? (
              <p className="text-textMuted">
                No preview rows available.
              </p>
            ) : (
              <div className="overflow-auto max-h-[500px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-borderSubtle text-textMuted">
                      {Object.keys(rows[0]).map((key) => (
                        <th key={key} className="text-left py-3 px-3">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row, index) => (
                      <tr
                        key={index}
                        className="border-b border-white/5"
                      >
                        {Object.values(row).map((value, valueIndex) => (
                          <td
                            key={valueIndex}
                            className="py-3 px-3 text-textMain/90"
                          >
                            {String(value ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </AppLayout>
  );
}