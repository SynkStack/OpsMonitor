const { checkTarget } = require('../src/checker');

afterEach(() => jest.restoreAllMocks());

// Helper: replace global fetch with a fake
const mockFetch = (impl) => jest.spyOn(global, 'fetch').mockImplementation(impl);

test('2xx response is up', async () => {
  mockFetch(async () => ({ ok: true, status: 200 }));
  const r = await checkTarget('http://x');
  expect(r.status).toBe('up');
  expect(r.httpCode).toBe(200);
});

test('500 response is down', async () => {
  mockFetch(async () => ({ ok: false, status: 500 }));
  const r = await checkTarget('http://x');
  expect(r.status).toBe('down');
  expect(r.httpCode).toBe(500);
});

test('network error is down with no http code', async () => {
  mockFetch(async () => { throw new Error('ECONNREFUSED'); });
  const r = await checkTarget('http://x');
  expect(r.status).toBe('down');
  expect(r.httpCode).toBeNull();
});