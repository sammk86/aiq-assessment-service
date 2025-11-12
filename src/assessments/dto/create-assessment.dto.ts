import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CreateAssessmentDto {
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @IsString()
  @IsNotEmpty()
  frameworkId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsOptional()
  targetEndDate?: string;
}

