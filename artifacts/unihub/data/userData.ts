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
  ouacRef: string;
  avg: number;
  marks: string[];
}

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Priya Shah',
  school: 'Bayview Secondary, Richmond Hill',
  ouacRef: '2026-1093478',
  avg: 92.4,
  marks: ['95', '94', '93', '91', '90', '92'],
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
  },
  {
    id: '2',
    readTime: '3 min',
    title: "Queen's Commerce PSE: the one question that trips everyone up.",
    blurb: "Nearly half of rejected PSE essays fail on the same question. Here's what to say instead.",
    tags: ["Queen's", 'Commerce', 'Essays'],
  },
];

export const SCHOLARSHIPS = [
  { id: '1', name: 'Schulich Leader', value: '$100,000', deadline: 'Jan 25', match: 89, status: 'Eligible' as const },
  { id: '2', name: 'Loran Award', value: '$100,000', deadline: 'Closed', match: 76, status: 'Submitted' as const },
  { id: '3', name: 'TD Community Leadership', value: '$70,000', deadline: 'Closed', match: 82, status: 'Submitted' as const },
  { id: '4', name: "Queen's Chancellor's", value: '$36,000', deadline: 'Auto', match: 95, status: 'Auto' as const },
  { id: '5', name: 'Western National', value: '$40,000', deadline: 'Auto', match: 91, status: 'Auto' as const },
  { id: '6', name: "Waterloo President's", value: '$2,000', deadline: 'Auto', match: 88, status: 'Auto' as const },
];

export const CHAT_LIST = [
  { id: '1', name: "OUAC 101 Class of '26", members: 412, last: 'anyone else freaking out about Waterloo AIF??', time: '2m', unread: 12, pinned: true, dm: false },
  { id: '2', name: 'Bayview SS — Y12', members: 87, last: 'Ms. Chen wants ref letters by Friday', time: '18m', unread: 3, pinned: true, dm: false },
  { id: '3', name: 'Aanya Patel', members: 2, last: 'i submitted ivey 🥲 send help', time: '1h', unread: 1, pinned: false, dm: true },
  { id: '4', name: 'Eng Sci Hopefuls', members: 156, last: 'Question 3 on Toronto supp — anyone got a structure?', time: '3h', unread: 0, pinned: false, dm: false },
  { id: '5', name: 'Rishi Mehta', members: 2, last: 'you applied to Mac Health?', time: '5h', unread: 0, pinned: false, dm: true },
  { id: '6', name: 'Smith Commerce 2030', members: 89, last: 'PSE word count question…', time: '1d', unread: 0, pinned: false, dm: false },
];
