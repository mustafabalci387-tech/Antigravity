/**
 * projectService.js — Proje Takibi API Servisi
 *
 * Backend /api/projects endpoint'lerine istek atar.
 * Merkezi ApiService'i miras alarak hata yönetimi ve
 * response ayıklama işlemlerini otomatik devralır.
 *
 * Kullanım Zinciri:
 *   Component → ProjectService → ApiService → api (axios)
 */
import ApiService from "../../../shared/services/ApiService";

class ProjectService extends ApiService {
    /**
     * Giriş yapmış kullanıcının projelerini listeler.
     * Backend, token'daki role göre (client/freelancer) otomatik filtreler.
     *
     * GET /api/projects
     * @returns {Promise<Object>} { projects: [...] }
     */
    static async getMyProjects() {
        return await this.get("/projects");
    }

    /**
     * Tek bir projenin detayını getirir.
     *
     * GET /api/projects/:projectId
     * @param {string} projectId - Projenin MongoDB ObjectId'si
     * @returns {Promise<Object>} { project: {...} }
     */
    static async getProjectById(projectId) {
        return await this.get(`/projects/${projectId}`);
    }

    /**
     * Proje durumunu günceller.
     * Geçerli değerler: devam_ediyor | tamamlandi | iptal
     *
     * PATCH /api/projects/:projectId/status
     * @param {string} projectId - Projenin MongoDB ObjectId'si
     * @param {string} durum - Yeni durum değeri
     * @returns {Promise<Object>} { project: {...} }
     */
    static async updateProjectStatus(projectId, durum) {
        return await this.patch(`/projects/${projectId}/status`, { durum });
    }
}

export default ProjectService;
