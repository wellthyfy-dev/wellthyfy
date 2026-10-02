import type { Accent } from "./site";

/**
 * The Wellthyfy course catalogue: three pillars, 22 courses.
 *
 * Pillars map onto the brand accents — Wellness/green, Wealth/navy,
 * Happiness/gold — so cards inherit the same palette as the rest of the site.
 * Edit course copy here; the homepage teaser and /courses both read from it.
 */

export type PillarId = "wellness" | "wealth" | "happiness";

export const coursePillars: {
  id: PillarId;
  accent: Accent;
  icon: string;
  title: string;
  tagline: string;
  topics: string[];
  cta: string;
}[] = [
  {
    id: "wellness",
    accent: "green",
    icon: "flower",
    title: "Wellness",
    tagline: "Live Better • Feel Better • Stay Better",
    topics: [
      "Nutrition",
      "Weight Management",
      "Yoga",
      "Meditation",
      "Lifestyle",
      "Stress Management",
    ],
    cta: "Explore Wellness Courses",
  },
  {
    id: "wealth",
    accent: "navy",
    icon: "wallet",
    title: "Wealth",
    tagline: "Learn Money • Manage Money • Grow Money",
    topics: [
      "Financial Literacy",
      "Budgeting",
      "Net Worth",
      "Investing Awareness",
      "Wealth Creation",
      "Entrepreneurship",
    ],
    cta: "Explore Wealth Courses",
  },
  {
    id: "happiness",
    accent: "gold",
    icon: "sun",
    title: "Happiness",
    tagline: "Think Better • Connect Better • Live Better",
    topics: [
      "Mindfulness",
      "Emotional Intelligence",
      "Relationships",
      "Confidence",
      "Purpose",
      "Work-Life Balance",
    ],
    cta: "Explore Happiness Courses",
  },
];

export type CatalogueCourse = {
  pillar: PillarId;
  title: string;
  modules: string[];
  /** Compliance or scope note shown beneath the modules. */
  note?: string;
};

export const courseCatalogue: CatalogueCourse[] = [
  // ── Wellness ──────────────────────────────────────────────────────────────
  {
    pillar: "wellness",
    title: "Healthy Lifestyle Fundamentals",
    modules: [
      "Understanding a healthy lifestyle",
      "Balanced food habits",
      "Hydration and daily routines",
      "Importance of physical activity",
      "Building sustainable healthy habits",
    ],
  },
  {
    pillar: "wellness",
    title: "Smart Nutrition & Balanced Eating",
    modules: [
      "Understanding nutrients and food groups",
      "Portion control and mindful eating",
      "Planning balanced daily meals",
      "Healthy snacking choices",
      "Avoiding common dietary mistakes",
    ],
  },
  {
    pillar: "wellness",
    title: "Weight Management & Healthy Living",
    modules: [
      "Understanding weight and body composition",
      "Food habits that influence weight",
      "Calorie awareness and portion management",
      "Exercise and daily movement",
      "Creating a sustainable lifestyle plan",
    ],
  },
  {
    pillar: "wellness",
    title: "Yoga, Breathing & Meditation",
    modules: [
      "Introduction to yoga and its benefits",
      "Basic breathing practices",
      "Relaxation and mindfulness",
      "Meditation for everyday wellbeing",
      "Building a consistent practice",
    ],
  },
  {
    pillar: "wellness",
    title: "Stress Management & Emotional Wellness",
    modules: [
      "Understanding everyday stress",
      "Identifying personal stress triggers",
      "Breathing and relaxation techniques",
      "Developing positive daily habits",
      "Creating a healthier work-life routine",
    ],
  },
  {
    pillar: "wellness",
    title: "Family Wellness & Healthy Habits",
    modules: [
      "Creating healthy family routines",
      "Healthy food choices for families",
      "Encouraging physical activity",
      "Managing screen time and sleep habits",
      "Building a supportive wellness environment",
    ],
  },

  // ── Wealth ────────────────────────────────────────────────────────────────
  {
    pillar: "wealth",
    title: "Financial Literacy for Everyone",
    modules: [
      "Understanding income and expenses",
      "Building saving habits",
      "Managing everyday money",
      "Understanding assets and liabilities",
      "Developing financial discipline",
    ],
  },
  {
    pillar: "wealth",
    title: "Smart Budgeting & Money Management",
    modules: [
      "Creating a practical monthly budget",
      "Tracking income and expenses",
      "Controlling unnecessary spending",
      "Building regular savings",
      "Reviewing and improving your budget",
    ],
  },
  {
    pillar: "wealth",
    title: "Know Your Net Worth",
    modules: [
      "Understanding net worth",
      "Identifying assets and liabilities",
      "Calculating personal net worth",
      "Finding areas for financial improvement",
      "Creating a personal wealth roadmap",
    ],
  },
  {
    pillar: "wealth",
    title: "Goal-Based Financial Planning",
    modules: [
      "Defining short-term and long-term goals",
      "Estimating financial requirements",
      "Prioritizing financial goals",
      "Creating action plans",
      "Reviewing progress regularly",
    ],
  },
  {
    pillar: "wealth",
    title: "Investing Awareness for Beginners",
    modules: [
      "Understanding saving vs investing",
      "Risk and return fundamentals",
      "Introduction to investment options",
      "Understanding diversification",
      "Developing long-term investing awareness",
    ],
    note: "Educational awareness only; not personalized investment advice.",
  },
  {
    pillar: "wealth",
    title: "Wealth Creation Fundamentals",
    modules: [
      "Understanding the principles of wealth creation",
      "Developing multiple income awareness",
      "Saving and investing for long-term goals",
      "Managing financial risks",
      "Building disciplined wealth habits",
    ],
  },
  {
    pillar: "wealth",
    title: "Entrepreneurship Fundamentals",
    modules: [
      "Understanding entrepreneurship",
      "Identifying business opportunities",
      "Basic business planning",
      "Understanding customers and markets",
      "Developing an entrepreneurial mindset",
    ],
  },
  {
    pillar: "wealth",
    title: "Money Management for Entrepreneurs",
    modules: [
      "Separating personal and business finances",
      "Understanding business income and expenses",
      "Cash-flow management basics",
      "Pricing and profitability awareness",
      "Building financially sustainable businesses",
    ],
  },

  // ── Happiness ─────────────────────────────────────────────────────────────
  {
    pillar: "happiness",
    title: "Happiness & Positive Living",
    modules: [
      "Understanding what influences happiness",
      "Developing positive daily habits",
      "Practising gratitude",
      "Building meaningful relationships",
      "Creating a balanced lifestyle",
    ],
  },
  {
    pillar: "happiness",
    title: "Mindfulness for Everyday Life",
    modules: [
      "Understanding mindfulness",
      "Living in the present moment",
      "Managing distractions",
      "Developing mindful habits",
      "Applying mindfulness in daily situations",
    ],
  },
  {
    pillar: "happiness",
    title: "Emotional Intelligence",
    modules: [
      "Understanding emotions",
      "Developing self-awareness",
      "Managing emotional reactions",
      "Understanding others’ perspectives",
      "Building healthier relationships",
    ],
  },
  {
    pillar: "happiness",
    title: "Communication & Relationships",
    modules: [
      "Building effective communication",
      "Active listening skills",
      "Expressing thoughts positively",
      "Handling disagreements constructively",
      "Strengthening personal relationships",
    ],
  },
  {
    pillar: "happiness",
    title: "Confidence & Personal Development",
    modules: [
      "Understanding self-confidence",
      "Identifying personal strengths",
      "Overcoming limiting beliefs",
      "Developing positive habits",
      "Creating a personal growth plan",
    ],
  },
  {
    pillar: "happiness",
    title: "Work-Life Balance",
    modules: [
      "Understanding work-life balance",
      "Managing time and priorities",
      "Setting healthy boundaries",
      "Making time for family and self",
      "Creating sustainable daily routines",
    ],
  },
  {
    pillar: "happiness",
    title: "Purpose, Goals & Meaningful Living",
    modules: [
      "Understanding personal purpose",
      "Identifying values and priorities",
      "Setting meaningful goals",
      "Turning goals into daily actions",
      "Creating a fulfilling life journey",
    ],
  },
  {
    pillar: "happiness",
    title: "Happiness Through Healthy Habits",
    modules: [
      "Connecting physical and emotional wellbeing",
      "Developing positive morning and evening routines",
      "Improving sleep and relaxation habits",
      "Building meaningful social connections",
      "Creating a happier lifestyle through consistency",
    ],
  },
];

export function coursesForPillar(pillar: PillarId) {
  return courseCatalogue.filter((course) => course.pillar === pillar);
}

export const CATALOGUE_COUNT = courseCatalogue.length;
