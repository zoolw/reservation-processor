import { IsString, IsUUID } from 'class-validator';

export class TaskIdDto {
  @IsString()
  @IsUUID()
  taskId: string;
}
