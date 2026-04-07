import api from "../../../config/api";

export const portfolioService = {
  getUserPortfolio: async (userId) => {
    const response = await api.get(`/portfolio/user/${userId}`);
    return response.data?.data || response.data;
  },
  createPortfolio: async (data) => {
    const response = await api.post("/portfolio/", data);
    return response.data?.data || response.data;
  },
  updatePortfolio: async (id, data) => {
    const response = await api.put(`/portfolio/${id}`, data);
    return response.data?.data || response.data;
  },
  deletePortfolio: async (id) => {
    const response = await api.delete(`/portfolio/${id}`);
    return response.data?.data || response.data;
  },
  uploadImage: async (formData) => {
    const response = await api.post("/portfolio/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data?.data || response.data;
  }
};
