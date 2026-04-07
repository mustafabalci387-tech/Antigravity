import BaseService from "../../../base/services/BaseService";

class NotificationService extends BaseService {
    static async getMyNotifications() {
        return await this.get("/notifications");
    }

    static async markAsRead(notificationId) {
        return await this.patch(`/notifications/${notificationId}/read`);
    }

    static async markAllAsRead() {
        return await this.patch("/notifications/read-all");
    }
}

export default NotificationService;
