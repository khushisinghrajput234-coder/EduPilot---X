export interface SubjectInfo {
  subject: string;
  score: number;
  rating: string;
  performanceTrend: string;
  attendance: string;
  analysis: string;
}

export interface StudentAnalysis {
  studentName: string;
  overallAttendanceRating: string;
  attendancePercentage: number;
  attendanceAnalysis: string;
  subjects: SubjectInfo[];
  strengths: string[];
  weaknesses: string[];
  attendanceCorrelation: string;
  gamifiedLevel: {
    level: number;
    points: number;
    badgeSuggested: string;
  };
}

export interface LearningStyle {
  primaryStyle: string;
  tactileCharacteristics: string;
  auditoryRatio: number;
  visualRatio: number;
  readingWritingRatio: number;
  kinestheticRatio: number;
  customMotto: string;
  learningHacks: string[];
}

export interface StudyTask {
  timeSlot: string;
  subject: string;
  topic: string;
  duration: number;
  activityStyle: string;
  completed?: boolean;
}

export interface WeeklySchedule {
  [day: string]: StudyTask[];
}

export interface StudyPlannerResponse {
  roadmap: Array<{
    phase: string;
    actions: string[];
    milestoneDescription: string;
  }>;
  schedule: WeeklySchedule;
  studyTechnique: {
    name: string;
    ratio: string;
    instructions: string;
  };
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface AdaptiveQuizResponse {
  subject: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questions: QuizQuestion[];
}

export interface MentorAdvice {
  mentorMessage: string;
  studyHacks: Array<{ name: string; detail: string }>;
  curatedResources: Array<{ title: string; type: string; link: string; notes: string }>;
}

export interface CareerMatch {
  title: string;
  suitabilityScore: number;
  whyItFits: string;
  requiredSkills: string[];
  academicPath: string;
  immediateActionSteps: string[];
}

export interface CareerGuidanceResponse {
  careers: CareerMatch[];
}

export interface CustomSubject {
  id: string;
  subject: string;
  score: number;
  attendance: number;
  examDate: string;
  behavior: string;
}

export interface StudentProfile {
  name: string;
  email?: string;
  dateOfBirth?: string;
  subjects?: CustomSubject[];
  mathScore: number;
  mathAttendance: number;
  mathExamDate: string;
  mathBehavior: string;
  scienceScore: number;
  scienceAttendance: number;
  scienceExamDate: string;
  scienceBehavior: string;
  englishScore: number;
  englishAttendance: number;
  englishExamDate: string;
  englishBehavior: string;
  historyScore: number;
  historyAttendance: number;
  historyExamDate: string;
  historyBehavior: string;
  csScore: number;
  csAttendance: number;
  csExamDate: string;
  csBehavior: string;
}
