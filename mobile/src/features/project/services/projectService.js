// features/project/services/projectService.js
// Proje yönetimi için API servisi
// Backend'deki /api/projects endpoint'leri ile iletişim kurar

import api from '../../../config/api';

const projectService = {
  getAll: async (params = {}) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  create: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  update: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

export default projectService;
