// features/job/services/jobService.js
// İş ilanları için API servisi
// Backend'deki /api/jobs endpoint'leri ile iletişim kurar
import ApiService from '../../../shared/services/ApiService';

class JobService extends ApiService {
  static async getAll(params = {}) {
    return await this.get('/jobs', params);
  }

  static async getById(id) {
    return await this.get(`/jobs/${id}`);
  }

  static async create(jobData) {
    return await this.post('/jobs', jobData);
  }

  static async update(id, jobData) {
    return await this.put(`/jobs/${id}`, jobData);
  }

  static async extendJob(id) {
    return await this.put(`/jobs/${id}/extend`);
  }

  static async deleteJob(id) {
    return await this.delete(`/jobs/${id}`);
  }
}

// Geriye dönük uyumluluk:
const jobService = {
  getAll: (params) => JobService.getAll(params),
  getById: (id) => JobService.getById(id),
  create: (jobData) => JobService.create(jobData),
  update: (id, jobData) => JobService.update(id, jobData),
  extendJob: (id) => JobService.extendJob(id),
  delete: (id) => JobService.deleteJob(id),
};

export default jobService;
