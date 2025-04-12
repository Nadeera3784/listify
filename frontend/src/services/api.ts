import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (userData: any) => api.post('/auth/login', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

export const listingsAPI = {
  getListings: (params?: any) => api.get('/listings', { params }),
  getListing: (id: string) => api.get(`/listings/${id}`),
  createListing: (listingData: any) => api.post('/listings', listingData),
  updateListing: (id: string, listingData: any) => api.put(`/listings/${id}`, listingData),
  deleteListing: (id: string) => api.delete(`/listings/${id}`),
  uploadImage: (id: string, formData: FormData) => {
    return api.post(`/listings/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadImages: (id: string, formData: FormData) => {
    return api.post(`/listings/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const auctionsAPI = {
  getAuctions: (params?: any) => api.get('/auctions', { params }),
  getAuction: (id: string) => api.get(`/auctions/${id}`),
  createAuction: (auctionData: any) => api.post('/auctions', auctionData),
  updateAuction: (id: string, auctionData: any) => api.put(`/auctions/${id}`, auctionData),
  deleteAuction: (id: string) => api.delete(`/auctions/${id}`),
  placeBid: (id: string, bidData: any) => api.post(`/auctions/${id}/bids`, bidData),
  getBids: (id: string) => api.get(`/auctions/${id}/bids`),
  updateStatus: (id: string, statusData: any) => api.put(`/auctions/${id}/status`, statusData),
  getWonAuctions: (params?: any) => api.get('/auctions/user/won', { params }),
  getUserWonAuctions: (userId: string, params?: any) => api.get(`/auctions/user/${userId}/won`, { params }),
  createAuctionWithImages: (formData: FormData) => {
    return api.post('/auctions/with-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateAuctionWithImages: (id: string, formData: FormData) => {
    return api.put(`/auctions/${id}/with-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const categoriesAPI = {
  getCategories: () => api.get('/categories'),
  getCategory: (id: string) => api.get(`/categories/${id}`),
  createCategory: (categoryData: any) => api.post('/categories', categoryData),
  updateCategory: (id: string, categoryData: any) => api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),
};

export const usersAPI = {
  getUsers: (params?: any) => api.get('/users', { params }),
  getUser: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, userData: any) => api.put(`/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

export default api; 