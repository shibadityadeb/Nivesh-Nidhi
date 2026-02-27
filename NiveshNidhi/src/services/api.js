import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEFAULT_DEV_API_URL =
    Platform.OS === 'android'
        ? 'http://10.0.2.2:3000/api'
        : 'http://localhost:3000/api';

// For physical devices, set `EXPO_PUBLIC_API_URL` to your machine's LAN IP
// e.g. `http://192.168.x.x:3000/api` (must be reachable from the phone).
export const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_DEV_API_URL;

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    timeoutErrorMessage: 'timeout exceeded',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('nn_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Normalize common axios/react-native error shapes
        if (error?.code === 'ECONNABORTED') {
            error.message = 'Request timed out. Please try again.';
        } else if (!error?.response) {
            // No response usually means: server unreachable, wrong URL, no internet, SSL/cleartext issues
            error.message = `Unable to reach server. Check API URL: ${API_URL}`;
        }
        return Promise.reject(error);
    }
);

export const auth = {
    login: (credentials) => api.post('/auth/login', credentials),
    signup: (userData) => api.post('/auth/signup', userData),
    getProfile: () => api.get('/auth/profile'),
};

export const user = {
    getMe: () => api.get('/user/me'),
    getChits: () => api.get('/user/chits')
};

export const kyc = {
    verify: (payload) => api.post('/kyc/verify', payload),
};

export const organizers = {
    apply: (applicationData) => api.post('/organizers/apply', applicationData),
};

export const locations = {
    getCities: (state, query) =>
        api.get('/locations/cities', {
            params: {
                state,
                q: query ? query.trim() : undefined,
            },
        }),
};

export const admin = {
    getPendingApplications: () => api.get('/admin/applications/pending'),
    getMigratingApplications: () => api.get('/admin/applications/migrating'),
    approveApplication: (id, isLimited = false) => api.post(`/admin/applications/${id}/approve`, { isLimited }),
    rejectApplication: (id, reason) => api.post(`/admin/applications/${id}/reject`, { reason }),
    suspendOrganization: (id, reason) => api.post(`/admin/organizations/${id}/suspend`, { reason }),
};

export const organizations = {
    discover: (city, state) => api.get('/organizations/discover', { params: { city, state } }),
};

export const chitGroups = {
    getAll: () => api.get('/chit-groups'),
    getById: (id) => api.get(`/chit-groups/${id}`),
    applyToJoin: (id, payload) => api.post(`/chit-groups/${id}/apply`, payload),
    getActiveGroups: () => api.get('/chit-groups/active-groups'),
    getMyGroups: () => api.get('/chit-groups/my-groups'),
    create: (data) => api.post('/chit-groups', data),
    update: (id, data) => api.put(`/chit-groups/${id}`, data),
    delete: (id) => api.delete(`/chit-groups/${id}`),
};

export const organizerRequests = {
    getPending: (groupId) =>
        api.get('/organizer/requests', {
            params: groupId ? { groupId } : undefined,
        }),
    updateStatus: (requestId, status) => api.patch(`/organizer/requests/${requestId}`, { status }),
};

export const orgManage = {
    getMyOrganizations: () => api.get('/org-manage/my-organizations'),

    // Members
    getMembers: (groupId) => api.get(`/org-manage/groups/${groupId}/members`),
    addMember: (groupId, data) => api.post(`/org-manage/groups/${groupId}/members`, data),
    removeMember: (groupId, memberId) => api.delete(`/org-manage/groups/${groupId}/members/${memberId}`),

    // Rules
    getRules: (groupId) => api.get(`/org-manage/groups/${groupId}/rules`),
    saveRules: (groupId, data) => api.put(`/org-manage/groups/${groupId}/rules`, data),

    // Announcements
    getAnnouncements: (groupId) => api.get(`/org-manage/groups/${groupId}/announcements`),
    createAnnouncement: (groupId, data) => api.post(`/org-manage/groups/${groupId}/announcements`, data),
    deleteAnnouncement: (groupId, announcementId) => api.delete(`/org-manage/groups/${groupId}/announcements/${announcementId}`),

    // Notifications
    getNotifications: (groupId) => api.get(`/org-manage/groups/${groupId}/notifications`),
    sendNotification: (groupId, data) => api.post(`/org-manage/groups/${groupId}/notifications`, data),
};

export const escrow = {
    contribute: (payload) => api.post('/escrow/contribute', payload),
    verifyWebhook: (payload) => api.post('/escrow/webhook', payload),
    webhookFailed: (payload) => api.post('/escrow/webhook/failed', payload),
    getBalance: (chitGroupId) => api.get(`/escrow/balance/${chitGroupId}`),
    releasePayout: (payload) => api.post('/escrow/release', payload),
    freeze: (payload) => api.post('/escrow/freeze', payload)
};

// Chatbot API
export const sendChatMessage = async (message, conversationHistory = []) => {
    try {
        const response = await api.post('/chatbot/chat', {
            message,
            conversationHistory,
        });
        return response.data;
    } catch (error) {
        console.error('Chat API error:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to send message',
        };
    }
};

export const getChatbotContext = async () => {
    try {
        const response = await api.get('/chatbot/context');
        return response.data;
    } catch (error) {
        console.error('Get context error:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to get context',
        };
    }
};

export default api;
