import api from "../../config/api";

class ApiService {
    static async get(url, params = {}) {
        try {
            const response = await api.get(url, { params });
            return response.data?.data || response.data;
        } catch (error) {
            ApiService.handleError(error);
            throw error;
        }
    }

    static async post(url, data = {}, config = {}) {
        try {
            const response = await api.post(url, data, config);
            return response.data?.data || response.data;
        } catch (error) {
            ApiService.handleError(error);
            throw error;
        }
    }

    static async put(url, data = {}, config = {}) {
        try {
            const response = await api.put(url, data, config);
            return response.data?.data || response.data;
        } catch (error) {
            ApiService.handleError(error);
            throw error;
        }
    }

    static async patch(url, data = {}, config = {}) {
        try {
            const response = await api.patch(url, data, config);
            return response.data?.data || response.data;
        } catch (error) {
            ApiService.handleError(error);
            throw error;
        }
    }

    static async delete(url, config = {}) {
        try {
            const response = await api.delete(url, config);
            return response.data?.data || response.data;
        } catch (error) {
            ApiService.handleError(error);
            throw error;
        }
    }

    static handleError(error) {
        console.error(
            "[Mobile ApiService Error]:",
            error?.response?.data || error.message
        );
    }
}

export default ApiService;
