export class Greeting {
  constructor(public readonly message: string) {}

  static createDefault(): Greeting {
    return new Greeting('Hello from Express + TypeScript + esbuild!');
  }
}
