import ApiService from "../../../base/services/ApiService";
class JobService extends ApiService {
    /**
     * İlanları listele (sayfalama ve filtre parametreleriyle)
     * @param {Object} params - { page, limit, sort, is_veren_id vb. }
     */
    static async listJobs(params = {}) {
        return await this.get("/jobs", params);
    }

    /**
     * Tek bir ilan getir
     */
    static async getJobById(jobId) {
        return await this.get(`/jobs/${jobId}`);
    }

    /**
     * Yeni ilan oluştur
     */
    static async createJob(data) {
        return await this.post("/jobs", data);
    }

    /**
     * İlanı sil
     */
    static async deleteJob(jobId) {
        return await this.delete(`/jobs/${jobId}`);
    }

    /**
     * İlan süresini uzat
     */
    static async extendJob(jobId) {
        return await this.put(`/jobs/${jobId}/extend`);
    }
}

export default JobService;
