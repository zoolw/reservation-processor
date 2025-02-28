import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bullmq';
import { TaskStatus } from '../shared/enums/task-status.enum';
import { Task } from './schemas/task.schema';
import { TasksService } from './tasks.service';

const mockTaskModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
  save: jest.fn(),
};

const mockQueue = {
  add: jest.fn(),
};

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken(Task.name),
          useValue: mockTaskModel,
        },
        {
          provide: Queue,
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTaskStatus', () => {
    it('should return task status', async () => {
      const mockTask = {
        taskId: '123',
        status: TaskStatus.IN_PROGRESS,
        createdAt: new Date(),
        errors: [],
      };
      mockTaskModel.findOne.mockResolvedValue(mockTask);

      const result = await service.getTaskStatus('123');
      expect(result).toEqual({
        taskId: '123',
        status: TaskStatus.IN_PROGRESS,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        createdAt: expect.any(Date),
        errors: [],
      });
    });

    it('should throw NotFoundException if task is not found', async () => {
      mockTaskModel.findOne.mockResolvedValue(null);
      await expect(service.getTaskStatus('invalid-task')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTaskReport', () => {
    it('should return a report file if errors exist', async () => {
      const mockTask = {
        taskId: '123',
        errors: [{ row: 1, error: 'Invalid data' }],
      };
      mockTaskModel.findOne.mockResolvedValue(mockTask);

      const mockResponse = {
        setHeader: jest.fn(),
        end: jest.fn(),
      };

      jest
        .spyOn(service as any, 'generateErrorReport')
        .mockReturnValue({ xlsx: { write: jest.fn() } });

      await service.getTaskReport('123', mockResponse as any);
      expect(mockResponse.setHeader).toHaveBeenCalled();
    });

    it('should return a message if there are no errors', async () => {
      const mockTask = { taskId: '123', errors: [] };
      mockTaskModel.findOne.mockResolvedValue(mockTask);
      const result = await service.getTaskReport('123', {} as any);
      expect(result).toEqual({ message: 'Brak błędów w przetwarzaniu pliku.' });
    });

    it('should throw NotFoundException if task is not found', async () => {
      mockTaskModel.findOne.mockResolvedValue(null);
      await expect(
        service.getTaskReport('invalid-task', {} as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
