import express from 'express';
import request from 'supertest';
import type { CreateGreeting } from '../../application/use-cases/CreateGreeting';
import type { DeleteGreeting } from '../../application/use-cases/DeleteGreeting';
import type { GetGreeting } from '../../application/use-cases/GetGreeting';
import type { UpdateGreeting } from '../../application/use-cases/UpdateGreeting';
import { Greeting } from '../../domain/entities/Greeting';
import { GreetingController } from '../../interface/http/controllers/GreetingController';

// Mock use cases
const mockGetGreeting: jest.Mocked<GetGreeting> = {
  execute: jest.fn(),
  executeAll: jest.fn(),
  executeById: jest.fn(),
} as unknown as jest.Mocked<GetGreeting>;

const mockCreateGreeting: jest.Mocked<CreateGreeting> = {
  execute: jest.fn(),
} as unknown as jest.Mocked<CreateGreeting>;

const mockUpdateGreeting: jest.Mocked<UpdateGreeting> = {
  execute: jest.fn(),
} as unknown as jest.Mocked<UpdateGreeting>;

const mockDeleteGreeting: jest.Mocked<DeleteGreeting> = {
  execute: jest.fn(),
} as unknown as jest.Mocked<DeleteGreeting>;

const controller = new GreetingController(
  mockGetGreeting,
  mockCreateGreeting,
  mockUpdateGreeting,
  mockDeleteGreeting
);

// Minimal express app for testing the controller
const app = express();
app.use(express.json());
app.get('/api/greetings', controller.getAll);
app.get('/api/greetings/:id', controller.getById);
app.post('/api/greetings', controller.create);
app.put('/api/greetings/:id', controller.update);
app.delete('/api/greetings/:id', controller.delete);

describe('GreetingController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/greetings', () => {
    it('returns all greetings', async () => {
      const greetings = [
        new Greeting({ id: '1', message: 'Hello' }),
        new Greeting({ id: '2', message: 'World' }),
      ];
      mockGetGreeting.executeAll.mockResolvedValue(greetings);

      const response = await request(app).get('/api/greetings');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].message).toBe('Hello');
    });

    it('returns 500 on error', async () => {
      mockGetGreeting.executeAll.mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/greetings');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch greetings');
    });
  });

  describe('GET /api/greetings/:id', () => {
    it('returns a greeting by id', async () => {
      const greeting = new Greeting({ id: '1', message: 'Hello' });
      mockGetGreeting.executeById.mockResolvedValue(greeting);

      const response = await request(app).get('/api/greetings/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Hello');
    });

    it('returns 404 when not found', async () => {
      mockGetGreeting.executeById.mockResolvedValue(null);

      const response = await request(app).get('/api/greetings/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Greeting not found');
    });
  });

  describe('POST /api/greetings', () => {
    it('creates a greeting and returns 201', async () => {
      const created = new Greeting({
        id: 'new-id',
        message: 'New greeting',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockCreateGreeting.execute.mockResolvedValue(created);

      const response = await request(app).post('/api/greetings').send({ message: 'New greeting' });

      expect(response.status).toBe(201);
      expect(response.body.id).toBe('new-id');
      expect(response.body.message).toBe('New greeting');
    });

    it('returns 400 when message is missing', async () => {
      const response = await request(app).post('/api/greetings').send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Message is required and must be a string');
    });

    it('returns 400 when message is not a string', async () => {
      const response = await request(app).post('/api/greetings').send({ message: 123 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Message is required and must be a string');
    });
  });

  describe('PUT /api/greetings/:id', () => {
    it('updates a greeting and returns it', async () => {
      const updated = new Greeting({ id: '1', message: 'Updated' });
      mockUpdateGreeting.execute.mockResolvedValue(updated);

      const response = await request(app).put('/api/greetings/1').send({ message: 'Updated' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Updated');
    });

    it('returns 404 when greeting not found', async () => {
      mockUpdateGreeting.execute.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/greetings/nonexistent')
        .send({ message: 'Updated' });

      expect(response.status).toBe(404);
    });

    it('returns 400 when message is missing', async () => {
      const response = await request(app).put('/api/greetings/1').send({});

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/greetings/:id', () => {
    it('returns 204 on successful delete', async () => {
      mockDeleteGreeting.execute.mockResolvedValue(true);

      const response = await request(app).delete('/api/greetings/1');

      expect(response.status).toBe(204);
    });

    it('returns 404 when greeting not found', async () => {
      mockDeleteGreeting.execute.mockResolvedValue(false);

      const response = await request(app).delete('/api/greetings/nonexistent');

      expect(response.status).toBe(404);
    });
  });
});
