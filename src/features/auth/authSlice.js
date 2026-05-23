import { createSlice } from '@reduxjs/toolkit';

// Load persisted auth state from localStorage on app start
const loadStateFromStorage = () => {
  try {
    const token = localStorage.getItem('caresync_token');
    const user = JSON.parse(localStorage.getItem('caresync_user'));
    if (token && user) {
      return { user, token, isAuthenticated: true };
    }
  } catch {
    // If parsing fails, return the default state
  }
  return { user: null, token: null, isAuthenticated: false };
};

const initialState = loadStateFromStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      // Persist to localStorage so session survives page refreshes
      localStorage.setItem('caresync_token', action.payload.token);
      localStorage.setItem('caresync_user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      // Clear persisted session data
      localStorage.removeItem('caresync_token');
      localStorage.removeItem('caresync_user');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;
