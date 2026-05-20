import React from 'react';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught an error:', error);
    console.error('[ErrorBoundary] Component stack:', info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          textAlign: 'center',
          minHeight: '300px'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#333' }}>
            Algo salió mal
          </h2>
          <p style={{ fontSize: '1rem', color: '#666', marginBottom: '24px' }}>
            Ocurrió un error inesperado. Por favor, intenta de nuevo.
          </p>
          <button
            onClick={this.handleReset}
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
        </div>
      );
    }

    return this.props.children;
  }
}
