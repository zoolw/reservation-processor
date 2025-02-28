import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskIdDto } from './dto/task_id.dto';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

const mockTasksService = {
  uploadFile: jest.fn(),
  getTaskStatus: jest.fn(),
  getTaskReport: jest.fn(),
};

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should throw BadRequestException if no file is provided', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await expect(controller.uploadFile(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if file is not XLSX', async () => {
      await expect(
        controller.uploadFile({
          mimetype: 'text/plain',
        } as Express.Multer.File),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call tasksService.uploadFile and return the result', async () => {
      const mockFile = {
        mimetype:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      } as Express.Multer.File;
      const mockResponse = { taskId: '123' };
      mockTasksService.uploadFile.mockResolvedValue(mockResponse);

      const result = await controller.uploadFile(mockFile);
      expect(result).toEqual(mockResponse);
      expect(mockTasksService.uploadFile).toHaveBeenCalledWith(mockFile);
    });
  });

  describe('getTaskStatus', () => {
    it('should return task status', async () => {
      const taskIdDto: TaskIdDto = { taskId: '123' };
      const mockResponse = { status: 'PENDING' };
      mockTasksService.getTaskStatus.mockResolvedValue(mockResponse);

      const result = await controller.getTaskStatus(taskIdDto);
      expect(result).toEqual(mockResponse);
      expect(mockTasksService.getTaskStatus).toHaveBeenCalledWith('123');
    });
  });

  describe('getTaskReport', () => {
    it('should call tasksService.getTaskReport', async () => {
      const taskIdDto: TaskIdDto = { taskId: '123' };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mockResponse = { send: jest.fn() } as any;
      await controller.getTaskReport(taskIdDto, mockResponse);
      expect(mockTasksService.getTaskReport).toHaveBeenCalledWith(
        '123',
        mockResponse,
      );
    });
  });
});
