export type AdviceSourceType = "official" | "alumni" | "coaching" | "community";

export interface SuppAdviceCard {
  id: string;
  programId: string;
  programDisplay: string;
  universityId: string;
  title: string;
  content: string;
  source: string;
  sourceType: AdviceSourceType;
  sourceUrl?: string;
  tags: string[];
}

export const SUPP_ADVICE: SuppAdviceCard[] = [

  // ── McMaster Health Sciences ───────────────────────────────────────────────
  {
    id: "mac-hs-official",
    programId: "mcmaster-health-sci",
    programDisplay: "McMaster Health Sciences",
    universityId: "mcmaster",
    title: "What McMaster HS Is Actually Looking For",
    content: "The supplementary application at Mac HS is evaluated on four areas: your academic record, the supplementary app itself, your CASPer score, and your Grade 11 grades. The school looks for students who demonstrate intellectual curiosity, genuine interest in health and people, AND who can articulate *why* problem-based learning appeals to them. Vague answers like 'I want to help people' don't stand out. Specific experiences — a hospital volunteer shift that changed how you saw patient care, a moment in a science class that sparked a question you couldn't stop thinking about — are what evaluators remember.",
    source: "McMaster Health Sciences Official (healthsci.mcmaster.ca)",
    sourceType: "official",
    sourceUrl: "https://healthsci.mcmaster.ca/undergraduate/hsc_admissions",
    tags: ["CASPer", "Supplementary App", "PBL", "Personal Statement"],
  },
  {
    id: "mac-hs-casper",
    programId: "mcmaster-health-sci",
    programDisplay: "McMaster Health Sciences",
    universityId: "mcmaster",
    title: "How to Prepare for CASPer (Honestly)",
    content: "CASPer is a 90-minute video- and text-based situational judgment test. There are no 'right' answers — it tests your ethical reasoning, empathy, and communication under pressure. The biggest mistake applicants make is trying to say the 'right' thing. Evaluators can spot inauthentic, formulaic responses immediately. Instead: practice articulating *your* genuine thought process out loud. Common themes: patient autonomy, whistleblowing, team conflict, resource allocation. Resources: the official Acuity Insights demo (free), and the Youthfully CASPer guide which walks through a dozen practice scenarios.",
    source: "Youthfully.ca — CASPer Prep Guide",
    sourceType: "coaching",
    sourceUrl: "https://youthfully.ca",
    tags: ["CASPer", "Ethical Reasoning", "Prep", "Youthfully"],
  },
  {
    id: "mac-hs-alumni",
    programId: "mcmaster-health-sci",
    programDisplay: "McMaster Health Sciences",
    universityId: "mcmaster",
    title: "Alumni Advice: What I Wish I Knew Before Applying",
    content: "I applied to Mac HS three times before getting in. What finally worked: stopping trying to sound impressive and starting to sound genuine. My successful app talked about specific things — the time I sat with my grandmother during chemo and noticed that the nurses were the ones actually holding patients' hands; that observation led me to read about integrative approaches to healthcare. The supplementary essay prompt is deliberately open-ended. Don't waste it listing your achievements. Tell a story. Connect it to *specifically* why Mac HS's problem-based learning is the right environment for you — not just 'medicine' in general.",
    source: "Mac HS Graduate (Class of 2024, r/OntarioUniversities)",
    sourceType: "alumni",
    tags: ["Personal Statement", "Storytelling", "Authenticity", "PBL"],
  },
  {
    id: "mac-hs-grantme",
    programId: "mcmaster-health-sci",
    programDisplay: "McMaster Health Sciences",
    universityId: "mcmaster",
    title: "Scoring Mac HS Extracurriculars: What Counts",
    content: "Mac HS uses a holistic review. Your extracurriculars are evaluated not just on what they are, but on *impact*, *leadership*, and *duration*. A brief list of 10 clubs you attended once is worth less than two or three deep, committed experiences with demonstrated growth. Ideal ECs: healthcare volunteering (hospital, clinic, hospice), community leadership (teaching peers, organizing events), and any experience that shows you can work in ambiguity. The Grantme platform ranks Mac HS as the most EC-sensitive program in Ontario — they estimate ECs account for ~30% of your application weight beyond the grade cutoff.",
    source: "Grantme.ca — Ontario Program Guide",
    sourceType: "coaching",
    sourceUrl: "https://grantme.ca",
    tags: ["Extracurriculars", "Healthcare Volunteering", "Leadership", "Grantme"],
  },

  // ── UofT Rotman Commerce ───────────────────────────────────────────────────
  {
    id: "rotman-official",
    programId: "uoft-rotman",
    programDisplay: "UofT Rotman Commerce",
    universityId: "uoft",
    title: "The Rotman Commerce Personal Profile — Officially Explained",
    content: "The Rotman Commerce Personal Profile consists of short-answer questions about your academic interests, extracurricular involvement, and why you're choosing commerce. It is reviewed *after* you've met the grade cutoff (approximately 90%). After that point, the Personal Profile is the primary differentiator. Rotman is looking for students who are intellectually curious about business, not just grade-focused. They want to know what you've *done* outside the classroom. The application opens in December and is due February 1.",
    source: "Rotman Commerce Official Admissions (rotmancommerce.utoronto.ca)",
    sourceType: "official",
    sourceUrl: "https://rotmancommerce.utoronto.ca/undergraduate-program/admissions/",
    tags: ["Personal Profile", "Rotman", "Admissions", "February Deadline"],
  },
  {
    id: "rotman-alumni-1",
    programId: "uoft-rotman",
    programDisplay: "UofT Rotman Commerce",
    universityId: "uoft",
    title: "How I Wrote a Rotman Personal Profile That Worked",
    content: "The mistake I almost made was writing about my passion for finance and Bay Street. That's what every applicant writes. What made my profile stand out (I was told this in my orientation): I wrote about running a small business selling custom art prints in Grade 10, what I learned about pricing and customer psychology, and how it made me realize that business was really applied human psychology. Rotman's current students value intellectual diversity. If you're one of 600 applicants all saying 'I love markets,' you'll disappear. What's your *unusual* insight into business or economics? Lead with that.",
    source: "Current Rotman Commerce Student (Class of 2027)",
    sourceType: "alumni",
    tags: ["Personal Profile", "Differentiation", "Storytelling", "Rotman"],
  },
  {
    id: "rotman-youthfully",
    programId: "uoft-rotman",
    programDisplay: "UofT Rotman Commerce",
    universityId: "uoft",
    title: "Youthfully's Guide: Rotman Application Breakdown",
    content: "According to Youthfully's analysis of successful Rotman profiles, the top three factors are: (1) demonstrated leadership in a non-academic context, (2) a clear and specific 'why commerce' answer rooted in personal experience, and (3) evidence of initiative — starting something, not just joining it. Rotman's Personal Profile word limits are tight. Do not use filler phrases ('as a passionate individual who...'). Every sentence should answer 'so what?' The profile is read in about 4 minutes. Your opening sentence is everything — don't start with your name, high school, or a generic statement about the economy.",
    source: "Youthfully.ca — Rotman Commerce Application Guide",
    sourceType: "coaching",
    sourceUrl: "https://youthfully.ca",
    tags: ["Youthfully", "Leadership", "Writing Tips", "Personal Profile"],
  },

  // ── Queen's Smith Commerce ─────────────────────────────────────────────────
  {
    id: "queens-smith-official",
    programId: "queens-commerce",
    programDisplay: "Queen's Smith Commerce",
    universityId: "queens",
    title: "Smith School's Supplementary Application — What's Actually Evaluated",
    content: "Smith's supplementary application includes essay questions focused on leadership, teamwork, and impact. The school is explicit: they are looking for evidence of leadership *outside* the classroom. Academic grades confirm you can handle the workload — the supplementary determines if you're the kind of person who thrives in Queen's Commerce culture (team-oriented, high-energy, community-minded). Essays must use the STAR method: Situation, Task, Action, Result. Every essay should have a concrete outcome. 'I learned a lot' is not a result.",
    source: "Smith School of Business Official (smith.queensu.ca)",
    sourceType: "official",
    sourceUrl: "https://smith.queensu.ca/bcom/admissions/",
    tags: ["STAR Method", "Leadership", "Community", "Smith"],
  },
  {
    id: "queens-smith-alumni",
    programId: "queens-commerce",
    programDisplay: "Queen's Smith Commerce",
    universityId: "queens",
    title: "How Queen's Commerce Is Different — An Insider Perspective",
    content: "Smith selects for culture fit more aggressively than almost any other Ontario business program. They want community builders — students who will be involved in Commerce Society, QSBC, case competitions, and mentorship programs. My advice: before writing the supplementary, research one Queen's Commerce club or event in detail and reference it authentically. Don't say 'I want to attend QSBC.' Say what you specifically plan to contribute to it, based on something you've done before. The best apps I've reviewed show applicants who already understand what makes Queen's unique — not applicants who want business school in general.",
    source: "Queen's Smith BCom Graduate (Class of 2025, LinkedIn post)",
    sourceType: "alumni",
    tags: ["Culture Fit", "QSBC", "Commerce Society", "Authenticity"],
  },
  {
    id: "queens-smith-grantme",
    programId: "queens-commerce",
    programDisplay: "Queen's Smith Commerce",
    universityId: "queens",
    title: "Grantme's Smith Commerce Application Checklist",
    content: "Grantme's coaching data shows the most successful Smith applicants share three patterns: they have a clearly articulated 'why business' rooted in a specific personal experience (not a job shadow), they demonstrate leadership in a team setting (not just individual achievement), and they write about failure or challenge honestly. Smith interviewers and essay readers say that the hardest thing to fake is genuine humility combined with drive. Show a moment when something didn't go the way you planned, what you did about it, and what changed as a result. That story structure is more compelling than any list of achievements.",
    source: "Grantme.ca — Queen's Commerce Application Guide",
    sourceType: "coaching",
    sourceUrl: "https://grantme.ca",
    tags: ["Grantme", "Failure Story", "Leadership", "Application Checklist"],
  },

  // ── Waterloo AIF ──────────────────────────────────────────────────────────
  {
    id: "uw-aif-official",
    programId: "uw-cs",
    programDisplay: "Waterloo AIF (All Programs)",
    universityId: "waterloo",
    title: "The Waterloo AIF — What It Is and Why It Matters",
    content: "The Admission Information Form (AIF) is required for all Waterloo applicants and is a critical part of the evaluation — especially for competitive programs like CS, SE, and Math. The AIF asks for a list of extracurriculars, work experience, and competitions, plus 3–4 short essay questions (roughly 150 words each). For CS and SE applicants specifically, the AIF can make or break a borderline application. Waterloo admissions officers have stated publicly that for top programs, the AIF and grade profile together determine admission — not grades alone.",
    source: "University of Waterloo Admissions (uwaterloo.ca/future-students/admissions)",
    sourceType: "official",
    sourceUrl: "https://uwaterloo.ca/future-students/admissions/apply/aif",
    tags: ["AIF", "Waterloo", "CS", "SE", "Math", "Extracurriculars"],
  },
  {
    id: "uw-aif-alumni",
    programId: "uw-cs",
    programDisplay: "Waterloo AIF (CS/SE)",
    universityId: "waterloo",
    title: "What Actually Gets You Into Waterloo CS — From a Student",
    content: "I got into Waterloo CS with a 93% average when the 'required' average was 95%+. What I had that higher-average applicants may have lacked: a strong AIF. I had competed in the CEMC (Canadian Computing Competition) and reached the top 25%. I had shipped two personal projects (a web app and an ML tool) on GitHub. And my AIF essay explained *specifically* why Waterloo's co-op model and research environment (I referenced the Cheriton School specifically) aligned with my long-term goal of working on large-scale distributed systems. Contests, projects, and specificity are the three things that move Waterloo evaluators.",
    source: "Waterloo CS Student (Class of 2027, r/uwaterloo)",
    sourceType: "alumni",
    tags: ["AIF", "Competitions", "Projects", "CS", "SE", "CEMC"],
  },
  {
    id: "uw-aif-youthfully",
    programId: "uw-se",
    programDisplay: "Waterloo Engineering AIF",
    universityId: "waterloo",
    title: "Youthfully: Writing Waterloo Engineering AIF Essays",
    content: "Youthfully's analysis of Waterloo Engineering AIF responses shows that successful applicants answer the 'why Waterloo Engineering' question with concrete program knowledge — not generic prestige reasons. Reference specific things: the Engineering Society (EngSoc), a specific research group, the co-op model's unique term structure, or a professor's work you've read about. For the activity list: list everything, even paid work. Waterloo values work ethic. For the extracurricular essays: use numbers wherever possible ('I tutored 12 students weekly for 2 years' is stronger than 'I tutored students'). The AIF word limits are tight — treat each word as precious.",
    source: "Youthfully.ca — Waterloo Engineering AIF Guide",
    sourceType: "coaching",
    sourceUrl: "https://youthfully.ca",
    tags: ["Youthfully", "AIF Essays", "Engineering", "Word Limits", "Specificity"],
  },

  // ── Ivey AEO ──────────────────────────────────────────────────────────────
  {
    id: "ivey-aeo-official",
    programId: "western-ivey",
    programDisplay: "Ivey HBA — AEO Application",
    universityId: "western",
    title: "What the Ivey AEO Application Is Looking For",
    content: "Ivey's AEO (Admission with Early Offer) program offers Grade 12 students a guaranteed Ivey HBA seat, conditional on maintaining a B average in their first two years at Western. The AEO supplementary application includes a personal essay and an extracurricular activities summary. Ivey is looking for 'leaders in learning' — students who show initiative, business curiosity, and community impact. The AEO offer is prestigious: fewer than 400 students receive it per year out of thousands of applicants.",
    source: "Ivey Business School Official (ivey.uwo.ca)",
    sourceType: "official",
    sourceUrl: "https://www.ivey.uwo.ca/hba/admissions/applying-to-ivey/",
    tags: ["AEO", "Ivey", "Leadership", "Application Essay"],
  },
  {
    id: "ivey-aeo-alumni",
    programId: "western-ivey",
    programDisplay: "Ivey HBA — AEO",
    universityId: "western",
    title: "Alumni: What the Ivey Essay Readers Are Really Scoring",
    content: "I went through the AEO process and spoke with admissions staff at an open house. Here's what they told me: they read thousands of essays from high-achievers. What differentiates: applicants who demonstrate they *understand the case method* and are excited by it — not just by Ivey's ranking. Write about a time you had to make a decision with incomplete information. Show you're comfortable with ambiguity. Also: Ivey heavily values community leadership. If your extracurriculars show depth in one area — a sport you played for years, an organization you built — that's better than a shallow list of clubs. Authenticity over impressiveness.",
    source: "Ivey HBA Graduate (Class of 2024)",
    sourceType: "alumni",
    tags: ["Case Method", "Leadership", "AEO Essay", "Authenticity"],
  },
  {
    id: "ivey-aeo-grantme",
    programId: "western-ivey",
    programDisplay: "Ivey HBA — AEO",
    universityId: "western",
    title: "Grantme's Ivey AEO Application Breakdown",
    content: "Grantme coaches who have helped students get AEO offers identify three winning patterns: (1) a compelling origin story for why business/leadership (rooted in a specific experience, not general interest), (2) demonstrated initiative (building or starting something, not just joining), and (3) evidence of persistence through difficulty. The AEO essay is typically 500–700 words. Don't list your achievements — pick one defining story and go deep. Grantme also notes that applicants who reference Ivey's case method correctly (showing they know what it means in practice, not just in theory) score significantly higher on the 'fit' dimension.",
    source: "Grantme.ca — Ivey AEO Application Guide",
    sourceType: "coaching",
    sourceUrl: "https://grantme.ca",
    tags: ["Grantme", "AEO", "Ivey", "Origin Story", "Case Method"],
  },

  // ── Schulich BBA ──────────────────────────────────────────────────────────
  {
    id: "schulich-official",
    programId: "york-schulich",
    programDisplay: "Schulich School of Business (York)",
    universityId: "yorku",
    title: "Schulich's Supplementary Application — What They're Evaluating",
    content: "Schulich requires a personal statement of approximately 500 words. The prompt changes slightly each year but consistently asks about leadership, community involvement, and why business. Schulich values global perspective — mention any international experience, language skills, or multicultural community work. The school's #1 differentiator is diversity; 80+ nationalities are represented. Show you understand and embrace that. The personal statement is evaluated on clarity of thought, evidence of leadership, and genuine interest in management disciplines (not just finance).",
    source: "Schulich School of Business Official (schulich.yorku.ca)",
    sourceType: "official",
    sourceUrl: "https://schulich.yorku.ca/bba/admissions/",
    tags: ["Personal Statement", "Global Perspective", "Diversity", "Leadership"],
  },
  {
    id: "schulich-alumni",
    programId: "york-schulich",
    programDisplay: "Schulich School of Business",
    universityId: "yorku",
    title: "Getting Into Schulich: A Student's Advice",
    content: "Schulich was my first choice because of its global ranking and diverse student body. My personal statement focused on my experience working with my family's small import business and what I learned about cross-cultural negotiation and supply chain. What I avoided: generic statements about 'the global economy.' What worked: specific numbers and outcomes from real experience, honest reflection on what I didn't know going in, and a paragraph that connected those experiences to specific Schulich programs (I mentioned the Global Leadership Program and the Seymour Schulich scholarship). Do your research on the school — it shows.",
    source: "Schulich BBA Student (Class of 2027, via LinkedIn)",
    sourceType: "alumni",
    tags: ["Personal Statement", "Global Experience", "Research the School", "Schulich"],
  },

  // ── UofT Engineering Science ───────────────────────────────────────────────
  {
    id: "uoft-engci-official",
    programId: "uoft-engci",
    programDisplay: "UofT Engineering Science",
    universityId: "uoft",
    title: "Engineering Science Supplementary Application — Official Guide",
    content: "UofT Engineering's supplementary application includes short essays asking about: (1) your most meaningful extracurricular activity, (2) a technical or academic challenge you overcame, and (3) why you want to study engineering at UofT specifically. Submission is through the Engineering portal, separate from OUAC. Due February 1. The Engineering Science stream is the most competitive (94%+ average), but the supplementary application is evaluated for intellectual depth and engineering mindset, not just additional achievements.",
    source: "UofT Engineering Admissions (undergrad.engineering.utoronto.ca)",
    sourceType: "official",
    sourceUrl: "https://undergrad.engineering.utoronto.ca/admissions/",
    tags: ["Engineering Science", "Supplementary", "UofT", "Technical Challenge"],
  },
  {
    id: "uoft-engci-alumni",
    programId: "uoft-engci",
    programDisplay: "UofT Engineering Science",
    universityId: "uoft",
    title: "What Makes an EngSci Applicant Stand Out",
    content: "EngSci is famous for being one of the hardest undergrad programs in North America. The admissions team knows this — they want to see that you know what you're getting into. In my supplementary, I was brutally honest about the fact that I found certain material difficult but also described specifically how I pushed through. The essays that don't work: students who describe a robotics club project generically, or who reference EngSci's 'prestige' without showing any understanding of the program. The essays that do work: students who demonstrate genuine intellectual passion for a specific area (AI, energy, aerospace) and show they've pursued that passion independently — reading papers, building things, asking professors questions.",
    source: "UofT EngSci Graduate (r/UofT, Class of 2024)",
    sourceType: "alumni",
    tags: ["Engineering Science", "Intellectual Passion", "Honesty", "UofT"],
  },

  // ── Carleton Journalism ────────────────────────────────────────────────────
  {
    id: "carleton-jour-official",
    programId: "carleton-journalism",
    programDisplay: "Carleton Journalism",
    universityId: "carleton",
    title: "Carleton Journalism Portfolio — What to Submit",
    content: "Carleton Journalism requires a portfolio of 3 samples of original journalism work. Accepted formats: written articles (500–1,000 words), audio reports (3–6 minutes), or video packages (3–6 minutes). All work must be your own and must demonstrate journalistic judgment — not just writing ability. Evaluators look for: a clear news sense, fair and accurate reporting, proper attribution, and a compelling lede. School newspaper articles, CBC Kids News submissions, student podcast episodes, and YouTube investigative videos all count. A published article, even in a small local paper, carries significant weight.",
    source: "Carleton Journalism Admissions (carleton.ca/journalism/admissions)",
    sourceType: "official",
    sourceUrl: "https://carleton.ca/journalism/admissions/",
    tags: ["Portfolio", "Carleton", "Journalism", "Published Work"],
  },

  // ── Architecture Programs ──────────────────────────────────────────────────
  {
    id: "arch-portfolio-general",
    programId: "uoft-arch",
    programDisplay: "Architecture Programs (UofT / TMU / Carleton)",
    universityId: "uoft",
    title: "Architecture Portfolio Advice — Applying to Any Ontario Arch Program",
    content: "All Ontario architecture programs require a portfolio of 8–12 pieces of creative work. This does NOT need to be architecture drawings — it should demonstrate your visual thinking, creativity, and spatial problem-solving. Strongest portfolio items: built/made objects (models, sculptures, crafted items), drawings or paintings showing perspective or light, photography with strong composition, graphic design showing typographic awareness, or anything that demonstrates how you *see* the world. Weaker portfolio items: traced/copied work, purely decorative art without conceptual intent, and rushed digital renderings. Quality over quantity. Accompany each piece with a brief caption explaining your intent.",
    source: "Architecture Portfolio Guide (Combined advice from UofT Daniels, TMU, Carleton Azrieli)",
    sourceType: "official",
    tags: ["Portfolio", "Architecture", "Creative Work", "Visual Thinking"],
  },

  // ── Western Medical Sciences ───────────────────────────────────────────────
  {
    id: "western-medsci-official",
    programId: "western-med-sci",
    programDisplay: "Western Medical Sciences",
    universityId: "western",
    title: "Western Medical Sciences Supplementary Application Guide",
    content: "Western Medical Sciences requires a supplementary application submitted through the Western portal. The application asks about: (1) extracurricular activities and community involvement, (2) an essay describing a meaningful experience in healthcare or community service, and (3) why Western Medical Sciences specifically. The cutoff average is approximately 93%+, but the supplementary is weighted heavily for borderline applicants. Volunteer hours in a healthcare setting (hospital, nursing home, clinic, hospice) are strongly valued — aim for 100+ hours.",
    source: "Western Medical Sciences Official (uwo.ca/sci/medsci)",
    sourceType: "official",
    sourceUrl: "https://www.uwo.ca/sci/medsci/",
    tags: ["Western", "Medical Sciences", "Healthcare Volunteering", "Supplementary"],
  },
  {
    id: "western-medsci-alumni",
    programId: "western-med-sci",
    programDisplay: "Western Medical Sciences",
    universityId: "western",
    title: "Alumni: What Made My Western Med Sci Application Work",
    content: "I volunteered at a long-term care home for two years before applying. That was the core of my supplementary essay — not a list of my volunteering hours, but one specific story about a conversation with a resident that shifted how I thought about aging and dignity in healthcare. Western Med Sci evaluators can tell when you've written what you thought they wanted to hear. Write about something that actually changed you. My second piece of advice: don't underestimate the 'why Western specifically' question. I mentioned Dr. Murray Huff's cardiology research lab (which I'd actually read about) and connected it to something I was curious about. That specificity matters.",
    source: "Western Medical Sciences Graduate (Class of 2025)",
    sourceType: "alumni",
    tags: ["Volunteering", "Specificity", "Research", "Western Med Sci"],
  },
];

export const SOURCE_TYPE_CONFIG: Record<AdviceSourceType, { label: string; color: string; icon: string }> = {
  official:  { label: "Official",  color: "#0EA5E9", icon: "shield"      },
  alumni:    { label: "Alumni",    color: "#10B981", icon: "user"        },
  coaching:  { label: "Coaching",  color: "#F59E0B", icon: "star"        },
  community: { label: "Community", color: "#8B5CF6", icon: "users"       },
};

export function getAdviceForProgram(programId: string): SuppAdviceCard[] {
  return SUPP_ADVICE.filter((a) => a.programId === programId);
}

export function getAdviceForUniversity(universityId: string): SuppAdviceCard[] {
  return SUPP_ADVICE.filter((a) => a.universityId === universityId);
}

export function getAllFeaturedAdvice(): SuppAdviceCard[] {
  // Return one card per program (the first/official one)
  const seen = new Set<string>();
  return SUPP_ADVICE.filter((a) => {
    if (seen.has(a.programId)) return false;
    seen.add(a.programId);
    return true;
  });
}
