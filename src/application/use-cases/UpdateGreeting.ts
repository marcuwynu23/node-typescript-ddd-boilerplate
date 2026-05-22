import type { Greeting } from '../../domain/entities/Greeting';
import type { GreetingRepository } from '../../domain/repositories/GreetingRepository';

export class UpdateGreeting {
  constructor(private readonly greetingRepository: GreetingRepository) {}

  async execute(id: string, message: string): Promise<Greeting | null> {
    return this.greetingRepository.update(id, { message });
  }
}
