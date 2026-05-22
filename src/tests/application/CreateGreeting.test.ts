import { CreateGreeting } from '../../application/use-cases/CreateGreeting';
import { Greeting } from '../../domain/entities/Greeting';
import type { GreetingRepository } from '../../domain/repositories/GreetingRepository';

const mockRepository: jest.Mocked<GreetingRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('CreateGreeting Use Case', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a greeting and returns it with id and timestamps', async () => {
    const now = new Date();
    const created = new Greeting({
      id: 'abc123',
      message: 'New greeting',
      createdAt: now,
      updatedAt: now,
    });
    mockRepository.create.mockResolvedValue(created);

    const useCase = new CreateGreeting(mockRepository);
    const result = await useCase.execute('New greeting');

    expect(result.id).toBe('abc123');
    expect(result.message).toBe('New greeting');
    expect(result.createdAt).toBe(now);
    expect(mockRepository.create).toHaveBeenCalledTimes(1);

    const passedGreeting = mockRepository.create.mock.calls[0][0];
    expect(passedGreeting.message).toBe('New greeting');
  });
});
