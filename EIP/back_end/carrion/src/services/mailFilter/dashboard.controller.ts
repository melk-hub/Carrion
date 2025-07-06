import {
  Controller,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { MailFilterService } from './mailFilter.service';
import { EmailPreFilterService } from './prefilter.service';
import { 
  DashboardStatsDto, 
  EmailAnalysisResult 
} from './dto/dashboard-response.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('dashboard-mail')
@Public()
@Controller('dashboard_mail')
export class DashboardMailController {
  constructor(
    private readonly mailFilterService: MailFilterService,
    private readonly preFilterService: EmailPreFilterService,
  ) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Get complete dashboard overview',
    description: 'All dashboard data in one response: stats, analyses, filtering performance, and system metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Complete dashboard overview retrieved successfully',
  })
  async getDashboardOverview() {
    // Récupérer toutes les données en parallèle
    const [
      dashboardStats,
      recentAnalyses,
      filteringStats,
      performanceMetrics,
      systemRecommendations
    ] = await Promise.all([
      this.mailFilterService.getDashboardStats(),
      this.mailFilterService.getRecentAnalyses(50),
      this.preFilterService.getFilteringStats(),
      this.mailFilterService.getPerformanceMetrics(),
      this.mailFilterService.getPerformanceRecommendations()
    ]);

    // Analyses détaillées
    const systemReflection = {
      totalAnalyses: recentAnalyses.length,
      recentPeriod: '50 most recent analyses',
      timestamp: new Date().toISOString(),
      patterns: {
        preFilterReasons: this.analyzePreFilterReasons(recentAnalyses),
        claudeAISuccess: this.analyzeClaudeAISuccess(recentAnalyses),
        jobComparisons: this.analyzeJobComparisons(recentAnalyses),
        commonIssues: this.identifyCommonIssues(recentAnalyses),
      },
      insights: {
        mostEffectiveFilters: this.getMostEffectiveFilters(recentAnalyses),
        improvementAreas: this.getImprovementAreas(recentAnalyses),
        successFactors: this.getSuccessFactors(recentAnalyses),
      },
    };

    // Statistiques de filtrage enrichies
    const enrichedFilteringStats = {
      ...filteringStats,
      performance: {
        costSavingsEstimate: `${Math.round(filteringStats.filteringRate * 100)}% reduction in Claude AI calls`,
        processingTimeReduction: `${Math.round(filteringStats.filteringRate * 70)}% faster processing`,
        estimatedMonthlySavings: `€${Math.round(filteringStats.filteringRate * 2000)} per 1000 users`,
      },
      filteringBreakdown: {
        senderFiltering: {
          count: filteringStats.filteredBySender,
          percentage: Math.round(filteringStats.efficiency.senderFiltering * 100),
          description: 'Emails filtered by sender domain/pattern',
        },
        contentFiltering: {
          count: filteringStats.filteredByContent,
          percentage: Math.round(filteringStats.efficiency.contentFiltering * 100),
          description: 'Emails filtered by content analysis',
        },
        mlFiltering: {
          count: filteringStats.filteredByML,
          percentage: Math.round(filteringStats.efficiency.mlFiltering * 100),
          description: 'Emails filtered by ML classifier',
        },
        claudeAIProcessing: {
          count: filteringStats.passedToClaudeAI,
          percentage: Math.round(filteringStats.efficiency.claudeAIUsage * 100),
          description: 'Emails processed by Claude AI',
        },
      },
    };

    // Santé du système
    const systemHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      concurrencyLimit: await this.mailFilterService.getConcurrentEmailLimit(),
      performance: {
        cacheHitRate: performanceMetrics.cacheHitRate,
        errorRate: systemRecommendations.currentPerformance.errorRate,
        avgLatency: systemRecommendations.currentPerformance.avgLatency,
        status: systemRecommendations.currentPerformance.status,
      },
      recommendations: systemRecommendations.recommendations,
    };

    return {
      // Vue d'ensemble
      overview: {
        totalEmailsProcessed: dashboardStats.totalEmailsProcessed,
        emailsFilteredOut: dashboardStats.emailsFilteredOut,
        claudeAIUsage: dashboardStats.emailsProcessedByClaudeAI,
        jobApplicationsCreated: dashboardStats.jobApplicationsCreated,
        jobApplicationsUpdated: dashboardStats.jobApplicationsUpdated,
        filteringEfficiency: Math.round(filteringStats.filteringRate * 100),
        costSavings: `€${Math.round(filteringStats.filteringRate * 2000)}/month`,
        systemStatus: systemHealth.status,
      },

      // Statistiques détaillées
      statistics: {
        dashboard: dashboardStats,
        filtering: enrichedFilteringStats,
        performance: performanceMetrics,
      },

      // Analyses récentes
      recentAnalyses: {
        total: recentAnalyses.length,
        data: recentAnalyses.slice(0, 10), // 10 plus récentes pour l'affichage
        summary: {
          successful: recentAnalyses.filter(a => a.finalResult === 'success').length,
          filtered: recentAnalyses.filter(a => !a.preFilterResult.shouldProcess).length,
          processed: recentAnalyses.filter(a => a.preFilterResult.shouldProcess).length,
        },
      },

      // Réflexion système
      systemInsights: systemReflection,

      // Santé système
      systemHealth,

      // Alertes et recommandations
      alerts: this.generateAlerts(recentAnalyses, filteringStats, systemRecommendations),

      // Métriques en temps réel
      realTimeMetrics: {
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - filteringStats.startTime) / 1000),
        processingRate: filteringStats.totalEmails > 0 ? 
          Math.round(filteringStats.totalEmails / ((Date.now() - filteringStats.startTime) / 1000 / 60)) : 0, // emails/minute
        cacheHitRate: Math.round(performanceMetrics.cacheHitRate * 100),
      },
    };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get mail filtering dashboard statistics',
    description: 'Comprehensive statistics about email processing, filtering efficiency, and job application creation',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    type: DashboardStatsDto,
  })
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.mailFilterService.getDashboardStats();
  }

  @Get('analyses')
  @ApiOperation({
    summary: 'Get recent email analyses',
    description: 'Detailed analysis results for recent emails including pre-filtering decisions and Claude AI reasoning',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of analyses to return (default: 20, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent analyses retrieved successfully',
    type: [EmailAnalysisResult],
  })
  async getRecentAnalyses(
    @Query('limit') limit?: number,
  ): Promise<EmailAnalysisResult[]> {
    const actualLimit = Math.min(limit || 20, 100);
    return this.mailFilterService.getRecentAnalyses(actualLimit);
  }

  @Get('analysis/:emailId')
  @ApiOperation({
    summary: 'Get detailed analysis for specific email',
    description: 'Complete analysis breakdown including pre-filtering, Claude AI reasoning, and comparison results',
  })
  @ApiResponse({
    status: 200,
    description: 'Email analysis retrieved successfully',
    type: EmailAnalysisResult,
  })
  @ApiResponse({ status: 404, description: 'Email analysis not found' })
  async getEmailAnalysis(
    @Param('emailId') emailId: string,
  ): Promise<EmailAnalysisResult | null> {
    const analyses = this.mailFilterService.getRecentAnalyses(100);
    return analyses.find(analysis => analysis.emailId === emailId) || null;
  }

  @Get('filtering-stats')
  @ApiOperation({
    summary: 'Get pre-filtering statistics',
    description: 'Detailed statistics about the email pre-filtering system performance',
  })
  @ApiResponse({
    status: 200,
    description: 'Pre-filtering statistics retrieved successfully',
  })
  async getFilteringStats() {
    const stats = this.preFilterService.getFilteringStats();
    
    return {
      ...stats,
      performance: {
        costSavingsEstimate: `${Math.round(stats.filteringRate * 100)}% reduction in Claude AI calls`,
        processingTimeReduction: `${Math.round(stats.filteringRate * 70)}% faster processing`,
        estimatedMonthlySavings: `€${Math.round(stats.filteringRate * 2000)} per 1000 users`,
      },
      filteringBreakdown: {
        senderFiltering: {
          count: stats.filteredBySender,
          percentage: Math.round(stats.efficiency.senderFiltering * 100),
          description: 'Emails filtered by sender domain/pattern',
        },
        contentFiltering: {
          count: stats.filteredByContent,
          percentage: Math.round(stats.efficiency.contentFiltering * 100),
          description: 'Emails filtered by content analysis',
        },
        mlFiltering: {
          count: stats.filteredByML,
          percentage: Math.round(stats.efficiency.mlFiltering * 100),
          description: 'Emails filtered by ML classifier',
        },
        claudeAIProcessing: {
          count: stats.passedToClaudeAI,
          percentage: Math.round(stats.efficiency.claudeAIUsage * 100),
          description: 'Emails processed by Claude AI',
        },
      },
    };
  }

  @Get('system-performance')
  @ApiOperation({
    summary: 'Get system performance metrics',
    description: 'Real-time performance metrics and system health indicators',
  })
  @ApiResponse({
    status: 200,
    description: 'System performance metrics retrieved successfully',
  })
  async getSystemPerformance() {
    const performanceMetrics = this.mailFilterService.getPerformanceMetrics();
    const recommendations = await this.mailFilterService.getPerformanceRecommendations();
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      concurrencyLimit: await this.mailFilterService.getConcurrentEmailLimit(),
      performance: {
        cacheHitRate: performanceMetrics.cacheHitRate,
        errorRate: recommendations.currentPerformance.errorRate,
        avgLatency: recommendations.currentPerformance.avgLatency,
        status: recommendations.currentPerformance.status,
      },
      recommendations: recommendations.recommendations,
    };

    return {
      health,
      metrics: performanceMetrics,
      recommendations: recommendations.recommendations,
    };
  }

  @Get('debug/email-test')
  @ApiOperation({
    summary: 'Test email filtering with sample content',
    description: 'Test the pre-filtering system with sample email content to debug filtering decisions',
  })
  @ApiResponse({
    status: 200,
    description: 'Email filtering test results',
  })
  async testEmailFiltering() {
    // Test avec vos deux emails
    const testEmails = [
      {
        id: 'test-1',
        subject: 'Re: Votre candidature au poste de Développeur/se Full-Stack',
        body: `Bonjour Lin, 

Je vous contacte suite à votre candidature au poste de Développeur/se Full-Stack chez ADVANCED SCHEMA. Je vous recontacterais dans quelques jours si votre profils nous interesse

Je vous souhaite une très bonne continuation et n'ai aucun doute sur le fait que vous trouviez une opportunité à votre convenance.

Cordialement,
Flavie Puschmann
Talent Acquisition
ADVANCED SCHEMA`,
        sender: 'flavie.puschmann@advanced-schema.com',
      },
      {
        id: 'test-2',
        subject: 'Votre candidature a été envoyée à HONOR',
        body: `LinkedIn	
Pascal Lin
Votre candidature a été envoyée à HONOR
HONOR	
Data Engineer Intern (pour une durée de 3 à 6 mois, ASAP)
HONOR · Issy-les-Moulineaux (Sur site)

Candidature envoyée le 3 juillet 2025

À vous de jouer, suivez les étapes suivantes pour encore plus de succès
Voir des offres d'emploi similaires qui pourraient vous intéresser`,
        sender: 'noreply@linkedin.com',
      },
    ];

    const results = [];
    
    for (const email of testEmails) {
      const filterResult = await this.preFilterService.shouldProcessWithClaudeAI(
        email.body,
        email.subject,
        email.sender
      );
      
      results.push({
        emailId: email.id,
        subject: email.subject,
        sender: email.sender,
        bodyPreview: email.body.substring(0, 200) + '...',
        filterResult,
        analysis: {
          senderCheck: filterResult.details.senderCheck,
          contentScore: filterResult.details.contentScore,
          mlPrediction: filterResult.details.mlPrediction,
          features: {
            subjectKeywords: filterResult.details.strongIndicators || [],
            senderDomain: '',
            contentAnalysis: filterResult.details
          },
        },
      });
    }

    return {
      testResults: results,
      summary: {
        totalTested: testEmails.length,
        passed: results.filter(r => r.filterResult.shouldProcess).length,
        filtered: results.filter(r => !r.filterResult.shouldProcess).length,
      },
      recommendations: results
        .filter(r => !r.filterResult.shouldProcess)
        .map(r => ({
          emailId: r.emailId,
          issue: r.filterResult.reason,
          suggestion: this.getSuggestionForFilteredEmail(r.filterResult),
        })),
    };
  }

  @Get('debug/reflection')
  @ApiOperation({
    summary: 'Get system reflection and debugging information',
    description: 'Advanced debugging information including system reasoning and decision patterns',
  })
  @ApiResponse({
    status: 200,
    description: 'System reflection data retrieved successfully',
  })
  async getSystemReflection() {
    const recentAnalyses = this.mailFilterService.getRecentAnalyses(50);
    
    return {
      systemReflection: {
        totalAnalyses: recentAnalyses.length,
        recentPeriod: '50 most recent analyses',
        timestamp: new Date().toISOString(),
        patterns: {
          preFilterReasons: this.analyzePreFilterReasons(recentAnalyses),
          claudeAISuccess: this.analyzeClaudeAISuccess(recentAnalyses),
          jobComparisons: this.analyzeJobComparisons(recentAnalyses),
          commonIssues: this.identifyCommonIssues(recentAnalyses),
        },
        insights: {
          mostEffectiveFilters: this.getMostEffectiveFilters(recentAnalyses),
          improvementAreas: this.getImprovementAreas(recentAnalyses),
          successFactors: this.getSuccessFactors(recentAnalyses),
        },
      },
      recentAnalyses: recentAnalyses.slice(0, 10),
    };
  }

  private analyzePreFilterReasons(analyses: EmailAnalysisResult[]) {
    const reasons = analyses
      .filter(a => !a.preFilterResult.shouldProcess)
      .map(a => a.preFilterResult.reason);
    
    return this.getTopReasons(reasons);
  }

  private analyzeClaudeAISuccess(analyses: EmailAnalysisResult[]) {
    const claudeAnalyses = analyses.filter(a => a.preFilterResult.shouldProcess);
    const successful = claudeAnalyses.filter(a => a.extractedData && a.finalResult === 'success');
    
    return {
      successRate: claudeAnalyses.length > 0 ? successful.length / claudeAnalyses.length : 0,
      totalProcessed: claudeAnalyses.length,
      successful: successful.length,
      failed: claudeAnalyses.length - successful.length,
      failureReasons: this.getFailureReasons(claudeAnalyses.filter(a => a.finalResult !== 'success')),
    };
  }

  private analyzeJobComparisons(analyses: EmailAnalysisResult[]) {
    const withComparisons = analyses.filter(a => a.existingJobsComparison && a.existingJobsComparison.similarJobs.length > 0);
    const similarJobs = withComparisons.filter(a => a.existingJobsComparison.similarJobs.some(c => c.similarity > 0.7));
    
    return {
      totalWithComparisons: withComparisons.length,
      withSimilarJobs: similarJobs.length,
      avgSimilarity: withComparisons.reduce((acc, a) => 
        acc + (a.existingJobsComparison.similarJobs.reduce((sum, c) => sum + c.similarity, 0) / a.existingJobsComparison.similarJobs.length), 0
      ) / withComparisons.length,
      commonActions: this.getComparisonActions(withComparisons),
    };
  }

  private identifyCommonIssues(analyses: EmailAnalysisResult[]) {
    const issues = [];
    
    // High pre-filter rate
    const preFilterRate = analyses.filter(a => !a.preFilterResult.shouldProcess).length / analyses.length;
    if (preFilterRate > 0.9) {
      issues.push('Very high pre-filter rate - may be filtering too aggressively');
    }
    
    // Low Claude AI success rate
    const claudeAnalyses = analyses.filter(a => a.preFilterResult.shouldProcess);
    const claudeSuccessRate = claudeAnalyses.filter(a => a.finalResult === 'success').length / claudeAnalyses.length;
    if (claudeSuccessRate < 0.8) {
      issues.push('Low Claude AI success rate - prompt may need optimization');
    }
    
    return issues;
  }

  private getFailureReasons(failedAnalyses: EmailAnalysisResult[]) {
    return failedAnalyses.map(a => a.systemReflection.finalDecision).filter(Boolean);
  }

  private getComparisonActions(similarAnalyses: EmailAnalysisResult[]) {
    return similarAnalyses.map(a => a.existingJobsComparison.similarJobs.map(c => c.action)).flat();
  }

  private getTopReasons(reasons: string[]) {
    const counts = reasons.reduce((acc, reason) => {
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }));
  }

  private getMostEffectiveFilters(analyses: EmailAnalysisResult[]) {
    return this.getTopReasons(
      analyses
        .filter(a => !a.preFilterResult.shouldProcess)
        .map(a => a.preFilterResult.reason)
    );
  }

  private getImprovementAreas(analyses: EmailAnalysisResult[]) {
    const areas = [];
    
    // Analyze processing failures
    const failures = analyses.filter(a => a.finalResult !== 'success');
    if (failures.length > 0) {
      areas.push({
        area: 'Processing Failures',
        description: 'Reduce processing errors and improve success rate',
        count: failures.length,
      });
    }
    
    return areas;
  }

  private getSuccessFactors(analyses: EmailAnalysisResult[]) {
    const successful = analyses.filter(a => a.finalResult === 'success' && a.extractedData);
    
    return {
      count: successful.length,
      factors: [
        'Clean email content',
        'Proper sender domain',
        'Clear job description format',
        'Structured email layout',
      ],
    };
  }

  private generateAlerts(analyses: EmailAnalysisResult[], filteringStats: any, systemRecommendations: any) {
    const alerts = [];
    
    // Alerte taux de filtrage élevé
    if (filteringStats.filteringRate > 0.95) {
      alerts.push({
        type: 'warning',
        title: 'High filtering rate detected',
        message: `${Math.round(filteringStats.filteringRate * 100)}% of emails are being filtered out. Consider reviewing filter settings.`,
        severity: 'medium',
      });
    }
    
    // Alerte taux d'erreur élevé
    if (systemRecommendations.currentPerformance.errorRate > 0.1) {
      alerts.push({
        type: 'error',
        title: 'High error rate',
        message: `${Math.round(systemRecommendations.currentPerformance.errorRate * 100)}% error rate detected. System may need attention.`,
        severity: 'high',
      });
    }
    
    // Alerte latence élevée
    if (systemRecommendations.currentPerformance.avgLatency > 5000) {
      alerts.push({
        type: 'warning',
        title: 'High latency',
        message: `Average processing time is ${Math.round(systemRecommendations.currentPerformance.avgLatency)}ms. Consider optimizing.`,
        severity: 'medium',
      });
    }
    
    // Alerte analyses récentes faibles
    const recentSuccessRate = analyses.filter(a => a.finalResult === 'success').length / analyses.length;
    if (recentSuccessRate < 0.7) {
      alerts.push({
        type: 'warning',
        title: 'Low success rate',
        message: `Only ${Math.round(recentSuccessRate * 100)}% of recent analyses were successful.`,
        severity: 'medium',
      });
    }
    
    return alerts;
  }

  private getSuggestionForFilteredEmail(filterResult: any): string {
    if (filterResult.reason.includes('Sender filtered')) {
      return 'Consider adding this sender domain to the whitelist if it\'s a legitimate recruitment source';
    }
    
    if (filterResult.reason.includes('Content score too low')) {
      return 'Email lacks sufficient job-related keywords. Consider adding more recruitment terms to the keyword list';
    }
    
    if (filterResult.reason.includes('ML classifier rejected')) {
      return 'ML classifier deemed this email as non-recruitment. Consider adjusting ML thresholds or adding more training data';
    }
    
    return 'Review the filtering criteria and consider adjusting the pre-filter settings';
  }
} 