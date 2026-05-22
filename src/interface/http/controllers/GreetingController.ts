import type { Request, Response } from 'express';
import type { CreateGreeting } from '../../../application/use-cases/CreateGreeting';
import type { DeleteGreeting } from '../../../application/use-cases/DeleteGreeting';
import type { GetGreeting } from '../../../application/use-cases/GetGreeting';
import type { UpdateGreeting } from '../../../application/use-cases/UpdateGreeting';

export class GreetingController {
  constructor(
    private readonly getGreetingUseCase: GetGreeting,
    private readonly createGreetingUseCase: CreateGreeting,
    private readonly updateGreetingUseCase: UpdateGreeting,
    private readonly deleteGreetingUseCase: DeleteGreeting
  ) {}

  getGreeting = (_req: Request, res: Response): void => {
    const greeting = this.getGreetingUseCase.execute();
    res.json({ message: greeting.message });
  };

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const greetings = await this.getGreetingUseCase.executeAll();
      res.json(greetings);
    } catch (_error) {
      res.status(500).json({ error: 'Failed to fetch greetings' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const greeting = await this.getGreetingUseCase.executeById(req.params.id);
      if (!greeting) {
        res.status(404).json({ error: 'Greeting not found' });
        return;
      }
      res.json(greeting);
    } catch (_error) {
      res.status(500).json({ error: 'Failed to fetch greeting' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required and must be a string' });
        return;
      }
      const greeting = await this.createGreetingUseCase.execute(message);
      res.status(201).json(greeting);
    } catch (_error) {
      res.status(500).json({ error: 'Failed to create greeting' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required and must be a string' });
        return;
      }
      const greeting = await this.updateGreetingUseCase.execute(req.params.id, message);
      if (!greeting) {
        res.status(404).json({ error: 'Greeting not found' });
        return;
      }
      res.json(greeting);
    } catch (_error) {
      res.status(500).json({ error: 'Failed to update greeting' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const deleted = await this.deleteGreetingUseCase.execute(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: 'Greeting not found' });
        return;
      }
      res.status(204).send();
    } catch (_error) {
      res.status(500).json({ error: 'Failed to delete greeting' });
    }
  };
}
