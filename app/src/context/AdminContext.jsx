import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AdminContext = createContext();

const adminReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        admin: action.payload.admin,
        token: action.payload.token,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        admin: null,
        token: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        admin: null,
        token: null,
        error: null
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const AdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, {
    isAuthenticated: false,
    admin: null,
    token: localStorage.getItem('adminToken'),
    loading: true, // Start with loading true to prevent immediate redirect
    error: null
  });

  // Set up axios interceptor for token
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      // Verify token on app load
      verifyToken();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.token]);

  const verifyToken = async () => {
    try {
      // Try new user system first
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/profile`);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          admin: response.data.user,
          token: state.token
        }
      });
    } catch (error) {
      console.log('Token verification failed:', error.message);
      // Try old admin system as fallback
      try {
        const response = await axios.get('http://localhost:5000/api/admin/profile');
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            admin: response.data.admin,
            token: state.token
          }
        });
      } catch (fallbackError) {
        console.log('Fallback authentication failed:', fallbackError.message);
        dispatch({ type: 'LOGOUT' });
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userId');
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      // Try new user system first
      const response = await axios.post('http://localhost:5000/api/users/login', { email, password });
      const { token, ...userData } = response.data;
      
      localStorage.setItem('adminToken', token);
      localStorage.setItem('userId', userData.user?._id || userData._id);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, admin: userData }
      });
      
      return { success: true };
    } catch (error) {
      console.log('New user system login failed, trying admin system...');
      try {
        // Fallback to old admin system
        const response = await axios.post('http://localhost:5000/api/admin/login', { email, password });
        const { token, admin } = response.data;
        
        localStorage.setItem('adminToken', token);
        localStorage.setItem('userId', admin?._id);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { token, admin }
        });
        
        return { success: true };
      } catch (fallbackError) {
        const errorMessage = fallbackError.response?.data?.error || 'Login failed';
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: errorMessage
        });
        return { success: false, error: errorMessage };
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userId');
    delete axios.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
  };

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  return (
    <AdminContext.Provider value={{
      ...state,
      login,
      logout,
      setError,
      setLoading
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
