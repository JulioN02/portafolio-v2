import type { AddressInfo } from 'net';
import type { Server } from 'http';

jest.mock('otplib', () => ({
  __esModule: true,
  default: {
    authenticator: {
      options: {},
      generateSecret: jest.fn(),
      keyuri: jest.fn(),
      check: jest.fn(),
    },
  },
}));

import app from '../app';

describe('application security middleware', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(() => {
    server.close();
  });

  it('denies an unapproved CORS origin', async () => {
    const response = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'https://unapproved.example' },
    });

    expect(response.status).toBe(403);
    expect(response.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('allows an explicitly configured local origin without wildcard credentials', async () => {
    const response = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'http://localhost:5173' },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
    expect(response.headers.get('access-control-allow-credentials')).toBe('true');
    expect(response.headers.get('access-control-allow-origin')).not.toBe('*');
  });
});
