import { IsString, IsArray, IsOptional } from 'class-validator';

export class AddStakeholderDto {
  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sections?: string[];
}

