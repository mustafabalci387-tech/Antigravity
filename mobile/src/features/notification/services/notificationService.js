import ApiService from "../../../shared/services/ApiService";

class NotificationService extends ApiService {
    static async getMyNotifications() {
        return await this.get("/notifications");
    }

    static async markAsRead(notificationId) {
        return await this.patch(`/notifications/${notificationId}/read`);
    }

    static async markAllAsRead() {
        return await this.patch("/notifications/read-all");
    }

    static async deleteNotification(notificationId) {
        return await this.delete(`/notifications/${notificationId}`);
    }

    static async clearAllNotifications() {
        return await this.delete("/notifications/clear/all");
    }
}

export default NotificationService;
