export type DeadlineCategory = "ouac" | "scholarship" | "supp_app" | "offer" | "general";

export interface Deadline {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  universityId?: string;
  programHint?: string;
  category: DeadlineCategory;
  url?: string;
}

export const ONTARIO_DEADLINES: Deadline[] = [
  {
    id: "ouac-opens",
    title: "OUAC Application Opens",
    description: "The Ontario Universities' Application Centre opens for Grade 12 students to begin their applications.",
    date: "2025-10-01",
    category: "ouac",
    url: "https://www.ouac.on.ca",
  },
  {
    id: "lester-pearson",
    title: "Lester B. Pearson Scholarship",
    description: "U of T's most prestigious international scholarship. You must be nominated by your school by this date.",
    date: "2025-11-07",
    universityId: "uoft",
    category: "scholarship",
    url: "https://future.utoronto.ca/scholarships/lester-b-pearson",
  },
  {
    id: "queens-supp",
    title: "Queen's Supplementary Application",
    description: "Queen's requires a supplementary application for Commerce, Computing, Engineering, Nursing, and other competitive programs.",
    date: "2026-01-31",
    universityId: "queens",
    category: "supp_app",
    url: "https://www.queensu.ca/admission",
  },
  {
    id: "ouac-deadline",
    title: "OUAC Main Application Deadline",
    description: "Apply to most Ontario universities through OUAC. After this date, you can still apply but may miss early consideration.",
    date: "2026-01-15",
    category: "ouac",
    url: "https://www.ouac.on.ca",
  },
  {
    id: "waterloo-ata",
    title: "Waterloo Admission Information Form (AIF)",
    description: "Waterloo requires the Admission Information Form (AIF) for all applicants. Engineering, Math, CS have earlier internal reviews.",
    date: "2026-02-01",
    universityId: "waterloo",
    category: "supp_app",
    url: "https://uwaterloo.ca/future-students/admissions/apply",
  },
  {
    id: "uoft-supp",
    title: "U of T Supplemental Applications",
    description: "Engineering, Rotman Commerce, Architecture, Nursing, and Kinesiology require supplementary materials.",
    date: "2026-02-01",
    universityId: "uoft",
    category: "supp_app",
    url: "https://future.utoronto.ca",
  },
  {
    id: "mac-supp",
    title: "McMaster Supplementary Applications",
    description: "McMaster Health Sciences, Engineering, and Business require supplementary essays or applications.",
    date: "2026-02-01",
    universityId: "mcmaster",
    category: "supp_app",
    url: "https://www.mcmaster.ca/admissions",
  },
  {
    id: "laurier-ent-scholarship",
    title: "Laurier Entrance Scholarship Review",
    description: "Wilfrid Laurier automatically considers students for entrance scholarships at time of admission offer.",
    date: "2026-02-15",
    universityId: "laurier",
    category: "scholarship",
    url: "https://www.wlu.ca/awards",
  },
  {
    id: "western-supp",
    title: "Western Supplementary Applications",
    description: "Western's Medical Sciences, Software Engineering, and Ivey AEO require supplementary applications.",
    date: "2026-02-15",
    universityId: "western",
    category: "supp_app",
    url: "https://www.uwo.ca/futurestudents",
  },
  {
    id: "carleton-entrance-award",
    title: "Carleton Entrance Scholarship Deadline",
    description: "Apply for Carleton's Prestige Scholarships (Chancellor's, President's). These require a separate application.",
    date: "2026-03-01",
    universityId: "carleton",
    category: "scholarship",
    url: "https://carleton.ca/awards",
  },
  {
    id: "ouac-late",
    title: "OUAC Late Application Deadline",
    description: "Final deadline to apply through OUAC. Applications after this date are typically not accepted.",
    date: "2026-03-01",
    category: "ouac",
    url: "https://www.ouac.on.ca",
  },
  {
    id: "offers-begin",
    title: "Ontario Offers Begin Rolling Out",
    description: "Most Ontario universities begin sending early offers of admission. Keep an eye on your email and OUAC portal.",
    date: "2026-03-15",
    category: "general",
    url: "https://www.ouac.on.ca",
  },
  {
    id: "ouac-response-deadline",
    title: "OUAC Offer Response Deadline",
    description: "You must accept or decline your Ontario university offer through OUAC by this date. You can only hold one offer.",
    date: "2026-06-01",
    category: "offer",
    url: "https://www.ouac.on.ca",
  },
];

export const DEADLINE_CATEGORY_CONFIG: Record<DeadlineCategory, { label: string; color: string; icon: string }> = {
  ouac:        { label: "OUAC",        color: "#0EA5E9", icon: "send"       },
  scholarship: { label: "Scholarship", color: "#10B981", icon: "dollar-sign"},
  supp_app:    { label: "Supp. App",   color: "#F59E0B", icon: "file-text"  },
  offer:       { label: "Offer",       color: "#7C3AED", icon: "award"      },
  general:     { label: "General",     color: "#6366F1", icon: "info"       },
};

export function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getUpcomingDeadlines(n = 5): (Deadline & { daysUntil: number })[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return ONTARIO_DEADLINES
    .map((d) => ({ ...d, daysUntil: getDaysUntil(d.date) }))
    .filter((d) => d.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, n);
}
