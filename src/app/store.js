import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import doctorsReducer from '../features/doctors/doctorsSlice';
import servicesReducer from '../features/services/servicesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    doctors: doctorsReducer,
    services: servicesReducer,
  },
});
