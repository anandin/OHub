export type ScholarshipCategory =
  | "National"
  | "University"
  | "Ontario"
  | "Community";

export interface ScholarshipAward {
  id: string;
  name: string;
  provider: string;
  category: ScholarshipCategory;
  /** Display value, e.g. "$100,000" */
  value: string;
  /** Approximate numeric value used for sorting (total award, CAD) */
  valueNum: number;
  quantity: string;
  deadline: string;
  renewable: string;
  applicationRequired: boolean;
  eligibility: string[];
  description: string;
  applyUrl: string;
  /** Domain shown as the source of the apply link */
  source: string;
  tags: string[];
}

export const SCHOLARSHIP_SOURCES = [
  {
    id: "ouinfo",
    name: "OUInfo Scholarships",
    blurb: "Official scholarship listings for every Ontario university",
    url: "https://www.ouinfo.ca/scholarships/",
  },
  {
    id: "ontarioscholarships",
    name: "OntarioScholarships.ca",
    blurb: "Ontario-focused scholarship directory, sorted by deadline",
    url: "https://ontarioscholarships.ca/",
  },
  {
    id: "scholarshipscanada",
    name: "ScholarshipsCanada",
    blurb: "Canada's largest searchable scholarship database",
    url: "https://www.scholarshipscanada.com/",
  },
  {
    id: "studentawards",
    name: "StudentAwards",
    blurb: "Personalized scholarship matching for Canadian students",
    url: "https://studentawards.com/",
  },
  {
    id: "ontariocolleges",
    name: "OntarioColleges.ca Awards",
    blurb: "Awards, bursaries and scholarships at Ontario colleges",
    url: "https://www.ontariocolleges.ca/en/fees-and-aid/awards-bursaries-and-scholarships",
  },
];

export const SCHOLARSHIP_AWARDS: ScholarshipAward[] = [
  // ——— National, application-based ———
  {
    id: "schulich-leader",
    name: "Schulich Leader Scholarships",
    provider: "Schulich Foundation",
    category: "National",
    value: "$100,000–$120,000",
    valueNum: 120000,
    quantity: "100 awarded across Canada each year",
    deadline: "School nomination: late January",
    renewable: "Paid out over 4 years of study",
    applicationRequired: true,
    eligibility: [
      "Graduating Canadian high school student",
      "Entering a STEM program (engineering, science, technology or math)",
      "Entrepreneurial-minded; leadership in school or community",
      "Must be nominated by your high school (1 nominee per school)",
      "$120,000 for engineering, $100,000 for science/tech/math",
    ],
    description:
      "Canada's largest STEM scholarship. Each high school nominates one student; nominees then apply to the foundation. Awarded at 20 partner universities including Waterloo, U of T, McMaster and Western.",
    applyUrl: "https://schulichleaders.com/apply/",
    source: "schulichleaders.com",
    tags: ["STEM", "Leadership", "Nomination"],
  },
  {
    id: "loran",
    name: "Loran Award",
    provider: "Loran Scholars Foundation",
    category: "National",
    value: "$100,000",
    valueNum: 100000,
    quantity: "Up to 36 Loran Scholars + ~124 smaller finalist/provincial awards",
    deadline: "Mid-October (direct pool) / school-sponsored early October",
    renewable: "Renewed annually over 4 years with mentorship & summer funding",
    applicationRequired: true,
    eligibility: [
      "Canadian citizen or permanent resident in final year of high school",
      "Minimum 85% cumulative average",
      "Demonstrated character, service and leadership potential",
      "Must study at one of 25 partner universities (incl. most Ontario schools)",
    ],
    description:
      "Canada's most comprehensive four-year award: tuition waiver + living stipend, plus mentorship, summer internship funding and retreats. Selection is based on character, service and leadership — not just grades.",
    applyUrl: "https://loranscholar.ca/the-program/how-to-apply/",
    source: "loranscholar.ca",
    tags: ["Leadership", "Service", "Character"],
  },
  {
    id: "td-community",
    name: "TD Scholarships for Community Leadership",
    provider: "TD Bank Group",
    category: "National",
    value: "Up to $70,000",
    valueNum: 70000,
    quantity: "20 awarded across Canada each year",
    deadline: "Mid-November",
    renewable: "Up to $10,000/yr tuition + $7,500/yr living expenses for 4 years",
    applicationRequired: true,
    eligibility: [
      "In final year of high school (or CEGEP) in Canada",
      "Minimum 75% overall average in most recent school year",
      "Outstanding record of community leadership solving a community problem",
      "Also includes paid summer employment offers at TD",
    ],
    description:
      "One of Canada's best-known scholarships for community changemakers. Recognizes students who have shown sustained leadership tackling a social or environmental problem.",
    applyUrl:
      "https://www.td.com/ca/en/about-td/ready-commitment/community-leadership-scholarship-for-canadians",
    source: "td.com",
    tags: ["Community", "Leadership"],
  },
  {
    id: "terry-fox",
    name: "Terry Fox Humanitarian Award",
    provider: "Terry Fox Humanitarian Award Program",
    category: "National",
    value: "$28,000",
    valueNum: 28000,
    quantity: "Up to 20 new awards each year",
    deadline: "December 1",
    renewable: "$7,000/yr, renewable up to 4 years",
    applicationRequired: true,
    eligibility: [
      "Canadian citizen or permanent resident",
      "Graduating high school or already in post-secondary (max age 25)",
      "Demonstrated humanitarian service and courage in overcoming obstacles",
      "Involvement in voluntary humanitarian work; fitness and sport valued",
    ],
    description:
      "Honours students who embody Terry Fox's ideals: humanitarian service, courage and perseverance through adversity, while maintaining satisfactory academic standing.",
    applyUrl: "https://terryfoxawards.ca/applicant-information/",
    source: "terryfoxawards.ca",
    tags: ["Humanitarian", "Service"],
  },
  {
    id: "horatio-alger",
    name: "Horatio Alger Canadian Scholarships",
    provider: "Horatio Alger Association of Canada",
    category: "National",
    value: "$10,000",
    valueNum: 10000,
    quantity: "85+ awarded across Canada each year",
    deadline: "October 25",
    renewable: "One-time award (not renewable)",
    applicationRequired: true,
    eligibility: [
      "Full-time high school student graduating this year in Canada",
      "Demonstrated financial need (household income under ~$65,000)",
      "Adversity overcome; involvement in co-curricular or community activities",
      "Minimum 65% average; will pursue post-secondary in Canada",
    ],
    description:
      "For students who have faced and overcome significant adversity while staying committed to their education and community. Focused on financial need, not top grades.",
    applyUrl: "https://horatioalger.ca/canadian-scholarships/",
    source: "horatioalger.ca",
    tags: ["Financial Need", "Adversity"],
  },
  {
    id: "rbc-next-step",
    name: "RBC Next Step Scholarships",
    provider: "Royal Bank of Canada",
    category: "National",
    value: "$5,000–$10,000",
    valueNum: 10000,
    quantity: "Multiple streams awarded annually",
    deadline: "Varies by stream (typically winter/spring)",
    renewable: "One-time awards; streams vary",
    applicationRequired: true,
    eligibility: [
      "Canadian citizen, permanent resident or protected person",
      "Entering or attending post-secondary in Canada",
      "Streams for general students, newcomers and equity-deserving groups",
      "No RBC account required for most streams",
    ],
    description:
      "RBC's scholarship program supporting students taking the next step into post-secondary, with multiple streams and simple online applications.",
    applyUrl: "https://www.rbc.com/dms/enterprise/scholarships.html",
    source: "rbc.com",
    tags: ["General", "Newcomers"],
  },
  // ——— Ontario ———
  {
    id: "lincoln-alexander",
    name: "Lincoln M. Alexander Award",
    provider: "Government of Ontario",
    category: "Ontario",
    value: "$5,000",
    valueNum: 5000,
    quantity: "3 awarded in Ontario each year",
    deadline: "May 31",
    renewable: "One-time award (not renewable)",
    applicationRequired: true,
    eligibility: [
      "Ontario student in final year of high school",
      "Demonstrated leadership in eliminating racial discrimination",
      "Contribution to social equity in school or community",
    ],
    description:
      "Ontario's award honouring young leaders who have taken action against racism and contributed to building inclusive communities.",
    applyUrl: "https://www.ontario.ca/page/lincoln-m-alexander-award",
    source: "ontario.ca",
    tags: ["Equity", "Leadership"],
  },
  // ——— University entrance: application-based majors ———
  {
    id: "uoft-national",
    name: "U of T National Scholarship",
    provider: "University of Toronto",
    category: "University",
    value: "Full tuition + 1st-year residence",
    valueNum: 30000,
    quantity: "Small national cohort each year",
    deadline: "School nomination: mid-November; application early December",
    renewable: "Tuition support continues in upper years with good standing",
    applicationRequired: true,
    eligibility: [
      "Canadian high school student (or Canadian abroad)",
      "Outstanding academic achievement AND original, creative involvement",
      "Nominated by your school, then complete a personal application",
    ],
    description:
      "U of T's most prestigious admission award, recognizing students who are both top scholars and creative leaders in their schools and communities.",
    applyUrl: "https://future.utoronto.ca/national-scholarships",
    source: "future.utoronto.ca",
    tags: ["Prestige", "Nomination"],
  },
  {
    id: "queens-chancellors",
    name: "Queen's Chancellor's Scholarship",
    provider: "Queen's University",
    category: "University",
    value: "$36,000",
    valueNum: 36000,
    quantity: "~50 awarded each year",
    deadline: "Early December (Major Admission Award application)",
    renewable: "$9,000/yr, renewable over 4 years with standing",
    applicationRequired: true,
    eligibility: [
      "Entering Queen's directly from high school",
      "Minimum ~90% admission average expected to be competitive",
      "Demonstrated leadership, creativity and community involvement",
      "Requires the Major Admission Award application (essay-based)",
    ],
    description:
      "Queen's flagship entrance award, part of its Major Admission Awards. One application puts you in the running for the Chancellor's and other major scholarships.",
    applyUrl:
      "https://www.queensu.ca/registrar/financial-aid/application-required/future-students/major-awards",
    source: "queensu.ca",
    tags: ["Prestige", "Essay"],
  },
  {
    id: "western-national",
    name: "Western National Scholarship Program",
    provider: "Western University",
    category: "University",
    value: "$30,000–$65,000",
    valueNum: 65000,
    quantity: "~20+ major awards each year",
    deadline: "Mid-February",
    renewable: "Paid over 4 years; continuing scholarships require standing",
    applicationRequired: true,
    eligibility: [
      "Entering Western (main campus) from high school",
      "Minimum 90% admission average",
      "Requires online application + essay + school nomination form",
      "Includes President's, Faculty and International President's scholarships",
    ],
    description:
      "Western's umbrella program for its largest entrance scholarships, including the President's Entrance Scholarships and Faculty Scholarships.",
    applyUrl:
      "https://registrar.uwo.ca/student_finances/scholarships_awards/admission/national_scholarship_program.html",
    source: "registrar.uwo.ca",
    tags: ["Prestige", "Essay"],
  },
  {
    id: "carleton-prestige",
    name: "Carleton Prestige Scholarships",
    provider: "Carleton University",
    category: "University",
    value: "$20,000–$30,000",
    valueNum: 30000,
    quantity: "~40 awarded each year (4 named scholarships)",
    deadline: "March 1",
    renewable: "Renewable annually with 10.0+ CGPA (A- standing)",
    applicationRequired: true,
    eligibility: [
      "Entering Carleton directly from high school",
      "Minimum 90% admission average",
      "Leadership and community involvement considered",
      "Includes Chancellor's, Richard Lewar, Carleton U. and Riordon scholarships",
    ],
    description:
      "Carleton's top entrance awards covering most or all of tuition. One application is considered for all four Prestige scholarships.",
    applyUrl: "https://carleton.ca/awards/awards/scholarships/prestige/",
    source: "carleton.ca",
    tags: ["Prestige"],
  },
  // ——— University entrance: automatic ———
  {
    id: "waterloo-presidents",
    name: "Waterloo President's Scholarship",
    provider: "University of Waterloo",
    category: "University",
    value: "$2,000",
    valueNum: 2000,
    quantity: "Every eligible incoming student",
    deadline: "Automatic — no application",
    renewable: "One-time entrance award",
    applicationRequired: false,
    eligibility: [
      "Admission average of 90.0%–94.9%",
      "Entering any Waterloo undergraduate program from high school",
      "95%+ students receive the President's Scholarship of Distinction instead ($2,500 + experiential awards)",
    ],
    description:
      "Waterloo's automatic entrance scholarship — awarded to every admitted student in the qualifying average range, no application needed.",
    applyUrl:
      "https://uwaterloo.ca/undergraduate-entrance-awards/awards/university-waterloo-presidents-scholarship",
    source: "uwaterloo.ca",
    tags: ["Automatic"],
  },
  {
    id: "uoft-scholars",
    name: "U of T Scholars Program",
    provider: "University of Toronto",
    category: "University",
    value: "$7,500",
    valueNum: 7500,
    quantity: "~700 awarded each year",
    deadline: "Automatic — no application",
    renewable: "One-time admission award",
    applicationRequired: false,
    eligibility: [
      "Top admission averages among incoming students (typically ~95%+)",
      "Automatically considered when you apply to U of T",
    ],
    description:
      "U of T automatically considers every applicant for admission awards, including the University of Toronto Scholars Program, based on academic excellence.",
    applyUrl: "https://future.utoronto.ca/admission-awards",
    source: "future.utoronto.ca",
    tags: ["Automatic"],
  },
  {
    id: "mcmaster-entrance",
    name: "McMaster Automatic Entrance Awards",
    provider: "McMaster University",
    category: "University",
    value: "$1,000–$3,000",
    valueNum: 3000,
    quantity: "Every eligible incoming student",
    deadline: "Automatic — no application",
    renewable: "One-time entrance award",
    applicationRequired: false,
    eligibility: [
      "Admission average of 90%+ (higher averages receive larger awards)",
      "Entering Level 1 at McMaster from high school",
      "Awarded automatically at admission",
    ],
    description:
      "McMaster automatically awards entrance scholarships to admitted students based on final admission average — no application required.",
    applyUrl: "https://registrar.mcmaster.ca/entrance-awards/",
    source: "registrar.mcmaster.ca",
    tags: ["Automatic"],
  },
  {
    id: "york-automatic",
    name: "York Automatic Entrance Scholarships",
    provider: "York University",
    category: "University",
    value: "$1,000–$3,500",
    valueNum: 3500,
    quantity: "Every eligible incoming student",
    deadline: "Automatic — no application",
    renewable: "One-time entrance award",
    applicationRequired: false,
    eligibility: [
      "Admission average of 80%+ (larger amounts for higher averages)",
      "Entering York directly from high school",
      "Awarded automatically at admission",
    ],
    description:
      "York automatically awards entrance scholarships to admitted high school students based on final admission average — no application required.",
    applyUrl: "https://futurestudents.yorku.ca/scholarships-incoming-students",
    source: "futurestudents.yorku.ca",
    tags: ["Automatic"],
  },
  {
    id: "york-major",
    name: "York Major Entrance Awards",
    provider: "York University",
    category: "University",
    value: "Up to $20,000+",
    valueNum: 20000,
    quantity: "Limited number of major awards each year",
    deadline: "Early February",
    renewable: "Renewable over 4 years with academic standing",
    applicationRequired: true,
    eligibility: [
      "Admission average of 90%+ to be competitive",
      "Demonstrated leadership and community involvement",
      "Requires a separate awards application (essays/references)",
      "Entering York directly from high school",
    ],
    description:
      "York's largest entrance awards — including President's and other named scholarships — require a separate application on top of your OUAC application.",
    applyUrl: "https://futurestudents.yorku.ca/scholarships-incoming-students",
    source: "futurestudents.yorku.ca",
    tags: ["Prestige", "Renewable"],
  },
  {
    id: "uottawa-admission",
    name: "uOttawa Admission Scholarship",
    provider: "University of Ottawa",
    category: "University",
    value: "$1,000–$4,000",
    valueNum: 4000,
    quantity: "Every eligible incoming student",
    deadline: "Automatic — no application",
    renewable: "Paid over first two terms",
    applicationRequired: false,
    eligibility: [
      "Admission average of 88%+ (larger amounts for higher averages)",
      "Entering uOttawa directly from high school",
      "French Studies bursary adds $1,000/yr for studying in French",
    ],
    description:
      "uOttawa automatically grants admission scholarships based on your admission average — plus extra funding if you study in French.",
    applyUrl:
      "https://www.uottawa.ca/study/fees-financial-support/scholarships-awards-overview",
    source: "uottawa.ca",
    tags: ["Automatic", "French"],
  },
  {
    id: "guelph-automatic",
    name: "Guelph Entrance Scholarships",
    provider: "University of Guelph",
    category: "University",
    value: "$1,000–$3,000",
    valueNum: 3000,
    quantity: "Every eligible incoming student",
    deadline: "Automatic — no application",
    renewable: "One-time entrance award",
    applicationRequired: false,
    eligibility: [
      "Admission average of ~85%+ (larger amounts for higher averages)",
      "Entering Guelph directly from high school",
      "Awarded automatically at admission",
    ],
    description:
      "Guelph automatically awards entrance scholarships to admitted students based on admission average — no application required.",
    applyUrl: "https://www.ouinfo.ca/scholarships/guelph",
    source: "ouinfo.ca",
    tags: ["Automatic"],
  },
  {
    id: "guelph-presidents",
    name: "Guelph President's & Chancellors Scholarships",
    provider: "University of Guelph",
    category: "University",
    value: "$42,500",
    valueNum: 42500,
    quantity: "Small number of major awards each year",
    deadline: "Late January",
    renewable: "Paid over 4 years with academic standing",
    applicationRequired: true,
    eligibility: [
      "Entering Guelph directly from high school",
      "Outstanding academic achievement (typically 90%+)",
      "Demonstrated leadership in school or community",
      "Requires a separate application with references",
    ],
    description:
      "Among Ontario's largest entrance awards — Guelph's President's and Chancellors Scholarships recognize top scholars who are also proven leaders.",
    applyUrl: "https://www.ouinfo.ca/scholarships/guelph",
    source: "ouinfo.ca",
    tags: ["Prestige", "Leadership"],
  },
  // ——— Community / other ———
  {
    id: "leonard-foundation",
    name: "Leonard Foundation Financial Assistance",
    provider: "The Leonard Foundation",
    category: "Community",
    value: "$1,000–$1,500",
    valueNum: 1500,
    quantity: "~140 awarded each year",
    deadline: "March 15",
    renewable: "Reapply annually",
    applicationRequired: true,
    eligibility: [
      "Attending or entering full-time university study in Canada",
      "Demonstrated financial need",
      "Requires a nominator's letter (teacher, clergy or community leader)",
    ],
    description:
      "One of Canada's oldest scholarship trusts, providing need-based support to students across the country.",
    applyUrl: "https://www.leonardfnd.org/",
    source: "leonardfnd.org",
    tags: ["Financial Need"],
  },
  {
    id: "dick-martin",
    name: "Dick Martin Scholarship Award",
    provider: "Canadian Centre for Occupational Health & Safety",
    category: "Community",
    value: "$3,000",
    valueNum: 3000,
    quantity: "2 awarded nationally each year",
    deadline: "January 31",
    renewable: "One-time award (not renewable)",
    applicationRequired: true,
    eligibility: [
      "Enrolled (or enrolling) in an occupational health & safety related program",
      "Canadian college or university students",
      "Requires a 1,000–1,200 word essay on a workplace safety topic",
    ],
    description:
      "National essay-based scholarship promoting workplace health and safety awareness among students.",
    applyUrl: "https://www.ccohs.ca/scholarships/",
    source: "ccohs.ca",
    tags: ["Essay", "Health & Safety"],
  },
];

export function getScholarshipById(id: string): ScholarshipAward | undefined {
  return SCHOLARSHIP_AWARDS.find(s => s.id === id);
}
