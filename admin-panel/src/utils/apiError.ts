/**
 * Converts an unknown API error into a safe, user-facing Spanish message.
 * Never leaks stack traces, request bodies or internal details.
 */
export function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const maybe = error as {
      code?: string;
      status?: number;
      message?: string;
      fields?: Record<string, string[]>;
    };

    if (maybe.code === 'SITUATION_SERVICE_LIMIT') {
      return 'Una situación no puede tener más de 3 servicios.';
    }
    if (maybe.status === 409) {
      return 'No se pudo guardar por un conflicto con los datos actuales.';
    }
    if (maybe.status === 404) {
      return 'El recurso ya no está disponible.';
    }
    if (maybe.fields && Object.keys(maybe.fields).length > 0) {
      const first = Object.values(maybe.fields)[0];
      if (Array.isArray(first) && first[0]) return first[0];
    }
  }
  return 'Ocurrió un error al guardar. Intenta de nuevo.';
}
