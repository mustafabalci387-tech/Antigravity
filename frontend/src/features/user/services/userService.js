/**
 * userService.js — Kullanıcı işlemleri servisi.
 */
import ApiService from "@/src/base/services/ApiService";
class UserService extends ApiService {
    static async getAllUsers(params = {}) {
        const data = await this.get("/users", params);
        // Gelen verinin içerisindeki 'users' array'ini çıkarıyoruz.
        return data?.users || [];
    }

    static async getUserById(userId) {
        return await this.get(`/users/${userId}`);
    }

    static async updateProfile(data) {
        // Hoca Kuralı GEREĞİ Backend'deki PATCH metoduna uyarlıyoruz
        return await this.patch("/users/profile", data);
    }

    static async uploadAvatar(file) {
        const formData = new FormData();
        formData.append("file", file);
        return await this.post("/users/avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }
}

export default UserService;
