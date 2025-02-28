import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/task.schema';

import { ReservationsModule } from 'src/reservations/reservations.module';
import { TaskGateway } from './task.gateway';
import { TaskProcessor } from './task.processor';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    BullModule.registerQueue({
      name: 'taskQueue',
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
    ReservationsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, TaskProcessor, TaskGateway],
})
export class TasksModule {}
