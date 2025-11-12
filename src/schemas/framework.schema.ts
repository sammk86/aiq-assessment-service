import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type FrameworkDocument = Framework & Document

@Schema({ collection: 'frameworks' })
export class Framework {
  @Prop({ required: true, unique: true })
  id: string

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  version: string

  @Prop({ required: true })
  description: string

  @Prop({ required: false })
  organizationId?: string

  @Prop({
    type: [
      {
        order: { type: Number, required: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        weight: { type: Number, required: true, default: 1 },
        questions: {
          type: [
            {
              order: { type: Number, required: true },
              text: { type: String, required: true },
              responseType: { type: String, required: true },
              helpText: { type: String },
              weight: { type: Number, required: true, default: 1 },
              tags: { type: [String], default: [] },
            },
          ],
          default: [],
        },
      },
    ],
    required: true,
    default: [],
  })
  dimensions: Array<{
    order: number
    name: string
    description: string
    weight: number
    questions: Array<{
      order: number
      text: string
      responseType: string
      helpText?: string
      weight: number
      tags: string[]
    }>
  }>

  @Prop()
  importedBy?: string

  @Prop({ type: Date })
  importedAt?: Date

  @Prop({ type: Date, default: Date.now })
  createdAt: Date

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date
}

export const FrameworkSchema = SchemaFactory.createForClass(Framework)

FrameworkSchema.index({ id: 1 }, { unique: true })
FrameworkSchema.index({ name: 1, version: 1 }, { unique: true })
FrameworkSchema.index({ organizationId: 1, name: 1 })
FrameworkSchema.index({ 'dimensions.name': 1 })
