import { Greeting } from '../../domain/entities/Greeting';

describe('Greeting Entity', () => {
  describe('constructor', () => {
    it('creates a greeting with all properties', () => {
      const now = new Date();
      const greeting = new Greeting({
        id: '123',
        message: 'Hello',
        createdAt: now,
        updatedAt: now,
      });

      expect(greeting.id).toBe('123');
      expect(greeting.message).toBe('Hello');
      expect(greeting.createdAt).toBe(now);
      expect(greeting.updatedAt).toBe(now);
    });

    it('creates a greeting with only message', () => {
      const greeting = new Greeting({ message: 'Hi there' });

      expect(greeting.id).toBeUndefined();
      expect(greeting.message).toBe('Hi there');
      expect(greeting.createdAt).toBeUndefined();
      expect(greeting.updatedAt).toBeUndefined();
    });
  });

  describe('createDefault', () => {
    it('returns a greeting with the default message', () => {
      const greeting = Greeting.createDefault();

      expect(greeting.message).toBe('Hello from Express + TypeScript + esbuild!');
      expect(greeting.id).toBeUndefined();
    });
  });

  describe('create', () => {
    it('returns a greeting with the given message', () => {
      const greeting = Greeting.create('Custom message');

      expect(greeting.message).toBe('Custom message');
      expect(greeting.id).toBeUndefined();
    });
  });
});
