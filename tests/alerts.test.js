const { createNotifier } = require('../src/alerts');

afterEach(() => jest.restoreAllMocks());

const event = { type: 'incident_opened', target: { name: 'A' }, incident: { summary: 'down' } };

test('logs to console when no webhook is set', async () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await createNotifier({ webhookUrl: '' })(event);
  expect(spy).toHaveBeenCalled();
});

test('posts to the webhook when set', async () => {
  const fetchFn = jest.fn(async () => ({ ok: true }));
  await createNotifier({ webhookUrl: 'http://hook', fetchFn })(event);
  expect(fetchFn).toHaveBeenCalledWith('http://hook', expect.objectContaining({ method: 'POST' }));
});

test('a failing webhook does not throw', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  const fetchFn = jest.fn(async () => { throw new Error('boom'); });
  await expect(createNotifier({ webhookUrl: 'http://hook', fetchFn })(event)).resolves.toBeUndefined();
});