import { NextResponse } from "next/server";

type InsightJob = {
  id: string;
  title?: string;
  description?: string;
  company?: string | null;
  company_name?: string | null;
  companies?: {
    name?: string | null;
  } | null;
  skills_required?: string[] | null;
};

export async function POST(request: Request) {
  try {
    const { resumeText, jobs } = await request.json();
    const insightJobs: InsightJob[] = Array.isArray(jobs) ? jobs : [];

    if (!resumeText || insightJobs.length === 0) {
      return NextResponse.json({ error: "Missing resume or jobs" }, { status: 400 });
    }

    const prompt = `
      You are an elite career coach and recruitment AI. 
      Analyze this candidate's resume text and provide concise matching insights for the provided jobs.
      
      Resume: "${resumeText.substring(0, 4000)}"
      
      Jobs to analyze:
      ${insightJobs.map((j, i) => `
        Job ${i+1}: ${j.title} at ${j.company || j.company_name || j.companies?.name || "Unknown Company"}
        Description: ${j.description}
        Skills: ${j.skills_required?.join(", ")}
      `).join('\n')}
      
      Format your response strictly as a JSON object with a key "insights" which is an array of objects.
      Each object must have:
      - id: the original job id
      - reasoning: 1-2 sentences on why this is a good match
      - gapAnalysis: what the candidate is missing or needs to learn
      - matchedSkills: top 3 skills that overlapped
      
      Example:
      {
        "insights": [
          { "id": "...", "reasoning": "...", "gapAnalysis": "...", "matchedSkills": ["...", "..."] }
        ]
      }
    `;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${error}`);
    }

    const result = await response.json();
    const content = JSON.parse(result.choices[0].message.content);

    return NextResponse.json(content);
  } catch (error: unknown) {
    console.error("AI Insights error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI insights" },
      { status: 500 }
    );
  }
}
