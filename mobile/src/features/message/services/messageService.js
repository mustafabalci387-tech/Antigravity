// features/message/services/messageService.js
// Mesajlaşma HTTP istekleri servisi.
// Backend /api/messages endpoint'lerine istek atar.  
import ApiService from '../../../shared/services/ApiService';

class MessageService extends ApiService {
  static async getMyConversations() {
    const data = await this.get('/messages/conversations');
    // Eğer ApiService sadece .data dönüyorsa ve içinde konusmalar varsa:
    return data?.konusmalar || data;
  }

  static async getMessagesByConversation(conversationId, page = 1, limit = 50) {
    const data = await this.get(`/messages/conversation/${conversationId}`, { page, limit });
    return data?.mesajlar || data;
  }

  static async sendMessage(receiverId, content) {
    return await this.post(`/messages/send`, {
      alici_id: receiverId,
      icerik: content
    });
  }

  static async deleteConversation(conversationId) {
    return await this.delete(`/messages/conversations/${conversationId}`);
  }
}

const messageService = {
  getMyConversations: () => MessageService.getMyConversations(),
  getMessagesByConversation: (conversationId, page, limit) => MessageService.getMessagesByConversation(conversationId, page, limit),
  sendMessage: (receiverId, content) => MessageService.sendMessage(receiverId, content),
  deleteConversation: (conversationId) => MessageService.deleteConversation(conversationId),
};

export default messageService;
