import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Request,
} from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { AddStakeholderDto } from './dto/add-stakeholder.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';

@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get()
  async findAll(@Request() req: any) {
    const userId = req.user?.userId || 'system';
    return this.assessmentsService.findAll(userId);
  }

  @Post()
  async create(@Body() createDto: CreateAssessmentDto, @Request() req: any) {
    const userId = req.user?.userId || 'system'; // In production, get from JWT
    return this.assessmentsService.create(createDto, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.userId || 'system';
    return this.assessmentsService.findOne(id, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateAssessmentDto>,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || 'system';
    return this.assessmentsService.update(id, updateData, userId);
  }

  @Get(':id/stakeholders')
  async getStakeholders(@Param('id') assessmentId: string, @Request() req: any) {
    const userId = req.user?.userId || 'system';
    return this.assessmentsService.getStakeholders(assessmentId, userId);
  }

  @Post(':id/stakeholders')
  async addStakeholder(
    @Param('id') assessmentId: string,
    @Body() stakeholderDto: AddStakeholderDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || 'system';
    return this.assessmentsService.addStakeholder(assessmentId, stakeholderDto, userId);
  }

  @Get(':id/questions')
  async getQuestions(@Param('id') assessmentId: string, @Request() req: any) {
    const userId = req.user?.userId || 'system';
    return this.assessmentsService.getQuestions(assessmentId, userId);
  }

  @Get(':id/responses')
  async getResponses(@Param('id') assessmentId: string, @Request() req: any) {
    const userId = req.user?.userId || 'system';
    return this.assessmentsService.getResponses(assessmentId, userId);
  }

  @Post(':id/responses')
  async submitResponse(
    @Param('id') assessmentId: string,
    @Body() responseDto: SubmitResponseDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || 'system';
    return this.assessmentsService.submitResponse(assessmentId, responseDto, userId);
  }

  @Put(':id/responses/:responseId')
  async updateResponse(
    @Param('id') assessmentId: string,
    @Param('responseId') responseId: string,
    @Body() updateDto: SubmitResponseDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || 'system';
    return this.assessmentsService.updateResponse(assessmentId, responseId, updateDto, userId);
  }

  @Get(':id/progress')
  async getProgress(@Param('id') assessmentId: string) {
    return this.assessmentsService.getProgress(assessmentId);
  }

  @Post(':id/complete')
  async complete(@Param('id') assessmentId: string, @Request() req: any) {
    const userId = req.user?.userId || 'system';
    return this.assessmentsService.complete(assessmentId, userId);
  }
}

