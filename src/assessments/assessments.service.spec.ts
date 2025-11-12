import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentsService } from './assessments.service';
import { PrismaService } from '../prisma/prisma.service';
import { FrameworksService } from '../frameworks/frameworks.service';
import { NatsService } from '../events/nats.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('AssessmentsService', () => {
  let service: AssessmentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    assessment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    question: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    response: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    assessmentStakeholder: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockFrameworksService = {
    findOne: jest.fn(),
  };

  const mockNatsService = {
    publishAssessmentCreated: jest.fn(),
    publishAssessmentCompleted: jest.fn(),
    publishResponseSubmitted: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: FrameworksService, useValue: mockFrameworksService },
        { provide: NatsService, useValue: mockNatsService },
      ],
    }).compile();

    service = module.get<AssessmentsService>(AssessmentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new assessment', async () => {
      const createDto = {
        organizationId: 'org-123',
        frameworkId: 'framework-123',
        name: 'Test Assessment',
        startDate: '2024-01-01',
      };

      mockFrameworksService.findOne.mockResolvedValue({ id: 'framework-123' });
      mockPrismaService.assessment.create.mockResolvedValue({
        id: 'assessment-123',
        ...createDto,
        status: 'draft',
      });

      const result = await service.create(createDto, 'user-123');

      expect(result).toBeDefined();
      expect(mockNatsService.publishAssessmentCreated).toHaveBeenCalled();
    });

    it('should throw NotFoundException if framework not found', async () => {
      mockFrameworksService.findOne.mockResolvedValue(null);

      await expect(
        service.create(
          {
            organizationId: 'org-123',
            frameworkId: 'non-existent',
            name: 'Test',
            startDate: '2024-01-01',
          },
          'user-123',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return assessment if found', async () => {
      const assessmentId = 'assessment-123';
      mockPrismaService.assessment.findUnique.mockResolvedValue({
        id: assessmentId,
        stakeholders: [],
        responses: [],
      });

      const result = await service.findOne(assessmentId, 'user-123');

      expect(result).toBeDefined();
      expect(result.id).toBe(assessmentId);
    });

    it('should throw NotFoundException if assessment not found', async () => {
      mockPrismaService.assessment.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

