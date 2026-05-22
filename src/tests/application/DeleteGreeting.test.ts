import { DeleteGreeting } from '../../application/use-cases/DeleteGreeting';
import type { GreetingRepository } from '../../domain/repositories/GreetingRepository';

const mockRepository: jest.Mocked<GreetingRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('DeleteGreeting Use Case', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns true when greeting is deleted', async () => {
    mockRepository.delete.mockResolvedValue(true);

    const useCase = new DeleteGreeting(mockRepository);
    const result = await useCase.execute('abc123');

    expect(result).toBe(true);
    expect(mockRepository.delete).toHaveBeenCalledWith('abc123');
  });

  it('returns false when greeting not found', async () => {
    mockRepository.delete.mockResolvedValue(false);

    const useCase = new DeleteGreeting(mockRepository);
    const result = await useCase.execute('nonexistent');

    expect(result).toBe(false);
  });
});
