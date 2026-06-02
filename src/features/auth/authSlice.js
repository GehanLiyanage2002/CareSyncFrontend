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
    updateUser: (state, action) => {
      // Merge the updated fields into the existing user object
      state.user = { ...state.user, ...action.payload };
      // Persist the updated user object to localStorage
      localStorage.setItem('caresync_user', JSON.stringify(state.user));
    },
  },
});

export const { loginSuccess, logout, updateUser } = authSlice.actions;

export default authSlice.reducer;
