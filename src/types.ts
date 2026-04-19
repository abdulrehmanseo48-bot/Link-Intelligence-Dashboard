export interface SiteData {
  title: string;
  description: string;
  content: string;
  url: string;
}

export interface BacklinkOpportunity {
  id: string;
  url: string;
  type: 'Guest Post' | 'Directory' | 'Forum' | 'Blog Comment' | 'Resource Page';
  relevanceScore: number;
  reason: string;
  strategy: string;
  status: 'Pending' | 'Analyzing' | 'Ready' | 'Contacted' | 'Completed';
}

export interface AnalysisResult {
  niche: string;
  targetKeywords: string[];
  competitorStrategies: string[];
  suggestedOutreach: string;
}
