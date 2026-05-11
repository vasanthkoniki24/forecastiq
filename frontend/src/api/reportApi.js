import api from "./axios";

export const generateReport = async (payload) => {
  const response = await api.post("/api/reports/generate", payload);
  return response.data;
};

export const getReports = async () => {
  const response = await api.get("/api/reports");
  return response.data;
};

export const downloadReport = async ({ reportId, format }) => {
  const response = await api.get(`/api/reports/${reportId}/download/${format}`, {
    responseType: "blob"
  });

  return response.data;
};