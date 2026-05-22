import { Greeting } from '../../domain/entities/Greeting';
import type { GreetingRepository } from '../../domain/repositories/GreetingRepository';

export class CreateGreeting {
  constructor(private readonly greetingRepository: GreetingRepository) {}

  async execute(message: string): Promise<Greeting> {
    const greeting = Greeting.create(message);
    return this.greetingRepository.create(greeting);
  }
}
