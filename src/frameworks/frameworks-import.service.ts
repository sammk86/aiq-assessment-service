import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common'
import { parseString } from 'fast-csv'
import { v4 as uuid } from 'uuid'
import { FrameworksService } from './frameworks.service'
import Redis from 'ioredis'

export interface ImportContext {
  organizationId: string
  uploadedBy: string
}

export interface ImportPreviewStore {
  set(key: string, value: any, ttlSeconds: number): Promise<void>
  get<T>(key: string): Promise<T | null>
  delete(key: string): Promise<void>
}

export const IMPORT_PREVIEW_STORE = 'IMPORT_PREVIEW_STORE'

type CsvRow = Record<string, string>

type RowStatus = 'valid' | 'error'

const REQUIRED_COLUMNS = [
  'framework_name',
  'framework_description',
  'dimension_order',
  'dimension_name',
  'dimension_description',
  'question_order',
  'question_text',
  'response_type',
  'help_text',
  'weight',
  'tags',
]

const PREVIEW_TTL_SECONDS = 15 * 60

@Injectable()
export class FrameworkImportService {
  private readonly logger = new Logger(FrameworkImportService.name)

  constructor(
    private readonly frameworksService: FrameworksService,
    @Inject(IMPORT_PREVIEW_STORE) private readonly previewStore: ImportPreviewStore,
  ) {}

  async generateTemplate(): Promise<string> {
    const header = REQUIRED_COLUMNS.join(',')
    const sampleRow = [
      'Sample Framework',
      'High-level description of the framework',
      '1',
      'Strategy & Governance',
      'Dimension description',
      '1',
      'Describe your AI strategy maturity',
      'rating_scale',
      'Guidance for respondents (optional)',
      '1',
      'strategy;governance',
    ].join(',')

    return `${header}\n${sampleRow}\n`
  }

  async previewImport(fileBuffer: Buffer, context: ImportContext) {
    const rows = await this.parseCsv(fileBuffer)

    this.logger.debug(`Received CSV for preview: ${rows.length} rows`)

    if (!rows.length) {
      throw new BadRequestException('CSV file is empty')
    }

    this.ensureColumns(rows[0])

    const parsedRows = this.mapRows(rows)
    const summary = this.buildSummary(parsedRows)

    if (!parsedRows.frameworkName) {
      throw new BadRequestException('framework_name is required in all rows')
    }

    const previewToken = uuid()
    const previewPayload = {
      framework: parsedRows.framework,
      rows: parsedRows.rows,
      summary,
      organizationId: context.organizationId,
      uploadedBy: context.uploadedBy,
      createdAt: new Date().toISOString(),
    }

    await this.previewStore.set(previewToken, previewPayload, PREVIEW_TTL_SECONDS)

    this.logger.log(
      `Prepared framework import preview for org ${context.organizationId} with token ${previewToken}`,
    )

    return {
      previewToken,
      framework: parsedRows.framework,
      rows: parsedRows.rows,
      summary,
    }
  }

  async confirmImport(previewToken: string, context: ImportContext) {
    const preview = await this.previewStore.get<any>(previewToken)

    if (!preview) {
      throw new BadRequestException('Preview expired or not found')
    }

    if (preview.organizationId !== context.organizationId) {
      throw new BadRequestException('Preview token does not belong to this organization')
    }

    if (preview.summary.errors > 0) {
      throw new BadRequestException('Cannot import framework with validation errors')
    }

    const frameworkId = this.generateFrameworkId(preview.framework.name)

    const result = await this.frameworksService.create({
      id: frameworkId,
      organizationId: context.organizationId,
      name: preview.framework.name,
      version: '1.0.0',
      description: preview.framework.description,
      dimensions: preview.framework.dimensions.map((dimension: any) => ({
        order: dimension.order,
        name: dimension.name,
        description: dimension.description,
        weight: dimension.weight,
        questions: dimension.questions.map((question: any) => ({
          order: question.order,
          text: question.text,
          responseType: question.responseType,
          helpText: question.helpText,
          weight: question.weight,
          tags: question.tags,
        })),
      })),
      importedBy: context.uploadedBy,
      importedAt: new Date(),
    })

    await this.previewStore.delete(previewToken)

    this.logger.log(
      `Imported framework ${preview.framework.name} for org ${context.organizationId} (${frameworkId})`,
    )

    return {
      frameworkId: result.id ?? frameworkId,
      name: preview.framework.name,
      dimensionCount: preview.framework.dimensions.length,
      questionCount: preview.framework.dimensions.reduce((total: number, dimension: any) => total + dimension.questions.length, 0),
    }
  }

  private async parseCsv(buffer: Buffer): Promise<CsvRow[]> {
    return new Promise((resolve, reject) => {
      const rows: CsvRow[] = []
      parseString(buffer.toString('utf8'), { headers: true, trim: true })
        .on('error', (error) => reject(new BadRequestException(`Invalid CSV: ${error.message}`)))
        .on('data', (row: CsvRow) => rows.push(row))
        .on('end', () => resolve(rows))
    })
  }

  private ensureColumns(row: CsvRow) {
    const headers = Object.keys(row)
    const missing = REQUIRED_COLUMNS.filter((column) => !headers.includes(column))

    if (missing.length) {
      throw new BadRequestException(`CSV is missing required columns: ${missing.join(', ')}`)
    }
  }

  private mapRows(rows: CsvRow[]) {
    const frameworkName = rows[0]['framework_name']?.trim()
    const frameworkDescription = rows[0]['framework_description']?.trim()

    const dimensionsMap = new Map<number, any>()
    const previewRows: any[] = []

    rows.forEach((row, index) => {
      const rowNumber = index + 2 // account for header row
      const issues: string[] = []

      if (!row['framework_name'] || row['framework_name'].trim() !== frameworkName) {
        issues.push('framework_name must match in every row')
      }

      if (!row['dimension_name']) {
        issues.push('dimension_name is required')
      }

      const dimensionOrder = this.parseInteger(row['dimension_order'], 'dimension_order', issues)
      const questionOrder = this.parseInteger(row['question_order'], 'question_order', issues)
      const responseType = row['response_type']?.trim()

      if (!responseType) {
        issues.push('response_type is required')
      } else if (!['rating_scale', 'boolean', 'text', 'long_text', 'file_upload'].includes(responseType)) {
        issues.push(`response_type "${responseType}" is not supported`)
      }

      const weight = this.parseWeight(row['weight'], issues)

      let dimension = dimensionsMap.get(dimensionOrder)
      if (!dimension) {
        dimension = {
          order: dimensionOrder,
          name: row['dimension_name']?.trim(),
          description: row['dimension_description']?.trim() ?? '',
          weight: 1,
          questions: [],
        }
        dimensionsMap.set(dimensionOrder, dimension)
      }

      const question = {
        order: questionOrder,
        text: row['question_text']?.trim() ?? '',
        responseType,
        helpText: row['help_text']?.trim() ?? '',
        weight,
        tags: row['tags']?.split(';').map((tag) => tag.trim()).filter(Boolean) ?? [],
      }

      if (!question.text) {
        issues.push('question_text is required')
      }

      const existingOrder = dimension.questions.find((q: any) => q.order === question.order)
      if (existingOrder) {
        issues.push(`question_order ${question.order} already used for dimension ${dimension.name}`)
      }

      dimension.questions.push(question)

      previewRows.push({
        rowNumber,
        status: issues.length ? ('error' as RowStatus) : ('valid' as RowStatus),
        issues,
      })
    })
    const dimensions = Array.from(dimensionsMap.values()).sort((a, b) => a.order - b.order)
    dimensions.forEach((dimension) => {
      dimension.questions.sort((a: any, b: any) => a.order - b.order)
    })

    return {
      frameworkName,
      framework: {
        name: frameworkName,
        description: frameworkDescription,
        dimensions,
      },
      rows: previewRows,
    }
  }

  private buildSummary(parsed: { rows: Array<{ status: RowStatus; issues: string[] }> }) {
    const totalRows = parsed.rows.length
    const errors = parsed.rows.filter((row) => row.status === 'error').length

    return {
      totalRows,
      validRows: totalRows - errors,
      errors,
      warnings: 0,
    }
  }

  private parseInteger(value: string | undefined, field: string, issues: string[]): number {
    const parsed = Number.parseInt((value ?? '').toString(), 10)
    if (Number.isNaN(parsed) || parsed < 1) {
      issues.push(`${field} must be a positive integer`)
      return 0
    }
    return parsed
  }

  private parseWeight(value: string | undefined, issues: string[]): number {
    if (value === undefined || value === '') {
      return 1
    }

    const parsed = Number.parseFloat(value)
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 1) {
      issues.push('weight must be a number between 0 and 1')
      return 1
    }

    return parsed
  }

  private generateFrameworkId(name: string): string {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    return `${slug}-${uuid().slice(0, 8)}`
  }
}

@Injectable()
export class RedisImportPreviewStore implements ImportPreviewStore {
  constructor(private readonly client: Redis) {}

  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key)
    if (!raw) {
      return null
    }
    try {
      return JSON.parse(raw) as T
    } catch (error) {
      await this.client.del(key)
      return null
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key)
  }
}
