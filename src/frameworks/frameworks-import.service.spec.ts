import { BadRequestException } from '@nestjs/common'
import { FrameworksService } from './frameworks.service'
import { FrameworkImportService, ImportPreviewStore } from './frameworks-import.service'

class InMemoryPreviewStore implements ImportPreviewStore {
  private store = new Map<string, { value: any; expiresAt: number }>()

  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000
    this.store.set(key, { value, expiresAt })
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key)
    if (!entry) return null
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key)
      return null
    }
    return entry.value as T
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }
}

describe('FrameworkImportService', () => {
  let service: FrameworkImportService
  let frameworksService: jest.Mocked<FrameworksService>
  let previewStore: InMemoryPreviewStore

  beforeEach(() => {
    frameworksService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<FrameworksService>

    previewStore = new InMemoryPreviewStore()

    service = new FrameworkImportService(frameworksService, previewStore)
  })

  const validCsv = `framework_name,framework_description,dimension_order,dimension_name,dimension_description,question_order,question_text,response_type,help_text,weight,tags\n` +
    'AI Governance,AI governance overview,1,Strategy,Governance strategy,1,"Do you have an AI strategy?",rating_scale,,1,"governance;strategy"\n' +
    'AI Governance,AI governance overview,1,Strategy,Governance strategy,2,"How do you manage AI risk?",rating_scale,,0.9,"risk"\n' +
    'AI Governance,AI governance overview,2,Data,Data capabilities,1,"How do you manage data quality?",rating_scale,,0.8,"data"\n'

  it('should generate CSV template with expected headers', async () => {
    const template = await service.generateTemplate()
    const [header] = template.trim().split('\n')
    expect(header).toBe('framework_name,framework_description,dimension_order,dimension_name,dimension_description,question_order,question_text,response_type,help_text,weight,tags')
  })

  it('should preview valid CSV and return grouped framework data', async () => {
    const result = await service.previewImport(Buffer.from(validCsv), {
      organizationId: 'org-123',
      uploadedBy: 'user-123',
    })

    expect(result.summary.totalRows).toBe(3)
    expect(result.summary.errors).toBe(0)
    expect(result.summary.validRows).toBe(3)
    expect(result.previewToken).toBeDefined()
    expect(result.framework.dimensions).toHaveLength(2)
    const strategyDimension = result.framework.dimensions.find((d) => d.order === 1)
    expect(strategyDimension?.questions).toHaveLength(2)

    const stored = await previewStore.get<any>(result.previewToken)
    expect(stored?.framework.name).toBe('AI Governance')
  })

  it('should throw validation error for missing required columns', async () => {
    const invalidCsv = 'framework_name,dimension_order\nAI Governance,1\n'
    await expect(
      service.previewImport(Buffer.from(invalidCsv), {
        organizationId: 'org-123',
        uploadedBy: 'user-123',
      }),
    ).rejects.toThrow(BadRequestException)
  })

  it('should confirm import using stored preview', async () => {
    const preview = await service.previewImport(Buffer.from(validCsv), {
      organizationId: 'org-456',
      uploadedBy: 'user-789',
    })

    frameworksService.create.mockResolvedValue({ id: 'generated-id' } as any)

    const result = await service.confirmImport(preview.previewToken, {
      organizationId: 'org-456',
      uploadedBy: 'user-789',
    })

    expect(frameworksService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 'org-456',
        name: 'AI Governance',
        dimensions: expect.any(Array),
      }),
    )
    expect(result.frameworkId).toBe('generated-id')

    const stored = await previewStore.get<any>(preview.previewToken)
    expect(stored).toBeNull()
  })
})
