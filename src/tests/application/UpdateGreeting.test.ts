import { UpdateGreeting } from '../../application/use-cases/UpdateGreeting';
import { Greeting } from '../../domain/entities/Greeting';
import type { GreetingRepository } from '../../domain/repositories/GreetingRepository';

const mockRepository: jest.Mocked<GreetingRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('UpdateGreeting Use Case', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates a greeting and returns the updated entity', async () => {
    const now = new Date();
    const updated = new Greeting({
      id: 'abc123',
      message: 'Updated message',
      createdAt: now,
      updatedAt: now,
    });
    mockRepository.update.mockResolvedValue(updated);

    const useCase = new UpdateGreeting(mockRepository);
    const result = await useCase.execute('abc123', 'Updated message');

    expect(result).toEqual(updated);
    expect(mockRepository.update).toHaveBeenCalledWith('abc123', {
      message: 'Updated message',
    });
  });

  it('returns null when greeting not found', async () => {
    mockRepository.update.mockResolvedValue(null);

    const useCase = new UpdateGreeting(mockRepository);
    const result = await useCase.execute('nonexistent', "Doesn't matter");

    expect(result).toBeNull();
  });
});
