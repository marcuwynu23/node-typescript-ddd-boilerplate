import type { Greeting } from '../entities/Greeting';

export interface GreetingRepository {
  findAll(): Promise<Greeting[]>;
  findById(id: string): Promise<Greeting | null>;
  create(greeting: Greeting): Promise<Greeting>;
  update(id: string, greeting: Partial<Greeting>): Promise<Greeting | null>;
  delete(id: string): Promise<boolean>;
}
