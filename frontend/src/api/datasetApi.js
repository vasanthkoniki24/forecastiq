import api from "./axios";

export const uploadDataset = async ({ file, onUploadProgress }) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/api/datasets/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    },
    onUploadProgress
  });

  return response.data;
};

export const getDatasets = async () => {
  const response = await api.get("/api/datasets");
  return response.data;
};

export const getDatasetPreview = async (datasetId) => {
  const response = await api.get(`/api/datasets/${datasetId}/preview`);
  return response.data;
};

export const deleteDataset = async (datasetId) => {
  const response = await api.delete(`/api/datasets/${datasetId}`);
  return response.data;
};