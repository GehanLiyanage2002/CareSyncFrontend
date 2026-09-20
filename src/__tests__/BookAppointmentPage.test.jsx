import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BookAppointmentPage from '../pages/BookAppointmentPage';
import axios from 'axios';
import * as reactRouterDom from 'react-router-dom';

vi.mock('axios');

// Mock socket.io
vi.mock('../socket', () => ({
  default: {
    on: vi.fn(),
    off: vi.fn(),
  },
}));

// Mock react-redux
vi.mock('react-redux', () => ({
  useSelector: vi.fn((callback) => callback({
    auth: {
      user: { name: 'Test Patient', role: 'Patient', email: 'test@example.com' },
      token: 'mock-token',
    },
  })),
  useDispatch: vi.fn(),
}));

const mockNavigate = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: vi.fn(),
  };
});

describe('BookAppointmentPage Integration Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    axios.get.mockImplementation((url) => {
      if (url.includes('/api/users/doctors')) {
        return Promise.resolve({
          data: {
            success: true,
            doctors: [
              {
                id: 1,
                name: 'Dr. Smith',
                specialization: 'Psychology',
                consultationFee: 1500,
                is_available: true,
              },
              {
                id: 2,
                name: 'Dr. Jones',
                specialization: 'Cardiology',
                consultationFee: 2000,
                is_available: true,
              }
            ]
          }
        });
      }
      if (url.includes('/api/appointments/configured-dates/')) {
        return Promise.resolve({
          data: {
            success: true,
            dates: ['2026-10-15T00:00:00.000Z']
          }
        });
      }
      if (url.includes('/api/appointments/slots/')) {
        return Promise.resolve({
          data: {
            success: true,
            slots: [
              { time: '10:00', isBuffer: false },
              { time: '10:30', isBuffer: false }
            ]
          }
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it('renders telemedicine booking indicator when doctor specialization is psychology', async () => {
    // Mock location state
    reactRouterDom.useLocation.mockReturnValue({
      state: {
        doctor: {
          id: 1,
          name: 'Dr. Smith',
          specialization: 'Psychology',
          consultationFee: 1500,
        }
      }
    });

    render(
      <BrowserRouter>
        <BookAppointmentPage />
      </BrowserRouter>
    );

    // Should indicate it's a Telemedicine Video Consultation due to specialization logic
    await waitFor(() => {
      expect(screen.getByText(/Telemedicine Video Consultation/i)).toBeInTheDocument();
    });

    // Dates should be loaded
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  it('renders telemedicine booking when explicitly passed in state', async () => {
    reactRouterDom.useLocation.mockReturnValue({
      state: {
        isTelemedicine: true,
        doctor: {
          id: 2,
          name: 'Dr. Jones',
          specialization: 'Cardiology',
          consultationFee: 2000,
        }
      }
    });

    render(
      <BrowserRouter>
        <BookAppointmentPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Telemedicine Video Consultation/i)).toBeInTheDocument();
    });
  });
});
