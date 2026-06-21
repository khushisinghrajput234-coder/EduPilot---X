import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini safely and lazily
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      console.warn("WARNING: GEMINI_API_KEY is not configured or in sandbox default. Fallbacks will be activated.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Routes

// Helper to clean markdown json wrapping from text responses
function sanitizeJSONResponse(text: string | undefined): any {
  if (!text) return null;
  let clean = text.trim();
  if (clean.startsWith("```json")) {
    clean = clean.substring(7);
  }
  if (clean.endsWith("```")) {
    clean = clean.substring(0, clean.length - 3);
  }
  return JSON.parse(clean.trim());
}

// 1. Academic Analyzer Endpoint
app.post("/api/analyze-academic", async (req, res) => {
  try {
    const { csvData, studentProfile } = req.body;
    let dataToAnalyze = csvData || "";

    if (studentProfile) {
      if (Array.isArray(studentProfile.subjects) && studentProfile.subjects.length > 0) {
        dataToAnalyze = `Subject,Score,Attendance,ExamDate,LearningBehaviorScore\n` +
          studentProfile.subjects.map((sub: any) => 
            `${sub.subject},${sub.score},${sub.attendance}%,${sub.examDate || "2026-07-15"},${sub.behavior || "Good student"}`
          ).join("\n");
      } else {
        dataToAnalyze = `
Subject,Score,Attendance,ExamDate,LearningBehaviorScore
Mathematics,${studentProfile.mathScore},${studentProfile.mathAttendance}%,${studentProfile.mathExamDate},${studentProfile.mathBehavior}
Science,${studentProfile.scienceScore},${studentProfile.scienceAttendance}%,${studentProfile.scienceExamDate},${studentProfile.scienceBehavior}
English,${studentProfile.englishScore},${studentProfile.englishAttendance}%,${studentProfile.englishExamDate},${studentProfile.englishBehavior}
History,${studentProfile.historyScore},${studentProfile.historyAttendance}%,${studentProfile.historyExamDate},${studentProfile.historyBehavior}
Computer Science,${studentProfile.csScore},${studentProfile.csAttendance}%,${studentProfile.csExamDate},${studentProfile.csBehavior}
        `;
      }
    }

    if (!dataToAnalyze.trim()) {
      return res.status(400).json({ error: "Missing educational CSV data or student profile parameters." });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      // Return dynamic, beautiful mockup analysis containing client's exact uploaded subjects
      const parsedSubjects = (studentProfile && Array.isArray(studentProfile.subjects) && studentProfile.subjects.length > 0)
        ? studentProfile.subjects
        : [
            { subject: "Mathematics", score: studentProfile?.mathScore || 62, attendance: studentProfile?.mathAttendance || 72, examDate: studentProfile?.mathExamDate, behavior: studentProfile?.mathBehavior || "Struggles with graphs" },
            { subject: "Science", score: studentProfile?.scienceScore || 58, attendance: studentProfile?.scienceAttendance || 75, examDate: studentProfile?.scienceExamDate, behavior: studentProfile?.scienceBehavior || "Needs lab demonstration" },
            { subject: "English", score: studentProfile?.englishScore || 85, attendance: studentProfile?.englishAttendance || 95, examDate: studentProfile?.englishExamDate, behavior: studentProfile?.englishBehavior || "Good textual narratives" },
            { subject: "History", score: studentProfile?.historyScore || 70, attendance: studentProfile?.historyAttendance || 80, examDate: studentProfile?.historyExamDate, behavior: studentProfile?.historyBehavior || "Strong memorization" },
            { subject: "Computer Science", score: studentProfile?.csScore || 90, attendance: studentProfile?.csAttendance || 90, examDate: studentProfile?.csExamDate, behavior: studentProfile?.csBehavior || "Quick algorithmic thinker" }
          ];

      const totalAttendance = parsedSubjects.reduce((sum: number, s: any) => sum + Number(s.attendance || 0), 0);
      const avgAttendance = Math.round(totalAttendance / (parsedSubjects.length || 1));
      
      const overallRating = avgAttendance >= 85 ? "Excellent" : avgAttendance >= 73 ? "Warning" : "Critical";

      const mappedSubjects = parsedSubjects.map((s: any) => {
        const score = Number(s.score || 0);
        const rating = score >= 80 ? "Excellent" : score >= 65 ? "Sound" : "Needs Urgent Attention";
        const performanceTrend = score >= 85 ? "Improving" : score >= 65 ? "Stable" : "Declining";
        return {
          subject: s.subject,
          score: score,
          rating: rating,
          performanceTrend: performanceTrend,
          attendance: `${s.attendance}%`,
          analysis: s.behavior ? `Behavior note: ${s.behavior}` : `The target student demonstrates a ${rating.toLowerCase()} command on ${s.subject}.`
        };
      });

      const avgScore = Math.round(mappedSubjects.reduce((sum, s) => sum + s.score, 0) / (mappedSubjects.length || 1));

      return res.json({
        studentName: studentProfile?.name || "Alex Mercer",
        overallAttendanceRating: overallRating,
        attendancePercentage: avgAttendance,
        attendanceAnalysis: `${studentProfile?.name || "The student"} displays an overall average attendance score of ${avgAttendance}%. Core lessons missed are directly correlating with sub-par performance in low attendance subjects.`,
        subjects: mappedSubjects,
        strengths: [
          `Fabulous performance in top subjects like ${mappedSubjects.find((s:any) => s.score >= 80)?.subject || 'Computer Science'}`,
          "Extremely sharp conceptual speed & logical structures retention",
          "Responds exceptionally well to visual notes and active laboratory practices"
        ],
        weaknesses: [
          `Needs structured reviews in subjects scoring low like ${mappedSubjects.find((s:any) => s.score < 70)?.subject || 'Science'}`,
          "Conceptual blocks on abstract formulas & manual diagram layout setups",
          "Potential performance bottlenecks linked to absences or missed core periods"
        ],
        attendanceCorrelation: `Strong linear correlation: Current average score is ${avgScore}% vs average lesson presence of ${avgAttendance}%. Presences are key to secure higher scores in examinations.`,
        gamifiedLevel: {
          level: Math.floor((studentProfile?.points || 240) / 200) + 1,
          points: studentProfile?.points || 240,
          badgeSuggested: avgScore >= 80 ? "Mastermind Scholar" : "Active Explorer"
        }
      });
    }

    const ai = getGemini();
    const prompt = `
      You are the "Academic Analyzer Agent" for EduPilot X. Your job is to parse the student's CSV data / profile inputs and return a structured JSON report regarding their performance, weaknesses, correlation between grades & attendance, and motivational milestones.
      
      Here is the student data:
      ${dataToAnalyze}
      
      Return a response strictly in JSON format as specified in the schema. Do not add metadata text outside JSON blocks.
      
      JSON schema to return:
      {
        "studentName": string,
        "overallAttendanceRating": "Excellent" | "Warning" | "Critical",
        "attendancePercentage": number (overall average attendance),
        "attendanceAnalysis": string (elaborative details on correlation and consequences),
        "subjects": [
          {
            "subject": string,
            "score": number,
            "rating": "Excellent" | "Sound" | "Needs Urgent Attention",
            "performanceTrend": "Improving" | "Stable" | "Declining",
            "attendance": string (e.g. "85%"),
            "analysis": string (specific sub-skills missed or excelled at)
          }
        ],
        "strengths": string[], (at least 3 strengths)
        "weaknesses": string[], (at least 3 specific weak subjects/chapters)
        "attendanceCorrelation": string (detailed analysis combining data trends of attendance vs raw marks),
        "gamifiedLevel": {
          "level": number,
          "points": number,
          "badgeSuggested": string
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = sanitizeJSONResponse(response.text);
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in analyzer:", error);
    res.status(500).json({ error: error.message || "Failed to analyze academic records." });
  }
});

// 2. Learning Style Detection Agent
app.post("/api/detect-learning-style", async (req, res) => {
  try {
    const { answers } = req.body; // Array of key-value answers e.g. [{questionNo: 1, optionText: "..."}]

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Missing learning behavior questionnaire answers." });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      // Custom mocked detection based on simple answers
      const choice = answers[0]?.scoreValue || "Visual";
      return res.json({
        primaryStyle: choice,
        tactileCharacteristics: "High responsiveness to diagrammatics, code visualizations, color coding methods, or mind-mapping.",
        auditoryRatio: 15,
        visualRatio: 65,
        readingWritingRatio: 12,
        kinestheticRatio: 8,
        customMotto: "Seeing is believing, mapping leads to achieving!",
        learningHacks: [
          "Use multi-color highlighters on essential subject formulae.",
          "Sketch layout workflows for science labs structures.",
          "Construct logical bento boxes and flowchart diagrams."
        ]
      });
    }

    const ai = getGemini();
    const prompt = `
      You are the "Learning Style Detection Agent" for EduPilot X. Based on the student's answers to study choices, analyze and output their primary learning style (Visual, Auditory, Reading/Writing, Kinesthetic) and custom tips.
      
      User Choices:
      ${JSON.stringify(answers)}
      
      Return a response strictly in JSON format.
      Schema:
      {
        "primaryStyle": "Visual" | "Auditory" | "Reading/Writing" | "Kinesthetic",
        "tactileCharacteristics": string (paragraph explaining how the student retains academic material),
        "auditoryRatio": number (percentage 0-100),
        "visualRatio": number (percentage 0-100),
        "readingWritingRatio": number (percentage 0-100),
        "kinestheticRatio": number (percentage 0-100),
        "customMotto": string (educational micro-phrase suited to style),
        "learningHacks": string[] (3 actionable tactical study techniques for this style e.g. color coding, record podcasts, trace maps, etc.)
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = sanitizeJSONResponse(response.text);
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in learning style detection:", error);
    res.status(500).json({ error: error.message || "Failed to detect learning style." });
  }
});

// 3. Study Planner Agent
app.post("/api/generate-roadmap-schedule", async (req, res) => {
  try {
    const { subjects, learningStyle, intensity, examDates } = req.body;

    if (!subjects || !Array.isArray(subjects)) {
      return res.status(400).json({ error: "Subjects are required for creating study plan." });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      // Mock scheduler fallback
      return res.json({
        roadmap: [
          { phase: "Phase 1: Weak spot core reconstruction", actions: ["Review 3 critical algebraic worksheets", "Formulate chemistry balance equations", "Schedule 30-minute flash card recall sessions"], milestoneDescription: "Overcome immediate STEM math roadblocks" },
          { phase: "Phase 2: Exam proximity speed testing", actions: ["Mock tests for computer sciences and English grammar review", "Timed history timeline draft writing"], milestoneDescription: "Attain overall subject comfort (>75%)" }
        ],
        schedule: {
          Monday: [
            { timeSlot: "04:00 PM - 05:00 PM", subject: "Mathematics", topic: "Algebra and coordinate graphs setup", duration: 60, activityStyle: "Visual mapping worksheet" },
            { timeSlot: "05:15 PM - 06:15 PM", subject: "Science", topic: "Chemical properties formulas quiz", duration: 60, activityStyle: "Interactive diagram labels" }
          ],
          Tuesday: [
            { timeSlot: "04:00 PM - 05:00 PM", subject: "English", topic: "Creative narrative drafting review", duration: 60, activityStyle: "Writing outline checklist" },
            { timeSlot: "05:15 PM - 06:15 PM", subject: "Computer Science", topic: "Debugging functions and loop systems", duration: 60, activityStyle: "Hands-on coding sprint" }
          ],
          Wednesday: [
            { timeSlot: "04:00 PM - 05:30 PM", subject: "Mathematics", topic: "Formula recall practice and equations", duration: 90, activityStyle: "Visual color-coded cards sketch" }
          ],
          Thursday: [
            { timeSlot: "04:00 PM - 05:00 PM", subject: "Science", topic: "Digestive chemical reaction states diagram", duration: 60, activityStyle: "Scientific sketches annotation" },
            { timeSlot: "05:15 PM - 06:15 PM", subject: "History", topic: "Mapping 19th Century major milestones", duration: 60, activityStyle: "Dynamic chronological line review" }
          ],
          Friday: [
            { timeSlot: "04:00 PM - 05:00 PM", subject: "Computer Science", topic: "Complexity matrices testing", duration: 60, activityStyle: "Mind mapping algorithms flow" },
            { timeSlot: "05:15 PM - 06:00 PM", subject: "English", topic: "Vocabulary retrieval active recall", duration: 45, activityStyle: "Speed-reading list exercises" }
          ],
          Saturday: [
            { timeSlot: "10:00 AM - 12:00 PM", subject: "Mathematics", topic: "Weekly mock evaluation review", duration: 120, activityStyle: "Past exams assessment sprint" }
          ],
          Sunday: [
            { timeSlot: "03:00 PM - 04:00 PM", subject: "Peer Lab", topic: "Revising notes and milestone review", duration: 60, activityStyle: "Flashcard quiz swap buddies" }
          ]
        },
        studyTechnique: {
          name: "SDA Pomodoro Integration (Adaptive Visual Rhythm)",
          ratio: `${intensity === "Hard" ? "50/10 focus cycle" : "25/5 focus cycle"}`,
          instructions: "Perform mock paper checks at high focus intensity, utilizing deep colors to highlight gaps. Review visual mindmaps immediately after breaks."
        }
      });
    }

    const ai = getGemini();
    const prompt = `
      You are the "Study Planner Agent" for EduPilot X. Create an adaptive, weekly schedule (Monday - Sunday) and target milestones roadmap based on the student's performance profiles, learning style, intensity, and upcoming exams.
      
      Inputs:
      - Student subjects & current scores: ${JSON.stringify(subjects)}
      - Style constraint: ${learningStyle || "General Visual learning"}
      - Workload Intensity choice: ${intensity || "Medium"}
      - Subject Exam Dates: ${JSON.stringify(examDates || {})}
      
      Prioritize subjects with lower scores AND impending exam dates. Allocate study slots appropriately (Light has fewer slots, Hard is more intense). Include a study studyTechnique matched to this learning style.
      
      Return a response strictly in JSON format matching this schema:
      {
        "roadmap": [
          {
            "phase": string (e.g. "Week 1: Core concepts integration"),
            "actions": string[] (3 explicit actions to address weaknesses),
            "milestoneDescription": string
          }
        ],
        "schedule": {
          "Monday": [ { "timeSlot": string, "subject": string, "topic": string, "duration": number, "activityStyle": string } ],
          "Tuesday": [ { "timeSlot": string, "subject": string, "topic": string, "duration": number, "activityStyle": string } ],
          "Wednesday": [ { "timeSlot": string, "subject": string, "topic": string, "duration": number, "activityStyle": string } ],
          "Thursday": [ { "timeSlot": string, "subject": string, "topic": string, "duration": number, "activityStyle": string } ],
          "Friday": [ { "timeSlot": string, "subject": string, "topic": string, "duration": number, "activityStyle": string } ],
          "Saturday": [ { "timeSlot": string, "subject": string, "topic": string, "duration": number, "activityStyle": string } ],
          "Sunday": [ { "timeSlot": string, "subject": string, "topic": string, "duration": number, "activityStyle": string } ]
        },
        "studyTechnique": {
          "name": string,
          "ratio": string,
          "instructions": string
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = sanitizeJSONResponse(response.text);
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in study planner:", error);
    res.status(500).json({ error: error.message || "Failed to generate study roadmap." });
  }
});

// 4. Adaptive Quiz Agent Endpoint
app.post("/api/generate-quiz", async (req, res) => {
  try {
    const { subject, difficulty, learningStyle } = req.body;

    if (!subject) {
      return res.status(400).json({ error: "A subject must be selected for quiz generation." });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      // Mock Quiz fallback
      const questions = [
        {
          id: 1,
          question: `In ${subject}, which of the following represents a fundamental structural concept used to solve complex problems?`,
          options: ["Linear division of modular components", "Decomposition by functional arrays", "Iterative active retrieval of variables", "None of the above"],
          correctOptionIndex: 1,
          explanation: "Decomposition allows complex modules to be divided into manageable visual sub-structures."
        },
        {
          id: 2,
          question: `Which approach is optimal when trying to master a challenging section in ${subject}?`,
          options: ["Passive visual memorization without testing", "Active recall paired with spaced repetition", "Cramming the night before high stakes assessments", "Skipping complex modules entirely"],
          correctOptionIndex: 1,
          explanation: "Active recall forces the brain to retrieve facts, which hardens neural pathways."
        },
        {
          id: 3,
          question: `If a student experiences conceptual blocks in ${subject}, what does the EduPilot mentor recommend first?`,
          options: ["Reducing mock practice frequency", "Analyzing missed foundation sessions and doing rapid quizzes", "Switching subjects permanently", "Taking full days off without schedule mapping"],
          correctOptionIndex: 1,
          explanation: "Pinpointing the specific missing sub-skill instantly speeds up concept restoration."
        },
        {
          id: 4,
          question: `What role does daily study consistency play in improving results in ${subject}?`,
          options: ["It has minimal impact compared to pure IQ", "It consolidates short-term knowledge into long-term structures", "It increases exam anxiety", "It is only required for high scoring subjects"],
          correctOptionIndex: 1,
          explanation: "Spaced consolidation is scientifically proven to prevent cognitive memory decays."
        },
        {
          id: 5,
          question: `To transition from ${difficulty} level of capability to a higher tier in ${subject}, a student should:`,
          options: ["Keep repeating easy questions only", "Increase query difficulty progressively and examine explanations", "Do not review quiz scores", "Rely entirely on passive video streams"],
          correctOptionIndex: 1,
          explanation: "Adaptive discomfort engages critical thinking and allows scaling to tougher conceptual brackets."
        }
      ];

      return res.json({
        subject,
        difficulty,
        questions
      });
    }

    const ai = getGemini();
    const prompt = `
      You are the "Adaptive Quiz Agent" for EduPilot X. Create a set of 5 multiple choice questions for the subject "${subject}" at ${difficulty} difficulty level.
      Make the question content educational, interesting, and appropriate.
      Tailor explanations slightly to suit a student with a ${learningStyle || "Visual"} preference.
      
      Return a response strictly in JSON format matching this schema:
      {
        "subject": string,
        "difficulty": string,
        "questions": [
          {
            "id": number,
            "question": string,
            "options": string[], (exactly 4 options)
            "correctOptionIndex": number (0 value index representing correct option e.g. 0 to 3),
            "explanation": string (highly logical and motivating reasoning)
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = sanitizeJSONResponse(response.text);
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in quiz generator:", error);
    res.status(500).json({ error: error.message || "Failed to generate dynamic quiz." });
  }
});

// 5. Resource Recommendation & Mentor Agent
app.post("/api/mentor-advice", async (req, res) => {
  try {
    const { subjects, learningStyle, overallScore } = req.body;

    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      return res.json({
        mentorMessage: "Dear Student, your potential is unlimited! Every small consistent step you take today configures your academic path tomorrow. Focus deeply on Mathematics and Science topics through spatial visualization. Keep up the streak!",
        studyHacks: [
          { name: "The Feynman Technique", detail: "Explain a tough algebra concept out loud in simple terms as if teaching a ten-year-old child." },
          { name: "Active Recall", detail: "Do not just highlight notes. Try closed-book quiz questions to check retention." },
          { name: "Pomodoro Block", detail: "Work with 25 minutes timer on high priority tasks, fully ignoring smartphone notifications." }
        ],
        curatedResources: [
          { title: "Visual Algebra Foundations (YouTube Channels)", type: "Video Masterclass", link: "https://www.youtube.com", notes: "Perfect visual diagrams of complex equations." },
          { title: "Interactive Chemistry Simulator Labs", type: "Simulation Tool", link: "https://phet.colorado.edu", notes: "Enact virtual chemical balances safely." },
          { title: "Computer Science Logic flows tutorial sheets", type: "PDF Exercise Guide", link: "https://github.com", notes: "Code structure flowcharts mapping loops." }
        ]
      });
    }

    const ai = getGemini();
    const prompt = `
      You are the "EduPilot Mentor Agent & Resource Recommendation Agent" unified. Review academic profiles, learning styles, and general indices to issue:
      1) A heartwarming and motivational message (Supportive and professional).
      2) 3 targeted study techniques/hacks matching their learning style.
      3) 3 curated educational learning resource links/materials with names, descriptions, types, and notes.
      
      Ref Data:
      - Subjects: ${JSON.stringify(subjects)}
      - Style: ${learningStyle}
      - Avg performance tier: ${overallScore}%
      
      Return a response strictly in JSON format matching this schema:
      {
        "mentorMessage": string,
        "studyHacks": [ { "name": string, "detail": string } ],
        "curatedResources": [ { "title": string, "type": string, "link": string, "notes": string } ]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = sanitizeJSONResponse(response.text);
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in mentor agent advice:", error);
    res.status(500).json({ error: error.message || "Failed to generate mentoring advice." });
  }
});

// 6. Career Navigator Agent Endpoint
app.post("/api/career-guidance", async (req, res) => {
  try {
    const { subjects, learningStyle, strengths } = req.body;

    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      return res.json({
        careers: [
          {
            title: "Autonomous Software Architect",
            suitabilityScore: 94,
            whyItFits: "Your outstanding computer science logic scores coupled with structured visual systems layout matches professional coding structures perfectly.",
            requiredSkills: ["System structures parsing", "Software cycles optimization", "Data processing models"],
            academicPath: "Undergraduate degree in Informatics, majoring in Software Architecture and visual data layouts.",
            immediateActionSteps: ["Build a full-stack study tracker", "Contribute a minor UI patch on GitHub repositories"]
          },
          {
            title: "Data Informatics Scientist",
            suitabilityScore: 88,
            whyItFits: "Mathematics capacity paired with visual structural mapping matches complex data visualization paths perfectly.",
            requiredSkills: ["D3.js rendering", "Informatics regressions", "Storytelling with datasets"],
            academicPath: "Double major in mathematical computation sciences and communications.",
            immediateActionSteps: ["Analyze real world sports or weather CSV datasets", "Practice plotting coordinate arrays"]
          },
          {
            title: "Visual STEM UX Designer",
            suitabilityScore: 85,
            whyItFits: "Balances excellent structural English capabilities with rapid digital rendering and spatial science planning.",
            requiredSkills: ["Logical wireframing", "Cognitive interface flows", "User testing feedback cycles"],
            academicPath: "Bachelors in Cognitive Systems Engineering or Digital Interaction layouts.",
            immediateActionSteps: ["Design a storyboard map mockup for your school dashboard", "Study standard color contrast ratios"]
          }
        ]
      });
    }

    const ai = getGemini();
    const prompt = `
      You are the "Career Navigator Agent" for EduPilot X. Recommend and detail 3 high-potential future careers matching the student's profile.
      
      Details:
      - Subject performance: ${JSON.stringify(subjects)}
      - Style: ${learningStyle}
      - Strengths identified: ${JSON.stringify(strengths)}
      
      Return a response strictly in JSON format matching this schema:
      {
        "careers": [
          {
            "title": string,
            "suitabilityScore": number (out of 100),
            "whyItFits": string,
            "requiredSkills": string[],
            "academicPath": string (recommended course or major focus),
            "immediateActionSteps": string[] (at least 2 immediate tasks they can start doing now)
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = sanitizeJSONResponse(response.text);
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in career guidance:", error);
    res.status(500).json({ error: error.message || "Failed to compile career recommendations." });
  }
});

// Configure Vite integration for develop, or serve index.html in production
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EduPilot X server active on port ${PORT}`);
  });
}

start();
