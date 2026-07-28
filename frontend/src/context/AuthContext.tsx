import React, { createContext, useContext, useEffect, useReducer, useMemo } from 'react';
import { getItemAsync, setItemAsync, deleteItemAsync } from '../utils/storage';
import authService, { User, RegisterData, LoginData } from '../api/services/authService';
import { Config } from '../constants/config';

// Types
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isSignout: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'RESTORE_TOKEN'; token: string | null; user: User | null }
  | { type: 'SIGN_IN'; token: string; user: User }
  | { type: 'SIGN_OUT' }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'UPDATE_USER'; user: User };

interface AuthContextType extends AuthState {
  signIn: (data: LoginData) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isSignout: false,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        token: action.token,
        user: action.user,
        isLoading: false,
      };
    case 'SIGN_IN':
      return {
        ...state,
        isSignout: false,
        token: action.token,
        user: action.user,
        isLoading: false,
        error: null,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        isSignout: true,
        token: null,
        user: null,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.user,
      };
    default:
      return state;
  }
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore token on app start
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await getItemAsync(Config.TOKEN_KEY);
        const userStr = await getItemAsync(Config.USER_KEY);

        if (token && userStr) {
          const user = JSON.parse(userStr) as User;
          
          // Verify token is still valid by fetching user profile
          try {
            const response = await authService.getMe();
            dispatch({
              type: 'RESTORE_TOKEN',
              token,
              user: response.data.user,
            });
            // Update stored user data
            await setItemAsync(
              Config.USER_KEY,
              JSON.stringify(response.data.user)
            );
          } catch {
            // Token expired or invalid
            await deleteItemAsync(Config.TOKEN_KEY);
            await deleteItemAsync(Config.USER_KEY);
            dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
          }
        } else {
          dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
        }
      } catch {
        dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = useMemo(
    () => ({
      ...state,
      signIn: async (data: LoginData) => {
        dispatch({ type: 'SET_LOADING', isLoading: true });
        try {
          const response = await authService.login(data);
          const { user, token } = response.data;

          await setItemAsync(Config.TOKEN_KEY, token);
          await setItemAsync(Config.USER_KEY, JSON.stringify(user));

          dispatch({ type: 'SIGN_IN', token, user });
        } catch (error: any) {
          dispatch({
            type: 'SET_ERROR',
            error: error.message || 'Login failed',
          });
          throw error;
        }
      },

      signUp: async (data: RegisterData) => {
        dispatch({ type: 'SET_LOADING', isLoading: true });
        try {
          const response = await authService.register(data);
          const { user, token } = response.data;

          await setItemAsync(Config.TOKEN_KEY, token);
          await setItemAsync(Config.USER_KEY, JSON.stringify(user));

          dispatch({ type: 'SIGN_IN', token, user });
        } catch (error: any) {
          dispatch({
            type: 'SET_ERROR',
            error: error.message || 'Registration failed',
          });
          throw error;
        }
      },

      signOut: async () => {
        await deleteItemAsync(Config.TOKEN_KEY);
        await deleteItemAsync(Config.USER_KEY);
        dispatch({ type: 'SIGN_OUT' });
      },

      updateUser: async (data: Partial<User>) => {
        try {
          const response = await authService.updateProfile(data);
          const user = response.data.user;

          await setItemAsync(Config.USER_KEY, JSON.stringify(user));
          dispatch({ type: 'UPDATE_USER', user });
        } catch (error: any) {
          dispatch({
            type: 'SET_ERROR',
            error: error.message || 'Profile update failed',
          });
          throw error;
        }
      },

      clearError: () => {
        dispatch({ type: 'SET_ERROR', error: null });
      },
    }),
    [state]
  );

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};

// Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
