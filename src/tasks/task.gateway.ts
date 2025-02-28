import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TaskStatus } from '../shared/enums/task-status.enum';

@WebSocketGateway({ cors: true })
export class TaskGateway {
  @WebSocketServer()
  private server: Server;

  sendTaskUpdate(taskId: string, status: TaskStatus) {
    this.server.emit(`taskUpdate:${taskId}`, { taskId, status });
  }

  @SubscribeMessage('subscribeToTask')
  handleSubscription(@MessageBody() data: { taskId: string }) {
    console.log(`📡 Klient zasubskrybował: ${data.taskId}`);
  }
}
