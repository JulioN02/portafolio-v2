export interface ErrorFallbackProps {
  onReset?: () => void;
  title?: string;
  message?: string;
}

export function ErrorFallback({
  onReset,
  title = 'Algo salió mal',
  message = 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
}: ErrorFallbackProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
      minHeight: '300px',
    }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#333' }}>
        {title}
      </h2>
      <p style={{ fontSize: '1rem', color: '#666', marginBottom: '24px' }}>
        {message}
      </p>
      {onReset && (
        <button
          onClick={onReset}
          style={{
            padding: '12px 32px',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#fff',
            backgroundColor: '#2563eb',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
