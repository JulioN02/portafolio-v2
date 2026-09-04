// Shared package test setup
// jsdom lacks ResizeObserver and a scriptable matchMedia; embla requires
// ResizeObserver at init. Both mocks are environment-safe (node-only test
// files, e.g. schema tests, are unaffected).

if (typeof window !== 'undefined') {
  class ResizeObserverMock {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }

  Object.defineProperty(globalThis, 'ResizeObserver', {
    value: ResizeObserverMock,
    writable: true,
    configurable: true,
  });

  const matchMediaMock = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;

  Object.defineProperty(window, 'matchMedia', {
    value: matchMediaMock,
    writable: true,
    configurable: true,
  });
}