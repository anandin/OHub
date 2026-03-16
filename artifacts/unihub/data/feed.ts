export type PostCategory =
  | "event"
  | "program"
  | "news"
  | "hackathon"
  | "competition"
  | "club"
  | "openhouse"
  | "scholarship"
  | "merch"
  | "sports"
  | "research"
  | "admission";

export interface Post {
  id: string;
  universityId: string;
  title: string;
  body: string;
  category: PostCategory;
  author: string;
  source: string;
  sourceUrl?: string;
  timeAgo: string;
  upvotes: number;
  comments: number;
  imageUrl?: string;
  tags: string[];
  isPinned?: boolean;
}

export const CATEGORY_CONFIG: Record<
  PostCategory,
  { label: string; color: string; icon: string }
> = {
  event: { label: "Event", color: "#7C3AED", icon: "calendar" },
  program: { label: "Program", color: "#0EA5E9", icon: "book-open" },
  news: { label: "News", color: "#059669", icon: "bell" },
  hackathon: { label: "Hackathon", color: "#F59E0B", icon: "zap" },
  competition: { label: "Competition", color: "#EF4444", icon: "award" },
  club: { label: "Club", color: "#EC4899", icon: "users" },
  openhouse: { label: "Open House", color: "#06B6D4", icon: "home" },
  scholarship: { label: "Scholarship", color: "#10B981", icon: "dollar-sign" },
  merch: { label: "Merch Drop", color: "#8B5CF6", icon: "shopping-bag" },
  sports: { label: "Sports", color: "#F97316", icon: "activity" },
  research: { label: "Research", color: "#6366F1", icon: "search" },
  admission: { label: "Admissions", color: "#14B8A6", icon: "clipboard" },
};

export const SAMPLE_POSTS: Post[] = [
  {
    id: "1",
    universityId: "waterloo",
    title: "WatHacks 2025 — Registration Now Open! 🚀",
    body: "WatHacks is back and bigger than ever. Join 800+ hackers for 36 hours of building, learning, and connecting. Amazing prizes, workshops by Google, Microsoft, and top Ontario startups. Open to all Ontario students.",
    category: "hackathon",
    author: "MathSoc",
    source: "mathsoc.uwaterloo.ca",
    sourceUrl: "https://mathsoc.uwaterloo.ca",
    timeAgo: "2h",
    upvotes: 1243,
    comments: 87,
    tags: ["Hacking", "Tech", "Prizes", "Free Food"],
    isPinned: true,
  },
  {
    id: "2",
    universityId: "uoft",
    title: "U of T Open House – Fall 2025 Registration",
    body: "Explore the University of Toronto this October! Meet faculty, tour campuses (St. George, Scarborough, Mississauga), discover 700+ programs, and talk to current students. Perfect for Grade 11 & 12 students.",
    category: "openhouse",
    author: "UofT Admissions",
    source: "future.utoronto.ca",
    sourceUrl: "https://future.utoronto.ca",
    timeAgo: "4h",
    upvotes: 892,
    comments: 134,
    tags: ["Open House", "Campus Tour", "Admissions"],
  },
  {
    id: "3",
    universityId: "waterloo",
    title: "New Computer Science Co-op Stream — Admission Requirements Updated",
    body: "The Faculty of Mathematics has announced a new co-op stream in Computer Science starting Fall 2026. Minimum admission average: 95%+ with strong math and programming background. Applications via OUAC.",
    category: "program",
    author: "Math Faculty",
    source: "uwaterloo.ca",
    sourceUrl: "https://uwaterloo.ca/math",
    timeAgo: "6h",
    upvotes: 2341,
    comments: 312,
    tags: ["CS", "Co-op", "Mathematics", "Admissions"],
  },
  {
    id: "4",
    universityId: "queens",
    title: "Queen's Commerce Merch Drop — Limited Edition Winter Collection",
    body: "The QCommerce Society is dropping their limited-edition winter merch collection on December 1st. Hoodies, crewnecks, toques, and more. Only 200 units available — first come, first served!",
    category: "merch",
    author: "QCommerce Society",
    source: "queensu.ca",
    sourceUrl: "https://queensu.ca",
    timeAgo: "1d",
    upvotes: 567,
    comments: 43,
    tags: ["Merch", "Commerce", "Limited Edition"],
  },
  {
    id: "5",
    universityId: "mcmaster",
    title: "McMaster Engineering Design Competition 2025",
    body: "MEDC is calling all engineering students to design, build, and compete! Categories include Civil, Electrical, Mechanical, and Chemical Engineering. $10,000 in prizes. Open to all Ontario engineering students.",
    category: "competition",
    author: "McMaster EngSoc",
    source: "mcmaster.ca",
    sourceUrl: "https://www.mcmaster.ca",
    timeAgo: "1d",
    upvotes: 788,
    comments: 92,
    tags: ["Engineering", "Design", "Competition", "Prizes"],
  },
  {
    id: "6",
    universityId: "western",
    title: "Ivey Business School Info Session — AEO Program 2025",
    body: "Interested in Ivey HBA? Join their Admission with Early Offer (AEO) info session to learn about the program, admission process, and what makes Ivey unique. Q&A with current students and admissions officers.",
    category: "event",
    author: "Ivey Business School",
    source: "ivey.uwo.ca",
    sourceUrl: "https://www.ivey.uwo.ca",
    timeAgo: "2d",
    upvotes: 1089,
    comments: 156,
    tags: ["Business", "Ivey", "AEO", "Info Session"],
  },
  {
    id: "7",
    universityId: "waterloo",
    title: "MathSoc End of Term Extravaganza — Free Pancakes & Games",
    body: "MathSoc is hosting their famous end-of-term pancake breakfast in the MC courtyard. Free pancakes, maple syrup, and orange juice for all Mathematics students. Bring your student card!",
    category: "club",
    author: "MathSoc",
    source: "mathsoc.uwaterloo.ca",
    sourceUrl: "https://mathsoc.uwaterloo.ca",
    timeAgo: "3d",
    upvotes: 445,
    comments: 67,
    tags: ["Free Food", "MathSoc", "Social", "Club"],
  },
  {
    id: "8",
    universityId: "uoft",
    title: "$40,000 Lester B. Pearson Scholarship — Applications Open",
    body: "The University of Toronto's prestigious Lester B. Pearson International Scholarship covers full tuition, books, incidental fees, and full residence support. Nominated by your school. Closes January 15th.",
    category: "scholarship",
    author: "UofT Awards Office",
    source: "future.utoronto.ca",
    sourceUrl: "https://future.utoronto.ca/scholarships",
    timeAgo: "3d",
    upvotes: 3421,
    comments: 289,
    tags: ["Scholarship", "International", "Full Ride", "Prestigious"],
    isPinned: false,
  },
  {
    id: "9",
    universityId: "carleton",
    title: "Carleton Journalism School Opens Applications for 2026",
    body: "Carleton's School of Journalism, one of Canada's best, is now accepting applications for Fall 2026. The program offers specializations in broadcast, digital, and investigative journalism. Average admission: 83%+.",
    category: "admission",
    author: "Carleton Journalism",
    source: "carleton.ca",
    sourceUrl: "https://carleton.ca/journalism",
    timeAgo: "4d",
    upvotes: 654,
    comments: 88,
    tags: ["Journalism", "Applications", "2026", "Media"],
  },
  {
    id: "10",
    universityId: "guelph",
    title: "U of G Hosts Canadian Veterinary Science Symposium",
    body: "The Ontario Veterinary College at the University of Guelph is hosting the annual Canadian Veterinary Science Symposium. Open to all pre-vet and vet students. Keynote by renowned wildlife vet Dr. Jane Goodall.",
    category: "event",
    author: "OVC Events",
    source: "ovc.uoguelph.ca",
    sourceUrl: "https://ovc.uoguelph.ca",
    timeAgo: "5d",
    upvotes: 432,
    comments: 51,
    tags: ["Veterinary", "Science", "Symposium", "Research"],
  },
  {
    id: "11",
    universityId: "ryerson",
    title: "DMZ Startup Pitch Competition — $50K in Startup Support",
    body: "TMU's DMZ (one of the world's top university incubators) is hosting their annual pitch competition. Student founders can win up to $50,000 in non-dilutive funding, mentorship, and office space.",
    category: "competition",
    author: "DMZ @ TMU",
    source: "dmz.torontomu.ca",
    sourceUrl: "https://dmz.torontomu.ca",
    timeAgo: "5d",
    upvotes: 1876,
    comments: 203,
    tags: ["Startup", "Entrepreneurship", "Funding", "Pitch"],
  },
  {
    id: "12",
    universityId: "ottawa",
    title: "uOttawa Bilingual Law Program — Among Top 3 in Canada",
    body: "uOttawa's Faculty of Law (Common Law Section) has been ranked among Canada's top 3 law schools in the 2025 Maclean's rankings. The unique bilingual program provides graduates with opportunities across Canada and internationally.",
    category: "news",
    author: "uOttawa News",
    source: "uottawa.ca",
    sourceUrl: "https://www.uottawa.ca",
    timeAgo: "6d",
    upvotes: 987,
    comments: 112,
    tags: ["Law", "Ranking", "Bilingual", "Achievement"],
  },
  {
    id: "13",
    universityId: "waterloo",
    title: "Software Engineering vs. Computer Science — Which is Right for You?",
    body: "Trying to decide between SE and CS at Waterloo? Both are world-class programs but have key differences in structure, co-op sequence, and career paths. This breakdown from current students will help you choose.",
    category: "program",
    author: "EngSoc UW",
    source: "engsoc.uwaterloo.ca",
    sourceUrl: "https://engsoc.uwaterloo.ca",
    timeAgo: "1w",
    upvotes: 5672,
    comments: 489,
    tags: ["SE", "CS", "Engineering", "Math", "Co-op"],
  },
  {
    id: "14",
    universityId: "yorku",
    title: "Schulich School of Business — New Sustainability MBA Program",
    body: "Schulich is launching an MBA specialization in Sustainability and ESG Investing starting Fall 2026. The program is designed for future business leaders who want to integrate environmental and social considerations into strategy.",
    category: "program",
    author: "Schulich School",
    source: "schulich.yorku.ca",
    sourceUrl: "https://schulich.yorku.ca",
    timeAgo: "1w",
    upvotes: 876,
    comments: 93,
    tags: ["MBA", "Sustainability", "ESG", "Business"],
  },
  {
    id: "15",
    universityId: "queens",
    title: "Queen's Homecoming 2025 — AMS Events & Schedule",
    body: "Homecoming 2025 is almost here! The AMS has planned a full weekend of events including the parade, alumni game, club showcases, and the famous Aberdeen Street festivities. Check the full schedule on the AMS website.",
    category: "event",
    author: "AMS Queen's",
    source: "myams.org",
    sourceUrl: "https://myams.org",
    timeAgo: "1w",
    upvotes: 2134,
    comments: 267,
    tags: ["Homecoming", "AMS", "Social", "Alumni"],
  },
];
