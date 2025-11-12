import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Request,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { Response } from 'express'
import { FileInterceptor } from '@nestjs/platform-express'
import { FrameworksService } from './frameworks.service'
import { FrameworkImportService } from './frameworks-import.service'
import { ConfirmImportDto } from './dto/confirm-import.dto'

@Controller('frameworks')
export class FrameworksController {
  constructor(
    private readonly frameworksService: FrameworksService,
    private readonly frameworkImportService: FrameworkImportService,
  ) {}

  @Get()
  async findAll() {
    return this.frameworksService.findAll()
  }

  @Get('import/template')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="framework-import-template.csv"')
  async downloadTemplate(@Res() res: Response) {
    const csv = await this.frameworkImportService.generateTemplate()
    res.send(csv)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.frameworksService.findOne(id)
  }

  @Post('import/preview')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async previewImport(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) {
      throw new BadRequestException('CSV file is required')
    }

    const context = this.resolveImportContext(req)

    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('Only CSV files are supported')
    }

    return this.frameworkImportService.previewImport(file.buffer, context)
  }

  @Post('import/confirm')
  async confirmImport(@Body() body: ConfirmImportDto, @Request() req: any) {
    const context = this.resolveImportContext(req)
    return this.frameworkImportService.confirmImport(body.previewToken, context)
  }

  private resolveImportContext(req: any) {
    const headerValue = req.headers['x-organization-id']
    const headerOrgId = Array.isArray(headerValue) ? headerValue[0] : headerValue
    const organizationId = req.user?.organizationId || headerOrgId
    const uploadedBy = req.user?.userId || 'system'

    if (!organizationId) {
      throw new BadRequestException('organizationId is required for framework import')
    }

    return {
      organizationId,
      uploadedBy,
    }
  }
}
