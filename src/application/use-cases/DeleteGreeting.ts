import type { GreetingRepository } from '../../domain/repositories/GreetingRepository';

export class DeleteGreeting {
  constructor(private readonly greetingRepository: GreetingRepository) {}

  async execute(id: string): Promise<boolean> {
    return this.greetingRepository.delete(id);
  }
}
