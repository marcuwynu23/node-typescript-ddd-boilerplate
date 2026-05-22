export interface GreetingProps {
  id?: string;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Greeting {
  public readonly id?: string;
  public readonly message: string;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: GreetingProps) {
    this.id = props.id;
    this.message = props.message;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static createDefault(): Greeting {
    return new Greeting({
      message: 'Hello from Express + TypeScript + esbuild!',
    });
  }

  static create(message: string): Greeting {
    return new Greeting({ message });
  }
}
