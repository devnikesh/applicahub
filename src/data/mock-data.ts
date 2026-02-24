import type { Applicant, TimelineEntry, Document, Payment, User, PipelineStage } from "@/types/applicant";

export const mockUser: User = {
  id: "u1",
  name: "Sarah Mitchell",
  email: "sarah@applicahub.com",
  role: "Senior Consultant",
};

const firstNames = ["Aisha", "Mohammed", "Priya", "Wei", "Carlos", "Fatima", "Raj", "Yuki", "Olumide", "Sofia", "Arjun", "Mei", "Hassan", "Elena", "Kwame", "Nadia", "Vikram", "Ling", "Ibrahim", "Ana", "Ravi", "Sana", "Chen", "Amara", "Diego", "Zara", "Jin", "Kemi", "Alejandro", "Hiroshi"];
const lastNames = ["Patel", "Khan", "Nakamura", "Santos", "Okafor", "Chen", "Rodriguez", "Singh", "Kim", "Adeyemi", "Garcia", "Sharma", "Tanaka", "Osei", "Martinez", "Ali", "Wang", "Fernandez", "Gupta", "Yamamoto", "Lopez", "Nguyen", "Bello", "Silva", "Park", "Ahmad", "Lee", "Costa", "Hussain", "Suzuki"];
const nationalities = ["Nigeria", "India", "China", "Brazil", "Pakistan", "Japan", "Mexico", "Ghana", "South Korea", "Bangladesh", "Philippines", "Egypt", "Vietnam", "Colombia", "Kenya"];
const countries = ["United Kingdom", "Canada", "Australia", "United States", "Germany", "Ireland", "New Zealand", "Netherlands"];
const universities = ["University of Manchester", "University of Toronto", "University of Melbourne", "MIT", "TU Munich", "Trinity College Dublin", "University of Auckland", "University of Amsterdam", "Imperial College London", "McGill University", "University of Sydney", "Stanford University"];
const courses = ["Computer Science", "Business Administration", "Mechanical Engineering", "Medicine", "Data Science", "International Relations", "Architecture", "Biomedical Science", "Economics", "Environmental Science", "Law", "Psychology"];

const stages: PipelineStage[] = ["Inquiry", "Document Collection", "Application Submitted", "Offer Received", "Visa Applied", "Visa Granted", "Enrolled", "Rejected"];

function randomDate(start: Date, end: Date): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

function generateApplicants(): Applicant[] {
  return Array.from({ length: 30 }, (_, i) => {
    const firstName = firstNames[i];
    const lastName = lastNames[i];
    const dateAdded = randomDate(new Date("2024-06-01"), new Date("2025-02-20"));
    const lastUpdated = randomDate(new Date(dateAdded), new Date("2025-02-24"));
    // Distribute across stages realistically
    const stageWeights = [4, 5, 6, 4, 3, 3, 3, 2]; // ~30 total
    let stageIndex = 0;
    let cumulative = 0;
    for (let s = 0; s < stageWeights.length; s++) {
      cumulative += stageWeights[s];
      if (i < cumulative) { stageIndex = s; break; }
    }
    return {
      id: `app-${String(i + 1).padStart(3, "0")}`,
      fullName: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      phone: `+${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      dateOfBirth: randomDate(new Date("1995-01-01"), new Date("2004-12-31")),
      nationality: nationalities[i % nationalities.length],
      countryApplyingTo: countries[i % countries.length],
      university: universities[i % universities.length],
      course: courses[i % courses.length],
      stage: stages[stageIndex],
      notes: i % 3 === 0 ? "Strong academic background. Requires financial documentation." : i % 3 === 1 ? "All documents submitted. Awaiting university response." : "",
      dateAdded,
      lastUpdated,
    };
  });
}

export const mockApplicants: Applicant[] = generateApplicants();

export function generateTimeline(applicantId: string): TimelineEntry[] {
  const applicant = mockApplicants.find(a => a.id === applicantId);
  if (!applicant) return [];
  const currentIdx = stages.indexOf(applicant.stage);
  const entries: TimelineEntry[] = [];
  for (let i = 0; i <= Math.min(currentIdx, stages.length - 2); i++) {
    entries.push({
      id: `tl-${applicantId}-${i}`,
      applicantId,
      action: i === 0 ? "Applicant created" : `Stage changed`,
      fromStage: i === 0 ? undefined : stages[i - 1],
      toStage: stages[i],
      createdAt: randomDate(new Date("2024-06-01"), new Date("2025-02-24")),
      createdBy: "Sarah Mitchell",
    });
  }
  return entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function generateDocuments(applicantId: string): Document[] {
  const types: Document["type"][] = ["Passport", "Photo", "Transcripts", "Offer Letter", "Visa"];
  const statuses: Document["status"][] = ["Pending", "Uploaded", "Verified"];
  return types.map((type, i) => ({
    id: `doc-${applicantId}-${i}`,
    applicantId,
    name: type,
    type,
    status: statuses[i % 3],
    uploadedAt: i % 3 !== 0 ? randomDate(new Date("2024-09-01"), new Date("2025-02-24")) : undefined,
  }));
}

export function generatePayments(applicantId: string): Payment[] {
  return [
    { id: `pay-${applicantId}-1`, applicantId, date: "2024-09-15", amount: 500, type: "Application Fee", status: "Paid" },
    { id: `pay-${applicantId}-2`, applicantId, date: "2024-11-01", amount: 2500, type: "Tuition Deposit", status: "Pending" },
    { id: `pay-${applicantId}-3`, applicantId, date: "2025-01-10", amount: 150, type: "Visa Fee", status: "Overdue" },
  ];
}

export const COUNTRIES_LIST = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria", "Bangladesh", "Belgium", "Brazil", "Cambodia", "Cameroon", "Canada", "Chile", "China", "Colombia", "Congo", "Cuba", "Czech Republic", "Denmark", "Ecuador", "Egypt", "Ethiopia", "Finland", "France", "Germany", "Ghana", "Greece", "Guatemala", "Honduras", "Hungary", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Lebanon", "Libya", "Malaysia", "Mexico", "Morocco", "Mozambique", "Myanmar", "Nepal", "Netherlands", "New Zealand", "Nigeria", "Norway", "Oman", "Pakistan", "Palestine", "Panama", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saudi Arabia", "Senegal", "Singapore", "Somalia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan", "Sweden", "Switzerland", "Syria", "Taiwan", "Tanzania", "Thailand", "Tunisia", "Turkey", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];
