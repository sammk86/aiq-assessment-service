import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding questions for General AI Maturity Framework...');

  const frameworkId = 'general-ai-maturity-v1';

  const questions = [
    // Strategy & Governance (10 questions)
    {
      frameworkId,
      text: 'Does your organization have a formal AI strategy document?',
      responseType: 'rating_scale',
      dimension: 'Strategy & Governance',
      subDimension: 'AI Strategy',
      scoringWeight: 1.0,
      helpText: 'A formal AI strategy includes vision, objectives, and roadmap',
      orderIndex: 1,
    },
    {
      frameworkId,
      text: 'How well is AI strategy aligned with overall business strategy?',
      responseType: 'rating_scale',
      dimension: 'Strategy & Governance',
      subDimension: 'AI Strategy',
      scoringWeight: 1.0,
      helpText: 'Rate the level of alignment from 1 (not aligned) to 5 (fully aligned)',
      orderIndex: 2,
    },
    {
      frameworkId,
      text: 'Does your organization have an AI governance committee or board?',
      responseType: 'rating_scale',
      dimension: 'Strategy & Governance',
      subDimension: 'Governance Structure',
      scoringWeight: 1.0,
      helpText: 'Governance committee oversees AI initiatives and risks',
      orderIndex: 3,
    },
    {
      frameworkId,
      text: 'How mature is your AI risk management framework?',
      responseType: 'rating_scale',
      dimension: 'Strategy & Governance',
      subDimension: 'Risk Management',
      scoringWeight: 1.0,
      helpText: 'Consider policies, processes, and tools for managing AI risks',
      orderIndex: 4,
    },
    {
      frameworkId,
      text: 'Are AI ethical guidelines defined and enforced?',
      responseType: 'rating_scale',
      dimension: 'Strategy & Governance',
      subDimension: 'Risk Management',
      scoringWeight: 1.0,
      helpText: 'Ethical guidelines cover fairness, transparency, and accountability',
      orderIndex: 5,
    },

    // Data & Infrastructure (10 questions)
    {
      frameworkId,
      text: 'How would you rate the quality of your data for AI initiatives?',
      responseType: 'rating_scale',
      dimension: 'Data & Infrastructure',
      subDimension: 'Data Quality',
      scoringWeight: 1.0,
      helpText: 'Consider completeness, accuracy, consistency, and timeliness',
      orderIndex: 6,
    },
    {
      frameworkId,
      text: 'Is your data properly labeled and annotated for machine learning?',
      responseType: 'rating_scale',
      dimension: 'Data & Infrastructure',
      subDimension: 'Data Quality',
      scoringWeight: 1.0,
      helpText: 'Labeled data is essential for supervised learning',
      orderIndex: 7,
    },
    {
      frameworkId,
      text: 'How mature is your data governance framework?',
      responseType: 'rating_scale',
      dimension: 'Data & Infrastructure',
      subDimension: 'Data Quality',
      scoringWeight: 1.0,
      helpText: 'Data governance includes policies, standards, and data ownership',
      orderIndex: 8,
    },
    {
      frameworkId,
      text: 'Do you have dedicated infrastructure for AI/ML workloads?',
      responseType: 'rating_scale',
      dimension: 'Data & Infrastructure',
      subDimension: 'Infrastructure',
      scoringWeight: 1.0,
      helpText: 'This could be GPUs, TPUs, or cloud ML infrastructure',
      orderIndex: 9,
    },
    {
      frameworkId,
      text: 'How scalable is your AI infrastructure?',
      responseType: 'rating_scale',
      dimension: 'Data & Infrastructure',
      subDimension: 'Infrastructure',
      scoringWeight: 1.0,
      helpText: 'Can it handle increasing data volumes and model complexity?',
      orderIndex: 10,
    },

    // Technology & Tools (10 questions)
    {
      frameworkId,
      text: 'Do you have a standardized ML platform or framework?',
      responseType: 'rating_scale',
      dimension: 'Technology & Tools',
      subDimension: 'ML Platforms',
      scoringWeight: 1.0,
      helpText: 'Examples: TensorFlow, PyTorch, SageMaker, Azure ML, Databricks',
      orderIndex: 11,
    },
    {
      frameworkId,
      text: 'How mature is your MLOps practice?',
      responseType: 'rating_scale',
      dimension: 'Technology & Tools',
      subDimension: 'ML Platforms',
      scoringWeight: 1.0,
      helpText: 'MLOps includes model versioning, deployment automation, monitoring',
      orderIndex: 12,
    },
    {
      frameworkId,
      text: 'Do you use automated ML (AutoML) tools?',
      responseType: 'rating_scale',
      dimension: 'Technology & Tools',
      subDimension: 'Tools & Libraries',
      scoringWeight: 1.0,
      helpText: 'AutoML automates feature engineering, model selection, and tuning',
      orderIndex: 13,
    },
    {
      frameworkId,
      text: 'How comprehensive is your model monitoring and observability?',
      responseType: 'rating_scale',
      dimension: 'Technology & Tools',
      subDimension: 'Model Management',
      scoringWeight: 1.0,
      helpText: 'Monitor for model drift, performance degradation, and bias',
      orderIndex: 14,
    },
    {
      frameworkId,
      text: 'Is model versioning and lineage tracking implemented?',
      responseType: 'rating_scale',
      dimension: 'Technology & Tools',
      subDimension: 'Model Management',
      scoringWeight: 1.0,
      helpText: 'Track model versions, training data, and experiment history',
      orderIndex: 15,
    },

    // People & Culture (8 questions)
    {
      frameworkId,
      text: 'How would you rate AI skills and expertise in your organization?',
      responseType: 'rating_scale',
      dimension: 'People & Culture',
      subDimension: 'Talent',
      scoringWeight: 1.0,
      helpText: 'Consider data scientists, ML engineers, and AI specialists',
      orderIndex: 16,
    },
    {
      frameworkId,
      text: 'Do you have active AI training and upskilling programs?',
      responseType: 'rating_scale',
      dimension: 'People & Culture',
      subDimension: 'Talent',
      scoringWeight: 1.0,
      helpText: 'Programs to develop AI skills across the organization',
      orderIndex: 17,
    },
    {
      frameworkId,
      text: 'How strong is executive sponsorship for AI initiatives?',
      responseType: 'rating_scale',
      dimension: 'People & Culture',
      subDimension: 'Culture',
      scoringWeight: 1.0,
      helpText: 'C-level commitment and resource allocation for AI',
      orderIndex: 18,
    },
    {
      frameworkId,
      text: 'Is there a culture of experimentation and innovation around AI?',
      responseType: 'rating_scale',
      dimension: 'People & Culture',
      subDimension: 'Culture',
      scoringWeight: 1.0,
      helpText: 'Willingness to try new approaches and learn from failures',
      orderIndex: 19,
    },
    {
      frameworkId,
      text: 'How well do different teams collaborate on AI projects?',
      responseType: 'rating_scale',
      dimension: 'People & Culture',
      subDimension: 'Culture',
      scoringWeight: 1.0,
      helpText: 'Cross-functional collaboration between IT, business, and data teams',
      orderIndex: 20,
    },

    // Operations & Impact (7 questions)
    {
      frameworkId,
      text: 'How many AI models are currently in production?',
      responseType: 'rating_scale',
      dimension: 'Operations & Impact',
      subDimension: 'Production Deployment',
      scoringWeight: 1.0,
      helpText: 'Rate: 1 (none), 2 (1-2), 3 (3-5), 4 (6-10), 5 (10+)',
      orderIndex: 21,
    },
    {
      frameworkId,
      text: 'How robust is your CI/CD pipeline for ML models?',
      responseType: 'rating_scale',
      dimension: 'Operations & Impact',
      subDimension: 'Production Deployment',
      scoringWeight: 1.0,
      helpText: 'Automated testing, validation, and deployment of models',
      orderIndex: 22,
    },
    {
      frameworkId,
      text: 'Is there a process for A/B testing and canary deployments of models?',
      responseType: 'rating_scale',
      dimension: 'Operations & Impact',
      subDimension: 'Production Deployment',
      scoringWeight: 1.0,
      helpText: 'Gradual rollout and testing before full deployment',
      orderIndex: 23,
    },
    {
      frameworkId,
      text: 'How measurable is the business impact of your AI initiatives?',
      responseType: 'rating_scale',
      dimension: 'Operations & Impact',
      subDimension: 'Business Impact',
      scoringWeight: 1.0,
      helpText: 'Clear KPIs and ROI tracking for AI projects',
      orderIndex: 24,
    },
    {
      frameworkId,
      text: 'Are AI solutions driving tangible business value?',
      responseType: 'rating_scale',
      dimension: 'Operations & Impact',
      subDimension: 'Business Impact',
      scoringWeight: 1.0,
      helpText: 'Revenue growth, cost reduction, improved customer experience, etc.',
      orderIndex: 25,
    },
  ];

  let createdCount = 0;

  // Check if questions already exist for this framework
  const existingCount = await prisma.question.count({
    where: { frameworkId },
  });

  if (existingCount > 0) {
    console.log(`⚠️  Found ${existingCount} existing questions for ${frameworkId}`);
    console.log('   Skipping seed to avoid duplicates');
    return;
  }

  for (const question of questions) {
    await prisma.question.create({
      data: {
        id: uuidv4(),
        ...question,
      },
    });
    createdCount++;
  }

  console.log(`✅ Created ${createdCount} questions for ${frameworkId}`);
  console.log('\n📊 Questions by Dimension:');
  console.log('  - Strategy & Governance: 5 questions');
  console.log('  - Data & Infrastructure: 5 questions');
  console.log('  - Technology & Tools: 5 questions');
  console.log('  - People & Culture: 5 questions');
  console.log('  - Operations & Impact: 5 questions');
  console.log('\n🎉 Total: 25 questions ready for assessment!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding questions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

