import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateJobApplyDto } from 'src/jobApply/dto/jobApply.dto';
import { JobApplyService } from 'src/jobApply/jobApply.service';
import { ApplicationStatus } from 'src/jobApply/enum/application-status.enum';
import { ExtractedJobDataDto } from './dto/extracted-job-data.dto';
import { convert } from 'html-to-text';
import {
  GmailMessage,
  GmailMessagePart,
  GmailHeader,
} from 'src/webhooks/mail/gmail.types';
import {
  JobApplyParams,
  UpdateJobApply,
} from 'src/jobApply/interface/jobApply.interface';
import { OutlookMessage } from 'src/webhooks/mail/outlook.types';
import { createHash } from 'crypto';
import { UserService } from 'src/user/user.service';
import Anthropic from '@anthropic-ai/sdk';

function extractJsonFromString(str: string): any | null {
  if (!str) {
    return null;
  }

  // Étape 1 : Essayer d'extraire le JSON d'un bloc markdown. C'est la méthode la plus fiable.
  // La regex est améliorée pour accepter ` ``` ` ou ` ```json `
  const match = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/);

  if (match && match[1]) {
    try {
      // On a trouvé un bloc, on essaie de parser son contenu.
      return JSON.parse(match[1]);
    } catch (e) {
      Logger.error(
        `A JSON markdown block was found, but its content is invalid: ${e.message}`,
        'MailFilterService-JSONUtil',
      );
      // Si le bloc trouvé est invalide, il est inutile de continuer.
      return null;
    }
  }

  // Étape 2 : Si aucun bloc markdown n'a été trouvé, essayer de parser la chaîne entière.
  // Utile si Claude retourne UNIQUEMENT l'objet JSON, sans le markdown.
  try {
    const parsed = JSON.parse(str);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
    // Le JSON est valide mais ce n'est pas un objet (ex: juste une chaîne "ok")
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
  private readonly claudeAI: Anthropic;

  // Deduplication system
  private processedEmails = new Set<string>();
  private readonly EMAIL_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  // Response caching system for claudeAI calls
  private responseCache = new Map<
    string,
    { response: ExtractedJobDataDto | null; timestamp: number }
  >();
  private readonly RESPONSE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

  // Pre-filtering configuration
  private readonly JOB_KEYWORDS = [
    // French keywords
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
    // English keywords
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

  // Performance metrics
  private metrics = {
    startTime: Date.now(),
    processedEmails: 0,
    preFilteredEmails: 0,
    claudeAICalls: 0,
    cacheHits: 0,
    duplicatesSkipped: 0,
    errors: 0,
    totalProcessingTime: 0,
  };

  // Concurrent processing configuration
  private readonly CONCURRENT_EMAIL_LIMIT = 5; // Shared limit for Gmail and Outlook

  // User count cache to avoid frequent DB calls
  private userCountCache: { count: number; timestamp: number } | null = null;
  private readonly USER_COUNT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  constructor(
    private readonly jobApplyService: JobApplyService,
    private readonly userService: UserService,
  ) {
    this.claudeAI = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Clean up processed emails cache every 20 minutes
    setInterval(
      () => {
        this.processedEmails.clear();
        this.cleanupResponseCache();
        this.logger.log('Cleared email deduplication cache');
        this.logMetrics();
      },
      20 * 60 * 1000,
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
    // Normalize text for better cache hits
    const normalizedText = emailText
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .substring(0, 500); // Use first 500 chars for similarity

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
        preFilterEfficiency:
          this.metrics.processedEmails > 0
            ? (
                (this.metrics.preFilteredEmails /
                  this.metrics.processedEmails) *
                100
              ).toFixed(1) + '%'
            : '0%',
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
  ): string {
    const content = `${userId}|${emailSubject || ''}|${emailSender || ''}|${emailText}`;
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Check if email has already been processed recently
   */
  private isEmailAlreadyProcessed(emailHash: string): boolean {
    return this.processedEmails.has(emailHash);
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
          { selector: 'img', format: 'skip' },
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
   * Pre-filter emails to identify job-related content
   */
  private isJobRelatedEmail(
    emailText: string,
    emailSubject?: string,
    emailSender?: string,
  ): { isJobRelated: boolean; confidence: number; reason: string } {
    const startTime = Date.now();
    let score = 0;
    const reasons: string[] = [];

    // Check sender domain
    if (emailSender) {
      const domain = emailSender.match(/@([^>]+)/)?.[1]?.toLowerCase();
      if (
        domain &&
        this.JOB_DOMAINS.some((jobDomain) => domain.includes(jobDomain))
      ) {
        score += 30;
        reasons.push('job-domain');
      }
    }

    // Check subject line
    const subject = (emailSubject || '').toLowerCase();
    const subjectKeywords = this.JOB_KEYWORDS.filter((keyword) =>
      subject.includes(keyword.toLowerCase()),
    );
    if (subjectKeywords.length > 0) {
      score += subjectKeywords.length * 15;
      reasons.push(`subject-keywords: ${subjectKeywords.join(',')}`);
    }

    // Check email content
    const content = emailText.toLowerCase();
    const contentKeywords = this.JOB_KEYWORDS.filter((keyword) =>
      content.includes(keyword.toLowerCase()),
    );
    if (contentKeywords.length > 0) {
      score += contentKeywords.length * 5;
      reasons.push(
        `content-keywords: ${contentKeywords.slice(0, 5).join(',')}`,
      );
    }

    // Check for negative indicators
    const negativeIndicators = this.NEGATIVE_INDICATORS.filter(
      (indicator) =>
        content.includes(indicator.toLowerCase()) ||
        subject.includes(indicator.toLowerCase()),
    );
    if (negativeIndicators.length > 0) {
      score -= negativeIndicators.length * 20;
      reasons.push(`negative: ${negativeIndicators.join(',')}`);
    }

    // Additional patterns
    if (content.includes('candidat') && content.includes('poste')) score += 10;
    if (content.includes('entretien') && content.includes('date')) score += 15;
    if (content.includes('offer') && content.includes('position')) score += 10;
    if (content.includes('interview') && content.includes('schedule'))
      score += 15;

    const confidence = Math.max(0, Math.min(100, score));
    const isJobRelated = confidence >= 20; // Threshold for job-related emails

    const processingTime = Date.now() - startTime;

    this.logger.log(
      `Pre-filter result: ${isJobRelated ? 'JOB' : 'NOT_JOB'} (${confidence}%) in ${processingTime}ms - ${reasons.join(', ')}`,
    );

    return {
      isJobRelated,
      confidence,
      reason: reasons.join(', '),
    };
  }

  /**
   * Generate optimized prompt based on email content length and complexity
   */
  private generateOptimizedPrompt(
    emailText: string,
    isComplex: boolean = false,
  ): string {
    const basePrompt = `Tu es un assistant expert en recrutement et en analyse d'emails de candidature.
**PREMIÈRE VALIDATION OBLIGATOIRE** : Vérifie que le contenu est bien lié au recrutement/candidature. Si ce n'est pas le cas, renvoie null.

Extraire des informations d'un email de candidature au format JSON :
{
  "company": "Nom de l'entreprise (string, obligatoire)",
  "title": "Intitulé du poste (string, obligatoire)",
  "location": "Lieu du poste (string, optionnel)",
  "salary": "Salaire (string, optionnel)",
  "contractType": "EXCLUSIVEMENT une de ces 5 valeurs: 'Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance', ou null",
  "status": "Statut parmi (${Object.values(ApplicationStatus).join(', ')})",
  "interviewDate": "Date d'entretien au format ISO 8601 (optionnel)"
}

**RÈGLES STRICTES** :
- Si pas de recrutement → renvoie null
- Informations en anglais pour title et contractType
- Ne pas inventer de données manquantes
- Company, title, status sont OBLIGATOIRES`;

    if (isComplex) {
      return (
        basePrompt +
        `
**ANALYSE APPROFONDIE** : Email complexe détecté. Analyse attentivement tout le contexte.`
      );
    }

    return (
      basePrompt +
      `
**ANALYSE RAPIDE** : Email simple détecté. Extraction directe des informations principales.`
    );
  }

  /**
   * Determine if email content is complex and needs detailed analysis
   */
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

    // Pre-filtering check
    const preFilterResult = this.isJobRelatedEmail(bodyText, subject, sender);
    if (!preFilterResult.isJobRelated) {
      this.metrics.preFilteredEmails++;
      this.logger.log(
        `Gmail email pre-filtered out (confidence: ${preFilterResult.confidence}%): ${preFilterResult.reason}. Subject: "${subject}"`,
      );
      return `Email filtered out - not job related (confidence: ${preFilterResult.confidence}%)`;
    }

    // Generate hash for deduplication
    const emailHash = this.generateEmailHash(bodyText, userId, subject, sender);

    // Check if email was already processed
    if (this.isEmailAlreadyProcessed(emailHash)) {
      this.metrics.duplicatesSkipped++;
      this.logger.warn(
        `Skipping already processed Gmail email. Subject: "${subject}", Sender: "${sender}", MessageId: ${gmailMessage.id}`,
      );
      return 'Email already processed - skipped';
    }

    // Mark as being processed
    this.markEmailAsProcessed(emailHash);

    try {
      const result = await this.processEmailWithExtractedData(
        bodyText,
        userId,
        subject,
        sender,
        preFilterResult.confidence,
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
    confidence?: number,
  ): Promise<string> {
    this.logger.log(
      `Processing email for user ${userId}. Subject: "${emailSubject}", Sender: "${emailSender}", Confidence: ${confidence}%`,
    );

    let emailContext = `Email Body:\n${emailText}\n`;
    if (emailSubject) {
      emailContext += `\nEmail Subject: ${emailSubject}\n`;
    }
    if (emailSender) {
      emailContext += `\nEmail Sender: ${emailSender}\n`;
    }

    try {
      const isComplex = this.isComplexEmail(emailText);
      const optimizedPrompt = this.generateOptimizedPrompt(
        emailText,
        isComplex,
      );

      // Check cache first
      const cacheKey = this.generateCacheKey(emailText, emailSubject);
      const cachedResponse = this.getCachedResponse(cacheKey);

      let parsedData: ExtractedJobDataDto | null = null;

      if (cachedResponse) {
        this.logger.log(`Using cached response for similar email`);
        parsedData = cachedResponse;
      } else {
        // Make claudeAI call with fallback mechanism
        parsedData = await this.callclaudeAIWithFallback(
          optimizedPrompt,
          emailContext,
          isComplex,
        );

        // Cache the response
        if (parsedData) {
          this.setCachedResponse(cacheKey, parsedData);
        }
      }

      if (!parsedData) {
        this.logger.error(
          'Failed to get valid response from claudeAI or cache.',
        );
        return 'Erreur lors du parsing du JSON de la réponse claudeAI.';
      } else if (!parsedData.title || !parsedData.company) {
        this.logger.warn(
          `Didn't create jobApply for this mail: ${emailSender + ' ' + emailSubject}`,
        );
        return 'Email analyzed but no valid job application data found';
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

      const jobApplyParam: JobApplyParams = {
        title: parsedData.title,
        company: parsedData.company,
        contractType: parsedData.contractType
          ? parsedData.contractType
          : undefined,
        location: parsedData.location ? parsedData.location : undefined,
      };

      // Enhanced logging for duplicate detection debugging
      this.logger.log(
        `Checking for duplicates with params: ${JSON.stringify(jobApplyParam)}`,
      );

      const existingJobApply = await this.jobApplyService.getJobApplyByParam(
        userId,
        jobApplyParam,
      );

      if (existingJobApply) {
        this.logger.warn(
          `Job apply already exists for user ${userId} with title ${parsedData.title} and company ${parsedData.company}. Updating status.`,
        );
        this.logger.log(
          `Existing job apply details: ${JSON.stringify({
            id: existingJobApply.id,
            title: existingJobApply.title,
            company: existingJobApply.company,
            contractType: existingJobApply.contractType,
            location: existingJobApply.location,
          })}`,
        );

        const updateJobApply: UpdateJobApply = {
          location: parsedData.location,
          salary: Number.parseInt(parsedData.salary),
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
          existingJobApply.id,
          userId,
          updateJobApply,
        );
        return existingJobApply.id;
      }

      this.logger.log(
        `No existing job apply found. Creating new one with params: ${JSON.stringify(jobApplyParam)}`,
      );

      return this.createJobApply(parsedData, userId);
    } catch (error) {
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
  private async callclaudeAIWithFallback(
    prompt: string,
    emailContext: string,
    isComplex: boolean,
    retryCount: number = 0,
  ): Promise<ExtractedJobDataDto | null> {
    const maxRetries = 2;

    try {
      this.metrics.claudeAICalls++;

      const response = await this.claudeAI.messages.create({
        model: 'claude-sonnet-4-20250514',
        system: prompt,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: emailContext,
              },
            ],
          },
        ],
        temperature: 1,
        max_tokens: isComplex ? 1000 : 600,
      });

      const rawResponse = response.content[0];
      if (!rawResponse) {
        throw new Error('ClaudeAI returned an empty response.');
      }

      if (rawResponse.type !== 'text') {
        throw new Error(
          `ClaudeAI returned an unexpected content block type: ${rawResponse.type}`,
        );
      }

      const parsedData: ExtractedJobDataDto | null = extractJsonFromString(
        rawResponse.text,
      );

      return parsedData;
    } catch (error) {
      this.logger.warn(
        `claudeAI call failed (attempt ${retryCount + 1}): ${error.message}`,
      );

      if (retryCount < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.callclaudeAIWithFallback(
          prompt,
          emailContext,
          isComplex,
          retryCount + 1,
        );
      }

      // If all retries failed, try with simpler prompt
      if (isComplex && retryCount >= maxRetries) {
        this.logger.log('Retrying with simplified prompt for complex email');
        const simplifiedPrompt = this.generateOptimizedPrompt(
          emailContext.substring(0, 1000),
          false,
        );
        return this.callclaudeAIWithFallback(
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

    // Extract text content from Outlook message body
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

    // Pre-filtering check
    const preFilterResult = this.isJobRelatedEmail(bodyText, subject, sender);
    if (!preFilterResult.isJobRelated) {
      this.metrics.preFilteredEmails++;
      this.logger.log(
        `Outlook email pre-filtered out (confidence: ${preFilterResult.confidence}%): ${preFilterResult.reason}. Subject: "${subject}"`,
      );
      return `Email filtered out - not job related (confidence: ${preFilterResult.confidence}%)`;
    }

    // Generate hash for deduplication
    const emailHash = this.generateEmailHash(bodyText, userId, subject, sender);

    // Check if email was already processed
    if (this.isEmailAlreadyProcessed(emailHash)) {
      this.metrics.duplicatesSkipped++;
      this.logger.warn(
        `Skipping already processed Outlook email. Subject: "${subject}", Sender: "${sender}", MessageId: ${outlookMessage.id}`,
      );
      return 'Email already processed - skipped';
    }

    // Mark as being processed
    this.markEmailAsProcessed(emailHash);

    try {
      const result = await this.processEmailWithExtractedData(
        bodyText,
        userId,
        subject,
        sender,
        preFilterResult.confidence,
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

    // If HTML content, convert to plain text
    if (outlookMessage.body.contentType === 'html') {
      content = convert(content, {
        wordwrap: false,
        selectors: [
          { selector: 'a', options: { ignoreHref: true } },
          { selector: 'img', format: 'skip' },
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
    // Start cache cleanup every 20 minutes
    setInterval(
      () => {
        this.performCacheCleanup();
      },
      20 * 60 * 1000,
    );

    // Log performance metrics every 30 minutes
    setInterval(
      () => {
        this.logPerformanceMetrics();
      },
      30 * 60 * 1000,
    );

    this.logger.log(
      'MailFilter Service initialized with optimizations enabled',
    );
    this.logger.log(
      `Pre-filter enabled with ${this.JOB_KEYWORDS.length} keywords and ${this.JOB_DOMAINS.length} domains`,
    );
  }

  /**
   * Cleanup method to clear expired entries from cache and processed emails
   */
  private performCacheCleanup(): void {
    const now = Date.now();

    // Clear expired processed emails
    const expiredProcessedEmails = [];
    for (const email of this.processedEmails) {
      const [hash, timestamp] = email.split(':');
      if (now - parseInt(timestamp) > this.EMAIL_CACHE_TTL) {
        expiredProcessedEmails.push(email);
      }
    }
    expiredProcessedEmails.forEach((email) =>
      this.processedEmails.delete(email),
    );

    // Clear expired cache entries
    const expiredCacheKeys = [];
    for (const [key, entry] of this.responseCache.entries()) {
      if (now - entry.timestamp > this.RESPONSE_CACHE_TTL) {
        expiredCacheKeys.push(key);
      }
    }
    expiredCacheKeys.forEach((key) => this.responseCache.delete(key));

    if (expiredProcessedEmails.length > 0 || expiredCacheKeys.length > 0) {
      this.logger.log(
        `Cache cleanup: Removed ${expiredProcessedEmails.length} processed emails and ${expiredCacheKeys.length} cached responses`,
      );
    }
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): any {
    return {
      ...this.metrics,
      preFilterEfficiency:
        this.metrics.processedEmails > 0
          ? (
              (this.metrics.preFilteredEmails / this.metrics.processedEmails) *
              100
            ).toFixed(1) + '%'
          : '0%',
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
  Pre-filtered Emails: ${metrics.preFilteredEmails}
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

    // Check if we have a valid cached count
    if (
      this.userCountCache &&
      now - this.userCountCache.timestamp < this.USER_COUNT_CACHE_TTL
    ) {
      return this.userCountCache.count;
    }

    try {
      // Fetch all users from database
      const users = await this.userService.findAll();
      const userCount = users.length;

      // Cache the result
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
      // Fallback to a conservative estimate
      return 100;
    }
  }

  /**
   * Get the concurrent email processing limit (dynamically calculated from real user count)
   */
  public async getConcurrentEmailLimit(): Promise<number> {
    // Get actual user count from database
    const userCount = await this.getUserCount();

    // Calculate optimal limit based on actual user scale
    if (userCount <= 100) return 5; // Small scale: 5 concurrent
    if (userCount <= 500) return 10; // Medium scale: 10 concurrent
    if (userCount <= 1000) return 15; // Large scale: 15 concurrent (RECOMMANDÉ pour 1000 users)
    if (userCount <= 5000) return 25; // Enterprise: 25 concurrent
    return 35; // Massive scale: 35 concurrent
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
        userCount: userCount, // Real user count from DB
        concurrencyLimit: currentLimit,
        estimatedDailyEmails: userCount * 50, // estimation moyenne
        estimatedJobEmails: Math.floor(userCount * 50 * 0.2), // 20% job-related
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

  private getScaleRecommendations(userCount: number): any {
    if (userCount <= 100) {
      return {
        scale: 'Small',
        recommendation: 'Current limit of 5 is optimal',
        expectedPeak: '~2-10 emails/minute',
      };
    }
    if (userCount <= 500) {
      return {
        scale: 'Medium',
        recommendation: 'Limit of 10 handles typical enterprise load',
        expectedPeak: '~10-50 emails/minute',
      };
    }
    if (userCount <= 1000) {
      return {
        scale: 'Large',
        recommendation:
          'Limit of 15 is OPTIMAL for 1000 users - Monitor and adjust',
        expectedPeak: '~20-100 emails/minute',
        scenarios: {
          conservative: '3,000 emails/day (20 emails/user, 15% job-related)',
          moderate: '10,000 emails/day (50 emails/user, 20% job-related)',
          intensive: '25,000 emails/day (100 emails/user, 25% job-related)',
        },
      };
    }
    return {
      scale: 'Enterprise+',
      recommendation: `Limit of ${this.getConcurrentEmailLimit()} for high-volume processing`,
      expectedPeak: '100+ emails/minute',
    };
  }
}
