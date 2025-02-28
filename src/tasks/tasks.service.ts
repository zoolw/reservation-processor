import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { createWriteStream } from 'fs';
import { Model } from 'mongoose';
import { join } from 'path';
import { TaskStatus } from '../shared/enums/task-status.enum';
import { Task, TaskDocument } from './schemas/task.schema';
import { SUGGESTIONS } from './validation-messages';

const ERROR_MESSAGES = {
  INVALID_FILE: 'Nieprawidłowy plik przesłany.',
  TASK_NOT_FOUND: (taskId: string) => `Zadanie ${taskId} nie istnieje.`,
  NO_ERRORS: 'Brak błędów w przetwarzaniu pliku.',
};

@Injectable()
export class TasksService {
  private taskQueue: Queue;
  private readonly logger = new Logger(TasksService.name);

  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {
    this.taskQueue = new Queue('taskQueue', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<{ taskId: string }> {
    if (!file || !(file instanceof Object) || !('buffer' in file)) {
      throw new Error(ERROR_MESSAGES.INVALID_FILE);
    }

    const taskId = randomUUID();
    const filePath = join(__dirname, '../../uploads', `${taskId}.xlsx`);

    await this.saveFileToDisk(file.buffer, filePath);

    const task = new this.taskModel({
      taskId,
      filePath,
      status: TaskStatus.PENDING,
    });
    await task.save();
    await this.taskQueue.add('processTask', { taskId, filePath });

    return { taskId };
  }

  async getTaskStatus(taskId: string) {
    this.logger.log(`Checking status for task: ${taskId}`);
    const task = await this.taskModel.findOne({ taskId });

    if (!task) {
      this.logger.warn(`Task ${taskId} does not exist`);
      throw new NotFoundException(ERROR_MESSAGES.TASK_NOT_FOUND(taskId));
    }

    return {
      taskId: task.taskId,
      status: task.status,
      createdAt: task.createdAt,
      errors: task.errors,
    };
  }

  async getTaskReport(taskId: string, res: Response) {
    const task = await this.taskModel.findOne({ taskId });

    if (!task) {
      throw new NotFoundException(ERROR_MESSAGES.TASK_NOT_FOUND(taskId));
    }

    if (!task.errors || task.errors.length === 0) {
      return { message: ERROR_MESSAGES.NO_ERRORS };
    }

    const workbook = this.generateErrorReport(task.errors);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=raport_bledow_${taskId}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  private async saveFileToDisk(
    buffer: Buffer,
    filePath: string,
  ): Promise<void> {
    const writeStream = createWriteStream(filePath);
    writeStream.write(buffer);
    writeStream.end();

    return new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  }

  private generateErrorReport(errors: { row: number; error: string }[]) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Raport błędów');

    worksheet.columns = [
      { header: 'Numer wiersza', key: 'row', width: 15 },
      { header: 'Powód błędu', key: 'error', width: 50 },
      { header: 'Sugestia poprawy', key: 'suggestion', width: 50 },
    ];

    errors.forEach((error) => {
      const suggestion = this.getSuggestionForError(error.error);
      worksheet.addRow({ row: error.row, error: error.error, suggestion });
    });

    worksheet.getRow(1).font = { bold: true };

    return workbook;
  }

  private getSuggestionForError(error: string): string {
    return SUGGESTIONS[error] || SUGGESTIONS.DEFAULT;
  }
}
