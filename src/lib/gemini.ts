import { GoogleGenAI, Type } from "@google/genai";
import { SiteData, BacklinkOpportunity, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeSiteContent(siteData: SiteData): Promise<AnalysisResult> {
  const prompt = `
    Analyze the following website content for SEO and backlink strategy:
    Title: ${siteData.title}
    Description: ${siteData.description}
    Content Snippet: ${siteData.content}
    URL: ${siteData.url}

    Identify the website's primary niche, potential high-value keywords for backlinks, and suggest a strategy for outreach.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          niche: { type: Type.STRING },
          targetKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          competitorStrategies: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedOutreach: { type: Type.STRING }
        },
        required: ["niche", "targetKeywords", "competitorStrategies", "suggestedOutreach"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function findOpportunities(analysis: AnalysisResult): Promise<BacklinkOpportunity[]> {
  const prompt = `
    Based on this SEO analysis:
    Niche: ${analysis.niche}
    Keywords: ${analysis.targetKeywords.join(", ")}

    Search for and suggest 5 high-potential backlink opportunity types (e.g., Guest Post on specific tech blogs, Directory submissions for ${analysis.niche}).
    Provide a simulated list of opportunities with relevance scores and strategies.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      toolConfig: { includeServerSideToolInvocations: true },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            url: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['Guest Post', 'Directory', 'Forum', 'Blog Comment', 'Resource Page'] },
            relevanceScore: { type: Type.NUMBER },
            reason: { type: Type.STRING },
            strategy: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['Pending', 'Analyzing', 'Ready', 'Contacted', 'Completed'] }
          },
          required: ["id", "url", "type", "relevanceScore", "reason", "strategy", "status"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function draftOutreachContent(opportunity: BacklinkOpportunity, mySite: SiteData): Promise<string> {
  const prompt = `
    Draft a professional and persuasive email outreach for a backlink opportunity.
    Target Site: ${opportunity.url}
    Opportunity Type: ${opportunity.type}
    My Site: ${mySite.url} (${mySite.title})
    Strategy: ${opportunity.strategy}

    The email should be personal, high-value, and not spammy.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt
  });

  return response.text;
}
