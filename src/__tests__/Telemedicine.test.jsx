import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Telemedicine from '../components/Telemedicine';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Telemedicine Component Unit Test', () => {
  it('should render the telemedicine component correctly', () => {
    render(
      <BrowserRouter>
        <Telemedicine />
      </BrowserRouter>
    );
    expect(screen.getByText(/Consult Top Doctors/i)).toBeInTheDocument();
    expect(screen.getByText(/From Anywhere/i)).toBeInTheDocument();
    expect(screen.getByText(/Start Consultation/i)).toBeInTheDocument();
  });

  it('should navigate to login when Start Consultation is clicked', () => {
    render(
      <BrowserRouter>
        <Telemedicine />
      </BrowserRouter>
    );
    const startBtn = screen.getByRole('button', { name: /Start your secure online consultation/i });
    fireEvent.click(startBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
