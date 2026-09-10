export const siteConfig = {
  name: "Wellthyfy Lifestyle Ventures",
  legalName: "Wellthyfy Lifestyle Ventures Pvt. Ltd.",
  tagline: "Empowering Health, Wealth & Happiness.",
  url: "https://www.wellthyfy.in",
  phone: "+91 97519 45999",
  phoneHref: "tel:+919751945999",
  email: "info@wellthyfy.in",
  emailHref: "mailto:info@wellthyfy.in",
  website: "www.wellthyfy.in",
  address: {
    line1: "No.34, First Floor,",
    line2: "Kasthuribai Nagar,",
    line3: "Puducherry - 605009",
    full: "No.34, First Floor, Kasthuribai Nagar, Puducherry - 605009",
  },
} as const;

export type Accent = "green" | "navy" | "gold";

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Courses", href: "#courses" },
  { label: "Why Wellthyfy", href: "#why-wellthyfy" },
  { label: "Contact", href: "#contact" },
];

export const pillars: {
  title: string;
  accent: Accent;
  icon: string;
  blurb: string;
  points: string[];
}[] = [
  {
    title: "Better Health",
    accent: "green",
    icon: "heart",
    blurb: "Feel stronger, calmer and more energetic every single day.",
    points: ["Wellness Programs", "Yoga", "Natural Lifestyle Guidance"],
  },
  {
    title: "Financial Wellbeing",
    accent: "navy",
    icon: "wallet",
    blurb: "Build the knowledge and skills that create real financial freedom.",
    points: ["Financial Education", "Skill Development", "Growth Opportunities"],
  },
  {
    title: "Lasting Happiness",
    accent: "gold",
    icon: "sun",
    blurb: "Grow within a positive community that lifts everyone forward.",
    points: ["Positive Living", "Strong Community", "Personal Development"],
  },
];

export const services: {
  title: string;
  accent: Accent;
  icon: string;
  description: string;
  points: string[];
}[] = [
  {
    title: "Health & Wellness",
    accent: "green",
    icon: "flower",
    description: "Time-tested natural practices that restore balance to body and mind.",
    points: ["Yoga", "Reflexology", "Acupressure", "Nutrition Guidance", "Holistic Wellness"],
  },
  {
    title: "Financial Education",
    accent: "navy",
    icon: "wallet",
    description: "Clear, practical money knowledge for individuals and families.",
    points: ["Money Management", "Financial Literacy", "Planning & Awareness"],
  },
  {
    title: "Lifestyle Coaching",
    accent: "gold",
    icon: "compass",
    description: "Guidance that turns good intentions into daily, repeatable habits.",
    points: ["Personal Growth", "Productivity", "Goal Setting"],
  },
  {
    title: "Skill Development",
    accent: "green",
    icon: "graduation",
    description: "Job-ready and business-ready skills taught through real practice.",
    points: ["Career Skills", "Practical Learning", "Income Opportunities"],
  },
  {
    title: "Community Empowerment",
    accent: "navy",
    icon: "users",
    description: "Grow faster surrounded by people walking the same path.",
    points: ["Networking", "Leadership Development", "Group Learning"],
  },
  {
    title: "Partnership Opportunities",
    accent: "gold",
    icon: "handshake",
    description: "Collaborate with us to bring wellbeing to more communities.",
    points: ["Affiliate Programs", "Faculty Partnerships", "Community Partnerships"],
  },
];

export const courses: {
  id: string;
  title: string;
  accent: Accent;
  badge: string;
  duration: string;
  description: string;
  highlights: string[];
  cta: string;
}[] = [
  {
    id: "beautician",
    title: "Basic Beautician Course",
    accent: "gold",
    badge: "Most Popular",
    duration: "Beginner friendly",
    description: "Transform your passion into a profession with hands-on beautician training.",
    highlights: [
      "Skin Care Basics",
      "Facial & Cleanup",
      "Threading",
      "Waxing",
      "Manicure & Pedicure",
      "Basic Makeup",
      "Personal Grooming",
    ],
    cta: "Enroll Now",
  },
  {
    id: "yoga",
    title: "Yoga Instructor Course",
    accent: "green",
    badge: "Certification Track",
    duration: "Practical + theory",
    description:
      "Learn traditional and modern yoga practices to improve health and guide others toward wellness.",
    highlights: [
      "Yoga Foundations",
      "Asanas",
      "Breathing Techniques",
      "Meditation",
      "Wellness Coaching",
      "Practical Sessions",
    ],
    cta: "Learn More",
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing Course",
    accent: "navy",
    badge: "High Demand",
    duration: "Career & freelance ready",
    description:
      "Master digital skills to build your career, freelance, or grow businesses online.",
    highlights: [
      "Social Media Marketing",
      "Meta Ads",
      "SEO",
      "Content Marketing",
      "Website Basics",
      "AI Tools",
    ],
    cta: "Learn More",
  },
];

export const morningClub: {
  minutes: string;
  title: string;
  accent: Accent;
  icon: string;
  description: string;
}[] = [
  {
    minutes: "10",
    title: "Minutes Yoga",
    accent: "green",
    icon: "flower",
    description: "Gentle asanas and breathwork to wake the body and steady the mind.",
  },
  {
    minutes: "10",
    title: "Minutes Motivation",
    accent: "gold",
    icon: "sun",
    description: "A short, powerful reset that sets the tone for the entire day.",
  },
  {
    minutes: "10",
    title: "Minutes Financial Learning",
    accent: "navy",
    icon: "wallet",
    description: "One practical money idea a day, compounding into real understanding.",
  },
];

export const whyWellthyfy = [
  "Natural and trusted solutions",
  "Holistic wellness approach",
  "Practical lifestyle guidance",
  "Opportunities for personal growth",
  "Supportive community",
  "Expert-led programs",
  "Better future for individuals and families",
];

export const audiences: {
  title: string;
  icon: string;
  accent: Accent;
  description: string;
}[] = [
  {
    title: "Students",
    icon: "graduation",
    accent: "navy",
    description: "Build skills and confidence long before the first job interview.",
  },
  {
    title: "Working Professionals",
    icon: "briefcase",
    accent: "green",
    description: "Restore energy, manage money better and grow beyond the desk.",
  },
  {
    title: "Homemakers",
    icon: "home",
    accent: "gold",
    description: "Turn everyday talent into an independent, flexible income.",
  },
  {
    title: "Entrepreneurs",
    icon: "rocket",
    accent: "navy",
    description: "Sharpen skills, expand networks and lead with clarity.",
  },
  {
    title: "Senior Citizens",
    icon: "heart",
    accent: "green",
    description: "Stay active, connected and joyfully engaged with community.",
  },
  {
    title: "Anyone Seeking Better Health & Growth",
    icon: "sparkles",
    accent: "gold",
    description: "If you want a better life, you already belong with us.",
  },
];

export const testimonials = [
  {
    quote:
      "The Daily Morning Club changed my routine completely. Ten minutes of yoga became the anchor of my whole day, and my energy has never been better.",
    name: "Priya Raman",
    role: "Homemaker, Puducherry",
    initials: "PR",
    rating: 5,
  },
  {
    quote:
      "I joined for the Digital Marketing course and left with a freelance career. The trainers were patient, practical and genuinely invested in my progress.",
    name: "Karthik S.",
    role: "Freelance Marketer, Chennai",
    initials: "KS",
    rating: 5,
  },
  {
    quote:
      "The financial education sessions were an eye-opener for our family. For the first time we have a plan we actually understand and follow together.",
    name: "Anitha Devi",
    role: "School Teacher, Cuddalore",
    initials: "AD",
    rating: 5,
  },
];
