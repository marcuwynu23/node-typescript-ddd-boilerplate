import type { Request, Response } from 'express';
import type { GetGreeting } from '../../../application/use-cases/GetGreeting';

export class GreetingController {
  constructor(private readonly getGreetingUseCase: GetGreeting) {}

  getGreeting = (_req: Request, res: Response): void => {
    const greeting = this.getGreetingUseCase.execute();
    res.json({ message: greeting.message });
  };
}
