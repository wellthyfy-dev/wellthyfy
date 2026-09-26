/**
 * Privacy Policy content.
 *
 * This is legal copy — edit the wording here rather than in the page component,
 * and bump `effectiveDate` whenever the text changes materially.
 *
 * Note: the grievance address below intentionally differs from `siteConfig`.
 * The policy states the full registered office (including Vazhuthaavur Road)
 * and uses admin@wellthyfy.in as the privacy contact, while the marketing site
 * publishes the shorter address and info@wellthyfy.in.
 */

export const policyMeta = {
  effectiveDate: "22 September 2026",
  legalName: "Wellthyfy Lifestyle Ventures Private Limited",
  shortName: "Wellthyfy",
  email: "admin@wellthyfy.in",
  phone: "+91 97519 45999",
  phoneHref: "tel:+919751945999",
  website: "www.wellthyfy.in",
  websiteHref: "https://www.wellthyfy.in",
  addressLines: [
    "No. 34, First Floor, Kasthuribai Nagar,",
    "Vazhuthaavur Road, Puducherry – 605009, India",
  ],
};

const DPDP_ACT = {
  label: "MeitY — Digital Personal Data Protection Act, 2023",
  href: "https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023-1.pdf",
};

export type PolicyBlock =
  | { kind: "p"; text: string; cite?: { label: string; href: string } }
  | { kind: "h3"; text: string }
  | { kind: "list"; items: string[] };

export type PolicySection = {
  id: string;
  number: number;
  title: string;
  blocks: PolicyBlock[];
};

export const policyIntro: PolicyBlock[] = [
  {
    kind: "p",
    text: "At Wellthyfy Lifestyle Ventures Private Limited (“Wellthyfy”, “we”, “our” or “us”), we respect your privacy and are committed to protecting the personal information you share with us.",
  },
  {
    kind: "p",
    text: "This Privacy Policy explains how we collect, use, store, process and protect information when you visit or use www.wellthyfy.in, register for our programs, contact us, participate in our community, or use our services.",
  },
];

export const policySections: PolicySection[] = [
  {
    id: "information-we-collect",
    number: 1,
    title: "Information We Collect",
    blocks: [
      { kind: "p", text: "Depending on how you interact with Wellthyfy, we may collect:" },
      { kind: "h3", text: "Personal Information" },
      {
        kind: "list",
        items: [
          "Name",
          "Mobile number",
          "Email address",
          "Date of birth or age",
          "Gender, where relevant",
          "Address and location",
          "Occupation and professional information",
          "Information provided through registration or enquiry forms",
        ],
      },
      { kind: "h3", text: "Wellness & Program Information" },
      {
        kind: "p",
        text: "When you voluntarily participate in our wellness programs, assessments or consultations, we may collect information relevant to providing the requested service, such as:",
      },
      {
        kind: "list",
        items: [
          "Height and weight",
          "Lifestyle information",
          "Wellness goals",
          "Dietary preferences",
          "Fitness-related information",
          "Other information voluntarily provided by you during a wellness assessment or consultation",
        ],
      },
      {
        kind: "p",
        text: "We will use such information only for the purposes communicated to you and, where required, with your consent.",
      },
      { kind: "h3", text: "Transaction Information" },
      {
        kind: "p",
        text: "If you purchase a product, membership, course, workshop or other service, we may receive information relating to the transaction, such as order details and payment status.",
      },
      {
        kind: "p",
        text: "Payment card, banking or other sensitive payment credentials may be processed directly by third-party payment service providers rather than being stored by Wellthyfy.",
      },
      { kind: "h3", text: "Technical Information" },
      {
        kind: "p",
        text: "When you visit our website, certain information may automatically be collected, such as:",
      },
      {
        kind: "list",
        items: [
          "IP address",
          "Browser type",
          "Device information",
          "Operating system",
          "Website pages visited",
          "Date and time of visits",
          "Referral information",
          "Cookies and similar technologies",
        ],
      },
    ],
  },
  {
    id: "how-we-use-your-information",
    number: 2,
    title: "How We Use Your Information",
    blocks: [
      { kind: "p", text: "We may use personal information to:" },
      {
        kind: "list",
        items: [
          "Respond to enquiries and requests",
          "Contact you regarding our programs and services",
          "Register you for courses, workshops, events and memberships",
          "Provide wellness, educational and community services",
          "Process orders and transactions",
          "Provide customer support",
          "Manage our Wellthyfy community",
          "Send important service-related communications",
          "Improve our website, programs and customer experience",
          "Conduct internal administration and record keeping",
          "Send promotional communications where permitted and, where required, based on your consent",
          "Prevent fraud, misuse and unauthorized activity",
          "Comply with applicable legal and regulatory requirements",
        ],
      },
      {
        kind: "p",
        text: "We aim to collect and process only information that is reasonably necessary for the relevant purpose.",
      },
    ],
  },
  {
    id: "consent",
    number: 3,
    title: "Consent",
    blocks: [
      {
        kind: "p",
        text: "Where consent is the basis for processing your personal data, we will seek consent in a clear and understandable manner.",
      },
      {
        kind: "p",
        text: "You may withdraw consent where applicable. Withdrawal of consent will not affect the lawfulness of processing carried out before withdrawal.",
      },
      {
        kind: "p",
        text: "Under India’s DPDP framework, consent is expected to be free, specific, informed, unconditional and unambiguous, with a clear affirmative action.",
        cite: DPDP_ACT,
      },
    ],
  },
  {
    id: "marketing-communications",
    number: 4,
    title: "Marketing Communications",
    blocks: [
      { kind: "p", text: "With your consent, we may contact you through:" },
      {
        kind: "list",
        items: [
          "Phone calls",
          "SMS",
          "WhatsApp",
          "Email",
          "Other digital communication channels",
        ],
      },
      { kind: "p", text: "Such communications may relate to:" },
      {
        kind: "list",
        items: [
          "Wellthyfy programs",
          "Courses and workshops",
          "Wellness activities",
          "Memberships",
          "Events",
          "Products and services",
          "Offers and announcements",
        ],
      },
      {
        kind: "p",
        text: `You may request to stop receiving promotional communications at any time by contacting ${policyMeta.email} or using an available unsubscribe/opt-out mechanism.`,
      },
    ],
  },
  {
    id: "sharing-of-information",
    number: 5,
    title: "Sharing of Information",
    blocks: [
      { kind: "p", text: "We do not sell your personal information." },
      {
        kind: "p",
        text: "We may share necessary information with trusted service providers and partners where required to provide our services, such as:",
      },
      {
        kind: "list",
        items: [
          "Payment service providers",
          "Website and hosting providers",
          "CRM and communication platforms",
          "Technology service providers",
          "Course or event support partners",
          "Delivery/logistics providers",
          "Professional service providers",
          "Authorized Wellthyfy faculty or service partners where necessary to deliver a requested program",
        ],
      },
      {
        kind: "p",
        text: "Such parties will be provided only the information reasonably necessary for the relevant purpose, subject to applicable contractual and legal requirements.",
      },
      {
        kind: "p",
        text: "We may also disclose information where required by law, regulation, court order, governmental authority or for the protection of our legal rights.",
      },
    ],
  },
  {
    id: "cookies",
    number: 6,
    title: "Cookies",
    blocks: [
      { kind: "p", text: "Our website may use cookies and similar technologies to:" },
      {
        kind: "list",
        items: [
          "Keep the website functioning properly",
          "Remember preferences",
          "Understand website usage",
          "Improve website performance",
          "Measure marketing effectiveness",
        ],
      },
      {
        kind: "p",
        text: "You may manage cookies through your browser settings. Disabling certain cookies may affect some website functionality.",
      },
    ],
  },
  {
    id: "data-security",
    number: 7,
    title: "Data Security",
    blocks: [
      {
        kind: "p",
        text: "We take reasonable technical and organizational measures designed to protect personal information against unauthorized access, loss, misuse, alteration or disclosure.",
      },
      {
        kind: "p",
        text: "However, no website, electronic transmission or storage system can be guaranteed to be completely secure.",
      },
      {
        kind: "p",
        text: "If we become aware of a personal-data breach requiring notification under applicable law, we will take appropriate steps as required by law.",
      },
    ],
  },
  {
    id: "data-retention",
    number: 8,
    title: "Data Retention",
    blocks: [
      {
        kind: "p",
        text: "We retain personal information only for as long as reasonably necessary for the purposes for which it was collected, including:",
      },
      {
        kind: "list",
        items: [
          "Providing requested services",
          "Maintaining business and transaction records",
          "Managing memberships and registrations",
          "Resolving disputes",
          "Meeting legal, tax, accounting and regulatory obligations",
          "Protecting our legitimate business interests",
        ],
      },
      {
        kind: "p",
        text: "When information is no longer required, we may securely delete, anonymize or otherwise dispose of it, subject to applicable legal requirements.",
      },
    ],
  },
  {
    id: "your-rights",
    number: 9,
    title: "Your Rights",
    blocks: [
      {
        kind: "p",
        text: "Subject to applicable law, you may have rights relating to your personal data, including the ability to:",
      },
      {
        kind: "list",
        items: [
          "Request information about processing of your personal data",
          "Request correction of inaccurate or incomplete information",
          "Request deletion of personal data where legally applicable",
          "Withdraw consent where consent is the basis of processing",
          "Raise a grievance regarding processing of your personal data",
          "Exercise other rights available under applicable data-protection laws",
        ],
      },
      {
        kind: "p",
        text: "India’s DPDP Act specifically provides for withdrawal of consent and requires processing to cease within a reasonable time where continued processing is not otherwise authorized by law.",
        cite: DPDP_ACT,
      },
      { kind: "p", text: "To exercise an applicable right, contact us at:" },
      {
        kind: "list",
        items: [`Email: ${policyMeta.email}`, `Phone: ${policyMeta.phone}`],
      },
      {
        kind: "p",
        text: "We may need to verify your identity before processing certain requests.",
      },
    ],
  },
  {
    id: "childrens-privacy",
    number: 10,
    title: "Children’s Privacy",
    blocks: [
      {
        kind: "p",
        text: "Our website and services are not intended to knowingly collect personal data from children in circumstances where parental or lawful consent is required without obtaining the appropriate consent.",
      },
      {
        kind: "p",
        text: `If you believe that a child has provided personal information to us improperly, please contact us at ${policyMeta.email}.`,
      },
    ],
  },
  {
    id: "third-party-websites",
    number: 11,
    title: "Third-Party Websites and Services",
    blocks: [
      {
        kind: "p",
        text: "Our website may contain links to third-party websites, applications, social-media platforms or services.",
      },
      {
        kind: "p",
        text: "We are not responsible for the privacy practices, security or content of third-party websites.",
      },
      {
        kind: "p",
        text: "We encourage users to review the privacy policies of those third parties before providing personal information.",
      },
    ],
  },
  {
    id: "social-media",
    number: 12,
    title: "Social Media",
    blocks: [
      { kind: "p", text: "Wellthyfy may maintain pages or profiles on social-media platforms." },
      {
        kind: "p",
        text: "Information you provide through those platforms may also be subject to the privacy policies and terms of the respective platforms.",
      },
    ],
  },
  {
    id: "changes-to-this-policy",
    number: 13,
    title: "Changes to This Privacy Policy",
    blocks: [
      { kind: "p", text: "We may update this Privacy Policy from time to time to reflect changes in:" },
      {
        kind: "list",
        items: [
          "Our services",
          "Technology",
          "Legal requirements",
          "Regulatory requirements",
          "Data-processing practices",
        ],
      },
      {
        kind: "p",
        text: "The updated version will be published on this page with the revised Effective Date.",
      },
      { kind: "p", text: "We encourage you to review this page periodically." },
    ],
  },
];
