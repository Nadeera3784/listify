import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { authAPI } from '../services/api';

// Define the context interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  clearError: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Check if user is logged in on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const response = await authAPI.getCurrentUser();
        if (response.data.success) {
          const userData = response.data.user;
          setState({
            user: { ...userData, token },
            loading: false,
            error: null,
          });
        } else {
          localStorage.removeItem('userToken');
          setState({
            user: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        localStorage.removeItem('userToken');
        setState({
          user: null,
          loading: false,
          error: 'Session expired. Please login again.',
        });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await authAPI.login({ email, password });
      const { success, user, error } = response.data;
      
      if (success && user) {
        localStorage.setItem('userToken', user.token);
        setState({
          user,
          loading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          loading: false,
          error: error || 'Failed to login',
        });
      }
    } catch (error: any) {
      setState({
        user: null,
        loading: false,
        error: error.response?.data?.error || 'Server error during login',
      });
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await authAPI.register({ name, email, password });
      const { success, user, error } = response.data;
      
      if (success && user) {
        localStorage.setItem('userToken', user.token);
        setState({
          user,
          loading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          loading: false,
          error: error || 'Failed to register',
        });
      }
    } catch (error: any) {
      setState({
        user: null,
        loading: false,
        error: error.response?.data?.error || 'Server error during registration',
      });
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('userToken');
    setState({
      user: null,
      loading: false,
      error: null,
    });
  };

  // Clear error
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 