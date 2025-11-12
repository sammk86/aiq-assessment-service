import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Prisma } from '@prisma/client'
import { Model } from 'mongoose'
import { v4 as uuid } from 'uuid'
import { Framework, FrameworkDocument } from '../schemas/framework.schema'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class FrameworksService {
  constructor(
    @InjectModel(Framework.name) private frameworkModel: Model<FrameworkDocument>,
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    return this.frameworkModel.find().exec()
  }

  async findOne(id: string) {
    return this.frameworkModel.findOne({ id }).exec()
  }

  async create(framework: Partial<Framework>) {
    const id = framework.id ?? uuid()

    const updatedDoc = await this.frameworkModel
      .findOneAndUpdate(
        { id },
        {
          $set: {
            ...framework,
            id,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec()

    if (!updatedDoc) {
      throw new Error('Failed to persist framework')
    }

    const frameworkRecord = updatedDoc.toObject() as Framework

    await this.syncQuestionsToPrisma(frameworkRecord)

    return frameworkRecord
  }

  private async syncQuestionsToPrisma(framework: Framework) {
    const dimensions = framework.dimensions ?? []

    const questions: Prisma.QuestionCreateManyInput[] = dimensions.flatMap((dimension) => {
      const dimensionOrder = dimension.order ?? 0
      return (dimension.questions ?? []).map((question) => {
        const questionOrder = question.order ?? 0
        const orderIndex = dimensionOrder * 100 + questionOrder
        const questionData: Prisma.QuestionCreateManyInput = {
          frameworkId: framework.id,
          text: question.text,
          responseType: question.responseType ?? 'rating_scale',
          dimension: dimension.name,
          subDimension: null,
          scoringWeight: new Prisma.Decimal(question.weight ?? 1),
          helpText: question.helpText ?? null,
          orderIndex,
        }

        if (question.tags && question.tags.length > 0) {
          questionData.options = { tags: question.tags }
        }

        return questionData
      })
    })

    await this.prisma.$transaction([
      this.prisma.question.deleteMany({
        where: { frameworkId: framework.id },
      }),
      ...(questions.length > 0
        ? [
            this.prisma.question.createMany({
              data: questions,
            }),
          ]
        : []),
    ])
  }
}
