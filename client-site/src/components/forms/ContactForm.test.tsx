import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { ContactForm } from './ContactForm';

const mockPost = vi.fn();

vi.mock('../../api/client', () => ({
  apiClient: { post: (path: string, body: unknown) => mockPost(path, body) },
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>{children}</LanguageProvider>
    </QueryClientProvider>
  );
}

function renderForm() {
  return render(<ContactForm source="general" />, { wrapper });
}

function fillValidForm() {
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
  fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'García' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.com' } });
  fireEvent.change(screen.getByLabelText('WhatsApp'), { target: { value: '+573001112233' } });
  fireEvent.change(screen.getByLabelText('Mensaje'), {
    target: { value: 'Hola, me interesa un desarrollo web.' },
  });
}

describe('ContactForm — anti-spam wiring (contact-anti-spam)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPost.mockResolvedValue({ message: 'Contact form submitted successfully', data: {} });
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders a visually-hidden honeypot input named website (tabIndex -1, autocomplete off)', () => {
    const { container } = renderForm();

    const honeypot = container.querySelector('input[name="website"]');
    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute('tabindex', '-1');
    expect(honeypot).toHaveAttribute('autocomplete', 'off');
    expect(honeypot).toHaveAttribute('aria-hidden', 'true');
  });

  it('includes website:"" and turnstileToken in the submit payload', async () => {
    renderForm();
    fillValidForm();

    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(1));
    const [path, body] = mockPost.mock.calls[0];
    expect(path).toBe('/contact/client');
    expect(body.website).toBe('');
    expect(body).toHaveProperty('turnstileToken');
  });

  it('renders the Turnstile widget when VITE_TURNSTILE_SITE_KEY is set and passes its token into the payload', async () => {
    const renderMock = vi.fn();
    const removeMock = vi.fn();
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '0x4AAAAAAA-test');
    let widgetCallback: ((token: string) => void) | undefined;
    renderMock.mockImplementation((_el: HTMLElement, options: { callback?: (t: string) => void }) => {
      widgetCallback = options.callback;
      return 'widget-1';
    });
    window.turnstile = { render: renderMock, remove: removeMock };

    renderForm();
    fillValidForm();

    expect(renderMock).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ sitekey: '0x4AAAAAAA-test' }),
    );

    act(() => {
      widgetCallback?.('token-123');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(1));
    const [, body] = mockPost.mock.calls[0];
    expect(body.turnstileToken).toBe('token-123');
  });

  it('does not render the Turnstile widget when the site key is empty', () => {
    const renderMock = vi.fn();
    window.turnstile = { render: renderMock, remove: vi.fn() };

    renderForm();

    expect(renderMock).not.toHaveBeenCalled();
    expect(document.getElementById('cf-turnstile-script')).toBeNull();
  });

  it('maps a 400 TURNSTILE_FAILED response to an inline error', async () => {
    mockPost.mockRejectedValue({
      message: 'Turnstile verification failed',
      code: 'TURNSTILE_FAILED',
      status: 400,
    });

    renderForm();
    fillValidForm();

    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    expect(
      await screen.findByText('Verificación anti-spam fallida. Por favor, inténtalo de nuevo.'),
    ).toBeInTheDocument();
  });
});

describe('ContactForm — phone normalization + format validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPost.mockResolvedValue({ message: 'Contact form submitted successfully', data: {} });
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('normalizes the whatsapp field to canonical digits before submitting', async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'García' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText('WhatsApp'), {
      target: { value: '+57 300 372-7134' },
    });
    fireEvent.change(screen.getByLabelText('Mensaje'), {
      target: { value: 'Hola, me interesa un desarrollo web.' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(1));
    const [, body] = mockPost.mock.calls[0];
    expect(body.whatsapp).toBe('+573003727134');
  });

  it('shows a validation error for a non-numeric whatsapp', async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'García' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText('WhatsApp'), { target: { value: 'abc' } });
    fireEvent.change(screen.getByLabelText('Mensaje'), {
      target: { value: 'Hola, me interesa un desarrollo web.' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    expect(
      await screen.findByText('Ingrese un número de WhatsApp válido'),
    ).toBeInTheDocument();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('shows a validation error for a first name shorter than 2 characters', async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'García' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText('WhatsApp'), { target: { value: '+573001112233' } });
    fireEvent.change(screen.getByLabelText('Mensaje'), {
      target: { value: 'Hola, me interesa un desarrollo web.' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    expect(
      await screen.findByText('El nombre debe tener al menos 2 caracteres'),
    ).toBeInTheDocument();
    expect(mockPost).not.toHaveBeenCalled();
  });
});

describe('ContactForm — success card (i18n + auto-reset)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPost.mockResolvedValue({ message: 'Contact form submitted successfully', data: {} });
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('shows the i18n success title and message after a successful submit', async () => {
    renderForm();
    fillValidForm();

    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    expect(await screen.findByText('¡Mensaje enviado!')).toBeInTheDocument();
    expect(
      screen.getByText('¡Gracias por escribirme! Te responderé lo antes posible.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar otro mensaje' })).toBeInTheDocument();
  });

  it('the manual reset button returns to the form immediately', async () => {
    renderForm();
    fillValidForm();

    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
    expect(await screen.findByText('¡Mensaje enviado!')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Enviar otro mensaje' }));

    expect(screen.queryByText('¡Mensaje enviado!')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeInTheDocument();
  });

  it('auto-resets the success card back to the form after ~5 seconds', async () => {
    vi.useFakeTimers();
    renderForm();
    fillValidForm();

    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    // Flush the async mutation microtasks so onSuccess commits the success state.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByText('¡Mensaje enviado!')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('¡Mensaje enviado!')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeInTheDocument();
  });
});