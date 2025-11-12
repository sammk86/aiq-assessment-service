import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FrameworksService } from '../frameworks/frameworks.service';
import { NatsService } from '../events/nats.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { AddStakeholderDto } from './dto/add-stakeholder.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AssessmentsService {
  constructor(
    private prisma: PrismaService,
    private frameworksService: FrameworksService,
    private natsService: NatsService,
  ) {}

  async create(createDto: CreateAssessmentDto, createdBy: string) {
    // Verify framework exists
    const framework = await this.frameworksService.findOne(createDto.frameworkId);
    if (!framework) {
      throw new NotFoundException(`Framework with ID ${createDto.frameworkId} not found`);
    }

    const assessment = await this.prisma.assessment.create({
      data: {
        organizationId: createDto.organizationId,
        frameworkId: createDto.frameworkId,
        name: createDto.name,
        startDate: new Date(createDto.startDate),
        targetEndDate: createDto.targetEndDate ? new Date(createDto.targetEndDate) : null,
        status: 'draft',
        createdBy,
      },
      include: {
        stakeholders: true,
      },
    });

    // Auto-add creator as assessor stakeholder
    await this.prisma.assessmentStakeholder.create({
      data: {
        assessmentId: assessment.id,
        userId: createdBy,
        role: 'assessor',
        sections: [], // Can access all sections
        completionStatus: 'not_started',
      },
    });

    // Publish event
    await this.natsService.publishAssessmentCreated(assessment.id, assessment.organizationId);

    return assessment;
  }

  async findAll(userId: string) {
    // For MVP: return all assessments (no filtering)
    // In production: filter by stakeholder or organization membership
    const assessments = await this.prisma.assessment.findMany({
      include: {
        stakeholders: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return assessments;
  }

  async findOne(id: string, userId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
      include: {
        stakeholders: true,
        responses: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    }

    // For MVP: allow access to all assessments
    // In production: check stakeholder or organization membership

    return assessment;
  }

  async update(id: string, updateData: Partial<CreateAssessmentDto>, userId: string) {
    const assessment = await this.findOne(id, userId);

    // Only creator or admin can update
    if (assessment.createdBy !== userId) {
      throw new ForbiddenException('Only creator can update assessment');
    }

    return this.prisma.assessment.update({
      where: { id },
      data: {
        ...updateData,
        startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
        targetEndDate: updateData.targetEndDate
          ? new Date(updateData.targetEndDate)
          : undefined,
      },
    });
  }

  async getStakeholders(assessmentId: string, userId: string) {
    // Verify user has access to this assessment
    await this.findOne(assessmentId, userId);

    return this.prisma.assessmentStakeholder.findMany({
      where: { assessmentId },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async addStakeholder(assessmentId: string, stakeholderDto: AddStakeholderDto, addedBy: string) {
    const assessment = await this.findOne(assessmentId, addedBy);

    // Check if stakeholder already exists
    const existing = await this.prisma.assessmentStakeholder.findUnique({
      where: {
        assessmentId_userId: {
          assessmentId,
          userId: stakeholderDto.userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Stakeholder already assigned to this assessment');
    }

    const stakeholder = await this.prisma.assessmentStakeholder.create({
      data: {
        assessmentId,
        userId: stakeholderDto.userId,
        role: stakeholderDto.role || 'contributor',
        sections: stakeholderDto.sections || [],
        completionStatus: 'not_started',
      },
    });

    return stakeholder;
  }

  async getQuestions(assessmentId: string, userId: string) {
    const assessment = await this.findOne(assessmentId, userId);

    // Get framework and its questions
    const framework = await this.frameworksService.findOne(assessment.frameworkId);
    if (!framework) {
      throw new NotFoundException('Framework not found');
    }

    // Get questions from PostgreSQL (synced from framework)
    const questions = await this.prisma.question.findMany({
      where: {
        frameworkId: assessment.frameworkId,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });

    // Get user's responses
    const userResponses = await this.prisma.response.findMany({
      where: {
        assessmentId,
        userId,
      },
    });

    // Merge questions with response status
    return questions.map((q) => {
      const response = userResponses.find((r) => r.questionId === q.id);
      return {
        ...q,
        hasResponse: !!response,
        response: response || null,
      };
    });
  }

  async submitResponse(
    assessmentId: string,
    responseDto: SubmitResponseDto,
    userId: string,
  ) {
    const assessment = await this.findOne(assessmentId, userId);

    if (assessment.status === 'completed' || assessment.status === 'archived') {
      throw new BadRequestException('Cannot submit responses to completed or archived assessment');
    }

    // Verify question belongs to assessment framework
    const question = await this.prisma.question.findUnique({
      where: { id: responseDto.questionId },
    });

    if (!question || question.frameworkId !== assessment.frameworkId) {
      throw new NotFoundException('Question not found in this assessment framework');
    }

    // Check for existing response
    const existingResponse = await this.prisma.response.findUnique({
      where: {
        assessmentId_questionId_userId: {
          assessmentId,
          questionId: responseDto.questionId,
          userId,
        },
      },
    });

    let response;
    if (existingResponse) {
      // Update existing response (conflict resolution handled by service)
      response = await this.prisma.response.update({
        where: { id: existingResponse.id },
        data: {
          answer: responseDto.answer,
          justification: responseDto.justification,
          confidenceLevel: responseDto.confidenceLevel || 0.5,
          submittedAt: new Date(),
        },
      });
    } else {
      // Create new response
      response = await this.prisma.response.create({
        data: {
          assessmentId,
          questionId: responseDto.questionId,
          userId,
          answer: responseDto.answer,
          justification: responseDto.justification,
          confidenceLevel: responseDto.confidenceLevel || 0.5,
          submittedAt: new Date(),
        },
      });
    }

    // Update assessment status if needed
    if (assessment.status === 'draft') {
      await this.prisma.assessment.update({
        where: { id: assessmentId },
        data: { status: 'in_progress' },
      });
    }

    await this.natsService.publishResponseSubmitted(
      assessmentId,
      responseDto.questionId,
      userId,
    );

    return response;
  }

  async getResponses(assessmentId: string, userId: string) {
    // Verify user has access to this assessment
    await this.findOne(assessmentId, userId);

    // Get all responses for this assessment
    const responses = await this.prisma.response.findMany({
      where: {
        assessmentId,
      },
      include: {
        question: true,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return responses;
  }

  async updateResponse(
    assessmentId: string,
    responseId: string,
    updateDto: SubmitResponseDto,
    userId: string,
  ) {
    // Verify response exists and belongs to this assessment
    const response = await this.prisma.response.findUnique({
      where: { id: responseId },
    });

    if (!response || response.assessmentId !== assessmentId) {
      throw new NotFoundException('Response not found');
    }

    // Verify user owns this response
    if (response.userId !== userId) {
      throw new ForbiddenException('Can only update your own responses');
    }

    // Update the response
    return this.prisma.response.update({
      where: { id: responseId },
      data: {
        answer: updateDto.answer,
        justification: updateDto.justification,
        confidenceLevel: updateDto.confidenceLevel || response.confidenceLevel,
        submittedAt: new Date(),
      },
    });
  }

  async getProgress(assessmentId: string) {
    const assessment = await this.findOne(assessmentId, 'system');

    // Get all questions for framework
    const totalQuestions = await this.prisma.question.count({
      where: { frameworkId: assessment.frameworkId },
    });

    // Get total responses
    const totalResponses = await this.prisma.response.count({
      where: { assessmentId },
    });

    // Get responses by stakeholder
    const stakeholders = await this.prisma.assessmentStakeholder.findMany({
      where: { assessmentId },
      include: {
        assessment: true,
      },
    });

    const stakeholderProgress = await Promise.all(
      stakeholders.map(async (stakeholder) => {
        const responses = await this.prisma.response.count({
          where: {
            assessmentId,
            userId: stakeholder.userId,
          },
        });
        return {
          userId: stakeholder.userId,
          responses,
          completionStatus: stakeholder.completionStatus,
        };
      }),
    );

    return {
      assessmentId,
      totalQuestions,
      totalResponses,
      completionPercentage: totalQuestions > 0 ? (totalResponses / totalQuestions) * 100 : 0,
      stakeholderProgress,
    };
  }

  async complete(assessmentId: string, userId: string) {
    const assessment = await this.findOne(assessmentId, userId);

    if (assessment.status === 'completed') {
      throw new BadRequestException('Assessment already completed');
    }

    if (assessment.createdBy !== userId) {
      throw new ForbiddenException('Only creator can complete assessment');
    }

    // Calculate progress
    const progress = await this.getProgress(assessmentId);
    if (progress.completionPercentage < 100) {
      throw new BadRequestException(
        `Assessment is only ${progress.completionPercentage.toFixed(1)}% complete`,
      );
    }

    const updated = await this.prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        status: 'completed',
        endDate: new Date(),
      },
    });

    // Publish completion event
    await this.natsService.publishAssessmentCompleted(assessmentId, assessment.organizationId);

    return updated;
  }
}

