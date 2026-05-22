import { GetGreeting } from '../../application/use-cases/GetGreeting';
import { Greeting } from '../../domain/entities/Greeting';
import type { GreetingRepository } from '../../domain/repositories/GreetingRepository';

const mockRepository: jest.Mocked<GreetingRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('GetGreeting Use Case', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('returns the default greeting without a repository', () => {
      const useCase = new GetGreeting();
      const result = useCase.execute();

      expect(result.message).toBe('Hello from Express + TypeScript + esbuild!');
    });
  });

  describe('executeAll', () => {
    it('returns all greetings from the repository', async () => {
      const greetings = [
        new Greeting({ id: '1', message: 'Hello' }),
        new Greeting({ id: '2', message: 'World' }),
      ];
      mockRepository.findAll.mockResolvedValue(greetings);

      const useCase = new GetGreeting(mockRepository);
      const result = await useCase.executeAll();

      expect(result).toEqual(greetings);
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('throws if repository is not provided', async () => {
      const useCase = new GetGreeting();

      await expect(useCase.executeAll()).rejects.toThrow('Repository not provided');
    });
  });

  describe('executeById', () => {
    it('returns a greeting by id', async () => {
      const greeting = new Greeting({ id: '1', message: 'Hello' });
      mockRepository.findById.mockResolvedValue(greeting);

      const useCase = new GetGreeting(mockRepository);
      const result = await useCase.executeById('1');

      expect(result).toEqual(greeting);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('returns null when greeting not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const useCase = new GetGreeting(mockRepository);
      const result = await useCase.executeById('nonexistent');

      expect(result).toBeNull();
    });

    it('throws if repository is not provided', async () => {
      const useCase = new GetGreeting();

      await expect(useCase.executeById('1')).rejects.toThrow('Repository not provided');
    });
  });
});
