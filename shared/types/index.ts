/**
 * Shared TypeScript type definitions for AI Maturity Assessment Platform
 */

// Organization and User Types
export interface Organization {
  id: string;
  name: string;
  industry: string;
  size: string;
  geography: string;
  subscriptionTier: string;
  settings: OrganizationSettings;
  branding?: BrandingSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  departmentId?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Assessment Types
export interface Assessment {
  id: string;
  organizationId: string;
  frameworkId: string;
  name: string;
  status: AssessmentStatus;
  startDate: Date;
  endDate?: Date;
  stakeholders: Stakeholder[];
  completionMetrics: CompletionMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export enum AssessmentStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export interface Question {
  id: string;
  frameworkId: string;
  text: string;
  responseType: ResponseType;
  dimension: MaturityDimension;
  subDimension: string;
  scoringWeight: number;
  helpText?: string;
  options?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Response {
  id: string;
  assessmentId: string;
  questionId: string;
  userId: string;
  answer: any;
  evidenceIds: string[];
  justification?: string;
  confidenceLevel: number;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum ResponseType {
  MULTIPLE_CHOICE = 'multiple_choice',
  RATING_SCALE = 'rating_scale',
  TEXT = 'text',
  FILE_UPLOAD = 'file_upload',
  BOOLEAN = 'boolean'
}

export enum MaturityDimension {
  STRATEGY_GOVERNANCE = 'strategy_governance',
  DATA_INFRASTRUCTURE = 'data_infrastructure',
  TECHNICAL_CAPABILITIES = 'technical_capabilities',
  TALENT_CULTURE = 'talent_culture',
  ETHICS_COMPLIANCE = 'ethics_compliance',
  OPERATIONAL_EXCELLENCE = 'operational_excellence'
}

// Scoring Types
export interface MaturityScore {
  id: string;
  assessmentId: string;
  overallScore: number;
  dimensionScores: DimensionScore[];
  confidenceInterval: number;
  calculatedAt: Date;
}

export interface DimensionScore {
  dimension: MaturityDimension;
  score: number;
  subDimensionScores: SubDimensionScore[];
}

export interface SubDimensionScore {
  subDimension: string;
  score: number;
}

// Recommendation Types
export interface Recommendation {
  id: string;
  assessmentId: string;
  title: string;
  description: string;
  rationale: string;
  priority: Priority;
  impact: number;
  effort: Effort;
  dimension: MaturityDimension;
  dependencies: string[];
  resources: Resource[];
  status: RecommendationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum Priority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum Effort {
  LOW = 'low',      // < 1 week
  MEDIUM = 'medium', // 1-4 weeks
  HIGH = 'high',    // 1-3 months
  VERY_HIGH = 'very_high' // 3+ months
}

export enum RecommendationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  DEFERRED = 'deferred',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

// Initiative Types
export interface Initiative {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  recommendationIds: string[];
  ownerId: string;
  contributors: string[];
  status: InitiativeStatus;
  startDate: Date;
  endDate?: Date;
  milestones: Milestone[];
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum InitiativeStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Policy Types
export interface Policy {
  id: string;
  organizationId: string;
  templateId?: string;
  name: string;
  category: PolicyCategory;
  content: string;
  status: PolicyStatus;
  version: number;
  ownerId: string;
  approvers: string[];
  complianceMappings: ComplianceMapping[];
  reviewSchedule: ReviewSchedule;
  lastReviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum PolicyCategory {
  AI_ETHICS = 'ai_ethics',
  MODEL_DEVELOPMENT = 'model_development',
  DATA_GOVERNANCE = 'data_governance',
  RISK_MANAGEMENT = 'risk_management',
  COMPLIANCE = 'compliance',
  INCIDENT_RESPONSE = 'incident_response'
}

export enum PolicyStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// Common Types
export interface Stakeholder {
  userId: string;
  role: string;
  sections: string[];
  completionStatus: CompletionStatus;
}

export interface CompletionMetrics {
  totalQuestions: number;
  completedQuestions: number;
  totalStakeholders: number;
  completedStakeholders: number;
  completionPercentage: number;
}

export enum CompletionStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export interface Resource {
  type: ResourceType;
  title: string;
  url?: string;
  description?: string;
}

export enum ResourceType {
  TEMPLATE = 'template',
  GUIDE = 'guide',
  POLICY = 'policy',
  VENDOR = 'vendor',
  DOCUMENTATION = 'documentation'
}

export interface ComplianceMapping {
  regulation: string;
  requirement: string;
  article?: string;
}

export interface ReviewSchedule {
  frequency: ReviewFrequency;
  nextReviewDate: Date;
}

export enum ReviewFrequency {
  ANNUAL = 'annual',
  BIANNUAL = 'biannual',
  QUARTERLY = 'quarterly',
  MONTHLY = 'monthly'
}

export interface OrganizationSettings {
  timezone: string;
  language: string;
  dateFormat: string;
  notificationPreferences: NotificationPreferences;
}

export interface BrandingSettings {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customDomain?: string;
}

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  slack?: boolean;
  webhook?: string;
}

export interface Milestone {
  id: string;
  name: string;
  description?: string;
  targetDate: Date;
  completedDate?: Date;
  status: MilestoneStatus;
}

export enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue'
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Event Types (for NATS)
export interface DomainEvent {
  eventType: string;
  aggregateId: string;
  data: any;
  metadata: EventMetadata;
  timestamp: Date;
}

export interface EventMetadata {
  userId?: string;
  organizationId?: string;
  correlationId?: string;
  causationId?: string;
}

