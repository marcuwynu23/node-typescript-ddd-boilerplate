import { Greeting } from '../../domain/entities/Greeting';

export class GetGreeting {
  execute(): Greeting {
    return Greeting.createDefault();
  }
}
