import { ApplicationStatus } from 'src/jobApply/enum/application-status.enum';
import { ExtractedJobDataDto } from './extracted-job-data.dto';
import { PreFilterResult } from '../prefilter.service';

// Simple interface for email features (legacy compatibility)
export interface EmailFeatures {
  subjectKeywords: string[];
  senderDomain: string;
  contentAnalysis: any;
}

export class EmailAnalysisResult {
  emailId: string;
  timestamp: Date;
  userId: string;
  
  // Informations email
  emailSubject: string;
  emailSender: string;
  emailBodyPreview: string; // Premiers 500 caractères
  
  // Résultat pré-filtrage
  preFilterResult: PreFilterResult;
  
  // Données extraites par Claude AI (si passé le pré-filtrage)
  extractedData?: ExtractedJobDataDto;
  
  // Comparaison avec jobs existants
  existingJobsComparison?: {
    foundSimilar: boolean;
    similarJobs: Array<{
      id: string;
      title: string;
      company: string;
      similarity: number;
      action: 'updated' | 'created' | 'ignored';
    }>;
  };
  
  // Métriques de performance
  processingTime: number; // en ms
  claudeAIUsed: boolean;
  
  // Réflexion détaillée du système
  systemReflection: {
    preFilterDecision: string;
    contentAnalysis: string;
    claudeAIReasoning?: string;
    finalDecision: string;
  };
  
  // Résultat final
  finalResult: string;
  jobApplyId?: string;
}

export class DashboardStatsDto {
  totalEmailsProcessed: number;
  emailsFilteredOut: number;
  emailsProcessedByClaudeAI: number;
  jobApplicationsCreated: number;
  jobApplicationsUpdated: number;
  
  filteringEfficiency: {
    senderFiltering: number;
    contentFiltering: number;
    mlFiltering: number;
    claudeAIUsage: number;
  };
  
  performanceMetrics: {
    averageProcessingTime: number;
    claudeAICostSavings: number;
    errorRate: number;
  };
  
  recentAnalyses: EmailAnalysisResult[];
}

export class ExistingJobComparisonDto {
  id: string;
  title: string;
  company: string;
  location?: string;
  contractType?: string;
  status: ApplicationStatus;
  createdAt: Date;
  similarity: number;
  matchReason: string;
} 