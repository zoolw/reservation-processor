import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bullmq';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import * as ExcelJS from 'exceljs';
import { createReadStream } from 'fs';
import { Model } from 'mongoose';
import {
  Reservation,
  ReservationDocument,
} from '../reservations/schemas/reservation.schema';
import { ReservationStatus } from '../shared/enums/reservation-status.enum';
import { TaskStatus } from '../shared/enums/task-status.enum';
import { ReservationDto } from './dto/reservation.dto';
import { Task, TaskDocument } from './schemas/task.schema';
import { TaskGateway } from './task.gateway';

@Processor('taskQueue')
export class TaskProcessor extends WorkerHost {
  private readonly BATCH_SIZE = Number(process.env.BATCH_SIZE) || 100;

  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
    private readonly taskGateway: TaskGateway,
  ) {
    super();
  }

  async process(job: { data: { taskId: string; filePath: string } }) {
    const { taskId, filePath } = job.data;

    try {
      console.log(`🔄 processing of task: ${taskId}`);
      this.taskGateway.sendTaskUpdate(taskId, TaskStatus.IN_PROGRESS);

      const stream = createReadStream(filePath);
      const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(stream, {});
      const errors: { row: number; error: string }[] = [];
      let batchOperations: Promise<void>[] = [];
      let rowCount = 0;

      for await (const worksheetReader of workbookReader) {
        for await (const row of worksheetReader) {
          if (row.number === 1) continue;

          if (isRowEmpty(row)) {
            continue;
          }

          const rowData = this.parseRowData(row);
          const validationErrors = await this.validateRowData(rowData);

          if (validationErrors.length > 0) {
            errors.push({
              row: row.number,
              error: validationErrors.join('; '),
            });
            continue;
          }

          batchOperations.push(
            this.updateOrCreateReservation(rowData as ReservationDto),
          );
          rowCount++;

          if (batchOperations.length >= this.BATCH_SIZE) {
            await Promise.all(batchOperations);
            batchOperations = [];
          }
        }
      }

      if (batchOperations.length > 0) {
        await Promise.all(batchOperations);
      }

      await this.taskModel.updateOne(
        { taskId },
        { status: TaskStatus.COMPLETED, errors },
      );
      this.taskGateway.sendTaskUpdate(taskId, TaskStatus.COMPLETED);
      console.log(`✅ Task ${taskId} completed. Processed ${rowCount} rows.`);

      return { success: true, errors, rowCount };
    } catch (error) {
      await this.handleTaskError(taskId, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    console.log(`❌ Task ${job.id} failed:`, error);
  }
  private parseRowData(row: ExcelJS.Row) {
    return {
      reservation_id: Number(row.getCell(1).value),
      guest_name: row.getCell(2).text.trim(),
      status: row.getCell(3).text.trim(),
      check_in_date: this.parseDate(row.getCell(4).value),
      check_out_date: this.parseDate(row.getCell(5).value),
    };
  }

  private parseDate(value: unknown): Date | null {
    if (typeof value === 'string') {
      return new Date(value);
    }
    return value instanceof Date ? value : null;
  }

  private async validateRowData(rowData: any): Promise<string[]> {
    const reservationDto = plainToInstance(ReservationDto, rowData);
    const validationErrors = await validate(reservationDto);
    return validationErrors.flatMap((e) => Object.values(e.constraints || {}));
  }

  private async updateOrCreateReservation(rowData: ReservationDto) {
    const existingReservation = await this.reservationModel.findOne({
      reservation_id: rowData.reservation_id,
    });

    if (
      [ReservationStatus.COMPLETED, ReservationStatus.CANCELLED].includes(
        rowData.status,
      )
    ) {
      if (existingReservation) {
        await this.reservationModel.updateOne(
          { reservation_id: rowData.reservation_id },
          { status: rowData.status },
        );
      }
    } else {
      if (existingReservation) {
        await this.reservationModel.updateOne(
          { reservation_id: rowData.reservation_id },
          rowData,
        );
      } else {
        await this.reservationModel.create(rowData);
      }
    }
  }

  private async handleTaskError(taskId: string, error: unknown) {
    console.error(`❌ Błąd przetwarzania zadania ${taskId}:`, error);
    this.taskGateway.sendTaskUpdate(taskId, TaskStatus.FAILED);
    await this.taskModel.updateOne(
      { taskId },
      {
        status: TaskStatus.FAILED,
        errors: [
          { error: error instanceof Error ? error.message : String(error) },
        ],
      },
    );
  }
}

function isRowEmpty(row: ExcelJS.Row): boolean {
  let isEmpty = true;
  row.eachCell((cell) => {
    if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
      isEmpty = false;
    }
  });
  return isEmpty;
}
