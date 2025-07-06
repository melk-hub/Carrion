import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface RecruitmentConfig {
  recruitmentIndicators: {
    strong: {
      subjects: string[];
      senders: string[];
      domains: string[];
    };
    medium: {
      subjects: string[];
      content: string[];
    };
  };
  exclusionPatterns: {
    obvious: string[];
  };
  scoring: {
    strongSubject: number;
    strongSender: number;
    strongDomain: number;
    mediumSubject: number;
    mediumContent: number;
    exclusionPenalty: number;
  };
  thresholds: {
    processWithClaude: number;
    certainRecruitment: number;
  };
}

export interface PreFilterResult {
  shouldProcess: boolean;
  score: number;
  confidence: number;
  reason: string;
  details: {
    senderCheck: { isValid: boolean; reason: string };
    contentScore: number;
    mlPrediction: boolean;
    strongIndicators?: string[];
    mediumIndicators?: string[];
    exclusionFound?: string[];
    finalScore?: number;
  };
}

export interface FilteringStats {
  totalEmails: number;
  processedByClaude: number;
  filteredOut: number;
  certainRecruitment: number;
  startTime: number;
  runtime: number;
  processingRate: number;
  filteringEfficiency: number;
  // Legacy compatibility for dashboard
  filteredBySender: number;
  filteredByContent: number;
  filteredByML: number;
  passedToClaudeAI: number;
  filteringRate: number;
  efficiency: {
    senderFiltering: number;
    contentFiltering: number;
    mlFiltering: number;
    claudeAIUsage: number;
  };
}

@Injectable()
export class EmailPreFilterService {
  private readonly logger = new Logger(EmailPreFilterService.name);
  private config: RecruitmentConfig;
  private stats = {
    totalEmails: 0,
    processedByClaude: 0,
    filteredOut: 0,
    certainRecruitment: 0,
    startTime: Date.now(),
  };

  constructor() {
    this.loadConfiguration();
  }

  private loadConfiguration(): void {
    try {
      const configPath = path.join(
        process.cwd(),
        'src',
        'services',
        'mailFilter',
        'config',
        'recruitment-patterns.json',
      );
      const configData = fs.readFileSync(configPath, 'utf8');
      this.config = JSON.parse(configData);
      this.logger.log('Smart prefilter configuration loaded successfully');
    } catch (error) {
      this.logger.error(
        'Failed to load recruitment patterns configuration:',
        error,
      );
      // Default configuration in case of error
      this.config = {
        recruitmentIndicators: {
          strong: {
            subjects: [
              'candidature',
              'application',
              'entretien',
              'interview',
              'job offer',
              'offer',
              'recruitment',
              'recrutement',
            ],
            senders: ['rh@', 'hr@', 'recrutement@', 'recruitment@'],
            domains: ['linkedin.com', 'indeed.com'],
          },
          medium: {
            subjects: ['opportunity', 'opportunité', 'position', 'poste'],
            content: [
              'nous recherchons',
              'we are looking',
              'hiring',
              'embauche',
            ],
          },
        },
        exclusionPatterns: {
          obvious: [
            'newsletter',
            'unsubscribe',
            'expedie',
            'shipped',
            'order',
            'commande',
            'facture',
            'invoice',
            'promotion',
            'marketing',
            'password',
            'security',
          ],
        },
        scoring: {
          strongSubject: 10,
          strongSender: 8,
          strongDomain: 6,
          mediumSubject: 4,
          mediumContent: 3,
          exclusionPenalty: -20,
        },
        thresholds: {
          processWithClaude: 5,
          certainRecruitment: 10,
        },
      };
    }
  }

  async shouldProcessWithClaudeAI(
    emailText: string,
    subject: string,
    sender: string,
  ): Promise<PreFilterResult> {
    this.stats.totalEmails++;
    const subjectLower = subject.toLowerCase();
    const senderLower = sender.toLowerCase();
    const emailTextLower = emailText.toLowerCase();
    let score = 0;
    const strongIndicators: string[] = [];
    const mediumIndicators: string[] = [];
    const exclusionFound: string[] = [];

    // SPECIAL CASE: LinkedIn job application confirmation emails
    // These emails contain "unsubscribe" but are legitimate recruitment emails
    const isLinkedInJobConfirmation = this.isLinkedInJobConfirmation(
      subjectLower,
      senderLower,
      emailTextLower,
    );

    if (isLinkedInJobConfirmation) {
      this.stats.processedByClaude++;
      this.logger.log(
        `LinkedIn job confirmation detected - bypassing normal filtering. Subject: "${subject}"`,
      );
      return {
        shouldProcess: true,
        score: 25, // High score for LinkedIn confirmations
        confidence: 0.95,
        reason:
          'LinkedIn job application confirmation email - automatically processed',
        details: {
          senderCheck: { isValid: true, reason: 'LinkedIn job confirmation' },
          contentScore: 25,
          mlPrediction: true,
          strongIndicators: ['linkedin-job-confirmation'],
          mediumIndicators: [],
          exclusionFound: [],
          finalScore: 25,
        },
      };
    }

    // 1. Check for obvious exclusions first (highest priority)
    for (const pattern of this.config.exclusionPatterns.obvious) {
      if (
        subjectLower.includes(pattern) ||
        senderLower.includes(pattern) ||
        emailTextLower.includes(pattern)
      ) {
        exclusionFound.push(pattern);
        score += this.config.scoring.exclusionPenalty;
      }
    }

    // If strong exclusion found, filter directly
    if (exclusionFound.length > 0 && score <= -10) {
      this.stats.filteredOut++;
      return {
        shouldProcess: false,
        score,
        confidence: 0.9,
        reason: `Email excluded - obvious patterns: ${exclusionFound.join(', ')}`,
        details: {
          senderCheck: { isValid: false, reason: 'Exclusion patterns found' },
          contentScore: score,
          mlPrediction: false,
          strongIndicators,
          mediumIndicators,
          exclusionFound,
          finalScore: score,
        },
      };
    }

    // 2. Positive scoring for recruitment indicators

    // Strong indicators in subject
    for (const pattern of this.config.recruitmentIndicators.strong.subjects) {
      if (subjectLower.includes(pattern)) {
        strongIndicators.push(`subject:${pattern}`);
        score += this.config.scoring.strongSubject;
      }
    }

    // Strong indicators in sender
    for (const pattern of this.config.recruitmentIndicators.strong.senders) {
      if (senderLower.includes(pattern)) {
        strongIndicators.push(`sender:${pattern}`);
        score += this.config.scoring.strongSender;
      }
    }

    // Recruitment domains
    for (const domain of this.config.recruitmentIndicators.strong.domains) {
      if (senderLower.includes(domain)) {
        strongIndicators.push(`domain:${domain}`);
        score += this.config.scoring.strongDomain;
      }
    }

    // Medium indicators in subject
    for (const pattern of this.config.recruitmentIndicators.medium.subjects) {
      if (subjectLower.includes(pattern)) {
        mediumIndicators.push(`subject:${pattern}`);
        score += this.config.scoring.mediumSubject;
      }
    }

    // Medium indicators in content
    for (const pattern of this.config.recruitmentIndicators.medium.content) {
      if (emailTextLower.includes(pattern)) {
        mediumIndicators.push(`content:${pattern}`);
        score += this.config.scoring.mediumContent;
      }
    }

    // 3. Final decision based on score
    const shouldProcess = score >= this.config.thresholds.processWithClaude;
    const confidence = this.calculateConfidence(
      score,
      strongIndicators.length,
      exclusionFound.length,
    );
    if (shouldProcess) {
      this.stats.processedByClaude++;
      if (score >= this.config.thresholds.certainRecruitment) {
        this.stats.certainRecruitment++;
      }
    } else {
      this.stats.filteredOut++;
    }

    const reason = shouldProcess
      ? `Email sent to Claude AI (score: ${score}, indicators: ${strongIndicators.length + mediumIndicators.length})`
      : `Email filtered - insufficient score (${score} < ${this.config.thresholds.processWithClaude})`;

    this.logger.log(
      `Smart prefilter - Subject: "${subject}", Score: ${score}, Decision: ${shouldProcess ? 'PROCESS' : 'FILTER'}`,
    );

    return {
      shouldProcess,
      score,
      confidence,
      reason,
      details: {
        senderCheck: {
          isValid: shouldProcess,
          reason: shouldProcess ? 'Passed smart filter' : 'Failed smart filter',
        },
        contentScore: score,
        mlPrediction: shouldProcess,
        strongIndicators,
        mediumIndicators,
        exclusionFound,
        finalScore: score,
      },
    };
  }

  private calculateConfidence(
    score: number,
    strongCount: number,
    exclusionCount: number,
  ): number {
    // Base confidence on score
    let confidence = Math.min(Math.max(score / 20, 0), 1);
    // Bonus for strong indicators
    confidence += strongCount * 0.1;
    // Penalty for exclusions
    confidence -= exclusionCount * 0.2;
    return Math.min(Math.max(confidence, 0), 1);
  }

  getFilteringStats(): FilteringStats {
    const runtime = Date.now() - this.stats.startTime;
    const processingRate =
      this.stats.totalEmails > 0
        ? this.stats.processedByClaude / this.stats.totalEmails
        : 0;
    const filteringEfficiency =
      this.stats.totalEmails > 0
        ? this.stats.filteredOut / this.stats.totalEmails
        : 0;

    return {
      ...this.stats,
      runtime,
      processingRate,
      filteringEfficiency,
      // Legacy compatibility mappings
      filteredBySender: 0, // Not tracked in new system
      filteredByContent: this.stats.filteredOut, // Map to filteredOut
      filteredByML: 0, // Not used in new system
      passedToClaudeAI: this.stats.processedByClaude,
      filteringRate: filteringEfficiency,
      efficiency: {
        senderFiltering: 0,
        contentFiltering: filteringEfficiency,
        mlFiltering: 0,
        claudeAIUsage: processingRate,
      },
    };
  }

  resetStats(): void {
    this.stats = {
      totalEmails: 0,
      processedByClaude: 0,
      filteredOut: 0,
      certainRecruitment: 0,
      startTime: Date.now(),
    };
  }

  // Method to reload configuration without restart
  reloadConfiguration(): void {
    this.loadConfiguration();
    this.logger.log('Configuration reloaded');
  }

  // Method to add patterns dynamically (for maintenance)
  addExclusionPattern(pattern: string): void {
    if (!this.config.exclusionPatterns.obvious.includes(pattern)) {
      this.config.exclusionPatterns.obvious.push(pattern);
      this.logger.log(`Exclusion pattern added: ${pattern}`);
    }
  }

  addRecruitmentPattern(
    type: 'strong' | 'medium',
    category: string,
    pattern: string,
  ): void {
    const target = this.config.recruitmentIndicators[type];
    if (category in target && Array.isArray(target[category])) {
      if (!target[category].includes(pattern)) {
        target[category].push(pattern);
        this.logger.log(
          `Recruitment pattern added: ${type}.${category}.${pattern}`,
        );
      }
    }
  }

  private isLinkedInJobConfirmation(
    subject: string,
    sender: string,
    emailText: string,
  ): boolean {
    // Check if it's from LinkedIn
    const isLinkedInSender = sender.includes('linkedin.com');

    // Check for job application confirmation patterns
    const jobConfirmationPatterns = [
      'candidature a été envoyée',
      'candidature envoyée',
      'application sent',
      'application submitted',
      'votre candidature a été envoyée',
      'your application has been sent',
    ];

    const hasJobConfirmation = jobConfirmationPatterns.some(
      (pattern) => subject.includes(pattern) || emailText.includes(pattern),
    );

    // Check for job-related content
    const jobContentPatterns = [
      'développeur',
      'developer',
      'stage',
      'internship',
      'poste',
      'position',
      'job',
      'emploi',
      'alternance',
      'apprenticeship',
    ];

    const hasJobContent = jobContentPatterns.some(
      (pattern) => subject.includes(pattern) || emailText.includes(pattern),
    );

    return isLinkedInSender && hasJobConfirmation && hasJobContent;
  }
}
