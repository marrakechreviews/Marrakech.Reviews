import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api, { authAPI } from '../lib/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('userToken');
      const user = localStorage.getItem('user');

      if (token && user) {
        try {
          // Verify token is still valid
          const response = await authAPI.getProfile();
          if (response.data.success) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: {
                user: response.data.data,
                token,
              },
            });
          } else {
            localStorage.removeItem('userToken');
            localStorage.removeItem('user');
            dispatch({ type: 'LOGIN_FAILURE' });
          }
        } catch (error) {
          localStorage.removeItem('userToken');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGIN_FAILURE' });
        }
      } else {
        dispatch({ type: 'LOGIN_FAILURE' });
      }
    };

    initAuth();
  }, []);

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authAPI.register(userData);
      
      if (response.data.success) {
        const { data } = response.data;
        
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('user', JSON.stringify(data));

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: data,
            token: data.token,
          },
        });

        return { success: true };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed',
      };
    }
  };

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.data.success) {
        const { data } = response.data;
        
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('user', JSON.stringify(data));

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: data,
            token: data.token,
          },
        });

        return { success: true };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      
      if (response.data.success) {
        const updatedUser = response.data.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Profile update failed');
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Profile update failed',
      };
    }
  };

  const googleLogin = async (googleToken) => {
    dispatch({ type: 'LOGIN_START' });
    try {
        const response = await api.post('/auth/google', { token: googleToken });
        if (response.data.success) {
            const { data } = response.data;
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data, token: data.token } });
            return { success: true };
        } else {
            return { success: false, message: response.data.message || 'Google login failed' };
        }
    } catch (error) {
        dispatch({ type: 'LOGIN_FAILURE' });
        return { success: false, message: error.response?.data?.message || 'Google login failed' };
    }
  };

  const updateProfileImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await authAPI.post('/auth/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const { image } = response.data.data;
        const updatedUser = { ...state.user, image };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Image upload failed');
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Image upload failed',
      };
    }
  };

  const value = {
    ...state,
    register,
    login,
    logout,
    updateProfile,
    googleLogin,
    updateProfileImage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
