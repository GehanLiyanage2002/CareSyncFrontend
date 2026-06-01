import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/doctors');
      if (response.data.success) {
        return response.data.doctors;
      } else {
        return rejectWithValue('Failed to fetch doctors');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState: {
    doctors: [],
    loading: false,
    error: null,
  },
  reducers: {
    updateDoctorAvailability: (state, action) => {
      const { doctor_id, is_available } = action.payload;
      const doctor = state.doctors.find((d) => d.doctor_id === doctor_id || d.id === doctor_id);
      if (doctor) {
        doctor.is_available = is_available;
      }
    },
    updateDoctorFee: (state, action) => {
      const { doctor_id, fee } = action.payload;
      const doctor = state.doctors.find((d) => d.doctor_id === doctor_id || d.id === doctor_id);
      if (doctor) {
        doctor.consultation_fee = fee;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateDoctorAvailability, updateDoctorFee } = doctorsSlice.actions;
export default doctorsSlice.reducer;
