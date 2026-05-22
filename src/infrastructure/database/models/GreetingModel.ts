import mongoose, { type Document, Schema } from 'mongoose';

export interface GreetingDocument extends Document {
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const GreetingSchema = new Schema<GreetingDocument>(
  {
    message: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const GreetingModel = mongoose.model<GreetingDocument>('Greeting', GreetingSchema);
