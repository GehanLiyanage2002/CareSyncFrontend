import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Chatbot from '../components/Chatbot';
import axios from 'axios';
import * as reactRedux from 'react-redux';

vi.mock('axios');

// Mock react-redux
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

describe('Chatbot Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders chatbot button when user is a patient', () => {
    // Mock user as Patient
    reactRedux.useSelector.mockImplementation((callback) => callback({
      auth: { user: { role: 'Patient' } }
    }));

    render(<Chatbot />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('does not render chatbot for Admin users', () => {
    // Mock user as Admin
    reactRedux.useSelector.mockImplementation((callback) => callback({
      auth: { user: { role: 'Admin' } }
    }));

    const { container } = render(<Chatbot />);
    expect(container).toBeEmptyDOMElement();
  });

  it('opens chat window when button is clicked', () => {
    reactRedux.useSelector.mockImplementation((callback) => callback({
      auth: { user: { role: 'Patient' } }
    }));

    render(<Chatbot />);
    
    // Open chat
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Assert chat window elements
    expect(screen.getByText('CareSync Assistant')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask about CareSync...')).toBeInTheDocument();
    expect(screen.getByText(/Hello! I am the CareSync system assistant/i)).toBeInTheDocument();
  });

  it('sends message and displays assistant response', async () => {
    reactRedux.useSelector.mockImplementation((callback) => callback({
      auth: { user: { role: 'Patient' } }
    }));

    // Mock successful API response
    axios.post.mockResolvedValueOnce({
      data: { success: true, reply: 'I can help you with appointments.' }
    });

    render(<Chatbot />);
    
    // Open chat
    fireEvent.click(screen.getByRole('button'));

    // Type and send message
    const input = screen.getByPlaceholderText('Ask about CareSync...');
    fireEvent.change(input, { target: { value: 'How do I book?' } });
    
    // The send button inside form
    const sendButton = screen.getAllByRole('button')[1]; 
    fireEvent.click(sendButton);

    // Verify user message appears
    expect(screen.getByText('How do I book?')).toBeInTheDocument();

    // Verify loading state is temporarily shown (simulated by disabled input)
    expect(input).toBeDisabled();

    // Verify API called correctly
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/chat'), 
      { message: 'How do I book?' }
    );

    // Verify assistant reply appears
    await waitFor(() => {
      expect(screen.getByText('I can help you with appointments.')).toBeInTheDocument();
    });

    // Verify input is re-enabled
    expect(input).not.toBeDisabled();
  });

  it('handles API errors gracefully', async () => {
    reactRedux.useSelector.mockImplementation((callback) => callback({
      auth: { user: { role: 'Patient' } }
    }));

    // Mock failed API response
    axios.post.mockRejectedValueOnce(new Error('Network Error'));

    render(<Chatbot />);
    
    // Open chat
    fireEvent.click(screen.getByRole('button'));

    // Type and send message
    const input = screen.getByPlaceholderText('Ask about CareSync...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    const sendButton = screen.getAllByRole('button')[1]; 
    fireEvent.click(sendButton);

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText('Sorry, I am having trouble connecting to the system right now.')).toBeInTheDocument();
    });
  });
});
