import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class SubmitResponseDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsNotEmpty()
  answer: any;

  @IsString()
  @IsOptional()
  justification?: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  confidenceLevel?: number;
}

