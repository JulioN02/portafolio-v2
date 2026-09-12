import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { RecruiterContactForm } from './RecruiterContactForm';

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
  return render(<RecruiterContactForm />, { wrapper });
}

function fillValidForm() {
  fireEvent.change(screen.getByLabelText('Nombre completo *'), { target: { value: 'Luis' } });
  fireEvent.change(screen.getByLabelText('Correo electrónico *'), {
    target: { value: 'luis@example.com' },
  });
  fireEvent.change(screen.getByLabelText('Teléfono *'), { target: { value: '+57 300 111 2233' } });
  fireEvent.change(screen.getByLabelText('Empresa *'), { target: { value: 'Acme' } });
  fireEvent.change(screen.getByLabelText('Cargo *'), { target: { value: 'Tech Lead' } });
  fireEvent.change(screen.getByLabelText('Presupuesto / Rango salarial *'), {
    target: { value: '$50k' },
  });
  fireEvent.change(screen.getByLabelText('Mensaje *'), {
    target: { value: 'Hola, tengo una oportunidad laboral.' },
  });
}

describe('RecruiterContactForm — anti-spam wiring (contact-anti-spam)', () => {
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

  it('includes website:"" and turnstileToken in the recruiter submit payload', async () => {
    renderForm();
    fillValidForm();

    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(1));
    const [path, body] = mockPost.mock.calls[0];
    expect(path).toBe('/contact/recruiter');
    expect(body.website).toBe('');
    expect(body).toHaveProperty('turnstileToken');
  });

  it('renders the Turnstile widget when the site key is set and passes its token into the payload', async () => {
    const renderMock = vi.fn();
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '0x4AAAAAAA-test');
    let widgetCallback: ((token: string) => void) | undefined;
    renderMock.mockImplementation((_el: HTMLElement, options: { callback?: (t: string) => void }) => {
      widgetCallback = options.callback;
      return 'widget-1';
    });
    window.turnstile = { render: renderMock, remove: vi.fn() };

    renderForm();
    fillValidForm();

    expect(renderMock).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ sitekey: '0x4AAAAAAA-test' }),
    );

    act(() => {
      widgetCallback?.('token-abc');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(1));
    const [, body] = mockPost.mock.calls[0];
    expect(body.turnstileToken).toBe('token-abc');
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

describe('RecruiterContactForm — phone normalization + min-length validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPost.mockResolvedValue({ message: 'Contact form submitted successfully', data: {} });
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('normalizes the phone field to canonical digits before submitting', async () => {
    renderForm();
    fillValidForm();

    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(1));
    const [, body] = mockPost.mock.calls[0];
    expect(body.whatsapp).toBe('+573001112233');
  });

  it('shows a validation error when the normalized phone is not 10–15 digits', async () => {
    renderForm();
    fillValidForm();
    fireEvent.change(screen.getByLabelText('Teléfono *'), {
      target: { value: '1-234-567' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    expect(
      await screen.findByText('Ingrese un número de teléfono válido (ej. +57 300 000 0000)'),
    ).toBeInTheDocument();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('shows a validation error for a name shorter than 2 characters', async () => {
    renderForm();
    fillValidForm();
    fireEvent.change(screen.getByLabelText('Nombre completo *'), {
      target: { value: 'A' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    expect(
      await screen.findByText('El nombre debe tener al menos 2 caracteres'),
    ).toBeInTheDocument();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('shows a validation error for a message shorter than 10 characters', async () => {
    renderForm();
    fillValidForm();
    fireEvent.change(screen.getByLabelText('Mensaje *'), {
      target: { value: 'Hola' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    expect(
      await screen.findByText('El mensaje debe tener al menos 10 caracteres'),
    ).toBeInTheDocument();
    expect(mockPost).not.toHaveBeenCalled();
  });
});

describe('RecruiterContactForm — success card (i18n + auto-reset)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPost.mockResolvedValue({ message: 'Contact form submitted successfully', data: {} });
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('shows the i18n success title and message, NOT the API message', async () => {
    renderForm();
    fillValidForm();

    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    expect(await screen.findByText('¡Mensaje enviado!')).toBeInTheDocument();
    expect(
      screen.getByText('¡Gracias por escribirme! Te responderé lo antes posible.'),
    ).toBeInTheDocument();
    // The spanglish fix: the raw English API message must never surface.
    expect(screen.queryByText('Contact form submitted successfully')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar otro mensaje' })).toBeInTheDocument();
  });

  it('the manual reset button returns to the form immediately', async () => {
    renderForm();
    fillValidForm();

    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
    expect(await screen.findByText('¡Mensaje enviado!')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Enviar otro mensaje' }));

    await waitFor(() => {
      expect(screen.queryByText('¡Mensaje enviado!')).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeInTheDocument();
  });

  it('auto-resets the success card back to the form after ~5 seconds', async () => {
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
    renderForm();
    fillValidForm();

    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
    expect(await screen.findByText('¡Mensaje enviado!')).toBeInTheDocument();

    // The component schedules a single 5000ms auto-reset timer.
    const autoResetTimer = setTimeoutSpy.mock.calls.find(([, delay]) => delay === 5000);
    expect(autoResetTimer).toBeDefined();
    const autoResetCallback = autoResetTimer![0] as () => void;

    act(() => {
      autoResetCallback();
    });

    await waitFor(() => {
      expect(screen.queryByText('¡Mensaje enviado!')).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeInTheDocument();

    setTimeoutSpy.mockRestore();
  });
});