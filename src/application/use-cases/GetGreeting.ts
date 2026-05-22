import { Greeting } from '../../domain/entities/Greeting';
import type { GreetingRepository } from '../../domain/repositories/GreetingRepository';

export class GetGreeting {
  constructor(private readonly greetingRepository?: GreetingRepository) {}

  execute(): Greeting {
    return Greeting.createDefault();
  }

  async executeById(id: string): Promise<Greeting | null> {
    if (!this.greetingRepository) {
      throw new Error('Repository not provided');
    }
    return this.greetingRepository.findById(id);
  }

  async executeAll(): Promise<Greeting[]> {
    if (!this.greetingRepository) {
      throw new Error('Repository not provided');
    }
    return this.greetingRepository.findAll();
  }
}
