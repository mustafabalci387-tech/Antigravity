import ApiService from '../../../base/services/ApiService';

class UserService extends ApiService {
  static async getAll() {
    return await this.get('/users');
  }

  static async getUserById(userId) {
    return await this.get(`/users/${userId}`);
  }

  static async updateProfile(data) {
    // Backend PATCH kullanmaktadır (Kısmi güncelleme)
    return await this.patch(`/users/${data.id}`, data);
  }

  static async uploadAvatar(formData) {
    return await this.post("/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
}

export const userService = {
  getAll: () => UserService.getAll(),
  getUserById: (userId) => UserService.getUserById(userId),
  updateProfile: (data) => UserService.updateProfile(data),
  uploadAvatar: (formData) => UserService.uploadAvatar(formData)
};
