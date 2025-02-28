import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { TaskIdDto } from './dto/task_id.dto';
import { TasksService } from './tasks.service';

const API_DESCRIPTIONS = {
  UPLOAD_FILE: 'Przesyłanie pliku rezerwacji',
  GET_TASK_STATUS: 'Sprawdzenie statusu przetwarzania zadania',
  GET_TASK_REPORT: 'Pobranie raportu błędów',
  API_KEY_HEADER: 'Klucz API dla autoryzacji',
};

const API_RESPONSES = {
  UPLOAD_SUCCESS: {
    status: HttpStatus.CREATED,
    description: 'Zadanie zostało dodane do kolejki.',
  },
  TASK_STATUS_SUCCESS: {
    status: HttpStatus.OK,
    description: 'Status zadania zwrócony pomyślnie.',
  },
  TASK_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    description: 'Zadanie nie istnieje.',
  },
  REPORT_SUCCESS: {
    status: HttpStatus.OK,
    description: 'Raport błędów pobrany pomyślnie.',
  },
  REPORT_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    description: 'Zadanie nie istnieje lub brak raportu błędów.',
  },
};

@ApiTags('Tasks')
@ApiHeader({
  name: 'x-api-key',
  required: true,
  description: API_DESCRIPTIONS.API_KEY_HEADER,
})
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: API_DESCRIPTIONS.UPLOAD_FILE })
  @ApiConsumes('multipart/form-data')
  @ApiResponse(API_RESPONSES.UPLOAD_SUCCESS)
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Plik jest wymagany.');
    }
    if (
      file.mimetype !==
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      throw new BadRequestException('Dozwolone są tylko pliki XLSX.');
    }

    return this.tasksService.uploadFile(file);
  }

  @Get('status/:taskId')
  @ApiOperation({ summary: API_DESCRIPTIONS.GET_TASK_STATUS })
  @ApiParam({ name: 'taskId', required: true, description: 'ID zadania' })
  @ApiResponse(API_RESPONSES.TASK_STATUS_SUCCESS)
  @ApiResponse(API_RESPONSES.TASK_NOT_FOUND)
  async getTaskStatus(@Param() params: TaskIdDto): Promise<{ status: string }> {
    return this.tasksService.getTaskStatus(params.taskId);
  }

  @Get('report/:taskId')
  @ApiOperation({ summary: API_DESCRIPTIONS.GET_TASK_REPORT })
  @ApiParam({ name: 'taskId', required: true, description: 'ID zadania' })
  @ApiResponse(API_RESPONSES.REPORT_SUCCESS)
  @ApiResponse(API_RESPONSES.REPORT_NOT_FOUND)
  async getTaskReport(@Param() params: TaskIdDto, @Res() res: Response) {
    return this.tasksService.getTaskReport(params.taskId, res);
  }
}
