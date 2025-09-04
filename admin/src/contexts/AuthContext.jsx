import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../lib/api';

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
      // Check for bypass mode
      // const bypassMode = localStorage.getItem("bypassLogin");
      // if (bypassMode === 'true') {
      //   // Create a mock admin user for bypass mode
      //   const mockUser = {
      //     _id: 'bypass-admin',
      //     name: 'Bypass Admin',
      //     email: 'admin@bypass.com',
      //     role: 'admin',
      //     isActive: true
      //   };
        
      //   dispatch({
      //     type: 'LOGIN_SUCCESS',
      //     payload: {
      //       user: mockUser,
      //       token: 'bypass-token',
      //     },
      //   });
      //   return;
      // }

      const token = localStorage.getItem('adminToken');
      const user = localStorage.getItem('adminUser');

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
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            dispatch({ type: 'LOGIN_FAILURE' });
          }
        } catch (error) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          dispatch({ type: 'LOGIN_FAILURE' });
        }
      } else {
        dispatch({ type: 'LOGIN_FAILURE' });
      }
    };

    initAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authAPI.login({ email, password, rememberMe });
      
      if (response.data.success) {
        const { data } = response.data;
        
        // Check if user is admin
        if (data.role !== 'admin') {
          throw new Error('Access denied. Admin privileges required.');
        }

        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data));

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
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    login,
    logout,
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

