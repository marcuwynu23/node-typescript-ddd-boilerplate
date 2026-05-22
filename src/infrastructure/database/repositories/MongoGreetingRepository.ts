import { Greeting } from '../../../domain/entities/Greeting';
import type { GreetingRepository } from '../../../domain/repositories/GreetingRepository';
import { GreetingModel } from '../models/GreetingModel';

export class MongoGreetingRepository implements GreetingRepository {
  async findAll(): Promise<Greeting[]> {
    const docs = await GreetingModel.find().sort({ createdAt: -1 });
    return docs.map(
      (doc) =>
        new Greeting({
          id: doc._id.toString(),
          message: doc.message,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        })
    );
  }

  async findById(id: string): Promise<Greeting | null> {
    const doc = await GreetingModel.findById(id);
    if (!doc) return null;
    return new Greeting({
      id: doc._id.toString(),
      message: doc.message,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async create(greeting: Greeting): Promise<Greeting> {
    const doc = await GreetingModel.create({ message: greeting.message });
    return new Greeting({
      id: doc._id.toString(),
      message: doc.message,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async update(id: string, data: Partial<Greeting>): Promise<Greeting | null> {
    const doc = await GreetingModel.findByIdAndUpdate(
      id,
      { message: data.message },
      { new: true, runValidators: true }
    );
    if (!doc) return null;
    return new Greeting({
      id: doc._id.toString(),
      message: doc.message,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await GreetingModel.findByIdAndDelete(id);
    return result !== null;
  }
}
