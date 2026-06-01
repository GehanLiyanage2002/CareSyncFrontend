import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('http://localhost:5000/api/services');
      if (response.data.success) {
        return response.data.services;
      } else {
        return rejectWithValue('Failed to fetch services');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const servicesSlice = createSlice({
  name: 'services',
  initialState: {
    services: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default servicesSlice.reducer;
