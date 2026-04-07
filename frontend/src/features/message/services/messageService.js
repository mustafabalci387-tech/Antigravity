/**
 * messageService.js — Mesajlaşma HTTP istekleri servisi.
 *
 * Backend /api/messages endpoint'lerine istek atar.
 */
import BaseService from "@/src/base/services/BaseService";
class MessageService extends BaseService {
    // Kullanıcının aktif olduğu konuşma odalarını listeler
    static async getMyConversations() {
        const data = await this.get("/messages/conversations");
        return data?.konusmalar || [];
    }

    // Bir konuşmanın geçmiş mesaj akışını getirir
    static async getMessagesByConversation(conversationId, page = 1, limit = 50) {
        const data = await this.get(`/messages/conversation/${conversationId}`, { page, limit });
        return data?.mesajlar || [];
    }

    // Belirli bir kullanıcıya yeni mesaj gönderir
    static async sendMessage(alici_id, icerik) {
        return await this.post("/messages/send", { alici_id, icerik });
    }

    // Bir konuşmayı ve mesaj geçmişini kalıcı olarak siler
    static async deleteConversation(conversation_id) {
        return await this.delete(`/messages/conversations/${conversation_id}`);
    }
}

export default MessageService;
