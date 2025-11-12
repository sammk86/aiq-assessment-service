import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import { FrameworksService } from '../src/frameworks/frameworks.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

const prisma = new PrismaClient();

type QuestionSeed = {
  order: number;
  text: string;
  responseType: string;
  helpText?: string;
  weight: number;
  tags: string[];
};

type DimensionSeed = {
  order: number;
  name: string;
  description: string;
  weight: number;
  questions: QuestionSeed[];
};

const makeQuestion = (
  order: number,
  text: string,
  tags: string[],
  weight = 1,
  responseType: string = 'rating_scale',
  helpText?: string,
): QuestionSeed => ({
  order,
  text,
  responseType,
  helpText: helpText ?? 'Rate the maturity on a 1-5 scale where 1 = ad hoc and 5 = optimized.',
  weight,
  tags,
});

const makeDimension = (
  order: number,
  name: string,
  description: string,
  weight: number,
  questions: QuestionSeed[],
): DimensionSeed => ({
  order,
  name,
  description,
  weight,
  questions,
});

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const frameworksService = app.get(FrameworksService);

  const generalFramework = {
    id: 'general-ai-maturity-v1',
    name: 'General AI Maturity',
    version: '1.0.0',
    description: 'Comprehensive AI maturity assessment framework',
    dimensions: [
      makeDimension(1, 'Strategy & Governance', 'AI strategy and governance practices', 1.0, [
        makeQuestion(1, 'How well-defined is your enterprise AI strategy?', ['AI Strategy'], 0.4),
        makeQuestion(2, 'How mature is your AI governance structure?', ['Governance Structure'], 0.3),
        makeQuestion(3, 'How effectively do you identify and mitigate AI risks?', ['Risk Management'], 0.3),
      ]),
      makeDimension(2, 'Data & Infrastructure', 'Data management and infrastructure capabilities', 1.0, [
        makeQuestion(1, 'What level of data quality standards are enforced across AI workloads?', ['Data Quality'], 0.5),
        makeQuestion(2, 'How scalable and reliable is your AI infrastructure?', ['Infrastructure'], 0.5),
      ]),
      makeDimension(3, 'Technology & Tools', 'AI technology stack and tooling', 1.0, [
        makeQuestion(1, 'How mature are your machine learning platforms?', ['ML Platforms'], 0.4),
        makeQuestion(2, 'How standardized are the AI tools and libraries in use?', ['Tools & Libraries'], 0.3),
        makeQuestion(3, 'How robust is model lifecycle management (monitoring, retraining, rollback)?', ['Model Management'], 0.3),
      ]),
      makeDimension(4, 'People & Culture', 'AI talent and organizational culture', 1.0, [
        makeQuestion(1, 'How effective is talent sourcing and upskilling for AI roles?', ['Talent'], 0.5),
        makeQuestion(2, 'How supportive is the organizational culture toward AI adoption?', ['Culture'], 0.5),
      ]),
      makeDimension(5, 'Operations & Impact', 'AI operations and business value realization', 1.0, [
        makeQuestion(1, 'How consistently are AI models deployed into production?', ['Production Deployment'], 0.5),
        makeQuestion(2, 'How well is AI-driven business impact measured and reported?', ['Business Impact'], 0.5),
      ]),
    ],
  };

  await frameworksService.create(generalFramework);

  const euAIActFramework = {
    id: 'eu-ai-act-v1',
    name: 'EU AI Act Compliance',
    version: '1.0.0',
    description: 'Assessment framework for EU AI Act compliance readiness',
    dimensions: [
      makeDimension(1, 'Risk Classification', 'AI system risk categorization', 1.0, [
        makeQuestion(1, 'Have AI systems been classified according to EU AI Act risk tiers?', ['Risk Classification']),
        makeQuestion(2, 'How frequently is risk classification reviewed for deployed AI systems?', ['Risk Review']),
      ]),
      makeDimension(2, 'Compliance Requirements', 'Regulatory compliance measures', 1.0, [
        makeQuestion(1, 'To what extent are mandatory compliance controls implemented for high-risk AI?', ['Compliance Controls']),
        makeQuestion(2, 'How mature are your processes for conformity assessments?', ['Conformity Assessment']),
      ]),
      makeDimension(3, 'Documentation & Transparency', 'Required documentation and transparency obligations', 1.0, [
        makeQuestion(1, 'How complete is technical documentation (data provenance, model behavior, limitations)?', ['Technical Documentation']),
        makeQuestion(2, 'How consistently are user transparency requirements communicated?', ['User Transparency']),
      ]),
    ],
  };

  await frameworksService.create(euAIActFramework);

  const nistFramework = {
    id: 'nist-ai-rmf-v1',
    name: 'NIST AI Risk Management Framework',
    version: '1.0.0',
    description: 'NIST AI RMF-based assessment framework',
    dimensions: [
      makeDimension(1, 'Govern', 'Governance and risk management', 1.0, [
        makeQuestion(1, 'How defined are governance roles for AI risk management?', ['Govern']),
        makeQuestion(2, 'How regularly are AI risk policies reviewed by leadership?', ['Govern']),
      ]),
      makeDimension(2, 'Map', 'Risk framing, context, and prioritization', 1.0, [
        makeQuestion(1, 'How well are AI use-cases inventoried and prioritized by risk?', ['Map']),
        makeQuestion(2, 'How documented is the socio-technical context for critical AI systems?', ['Map']),
      ]),
      makeDimension(3, 'Measure', 'Risk measurement and monitoring', 1.0, [
        makeQuestion(1, 'How mature are metrics for tracking AI system reliability and safety?', ['Measure']),
        makeQuestion(2, 'How frequently are AI models audited for bias and performance drift?', ['Measure']),
      ]),
      makeDimension(4, 'Manage', 'Risk treatment, controls, and incident response', 1.0, [
        makeQuestion(1, 'How effective are mitigation plans for identified AI risks?', ['Manage']),
        makeQuestion(2, 'How well is AI incident response integrated with enterprise processes?', ['Manage']),
      ]),
    ],
  };

  await frameworksService.create(nistFramework);

  console.log('✅ Seeded 3 assessment frameworks');

  await app.close();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

