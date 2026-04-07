import BaseService from "@/src/base/services/BaseService";
class PortfolioService extends BaseService {
  static async getUserPortfolio(userId) {
    return await this.get('/portfolio/user/' + userId);
  }

  // Yeni portfolyo öğesi ekle
  static async createPortfolioItem(data) {
    // Backend 'PortfolioCreate' DTO: ad, aciklama, medya_url, etiketler, proje_linki
    return await this.post("/portfolio/", data);
  }

  // Portfolyo öğesini güncelle
  static async updatePortfolioItem(id, data) {
    return await this.put(`/portfolio/${id}`, data);
  }

  // Portfolyo öğesini sil
  static async deletePortfolioItem(id) {
    return await this.delete(`/portfolio/${id}`);
  }

  // Görsel yükle
  static async uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    return await this.post("/portfolio/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export default PortfolioService;
