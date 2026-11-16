const request = require('supertest');
const { createApp } = require('../src/app');
const { createDb } = require('../src/db');

let app;
beforeEach(() => { app = createApp({ db: createDb() }); }); // fresh DB per test

const sample = { name: 'Fake', url: 'http://localhost:4000/health', interval_sec: 10 };

test('creates a target', async () => {
  const res = await request(app).post('/targets').send(sample);
  expect(res.status).toBe(201);
  expect(res.body).toMatchObject({ id: 1, name: 'Fake', active: true });
});

test('lists targets', async () => {
  await request(app).post('/targets').send(sample);
  const res = await request(app).get('/targets');
  expect(res.body).toHaveLength(1);
});

test('rejects an invalid url', async () => {
  const res = await request(app).post('/targets').send({ ...sample, url: 'nope' });
  expect(res.status).toBe(400);
});

test('returns 404 for unknown id', async () => {
  const res = await request(app).get('/targets/999');
  expect(res.status).toBe(404);
});

test('deletes a target', async () => {
  await request(app).post('/targets').send(sample);
  const del = await request(app).delete('/targets/1');
  expect(del.status).toBe(204);
  expect((await request(app).get('/targets/1')).status).toBe(404);
});