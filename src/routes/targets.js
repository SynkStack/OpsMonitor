const express = require('express');
const { z } = require('zod');

// Shape of a valid new target
const targetSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  interval_sec: z.number().int().min(5).default(30),
});

function targetsRouter(repo) {
  const router = express.Router();

  router.post('/', (req, res) => {
    const parsed = targetSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
    res.status(201).json(repo.create(parsed.data));
  });

  router.get('/', (req, res) => res.json(repo.list()));

  router.get('/:id', (req, res) => {
    const target = repo.get(Number(req.params.id));
    if (!target) return res.status(404).json({ error: 'not found' });
    res.json(target);
  });

  router.delete('/:id', (req, res) => {
    const removed = repo.remove(Number(req.params.id));
    if (!removed) return res.status(404).json({ error: 'not found' });
    res.status(204).end();
  });

  return router;
}

module.exports = { targetsRouter };