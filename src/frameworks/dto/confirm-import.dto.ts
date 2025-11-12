import { IsString, Length } from 'class-validator'

export class ConfirmImportDto {
  @IsString()
  @Length(1, 200)
  previewToken!: string
}
