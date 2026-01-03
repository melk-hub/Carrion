import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateJobApplyDto } from '@/jobApply/dto/jobApply.dto';
import { JobApplyService } from '@/jobApply/jobApply.service';
import { ApplicationStatus } from '@/jobApply/enum/application-status.enum';
import { ExtractedJobDataDto } from './dto/extracted-job-data.dto';
import { convert } from 'html-to-text';
import {
  GmailMessage,
  GmailMessagePart,
  GmailHeader,
} from '@/webhooks/mail/gmail.types';
import { UpdateJobApply } from '@/jobApply/interface/jobApply.interface';
import { OutlookMessage } from '@/webhooks/mail/outlook.types';
import { createHash } from 'crypto';
import { UserService } from '@/user/user.service';
import { EmailPreFilterService } from './prefilter.service';
import { Mistral } from '@mistralai/mistralai';
import {
  EmailAnalysisResult,
  ExistingJobComparisonDto,
} from './dto/dashboard-response.dto';
import { PrismaService } from '@/prisma/prisma.service';

function extractJsonFromString(str: string): any | null {
  if (!str) {
    return null;
  }

  const match = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/);

  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      Logger.error(
        `A JSON markdown block was found, but its content is invalid: ${e.message}`,
        'MailFilterService-JSONUtil',
      );
      return null;
    }
  }

  try {
    const parsed = JSON.parse(str);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
    Logger.warn(
      `The string was parsed as valid JSON, but it is not an object.`,
      'MailFilterService-JSONUtil',
    );
    return null;
  } catch (e) {
    Logger.error(
      `The string could not be parsed as valid JSON: ${e.message}`,
      'MailFilterService-JSONUtil',
    );
    return null;
  }
}

@Injectable()
export class MailFilterService {
  private readonly logger = new Logger(MailFilterService.name);
  private readonly mistralAI: Mistral;

  private processedEmails = new Set<string>();
  private readonly EMAIL_CACHE_TTL = 24 * 60 * 60 * 1000;
  private readonly MAX_CACHE_SIZE = 15000;

  private responseCache = new Map<
    string,
    { response: ExtractedJobDataDto | null; timestamp: number }
  >();
  private readonly RESPONSE_CACHE_TTL = 60 * 60 * 1000;
  private readonly MAX_RESPONSE_CACHE_SIZE = 1000;

  private readonly JOB_KEYWORDS = [
    'recrutement',
    'candidature',
    'poste',
    'emploi',
    'job',
    'entretien',
    'interview',
    'offre',
    'stage',
    'alternance',
    'apprentissage',
    'cdi',
    'cdd',
    'freelance',
    'mission',
    'opportunité',
    'carrière',
    'postulation',
    'embauche',

    'recruitment',
    'application',
    'position',
    'employment',
    'career',
    'opportunity',
    'interview',
    'offer',
    'internship',
    'full-time',
    'part-time',
    'contract',
    'freelance',
    'remote',
    'hiring',
    'vacancy',
    'candidate',
  ];

  private readonly JOB_DOMAINS = [
    'linkedin.com',
    'indeed.com',
    'glassdoor.com',
    'monster.com',
    'jobteaser.com',
    'apec.fr',
    'pole-emploi.fr',
    'welcometothejungle.com',
    'jobijoba.com',
    'regionsjob.com',
    'cadremploi.fr',
    'meteojob.com',
    'stepstone.fr',
  ];

  private readonly NEGATIVE_INDICATORS = [
    'newsletter',
    'promotion',
    'marketing',
    'publicité',
    'spam',
    'advertising',
    'unsubscribe',
    'désabonnement',
    'commercial',
    'vente',
    'soldes',
    'sale',
    'discount',
    'réduction',
    'password',
    'mot de passe',
    'security',
    'sécurité',
  ];

  private metrics = {
    startTime: Date.now(),
    processedEmails: 0,
    claudeAICalls: 0,
    cacheHits: 0,
    duplicatesSkipped: 0,
    errors: 0,
    totalProcessingTime: 0,
  };

  private readonly CONCURRENT_EMAIL_LIMIT = 5;

  private userCountCache: { count: number; timestamp: number } | null = null;
  private readonly USER_COUNT_CACHE_TTL = 10 * 60 * 1000;

  private recentAnalyses: EmailAnalysisResult[] = [];
  private readonly MAX_RECENT_ANALYSES = 100;

  constructor(
    private readonly jobApplyService: JobApplyService,
    private readonly userService: UserService,
    private readonly preFilterService: EmailPreFilterService,
    private readonly prisma: PrismaService,
  ) {
    this.mistralAI = new Mistral({
      apiKey: process.env.MISTRAL_API_KEY,
    });

    setInterval(
      () => {
        this.performCacheCleanup();
        this.cleanupResponseCache();
        this.logger.log('Performed smart email deduplication cache cleanup');
        this.logMetrics();
      },
      6 * 60 * 60 * 1000,
    );
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupResponseCache(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, value] of this.responseCache.entries()) {
      if (now - value.timestamp > this.RESPONSE_CACHE_TTL) {
        this.responseCache.delete(key);
        removedCount++;
      }
    }

    this.logger.log(
      `Cleaned up ${removedCount} expired cache entries. Cache size: ${this.responseCache.size}`,
    );
  }

  /**
   * Generate cache key for similar emails
   */
  private generateCacheKey(emailText: string, emailSubject?: string): string {
    const normalizedText = emailText
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .substring(0, 500);

    const normalizedSubject = (emailSubject || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');

    return createHash('md5')
      .update(`${normalizedSubject}|${normalizedText}`)
      .digest('hex');
  }

  /**
   * Get cached response if available
   */
  private getCachedResponse(cacheKey: string): ExtractedJobDataDto | null {
    const cached = this.responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.RESPONSE_CACHE_TTL) {
      this.metrics.cacheHits++;
      this.logger.log(`Cache hit for key: ${cacheKey.substring(0, 8)}...`);
      return cached.response;
    }
    return null;
  }

  /**
   * Store response in cache
   */
  private setCachedResponse(
    cacheKey: string,
    response: ExtractedJobDataDto | null,
  ): void {
    this.responseCache.set(cacheKey, {
      response,
      timestamp: Date.now(),
    });
  }

  /**
   * Log performance metrics
   */
  private logMetrics(): void {
    this.logger.log(
      'MailFilter Performance Metrics:',
      JSON.stringify({
        ...this.metrics,
        duplicateRate:
          this.metrics.processedEmails > 0
            ? (
                (this.metrics.duplicatesSkipped /
                  this.metrics.processedEmails) *
                100
              ).toFixed(1) + '%'
            : '0%',
        cacheHitRate:
          this.metrics.claudeAICalls > 0
            ? (
                (this.metrics.cacheHits /
                  (this.metrics.claudeAICalls + this.metrics.cacheHits)) *
                100
              ).toFixed(1) + '%'
            : '0%',
        cacheSize: this.responseCache.size,
      }),
    );
  }

  /**
   * Generate a unique hash for email content to detect duplicates
   */
  private generateEmailHash(
    emailText: string,
    userId: string,
    emailSubject?: string,
    emailSender?: string,
    messageId?: string,
  ): string {
    const stableContent = `${userId}|${emailSubject || ''}|${emailSender || ''}|${messageId || 'no-msg-id'}`;
    const hash = createHash('sha256').update(stableContent).digest('hex');

    const timestampedHash = `${hash}:${Date.now()}`;
    return timestampedHash;
  }

  /**
   * Check if email has already been processed recently
   */
  private isEmailAlreadyProcessed(emailHash: string): boolean {
    const baseHash = emailHash.split(':')[0];

    for (const processedHash of this.processedEmails) {
      const processedBaseHash = processedHash.split(':')[0];
      if (processedBaseHash === baseHash) {
        this.logger.debug(
          `Found duplicate email with base hash: ${baseHash.substring(0, 12)}...`,
        );
        return true;
      }
    }

    return false;
  }

  /**
   * Mark email as processed
   */
  private markEmailAsProcessed(emailHash: string): void {
    this.processedEmails.add(emailHash);
  }

  private decodeBase64Url(encoded?: string): string {
    if (!encoded) return '';
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    try {
      return Buffer.from(base64, 'base64').toString('utf-8');
    } catch (error) {
      this.logger.error('Failed to decode Base64URL string:', error);
      return `[Decoding error:: ${encoded.substring(0, 20)}...]`;
    }
  }

  private getHeaderValue(
    headers: GmailHeader[] | undefined,
    name: string,
  ): string | undefined {
    if (!headers) return undefined;
    const header = headers.find(
      (h) => h.name.toLowerCase() === name.toLowerCase(),
    );
    return header ? header.value : undefined;
  }

  private extractTextFromGmailPart(part: GmailMessagePart): string {
    let textContent = '';

    if (part.mimeType === 'text/plain' && part.body?.data) {
      textContent = this.decodeBase64Url(part.body.data);
    } else if (part.mimeType === 'text/html' && part.body?.data) {
      const htmlContent = this.decodeBase64Url(part.body.data);
      textContent = convert(htmlContent, {
        wordwrap: false,
        selectors: [
          { selector: 'a', options: { ignoreHref: true } },
          { selector: 'Image', format: 'skip' },
        ],
      });
    } else if (part.mimeType.startsWith('multipart/') && part.parts) {
      if (part.mimeType === 'multipart/alternative') {
        const plainPart = part.parts.find((p) => p.mimeType === 'text/plain');
        if (plainPart) return this.extractTextFromGmailPart(plainPart);

        const htmlPart = part.parts.find((p) => p.mimeType === 'text/html');
        if (htmlPart) return this.extractTextFromGmailPart(htmlPart);
      }
      for (const subPart of part.parts) {
        const contentDisposition = this.getHeaderValue(
          subPart.headers,
          'Content-Disposition',
        );
        if (
          subPart.filename ||
          (contentDisposition && contentDisposition.startsWith('attachment'))
        ) {
          continue;
        }
        const subPartText = this.extractTextFromGmailPart(subPart);
        if (subPartText) {
          textContent += subPartText + '\n\n';
        }
      }
    }
    return textContent.trim();
  }

  /**
   * Pre-filter emails to identify job-related content - DISABLED
   * All emails will now be processed by Claude AI
   */
  /*
  private isJobRelatedEmail(
    emailText: string,
    emailSubject?: string,
    emailSender?: string,
  ): { isJobRelated: boolean; confidence: number; reason: string } {

    return {
      isJobRelated: true,
      confidence: 100,
      reason: 'pre-filtering disabled',
    };
  }
  */

  /**
   * Generate optimized prompt based on email content length and complexity
   */
  private generateOptimizedPrompt(
    emailText: string,
    isComplex: boolean = false,
    existingJobs: ExistingJobComparisonDto[] = [],
  ): string {
    const existingJobsContext =
      existingJobs.length > 0
        ? `

## USER'S EXISTING JOBS
To improve accuracy, here are the user's existing applications:
${existingJobs.map((job) => `- ${job.title} at ${job.company} (${job.status})`).join('\n')}

Use this information to:
- Detect potential duplicates
- Improve company name consistency
- Identify status updates`
        : '';

    const basePrompt = `You are an expert in recruitment email analysis with 10 years of experience. You extract job application information with precision.

## MANDATORY PRELIMINARY VALIDATION
STEP 1: Verify that the email concerns recruitment/job application
- If NON-RECRUITMENT → return exactly: null
- If UNCERTAIN → return exactly: null  
- If RECRUITMENT → continue analysis

## RECRUITMENT EMAIL TYPES TO PROCESS
Application confirmation
Interview invitation
Job offer/proposal
Application rejection  
Request for additional documents
Post-interview feedback
Internship/apprenticeship proposal

## EMAIL TYPES TO EXCLUDE
Generic job newsletters
Training/coaching advertisements
Technical emails (password, etc.)
Commercial/marketing emails
Event/webinar confirmations
Commercial prospecting emails${existingJobsContext}

## STRICT OUTPUT FORMAT - CRITICAL
You must return ONLY a valid JSON object in a markdown block. NO text before or after!

EXPECTED FORMAT EXAMPLE:
\`\`\`json
{
  "company": "string",
  "title": "string", 
  "location": "string|null",
  "salary": "string|null",
  "contractType": "Full-time|Part-time|Internship|Contract|Freelance|null",
  "status": "PENDING|APPLIED|INTERVIEW_SCHEDULED|TECHNICAL_TEST|OFFER_RECEIVED|NEGOTIATION|OFFER_ACCEPTED|REJECTED_BY_COMPANY|OFFER_DECLINED|APPLICATION_WITHDRAWN",
  "interviewDate": "YYYY-MM-DDTHH:mm:ss.sssZ|null",
  "offerReference": "string|null"
}
\`\`\`

FORBIDDEN: Explanatory text, markdown titles (##), comments
FORBIDDEN: "## VALIDATION", "## ANALYSIS", etc.
MANDATORY: Only the JSON markdown block above

## STRICT EXTRACTION RULES

### Company (MANDATORY)
- Exact company name (not department/subsidiary)
- If email signature → use company name from signature
- If email domain → extract company name from domain
- Examples: "Carrion Corp", "Google", "BNP Paribas"

### Title (MANDATORY)  
- Exact job title in English
- No obscure abbreviations
- Examples: "Software Developer", "Marketing Manager", "Data Scientist"

### Status (MANDATORY - BUSINESS LOGIC)
- **PENDING**: Application received, awaiting response
- **APPLIED**: Application already sent
- **INTERVIEW_SCHEDULED**: Interview invitation / appointment scheduled 
- **TECHNICAL_TEST**: Technical test
- **OFFER_RECEIVED**: Offer received
- **NEGOTIATION**: Negotiation
- **OFFER_ACCEPTED**: Offer accepted / firm proposal / application retained
- **REJECTED_BY_COMPANY**: Explicit rejection by company
- **OFFER_DECLINED**: Explicit application refusal
- **APPLICATION_WITHDRAWN**: Application withdrawn

### ContractType (Strict normalization)
- **Full-time**: CDI, full-time, permanent
- **Part-time**: Part-time, partial CDI  
- **Internship**: Internship, apprenticeship
- **Contract**: CDD, temporary mission, freelance project
- **Freelance**: Consultant, self-employed, freelance
- **null**: If type not mentioned

### Salary (Uniform format)
- Keep currency and period: "45000 EUR/year", "2500 EUR/month"  
- Ranges: "40000-50000 EUR/year"
- null if not mentioned

### InterviewDate (Strict ISO format)
- Format: "2024-03-15T14:30:00.000Z"
- null if no precise date
- Extract time if mentioned

### Location (Geographic normalization)
- Format: "City, Country" or "City, Region, Country"
- Examples: "Paris, France", "Remote", "Lyon, Auvergne-Rhône-Alpes, France"
- null if remote work not specified

## FINAL VALIDATION
Before returning JSON:
1. company AND title are non-null and non-empty
2. status is in allowed enum  
3. contractType is in allowed enum or null
4. interviewDate is valid ISO 8601 or null
5. JSON is syntactically correct

If validation fails → return null

## SPECIFIC INSTRUCTIONS
- DO NOT invent missing information
- DO NOT hallucinate data  
- ALWAYS prefer null if uncertain
- RESPECT exactly the requested JSON format
- INCLUDE JSON quotes and commas`;

    if (isComplex) {
      return (
        basePrompt +
        `

**ANALYSE APPROFONDIE** : Email complexe détecté. Analyse attentivement tout le contexte et les nuances.`
      );
    }

    return (
      basePrompt +
      `

**ANALYSE RAPIDE** : Email simple détecté. Extraction directe des informations principales.`
    );
  }

  private isComplexEmail(emailText: string): boolean {
    const indicators = [
      emailText.length > 2000,
      (emailText.match(/\n/g) || []).length > 20,
      emailText.includes('thread') || emailText.includes('conversation'),
      emailText.includes('RE:') || emailText.includes('FW:'),
      (emailText.match(/[.!?]/g) || []).length > 10,
    ];

    return indicators.filter(Boolean).length >= 2;
  }

  async processEmailAndCreateJobApplyFromGmail(
    gmailMessage: GmailMessage,
    userId: string,
  ): Promise<string> {
    const startTime = Date.now();
    this.metrics.processedEmails++;

    if (!gmailMessage || !gmailMessage.payload) {
      this.metrics.errors++;
      this.logger.error('Received invalid or empty gmailMessage object');
      throw new BadRequestException('Invalid email data provided.');
    }

    const subject = this.getHeaderValue(
      gmailMessage.payload.headers,
      'Subject',
    );

    const sender = this.getHeaderValue(gmailMessage.payload.headers, 'From');
    let bodyText = this.extractTextFromGmailPart(gmailMessage.payload);

    if (!bodyText && gmailMessage.snippet) {
      this.logger.warn(
        `No main body extracted for message ${gmailMessage.id}, using snippet.`,
      );
      bodyText = gmailMessage.snippet;
    }

    if (!bodyText) {
      this.metrics.errors++;
      this.logger.error(
        `Could not extract text body for message ${gmailMessage.id}`,
      );
      throw new BadRequestException(
        'Could not extract readable text from the email.',
      );
    }

    this.logger.log(
      `Processing Gmail email. Subject: "${subject}", Sender: "${sender}"`,
    );

    const emailHash = this.generateEmailHash(
      bodyText,
      userId,
      subject,
      sender,
      gmailMessage.id,
    );

    if (this.isEmailAlreadyProcessed(emailHash)) {
      this.metrics.duplicatesSkipped++;
      this.logger.warn(
        `Skipping already processed Gmail email. Subject: "${subject}", Sender: "${sender}", MessageId: ${gmailMessage.id}`,
      );
      return 'Email already processed - skipped';
    }

    this.markEmailAsProcessed(emailHash);

    try {
      const result = await this.processEmailWithExtractedData(
        bodyText,
        userId,
        subject,
        sender,
      );

      const processingTime = Date.now() - startTime;
      this.metrics.totalProcessingTime += processingTime;

      return result;
    } catch (error) {
      this.metrics.errors++;
      this.logger.error(
        `Erreur avec l'API claudeAI ou lors du traitement: ${error.message}`,
        error.stack,
      );
      return error.message;
    }
  }

  private async processEmailWithExtractedData(
    emailText: string,
    userId: string,
    emailSubject?: string,
    emailSender?: string,
  ): Promise<string> {
    const startTime = Date.now();
    const emailId = this.generateEmailHash(
      emailText,
      userId,
      emailSubject,
      emailSender,
    );
    this.logger.log(
      `Processing email for user ${userId}. Subject: "${emailSubject}", Sender: "${emailSender}"`,
    );

    const preFilterResult =
      await this.preFilterService.shouldProcessWithClaudeAI(
        emailText,
        emailSubject || '',
        emailSender || '',
      );

    const analysis: EmailAnalysisResult = {
      emailId,
      timestamp: new Date(),
      userId,
      emailSubject: emailSubject || '',
      emailSender: emailSender || '',
      emailBodyPreview: emailText.substring(0, 500),
      preFilterResult,
      processingTime: 0,
      claudeAIUsed: false,
      systemReflection: {
        preFilterDecision: this.generatePreFilterDecision(preFilterResult),
        contentAnalysis: this.generateContentAnalysis(
          emailText,
          emailSubject,
          emailSender,
        ),
        finalDecision: '',
      },
      finalResult: '',
    };

    try {
      if (!preFilterResult.shouldProcess) {
        analysis.systemReflection.finalDecision = `Email filtré: ${preFilterResult.reason}`;
        analysis.finalResult = `Email filtered: ${preFilterResult.reason} (confidence: ${preFilterResult.confidence})`;
        analysis.processingTime = Date.now() - startTime;
        this.addAnalysisToHistory(analysis);
        this.logger.log(`Email pre-filtered out: ${preFilterResult.reason}`);
        return analysis.finalResult;
      }

      this.logger.log(
        `Email passed pre-filtering with confidence ${preFilterResult.confidence}`,
      );

      const existingJobs = await this.getExistingJobsForComparison(userId);
      console.log('existingJobs', existingJobs);
      let emailContext = `Email Body:\n${emailText}\n`;
      if (emailSubject) {
        emailContext += `\nEmail Subject: ${emailSubject}\n`;
      }
      if (emailSender) {
        emailContext += `\nEmail Sender: ${emailSender}\n`;
      }

      const isComplex = this.isComplexEmail(emailText);
      const optimizedPrompt = this.generateOptimizedPrompt(
        emailText,
        isComplex,
        existingJobs,
      );

      const cacheKey = this.generateCacheKey(emailText, emailSubject);
      const cachedResponse = this.getCachedResponse(cacheKey);

      let parsedData: ExtractedJobDataDto | null = null;

      if (cachedResponse) {
        this.logger.log(`Using cached response for similar email`);
        parsedData = cachedResponse;
        analysis.systemReflection.claudeAIReasoning =
          'Réponse trouvée en cache';
      } else {
        analysis.claudeAIUsed = true;
        parsedData = await this.callMistralAIWithFallback(
          optimizedPrompt,
          emailContext,
          isComplex,
        );

        analysis.systemReflection.claudeAIReasoning =
          this.generateClaudeAIReasoning(parsedData, isComplex, existingJobs);

        if (parsedData) {
          this.setCachedResponse(cacheKey, parsedData);
        }
      }

      analysis.extractedData = parsedData;

      if (!parsedData) {
        analysis.systemReflection.finalDecision = 'Échec extraction Claude AI';
        analysis.finalResult =
          'Erreur lors du parsing du JSON de la réponse claudeAI.';
        analysis.processingTime = Date.now() - startTime;
        this.addAnalysisToHistory(analysis);
        this.logger.error(
          'Failed to get valid response from claudeAI or cache.',
        );
        return analysis.finalResult;
      } else if (!parsedData.title || !parsedData.company) {
        analysis.systemReflection.finalDecision =
          'Données insuffisantes extraites';
        analysis.finalResult =
          'Email analyzed but no valid job application data found';
        analysis.processingTime = Date.now() - startTime;
        this.addAnalysisToHistory(analysis);
        this.logger.warn(
          `Didn't create jobApply for this mail: ${emailSender + ' ' + emailSubject}`,
        );
        return analysis.finalResult;
      }

      if (
        !parsedData.status ||
        !Object.values(ApplicationStatus).includes(
          parsedData.status as ApplicationStatus,
        )
      ) {
        this.logger.warn(
          `Invalid or missing status from claudeAI: '${parsedData.status}'. Defaulting to PENDING.`,
        );
        parsedData.status = ApplicationStatus.PENDING;
      }

      const jobComparison = await this.compareWithExistingJobs(
        parsedData,
        userId,
        existingJobs,
      );
      analysis.existingJobsComparison = jobComparison;

      if (jobComparison.foundSimilar) {
        const similarJob = jobComparison.similarJobs[0];
        if (similarJob.action === 'updated') {
          analysis.systemReflection.finalDecision = `Existing job updated: ${similarJob.title} at ${similarJob.company}`;
          analysis.finalResult = `Job application updated successfully (ID: ${similarJob.id})`;
          analysis.jobApplyId = similarJob.id;
        } else {
          analysis.systemReflection.finalDecision = `Similar job found but no action taken: ${similarJob.title} at ${similarJob.company}`;
          analysis.finalResult = `Similar job found but no action taken (ID: ${similarJob.id})`;
        }
      } else {
        const newJobResult = await this.createJobApply(parsedData, userId);
        analysis.systemReflection.finalDecision = `New job created: ${parsedData.title} at ${parsedData.company}`;
        analysis.finalResult = newJobResult;

        const idMatch = newJobResult.match(/ID: ([^)]+)/);
        if (idMatch) {
          analysis.jobApplyId = idMatch[1];
        }
      }

      analysis.processingTime = Date.now() - startTime;
      this.addAnalysisToHistory(analysis);
      return analysis.finalResult;
    } catch (error) {
      analysis.systemReflection.finalDecision = `Erreur: ${error.message}`;
      analysis.finalResult = error.message;
      analysis.processingTime = Date.now() - startTime;
      this.addAnalysisToHistory(analysis);
      this.logger.error(
        `Erreur avec l'API claudeAI ou lors du traitement: ${error.message}`,
        error.stack,
      );
      return error.message;
    }
  }

  /**
   * Call claudeAI with fallback mechanism for better reliability
   */
  private async callMistralAIWithFallback(
    prompt: string,
    emailContext: string,
    isComplex: boolean,
    retryCount: number = 0,
  ): Promise<ExtractedJobDataDto | null> {
    const maxRetries = 2;

    try {
      this.metrics.claudeAICalls++;

      const response = await this.mistralAI.chat.complete({
        model: 'mistral-small-latest',

        messages: [
          {
            role: 'system',
            content: prompt,
          },
          {
            role: 'user',
            content: emailContext,
          },
        ],
        temperature: 0.3,
      });

      const rawResponse = response.choices[0].message.content;
      if (!rawResponse) {
        throw new Error('MistralAI returned an empty response.');
      }

      // if (rawResponse.type !== 'text') {
      //   throw new Error(
      //     `ClaudeAI returned an unexpected content block type: ${rawResponse.type}`,
      //   );
      // }

      const parsedData: ExtractedJobDataDto | null = extractJsonFromString(
        rawResponse as string,
      );

      return parsedData;
    } catch (error) {
      this.logger.warn(
        `mistralAI call failed (attempt ${retryCount + 1}): ${error.message}`,
      );

      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.callMistralAIWithFallback(
          prompt,
          emailContext,
          isComplex,
          retryCount + 1,
        );
      }

      if (isComplex && retryCount >= maxRetries) {
        this.logger.log('Retrying with simplified prompt for complex email');
        const simplifiedPrompt = this.generateOptimizedPrompt(
          emailContext.substring(0, 1000),
          false,
        );
        return this.callMistralAIWithFallback(
          simplifiedPrompt,
          emailContext.substring(0, 1000),
          false,
          0,
        );
      }

      throw error;
    }
  }

  async createJobApply(
    parsedData: ExtractedJobDataDto,
    userId: string,
  ): Promise<string> {
    const jobApplyDto: CreateJobApplyDto = {
      title: parsedData.title || 'Titre non spécifié',
      company: parsedData.company || 'Entreprise non spécifiée',
      location: parsedData.location ? parsedData.location : undefined,
      salary: parsedData.salary
        ? Number.parseInt(parsedData.salary.replace(/\s/g, ''))
        : undefined,
      status: parsedData.status as ApplicationStatus,
      contractType: parsedData.contractType
        ? parsedData.contractType
        : undefined,
      interviewDate:
        parsedData.interviewDate &&
        parsedData.interviewDate !== 'null' &&
        parsedData.interviewDate.trim() !== ''
          ? new Date(parsedData.interviewDate)
          : undefined,
    };

    this.logger.log(
      `Creating job apply entry with DTO: ${JSON.stringify(jobApplyDto)}`,
    );
    const createdJobApply = await this.jobApplyService.createJobApply(
      userId,
      jobApplyDto,
    );
    return `Job application processed successfully (ID: ${createdJobApply.id}).`;
  }

  async processEmailAndCreateJobApplyFromOutlook(
    outlookMessage: OutlookMessage,
    userId: string,
  ): Promise<string> {
    const startTime = Date.now();
    this.metrics.processedEmails++;

    if (!outlookMessage) {
      this.metrics.errors++;
      this.logger.error('Received invalid or empty outlookMessage object');
      throw new BadRequestException('Invalid email data provided.');
    }

    const subject = outlookMessage.subject || '';
    const sender = `${outlookMessage.from?.emailAddress?.name || ''} <${outlookMessage.from?.emailAddress?.address || ''}>`;

    let bodyText = this.extractTextFromOutlookMessage(outlookMessage);

    if (!bodyText && outlookMessage.bodyPreview) {
      this.logger.warn(
        `No main body extracted for message ${outlookMessage.id}, using bodyPreview.`,
      );
      bodyText = outlookMessage.bodyPreview;
    }

    if (!bodyText) {
      this.metrics.errors++;
      this.logger.error(
        `Could not extract text body for message ${outlookMessage.id}`,
      );
      throw new BadRequestException(
        'Could not extract readable text from the email.',
      );
    }

    this.logger.log(
      `Processing Outlook email without pre-filtering. Subject: "${subject}", Sender: "${sender}"`,
    );

    const emailHash = this.generateEmailHash(bodyText, userId, subject, sender);

    if (this.isEmailAlreadyProcessed(emailHash)) {
      this.metrics.duplicatesSkipped++;
      this.logger.warn(
        `Skipping already processed Outlook email. Subject: "${subject}", Sender: "${sender}", MessageId: ${outlookMessage.id}`,
      );
      return 'Email already processed - skipped';
    }

    this.markEmailAsProcessed(emailHash);

    try {
      const result = await this.processEmailWithExtractedData(
        bodyText,
        userId,
        subject,
        sender,
      );

      const processingTime = Date.now() - startTime;
      this.metrics.totalProcessingTime += processingTime;

      return result;
    } catch (error) {
      this.metrics.errors++;
      this.logger.error(
        `Error with claudeAI API or during processing: ${error.message}`,
        error.stack,
      );
      return error.message;
    }
  }

  /**
   * Extract readable text content from Outlook message
   */
  private extractTextFromOutlookMessage(
    outlookMessage: OutlookMessage,
  ): string {
    if (!outlookMessage.body?.content) {
      return outlookMessage.bodyPreview || '';
    }

    let content = outlookMessage.body.content;

    if (outlookMessage.body.contentType === 'html') {
      content = convert(content, {
        wordwrap: false,
        selectors: [
          { selector: 'a', options: { ignoreHref: true } },
          { selector: 'Image', format: 'skip' },
          { selector: 'script', format: 'skip' },
          { selector: 'style', format: 'skip' },
        ],
      });
    }

    return content.trim();
  }

  /**
   * Initialize monitoring system
   */
  onModuleInit() {
    setInterval(
      () => {
        this.performCacheCleanup();
      },
      20 * 60 * 1000,
    );

    setInterval(
      () => {
        this.logPerformanceMetrics();
      },
      30 * 60 * 1000,
    );

    this.logger.log(
      'MailFilter Service initialized - ALL EMAILS WILL BE PROCESSED BY AI',
    );
    this.logger.log(
      `Pre-filtering DISABLED - All emails will be sent to Claude AI for analysis`,
    );
  }

  /**
   * Enhanced cache cleanup with memory management
   */
  private performCacheCleanup(): void {
    const now = Date.now();

    const expiredProcessedEmails = [];
    for (const email of this.processedEmails) {
      const [, timestamp] = email.split(':');
      if (now - parseInt(timestamp) > this.EMAIL_CACHE_TTL) {
        expiredProcessedEmails.push(email);
      }
    }
    expiredProcessedEmails.forEach((email) =>
      this.processedEmails.delete(email),
    );

    if (this.processedEmails.size > this.MAX_CACHE_SIZE) {
      const sortedEmails = Array.from(this.processedEmails).sort((a, b) => {
        const timestampA = parseInt(a.split(':')[1]);
        const timestampB = parseInt(b.split(':')[1]);
        return timestampA - timestampB;
      });

      const toRemove = sortedEmails.slice(
        0,
        this.processedEmails.size - this.MAX_CACHE_SIZE,
      );
      toRemove.forEach((email) => this.processedEmails.delete(email));

      this.logger.warn(
        `Cache size exceeded ${this.MAX_CACHE_SIZE}. Removed ${toRemove.length} oldest entries.`,
      );
    }

    const expiredCacheKeys = [];
    for (const [key, entry] of this.responseCache.entries()) {
      if (now - entry.timestamp > this.RESPONSE_CACHE_TTL) {
        expiredCacheKeys.push(key);
      }
    }
    expiredCacheKeys.forEach((key) => this.responseCache.delete(key));

    if (this.responseCache.size > this.MAX_RESPONSE_CACHE_SIZE) {
      const sortedEntries = Array.from(this.responseCache.entries()).sort(
        (a, b) => a[1].timestamp - b[1].timestamp,
      );
      const toRemove = sortedEntries.slice(
        0,
        this.responseCache.size - this.MAX_RESPONSE_CACHE_SIZE,
      );
      toRemove.forEach(([key]) => this.responseCache.delete(key));
    }

    const memoryUsage = this.estimateMemoryUsage();
    this.logger.log(
      `Cache cleanup: Removed ${expiredProcessedEmails.length} processed emails and ${expiredCacheKeys.length} cached responses. Memory: ${memoryUsage.totalMB}MB`,
    );
  }

  /**
   * Estimate current memory usage
   */
  private estimateMemoryUsage(): {
    processedEmailsMB: number;
    responseCacheMB: number;
    totalMB: number;
  } {
    const processedEmailsSize =
      Array.from(this.processedEmails).join('').length * 2;
    const responseCacheSize =
      JSON.stringify(Array.from(this.responseCache.values())).length * 2;

    return {
      processedEmailsMB: +(processedEmailsSize / 1024 / 1024).toFixed(2),
      responseCacheMB: +(responseCacheSize / 1024 / 1024).toFixed(2),
      totalMB: +(
        (processedEmailsSize + responseCacheSize) /
        1024 /
        1024
      ).toFixed(2),
    };
  }

  /**
   * Get cache statistics for monitoring
   */
  public getCacheStats(): any {
    const memoryUsage = this.estimateMemoryUsage();

    return {
      processedEmails: {
        count: this.processedEmails.size,
        maxSize: this.MAX_CACHE_SIZE,
        memoryMB: memoryUsage.processedEmailsMB,
        ttlHours: this.EMAIL_CACHE_TTL / (60 * 60 * 1000),
      },
      responseCache: {
        count: this.responseCache.size,
        maxSize: this.MAX_RESPONSE_CACHE_SIZE,
        memoryMB: memoryUsage.responseCacheMB,
        ttlHours: this.RESPONSE_CACHE_TTL / (60 * 60 * 1000),
      },
      total: {
        memoryMB: memoryUsage.totalMB,
        recommendation: this.getCacheRecommendation(memoryUsage.totalMB),
      },
    };
  }

  /**
   * Get cache optimization recommendations
   */
  private getCacheRecommendation(totalMemoryMB: number): string {
    if (totalMemoryMB > 50) {
      return 'HIGH MEMORY USAGE - Consider Redis or reducing TTL';
    }
    if (totalMemoryMB > 20) {
      return 'MEDIUM MEMORY USAGE - Monitor and consider optimizations';
    }
    return 'OPTIMAL MEMORY USAGE - Current setup is efficient';
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): any {
    return {
      ...this.metrics,
      duplicateRate:
        this.metrics.processedEmails > 0
          ? (
              (this.metrics.duplicatesSkipped / this.metrics.processedEmails) *
              100
            ).toFixed(1) + '%'
          : '0%',
      cacheHitRate:
        this.metrics.claudeAICalls > 0
          ? (
              (this.metrics.cacheHits /
                (this.metrics.claudeAICalls + this.metrics.cacheHits)) *
              100
            ).toFixed(1) + '%'
          : '0%',
      cacheSize: this.responseCache.size,
      uptime: Math.floor((Date.now() - this.metrics.startTime) / 1000),
    };
  }

  /**
   * Log performance metrics periodically
   */
  private logPerformanceMetrics(): void {
    const metrics = this.getPerformanceMetrics();
    this.logger.log(`Performance Metrics:
  Uptime: ${metrics.uptime}s
  Processed Emails: ${metrics.processedEmails}
  claudeAI Calls: ${metrics.claudeAICalls}
  Cache Hits: ${metrics.cacheHits} (${metrics.cacheHitRate}% hit rate)
  Duplicates Skipped: ${metrics.duplicatesSkipped}
  Errors: ${metrics.errors}
  Avg Processing Time: ${metrics.averageProcessingTime}ms`);
  }

  /**
   * Get the current user count from database with caching
   */
  private async getUserCount(): Promise<number> {
    const now = Date.now();

    if (
      this.userCountCache &&
      now - this.userCountCache.timestamp < this.USER_COUNT_CACHE_TTL
    ) {
      return this.userCountCache.count;
    }

    try {
      const users = await this.userService.findAll();
      const userCount = users.length;

      this.userCountCache = {
        count: userCount,
        timestamp: now,
      };

      this.logger.log(`Updated user count cache: ${userCount} users`);
      return userCount;
    } catch (error) {
      this.logger.error(
        `Failed to get user count: ${error.message}. Using fallback of 100.`,
      );

      return 100;
    }
  }

  /**
   * Get the concurrent email processing limit (dynamically calculated from real user count)
   */
  public async getConcurrentEmailLimit(): Promise<number> {
    const userCount = await this.getUserCount();

    if (userCount <= 100) return 5;
    if (userCount <= 500) return 10;
    if (userCount <= 1000) return 15;
    if (userCount <= 5000) return 25;
    return 35;
  }

  /**
   * Get current performance status and recommendations (with real user count)
   */
  public async getPerformanceRecommendations(): Promise<any> {
    const userCount = await this.getUserCount();
    const currentLimit = await this.getConcurrentEmailLimit();
    const errorRate =
      this.metrics.errors / Math.max(this.metrics.processedEmails, 1);
    const avgLatency =
      this.metrics.totalProcessingTime /
      Math.max(this.metrics.processedEmails, 1);

    return {
      currentConfig: {
        userCount: userCount,
        concurrencyLimit: currentLimit,
        estimatedDailyEmails: userCount * 50,
        estimatedJobEmails: Math.floor(userCount * 50 * 0.2),
      },
      currentPerformance: {
        errorRate: (errorRate * 100).toFixed(2) + '%',
        avgLatency: Math.round(avgLatency) + 'ms',
        cacheHitRate: this.getPerformanceMetrics().cacheHitRate,
        status: this.getPerformanceStatus(errorRate, avgLatency),
      },
      recommendations: this.getScaleRecommendations(userCount),
      monitoring: {
        keyMetrics: [
          'Error rate < 5%',
          'Avg latency < 2000ms',
          'claudeAI calls < 900/min',
          'Cache hit rate > 50%',
        ],
      },
    };
  }

  private getPerformanceStatus(errorRate: number, avgLatency: number): string {
    if (errorRate > 0.05 || avgLatency > 2000)
      return 'POOR - Consider reducing concurrency';
    if (errorRate < 0.01 && avgLatency < 500)
      return 'EXCELLENT - Can increase concurrency';
    return 'GOOD - Current settings optimal';
  }

  private generatePreFilterDecision(preFilterResult: any): string {
    if (!preFilterResult.shouldProcess) {
      return `FILTERED: ${preFilterResult.reason} (Confidence: ${Math.round(preFilterResult.confidence * 100)}%)`;
    }
    return `PASSED: ${preFilterResult.reason} (Confidence: ${Math.round(preFilterResult.confidence * 100)}%)`;
  }

  private generateContentAnalysis(
    emailText: string,
    subject?: string,
    sender?: string,
  ): string {
    const analysis = [];

    if (emailText.length < 100) {
      analysis.push('Very short email');
    } else if (emailText.length > 2000) {
      analysis.push('Long/complex email');
    } else {
      analysis.push('Normal length');
    }

    const jobKeywords = [
      'candidature',
      'entretien',
      'interview',
      'recrutement',
      'recruitment',
      'poste',
      'position',
      'emploi',
      'job',
      'application',
    ];
    const foundKeywords = jobKeywords.filter((keyword) =>
      (emailText + ' ' + (subject || '')).toLowerCase().includes(keyword),
    );

    if (foundKeywords.length > 0) {
      analysis.push(`Job keywords: ${foundKeywords.join(', ')}`);
    } else {
      analysis.push('No job keywords detected');
    }

    if (sender?.includes('linkedin.com') || sender?.includes('indeed.com')) {
      analysis.push('Sender: Job platform');
    } else if (sender?.includes('no-reply') || sender?.includes('noreply')) {
      analysis.push('Sender: Automatic email');
    } else {
      analysis.push('Sender: Personal/company email');
    }

    return analysis.join(' | ');
  }

  private generateClaudeAIReasoning(
    extractedData: ExtractedJobDataDto | null,
    isComplex: boolean,
    existingJobs: ExistingJobComparisonDto[],
  ): string {
    if (!extractedData) {
      return 'Claude AI: Unable to extract valid data';
    }

    const reasoning = [];

    reasoning.push(`Analysis ${isComplex ? 'complex' : 'simple'}`);

    if (extractedData.company && extractedData.title) {
      reasoning.push(
        `Company: ${extractedData.company}, Position: ${extractedData.title}`,
      );
    }

    if (extractedData.status) {
      reasoning.push(`Status detected: ${extractedData.status}`);
    }

    if (existingJobs.length > 0) {
      reasoning.push(`Compared with ${existingJobs.length} existing jobs`);
    }

    return reasoning.join(' | ');
  }

  private async getExistingJobsForComparison(
    userId: string,
  ): Promise<ExistingJobComparisonDto[]> {
    try {
      const existingJobs = await this.jobApplyService.getAllJobApplies(userId);

      const jobsForComparison: ExistingJobComparisonDto[] = existingJobs
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 50)
        .map((job) => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location || null,
          status: job.status,
          contractType: job.contractType || null,
          createdAt: job.createdAt,
          similarity: 0,
          matchReason: '',
        }));

      this.logger.log(
        `Found ${jobsForComparison.length} existing jobs for user ${userId}`,
      );
      return jobsForComparison;
    } catch (error) {
      this.logger.warn(
        `Could not fetch existing jobs for user ${userId}: ${error.message}`,
      );
      return [];
    }
  }

  private async compareWithExistingJobs(
    parsedData: ExtractedJobDataDto,
    userId: string,
    existingJobs: ExistingJobComparisonDto[],
  ): Promise<{
    foundSimilar: boolean;
    similarJobs: Array<{
      id: string;
      title: string;
      company: string;
      similarity: number;
      action: 'updated' | 'created' | 'ignored';
    }>;
  }> {
    const similarJobs = [];

    this.logger.log(
      `Comparing new job "${parsedData.title}" at "${parsedData.company}" with ${existingJobs.length} existing jobs`,
    );

    for (const existingJob of existingJobs) {
      const similarity = this.calculateJobSimilarity(parsedData, existingJob);

      this.logger.log(
        `Similarity with "${existingJob.title}" at "${existingJob.company}": ${(similarity * 100).toFixed(1)}%`,
      );

      if (similarity > 0.75) {
        const companySimilarity = this.stringSimilarity(
          parsedData.company?.toLowerCase() || '',
          existingJob.company?.toLowerCase() || '',
        );

        if (companySimilarity < 0.5) {
          this.logger.log(
            `Rejecting match due to different companies: "${parsedData.company}" vs "${existingJob.company}" (${(companySimilarity * 100).toFixed(1)}% similar)`,
          );
          continue;
        }

        let action: 'updated' | 'created' | 'ignored' = 'ignored';
        if (similarity > 0.8) {
          try {
            const updateJobApply: UpdateJobApply = {
              location: parsedData.location,
              salary: parsedData.salary
                ? Number.parseInt(parsedData.salary)
                : undefined,
              status: parsedData.status,
              interviewDate:
                parsedData.interviewDate &&
                parsedData.interviewDate !== 'null' &&
                parsedData.interviewDate.trim() !== ''
                  ? new Date(parsedData.interviewDate)
                  : null,
              contractType: parsedData.contractType,
            };

            await this.jobApplyService.updateJobApplyByMail(
              existingJob.id,
              userId,
              updateJobApply,
            );
            action = 'updated';
            this.logger.log(
              `Updated existing job ${existingJob.id}: ${existingJob.title} at ${existingJob.company}`,
            );
          } catch (error) {
            this.logger.error(
              `Failed to update job ${existingJob.id}: ${error.message}`,
            );
          }
        }

        similarJobs.push({
          id: existingJob.id,
          title: existingJob.title,
          company: existingJob.company,
          similarity,
          action,
        });
      }
    }

    if (similarJobs.length === 0) {
      this.logger.log(
        `No similar jobs found. Creating new job for "${parsedData.title}" at "${parsedData.company}"`,
      );
    }

    return {
      foundSimilar: similarJobs.length > 0,
      similarJobs: similarJobs.sort((a, b) => b.similarity - a.similarity),
    };
  }

  private calculateJobSimilarity(
    parsedData: ExtractedJobDataDto,
    existingJob: ExistingJobComparisonDto,
  ): number {
    let score = 0;
    let maxScore = 0;

    maxScore += 0.5;
    if (parsedData.company && existingJob.company) {
      const companySimilarity = this.stringSimilarity(
        parsedData.company.toLowerCase(),
        existingJob.company.toLowerCase(),
      );
      score += companySimilarity * 0.5;
    }

    maxScore += 0.3;
    if (parsedData.title && existingJob.title) {
      const titleSimilarity = this.stringSimilarity(
        parsedData.title.toLowerCase(),
        existingJob.title.toLowerCase(),
      );
      score += titleSimilarity * 0.3;
    }

    maxScore += 0.1;
    if (parsedData.location && existingJob.location) {
      const locationSimilarity = this.stringSimilarity(
        parsedData.location.toLowerCase(),
        existingJob.location.toLowerCase(),
      );
      score += locationSimilarity * 0.1;
    } else if (!parsedData.location && !existingJob.location) {
      score += 0.1;
    }

    maxScore += 0.1;
    if (parsedData.contractType && existingJob.contractType) {
      if (parsedData.contractType === existingJob.contractType) {
        score += 0.1;
      }
    } else if (!parsedData.contractType && !existingJob.contractType) {
      score += 0.1;
    }

    const finalScore = maxScore > 0 ? score / maxScore : 0;

    this.logger.debug(
      `Similarity calculation: Company(${((score / maxScore) * 0.5 * 100).toFixed(1)}%) + Title(${((score / maxScore) * 0.3 * 100).toFixed(1)}%) = ${(finalScore * 100).toFixed(1)}%`,
    );

    return finalScore;
  }

  private stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    if (longer.length === 0) return 1;
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  private addAnalysisToHistory(analysis: EmailAnalysisResult): void {
    this.recentAnalyses.unshift(analysis);
    if (this.recentAnalyses.length > this.MAX_RECENT_ANALYSES) {
      this.recentAnalyses = this.recentAnalyses.slice(
        0,
        this.MAX_RECENT_ANALYSES,
      );
    }
  }

  getRecentAnalyses(limit: number = 10): EmailAnalysisResult[] {
    return this.recentAnalyses.slice(0, limit);
  }

  getDashboardStats(): any {
    const filterStats = this.preFilterService.getFilteringStats();
    const currentMetrics = this.getPerformanceMetrics();
    const totalCreated = this.recentAnalyses.filter(
      (a) => a.jobApplyId && !a.existingJobsComparison?.foundSimilar,
    ).length;
    const totalUpdated = this.recentAnalyses.filter(
      (a) => a.existingJobsComparison?.foundSimilar,
    ).length;
    return {
      totalEmailsProcessed: filterStats.totalEmails,
      emailsFilteredOut:
        filterStats.totalEmails - filterStats.processedByClaude,
      emailsProcessedByClaudeAI: filterStats.processedByClaude,
      jobApplicationsCreated: totalCreated,
      jobApplicationsUpdated: totalUpdated,
      filteringEfficiency: filterStats.filteringEfficiency,
      performanceMetrics: {
        averageProcessingTime:
          this.recentAnalyses.length > 0
            ? this.recentAnalyses.reduce(
                (sum, a) => sum + a.processingTime,
                0,
              ) / this.recentAnalyses.length
            : 0,
        claudeAICostSavings: filterStats.filteringEfficiency * 100,
        errorRate: currentMetrics.errorRate,
      },
      recentAnalyses: this.getRecentAnalyses(20),
    };
  }

  private getScaleRecommendations(userCount: number): any {
    if (userCount <= 100) {
      return {
        scale: 'Small',
        recommendation: 'Current limit of 5 is optimal',
        expectedPeak: '~5-25 emails/minute (no pre-filtering)',
      };
    }
    if (userCount <= 500) {
      return {
        scale: 'Medium',
        recommendation: 'Limit of 10 handles typical enterprise load',
        expectedPeak: '~25-125 emails/minute (no pre-filtering)',
      };
    }
    if (userCount <= 1000) {
      return {
        scale: 'Large',
        recommendation:
          'Limit of 15 is OPTIMAL for 1000 users - Monitor Claude AI usage',
        expectedPeak: '~50-250 emails/minute (no pre-filtering)',
        scenarios: {
          conservative: '15,000 emails/day (100% processed by AI)',
          moderate: '50,000 emails/day (100% processed by AI)',
          intensive: '125,000 emails/day (100% processed by AI)',
        },
      };
    }
    return {
      scale: 'Enterprise+',
      recommendation: `Limit of ${this.getConcurrentEmailLimit()} for high-volume AI processing`,
      expectedPeak: '250+ emails/minute (100% AI processed)',
    };
  }
}
