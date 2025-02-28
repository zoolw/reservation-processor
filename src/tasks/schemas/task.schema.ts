import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TaskStatus } from '../../shared/enums/task-status.enum';

const DEFAULT_VALUES = {
  CREATED_AT: new Date(),
  ERRORS: [],
};

export type TaskError = { row: number; error: string };

export type TaskDocument = Task & Document;

@Schema()
export class Task {
  @Prop({ required: true, unique: true })
  taskId: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({
    required: true,
    enum: Object.values(TaskStatus),
  })
  status: TaskStatus;

  @Prop({ default: DEFAULT_VALUES.CREATED_AT })
  createdAt: Date;

  @Prop({ type: Array, default: DEFAULT_VALUES.ERRORS })
  errors: TaskError[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
