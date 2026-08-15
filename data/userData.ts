export interface Task {
  id: string;
  label: string;
  est: string;
  priority: 'high' | 'med' | 'low';
}

export interface UserEvent {
  id: string;
  name: string;
  host: string;
  date: string;
  time: string;
  attending: boolean;
}

export interface UserProfile {
  name: string;
  school: string;
  /**
   * OUAC reference number. Personal data: it is optional, stored only on this
   * device, and masked everywhere except the field the student edits.
   */
  ouacRef: string;
  /** Top-6 average. `null` until the student enters marks — never guessed. */
  avg: number | null;
  marks: string[];
  courseCodes: string[];
}

export const EMPTY_MARKS = ['', '', '', '', '', ''];

/**
 * A new install starts empty. Earlier builds seeded a fictional student
 * ("Priya Shah", 92.5 average, a plausible-looking OUAC reference), which meant
 * every screen showed confident, personalised admission verdicts derived from
 * data the student had never entered.
 */
export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  school: '',
  ouacRef: '',
  avg: null,
  marks: [...EMPTY_MARKS],
  courseCodes: [...EMPTY_MARKS],
};

export const DEFAULT_TASKS: Task[] = [
  { id: '1', label: 'Finish Waterloo AIF — Section 3', est: '25 min', priority: 'high' },
  { id: '2', label: "Review Queen's PSE draft", est: '15 min', priority: 'med' },
  { id: '3', label: 'Email teacher — ref letter follow-up', est: '5 min', priority: 'low' },
  { id: '4', label: 'Practice Ivey video essay (3 takes)', est: '30 min', priority: 'high' },
];

export const UPCOMING_EVENTS: UserEvent[] = [
  { id: '1', name: 'Waterloo Virtual Tour', host: 'Waterloo', date: 'Tue Jan 14', time: '7 PM', attending: true },
  { id: '2', name: "Smith PSE Workshop", host: "Queen's", date: 'Wed Jan 15', time: '6 PM', attending: false },
  { id: '3', name: 'Toronto Eng Open House', host: 'U of T', date: 'Sat Jan 18', time: '11 AM', attending: true },
  { id: '4', name: 'Schulich Leader Info Session', host: 'Schulich', date: 'Mon Jan 20', time: '8 PM', attending: false },
];

export const FEATURED_ARTICLES = [
  {
    id: '1',
    readTime: '4 min',
    title: "How to write a Waterloo AIF that doesn't read like everyone else's.",
    blurb: "The Admission Information Form is the most underrated part of your application. Here's what 800 admitted students did differently.",
    tags: ['Waterloo', 'Essays', 'Insider'],
    essayRoute: '/essay/waterloo-aif-4',
  },
  {
    id: '2',
    readTime: '3 min',
    title: "Queen's Commerce PSE: the one question that trips everyone up.",
    blurb: "Nearly half of rejected PSE essays fail on the same question. Here's what to say instead.",
    tags: ["Queen's", 'Commerce', 'Essays'],
    essayRoute: '/essay/queens-pse-1',
  },
];

export interface Scholarship {
  id: string;
  name: string;
  university: string;
  value: string;
  deadline: string;
  match: number;
  status: 'Eligible' | 'Submitted' | 'Auto';
  url: string;
  description: string;
}

export const SCHOLARSHIPS: Scholarship[] = [
  {
    id: '1',
    name: 'Schulich Leader Scholarship',
    university: 'Multiple universities',
    value: '$100,000',
    deadline: 'Feb 1, 2026',
    match: 89,
    status: 'Eligible',
    url: 'https://schulichleaders.com',
    description: "Canada's most prestigious STEM scholarship. Nominated by your principal; up to $100K over 4 years.",
  },
  {
    id: '2',
    name: 'Loran Award',
    university: 'All universities',
    value: '$100,000',
    deadline: 'Closed',
    match: 76,
    status: 'Submitted',
    url: 'https://loranscholar.ca',
    description: '4-year award of $100K for students who demonstrate character, service, and leadership potential.',
  },
  {
    id: '3',
    name: 'TD Scholarships for Community Leadership',
    university: 'All universities',
    value: '$70,000',
    deadline: 'Closed',
    match: 82,
    status: 'Submitted',
    url: 'https://www.td.com/ca/en/personal-banking/solutions/student/td-scholarship/',
    description: 'For exceptional commitment to community service. $17,500/year for up to 4 years.',
  },
  {
    id: '4',
    name: "Queen's Chancellor's Scholarship",
    university: "Queen's University",
    value: '$36,000',
    deadline: 'Auto',
    match: 95,
    status: 'Auto',
    url: 'https://www.queensu.ca/registrar/financial-aid/entrance-awards/chancellors-scholarships',
    description: 'Automatic $9,000/year (4 yr) entrance award for top academic achievers at Queen\'s.',
  },
  {
    id: '5',
    name: 'Western National Scholarship',
    university: 'Western University',
    value: '$40,000',
    deadline: 'Auto',
    match: 91,
    status: 'Auto',
    url: 'https://registrar.uwo.ca/student_finances/scholarships_awards/admission/national.html',
    description: 'Up to $10,000/year for 4 years. Automatically awarded to students admitted with 95%+.',
  },
  {
    id: '6',
    name: "Waterloo President's Scholarship of Distinction",
    university: 'University of Waterloo',
    value: '$2,000',
    deadline: 'Auto',
    match: 88,
    status: 'Auto',
    url: 'https://uwaterloo.ca/future-students/financing/scholarships/presidents-scholarship-distinction',
    description: 'One-time $2,000 award given automatically to students admitted with a 95%+ average.',
  },
  {
    id: '7',
    name: 'Lester B. Pearson International Scholarship',
    university: 'University of Toronto',
    value: '$200,000+',
    deadline: 'Nov 7, 2025',
    match: 72,
    status: 'Eligible',
    url: 'https://future.utoronto.ca/finances/awards/lester-b-pearson-international-scholarship/',
    description: 'Full tuition, books, incidentals, and residence for 4 years. Nominated by your school principal.',
  },
  {
    id: '8',
    name: 'McMaster University National Scholarship',
    university: 'McMaster University',
    value: '$12,000',
    deadline: 'Auto',
    match: 87,
    status: 'Auto',
    url: 'https://future.mcmaster.ca/application/scholarships/',
    description: 'Automatic entrance scholarship for Ontario students with 90%+ average. Renewable annually.',
  },
  {
    id: '9',
    name: "Governor General's Academic Medal",
    university: 'Your high school',
    value: 'Medal',
    deadline: 'Jun 2026',
    match: 90,
    status: 'Eligible',
    url: 'https://www.gg.ca/en/honours/governor-generals-academic-medals',
    description: "Awarded to the graduating student with the highest overall average at your school. Highly prestigious.",
  },
  {
    id: '10',
    name: 'Carleton University Entrance Scholarship',
    university: 'Carleton University',
    value: '$5,000',
    deadline: 'Auto',
    match: 84,
    status: 'Auto',
    url: 'https://admissions.carleton.ca/awards-and-bursaries/',
    description: 'Renewable scholarship for students with 90%+ admission average. Up to $5,000/year.',
  },
  {
    id: '11',
    name: 'RBC Future Launch Scholarship',
    university: 'All universities',
    value: '$5,000',
    deadline: 'Apr 30, 2026',
    match: 78,
    status: 'Eligible',
    url: 'https://www.rbc.com/community-social-impact/education/rbc-future-launch.html',
    description: 'For students with demonstrated leadership and community involvement. Open to all programs.',
  },
  {
    id: '12',
    name: 'BMO First-Generation Bursary',
    university: 'All universities',
    value: '$3,500',
    deadline: 'Mar 1, 2026',
    match: 81,
    status: 'Eligible',
    url: 'https://bmo.com/en-ca/main/personal/mortgages-loans-lines-of-credit/student/bmo-scholarships-and-bursaries/',
    description: 'Supporting first-generation post-secondary students. Financial need and community involvement required.',
  },
  {
    id: '13',
    name: 'York University Entrance Scholarship',
    university: 'York University',
    value: '$70,000',
    deadline: 'Auto',
    match: 86,
    status: 'Auto',
    url: 'https://futurestudents.yorku.ca/financial-aid/scholarships',
    description: 'Up to $35,000 ($17,500/year, renewable) for students with 95%+ admission average.',
  },
  {
    id: '14',
    name: 'uOttawa Excellence Scholarship',
    university: 'University of Ottawa',
    value: '$28,000',
    deadline: 'Auto',
    match: 83,
    status: 'Auto',
    url: 'https://www.uottawa.ca/administration-and-governance/student-accounts-and-financial-aid/awards-and-scholarships',
    description: 'Renewable entrance scholarship for students admitted with a 95%+ average. Up to $7,000/year.',
  },
];
