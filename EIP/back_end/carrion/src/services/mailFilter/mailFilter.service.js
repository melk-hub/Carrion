"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailFilterService = void 0;
var common_1 = require("@nestjs/common");
var application_status_enum_1 = require("../../jobApply/enum/application-status.enum");
var html_to_text_1 = require("html-to-text");
var crypto_1 = require("crypto");
var sdk_1 = require("@anthropic-ai/sdk");
function extractJsonFromString(str) {
    if (!str) {
        return null;
    }
    // Étape 1 : Essayer d'extraire le JSON d'un bloc markdown. C'est la méthode la plus fiable.
    // La regex est améliorée pour accepter ` ``` ` ou ` ```json `
    var match = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
        try {
            // On a trouvé un bloc, on essaie de parser son contenu.
            return JSON.parse(match[1]);
        }
        catch (e) {
            common_1.Logger.error("A JSON markdown block was found, but its content is invalid: ".concat(e.message), 'MailFilterService-JSONUtil');
            // Si le bloc trouvé est invalide, il est inutile de continuer.
            return null;
        }
    }
    // Étape 2 : Si aucun bloc markdown n'a été trouvé, essayer de parser la chaîne entière.
    // Utile si Claude retourne UNIQUEMENT l'objet JSON, sans le markdown.
    try {
        var parsed = JSON.parse(str);
        if (typeof parsed === 'object' && parsed !== null) {
            return parsed;
        }
        // Le JSON est valide mais ce n'est pas un objet (ex: juste une chaîne "ok")
        common_1.Logger.warn("The string was parsed as valid JSON, but it is not an object.", 'MailFilterService-JSONUtil');
        return null;
    }
    catch (e) {
        common_1.Logger.error("The string could not be parsed as valid JSON: ".concat(e.message), 'MailFilterService-JSONUtil');
        return null;
    }
}
var MailFilterService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var MailFilterService = _classThis = /** @class */ (function () {
        function MailFilterService_1(jobApplyService, userService, preFilterService, prisma) {
            var _this = this;
            this.jobApplyService = jobApplyService;
            this.userService = userService;
            this.preFilterService = preFilterService;
            this.prisma = prisma;
            this.logger = new common_1.Logger(MailFilterService.name);
            // Deduplication system with improved scalability
            this.processedEmails = new Set();
            this.EMAIL_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours (prevent reprocessing same day)
            this.MAX_CACHE_SIZE = 15000; // Limit cache size for memory control
            // Response caching system for claudeAI calls
            this.responseCache = new Map();
            this.RESPONSE_CACHE_TTL = 60 * 60 * 1000; // 1 hour
            this.MAX_RESPONSE_CACHE_SIZE = 1000; // Limit response cache size
            // Pre-filtering configuration
            this.JOB_KEYWORDS = [
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
            this.JOB_DOMAINS = [
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
            this.NEGATIVE_INDICATORS = [
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
            this.metrics = {
                startTime: Date.now(),
                processedEmails: 0,
                claudeAICalls: 0,
                cacheHits: 0,
                duplicatesSkipped: 0,
                errors: 0,
                totalProcessingTime: 0,
            };
            // Concurrent processing configuration
            this.CONCURRENT_EMAIL_LIMIT = 5; // Shared limit for Gmail and Outlook
            // User count cache to avoid frequent DB calls
            this.userCountCache = null;
            this.USER_COUNT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
            // Stockage analyses pour dashboard
            this.recentAnalyses = [];
            this.MAX_RECENT_ANALYSES = 100;
            this.claudeAI = new sdk_1.default({
                apiKey: process.env.ANTHROPIC_API_KEY,
            });
            // Clean up processed emails cache every 6 hours (instead of clearing completely)
            setInterval(function () {
                _this.performCacheCleanup(); // Use smart cleanup instead of clearing everything
                _this.cleanupResponseCache();
                _this.logger.log('Performed smart email deduplication cache cleanup');
                _this.logMetrics();
            }, 6 * 60 * 60 * 1000);
        }
        /**
         * Clean up expired cache entries
         */
        MailFilterService_1.prototype.cleanupResponseCache = function () {
            var now = Date.now();
            var removedCount = 0;
            for (var _i = 0, _a = this.responseCache.entries(); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], value = _b[1];
                if (now - value.timestamp > this.RESPONSE_CACHE_TTL) {
                    this.responseCache.delete(key);
                    removedCount++;
                }
            }
            this.logger.log("Cleaned up ".concat(removedCount, " expired cache entries. Cache size: ").concat(this.responseCache.size));
        };
        /**
         * Generate cache key for similar emails
         */
        MailFilterService_1.prototype.generateCacheKey = function (emailText, emailSubject) {
            // Normalize text for better cache hits
            var normalizedText = emailText
                .toLowerCase()
                .replace(/\s+/g, ' ')
                .replace(/[^\w\s]/g, '')
                .substring(0, 500); // Use first 500 chars for similarity
            var normalizedSubject = (emailSubject || '')
                .toLowerCase()
                .replace(/\s+/g, ' ')
                .replace(/[^\w\s]/g, '');
            return (0, crypto_1.createHash)('md5')
                .update("".concat(normalizedSubject, "|").concat(normalizedText))
                .digest('hex');
        };
        /**
         * Get cached response if available
         */
        MailFilterService_1.prototype.getCachedResponse = function (cacheKey) {
            var cached = this.responseCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.RESPONSE_CACHE_TTL) {
                this.metrics.cacheHits++;
                this.logger.log("Cache hit for key: ".concat(cacheKey.substring(0, 8), "..."));
                return cached.response;
            }
            return null;
        };
        /**
         * Store response in cache
         */
        MailFilterService_1.prototype.setCachedResponse = function (cacheKey, response) {
            this.responseCache.set(cacheKey, {
                response: response,
                timestamp: Date.now(),
            });
        };
        /**
         * Log performance metrics
         */
        MailFilterService_1.prototype.logMetrics = function () {
            this.logger.log('MailFilter Performance Metrics:', JSON.stringify(__assign(__assign({}, this.metrics), { duplicateRate: this.metrics.processedEmails > 0
                    ? ((this.metrics.duplicatesSkipped /
                        this.metrics.processedEmails) *
                        100).toFixed(1) + '%'
                    : '0%', cacheHitRate: this.metrics.claudeAICalls > 0
                    ? ((this.metrics.cacheHits /
                        (this.metrics.claudeAICalls + this.metrics.cacheHits)) *
                        100).toFixed(1) + '%'
                    : '0%', cacheSize: this.responseCache.size })));
        };
        /**
         * Generate a unique hash for email content to detect duplicates
         */
        MailFilterService_1.prototype.generateEmailHash = function (emailText, userId, emailSubject, emailSender, messageId) {
            // Create stable hash based on message ID + user + subject (ignore content changes from Gmail formatting)
            var stableContent = "".concat(userId, "|").concat(emailSubject || '', "|").concat(emailSender || '', "|").concat(messageId || 'no-msg-id');
            var hash = (0, crypto_1.createHash)('sha256').update(stableContent).digest('hex');
            // Add timestamp for TTL tracking
            var timestampedHash = "".concat(hash, ":").concat(Date.now());
            return timestampedHash;
        };
        /**
         * Check if email has already been processed recently
         */
        MailFilterService_1.prototype.isEmailAlreadyProcessed = function (emailHash) {
            // Extract base hash without timestamp for checking
            var baseHash = emailHash.split(':')[0];
            // Check if any variant of this email was already processed
            for (var _i = 0, _a = this.processedEmails; _i < _a.length; _i++) {
                var processedHash = _a[_i];
                var processedBaseHash = processedHash.split(':')[0];
                if (processedBaseHash === baseHash) {
                    this.logger.debug("Found duplicate email with base hash: ".concat(baseHash.substring(0, 12), "..."));
                    return true;
                }
            }
            return false;
        };
        /**
         * Mark email as processed
         */
        MailFilterService_1.prototype.markEmailAsProcessed = function (emailHash) {
            this.processedEmails.add(emailHash);
        };
        MailFilterService_1.prototype.decodeBase64Url = function (encoded) {
            if (!encoded)
                return '';
            var base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) {
                base64 += '=';
            }
            try {
                return Buffer.from(base64, 'base64').toString('utf-8');
            }
            catch (error) {
                this.logger.error('Failed to decode Base64URL string:', error);
                return "[Decoding error:: ".concat(encoded.substring(0, 20), "...]");
            }
        };
        MailFilterService_1.prototype.getHeaderValue = function (headers, name) {
            if (!headers)
                return undefined;
            var header = headers.find(function (h) { return h.name.toLowerCase() === name.toLowerCase(); });
            return header ? header.value : undefined;
        };
        MailFilterService_1.prototype.extractTextFromGmailPart = function (part) {
            var _a, _b;
            var textContent = '';
            if (part.mimeType === 'text/plain' && ((_a = part.body) === null || _a === void 0 ? void 0 : _a.data)) {
                textContent = this.decodeBase64Url(part.body.data);
            }
            else if (part.mimeType === 'text/html' && ((_b = part.body) === null || _b === void 0 ? void 0 : _b.data)) {
                var htmlContent = this.decodeBase64Url(part.body.data);
                textContent = (0, html_to_text_1.convert)(htmlContent, {
                    wordwrap: false,
                    selectors: [
                        { selector: 'a', options: { ignoreHref: true } },
                        { selector: 'img', format: 'skip' },
                    ],
                });
            }
            else if (part.mimeType.startsWith('multipart/') && part.parts) {
                if (part.mimeType === 'multipart/alternative') {
                    var plainPart = part.parts.find(function (p) { return p.mimeType === 'text/plain'; });
                    if (plainPart)
                        return this.extractTextFromGmailPart(plainPart);
                    var htmlPart = part.parts.find(function (p) { return p.mimeType === 'text/html'; });
                    if (htmlPart)
                        return this.extractTextFromGmailPart(htmlPart);
                }
                for (var _i = 0, _c = part.parts; _i < _c.length; _i++) {
                    var subPart = _c[_i];
                    var contentDisposition = this.getHeaderValue(subPart.headers, 'Content-Disposition');
                    if (subPart.filename ||
                        (contentDisposition && contentDisposition.startsWith('attachment'))) {
                        continue;
                    }
                    var subPartText = this.extractTextFromGmailPart(subPart);
                    if (subPartText) {
                        textContent += subPartText + '\n\n';
                    }
                }
            }
            return textContent.trim();
        };
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
          // Pre-filtering logic removed - all emails will be processed
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
        MailFilterService_1.prototype.generateOptimizedPrompt = function (emailText, isComplex, existingJobs) {
            if (isComplex === void 0) { isComplex = false; }
            if (existingJobs === void 0) { existingJobs = []; }
            var existingJobsContext = existingJobs.length > 0
                ? "\n\n## USER'S EXISTING JOBS\nTo improve accuracy, here are the user's existing applications:\n".concat(existingJobs.map(function (job) { return "- ".concat(job.title, " at ").concat(job.company, " (").concat(job.status, ")"); }).join('\n'), "\n\nUse this information to:\n- Detect potential duplicates\n- Improve company name consistency\n- Identify status updates")
                : '';
            var basePrompt = "You are an expert in recruitment email analysis with 10 years of experience. You extract job application information with precision.\n\n## MANDATORY PRELIMINARY VALIDATION\nSTEP 1: Verify that the email concerns recruitment/job application\n- If NON-RECRUITMENT \u2192 return exactly: null\n- If UNCERTAIN \u2192 return exactly: null  \n- If RECRUITMENT \u2192 continue analysis\n\n## RECRUITMENT EMAIL TYPES TO PROCESS\nApplication confirmation\nInterview invitation\nJob offer/proposal\nApplication rejection  \nRequest for additional documents\nPost-interview feedback\nInternship/apprenticeship proposal\n\n## EMAIL TYPES TO EXCLUDE\nGeneric job newsletters\nTraining/coaching advertisements\nTechnical emails (password, etc.)\nCommercial/marketing emails\nEvent/webinar confirmations\nCommercial prospecting emails".concat(existingJobsContext, "\n\n## STRICT OUTPUT FORMAT - CRITICAL\nYou must return ONLY a valid JSON object in a markdown block. NO text before or after!\n\nEXPECTED FORMAT EXAMPLE:\n```json\n{\n  \"company\": \"string\",\n  \"title\": \"string\", \n  \"location\": \"string|null\",\n  \"salary\": \"string|null\",\n  \"contractType\": \"Full-time|Part-time|Internship|Contract|Freelance|null\",\n  \"status\": \"PENDING|APPLIED|INTERVIEW_SCHEDULED|TECHNICAL_TEST|OFFER_RECEIVED|NEGOTIATION|OFFER_ACCEPTED|REJECTED_BY_COMPANY|OFFER_DECLINED|APPLICATION_WITHDRAWN\",\n  \"interviewDate\": \"YYYY-MM-DDTHH:mm:ss.sssZ|null\",\n  \"offerReference\": \"string|null\"\n}\n```\n\nFORBIDDEN: Explanatory text, markdown titles (##), comments\nFORBIDDEN: \"## VALIDATION\", \"## ANALYSIS\", etc.\nMANDATORY: Only the JSON markdown block above\n\n## STRICT EXTRACTION RULES\n\n### Company (MANDATORY)\n- Exact company name (not department/subsidiary)\n- If email signature \u2192 use company name from signature\n- If email domain \u2192 extract company name from domain\n- Examples: \"Carrion Corp\", \"Google\", \"BNP Paribas\"\n\n### Title (MANDATORY)  \n- Exact job title in English\n- No obscure abbreviations\n- Examples: \"Software Developer\", \"Marketing Manager\", \"Data Scientist\"\n\n### Status (MANDATORY - BUSINESS LOGIC)\n- **PENDING**: Application received, awaiting response\n- **APPLIED**: Application already sent\n- **INTERVIEW_SCHEDULED**: Interview invitation / appointment scheduled \n- **TECHNICAL_TEST**: Technical test\n- **OFFER_RECEIVED**: Offer received\n- **NEGOTIATION**: Negotiation\n- **OFFER_ACCEPTED**: Offer accepted / firm proposal / application retained\n- **REJECTED_BY_COMPANY**: Explicit rejection by company\n- **OFFER_DECLINED**: Explicit application refusal\n- **APPLICATION_WITHDRAWN**: Application withdrawn\n\n### ContractType (Strict normalization)\n- **Full-time**: CDI, full-time, permanent\n- **Part-time**: Part-time, partial CDI  \n- **Internship**: Internship, apprenticeship\n- **Contract**: CDD, temporary mission, freelance project\n- **Freelance**: Consultant, self-employed, freelance\n- **null**: If type not mentioned\n\n### Salary (Uniform format)\n- Keep currency and period: \"45000 EUR/year\", \"2500 EUR/month\"  \n- Ranges: \"40000-50000 EUR/year\"\n- null if not mentioned\n\n### InterviewDate (Strict ISO format)\n- Format: \"2024-03-15T14:30:00.000Z\"\n- null if no precise date\n- Extract time if mentioned\n\n### Location (Geographic normalization)\n- Format: \"City, Country\" or \"City, Region, Country\"\n- Examples: \"Paris, France\", \"Remote\", \"Lyon, Auvergne-Rh\u00F4ne-Alpes, France\"\n- null if remote work not specified\n\n## FINAL VALIDATION\nBefore returning JSON:\n1. company AND title are non-null and non-empty\n2. status is in allowed enum  \n3. contractType is in allowed enum or null\n4. interviewDate is valid ISO 8601 or null\n5. JSON is syntactically correct\n\nIf validation fails \u2192 return null\n\n## SPECIFIC INSTRUCTIONS\n- DO NOT invent missing information\n- DO NOT hallucinate data  \n- ALWAYS prefer null if uncertain\n- RESPECT exactly the requested JSON format\n- INCLUDE JSON quotes and commas");
            if (isComplex) {
                return (basePrompt +
                    "\n\n**ANALYSE APPROFONDIE** : Email complexe d\u00E9tect\u00E9. Analyse attentivement tout le contexte et les nuances.");
            }
            return (basePrompt +
                "\n\n**ANALYSE RAPIDE** : Email simple d\u00E9tect\u00E9. Extraction directe des informations principales.");
        };
        MailFilterService_1.prototype.isComplexEmail = function (emailText) {
            var indicators = [
                emailText.length > 2000,
                (emailText.match(/\n/g) || []).length > 20,
                emailText.includes('thread') || emailText.includes('conversation'),
                emailText.includes('RE:') || emailText.includes('FW:'),
                (emailText.match(/[.!?]/g) || []).length > 10,
            ];
            return indicators.filter(Boolean).length >= 2;
        };
        MailFilterService_1.prototype.processEmailAndCreateJobApplyFromGmail = function (gmailMessage, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var startTime, subject, sender, bodyText, emailHash, result, processingTime, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            startTime = Date.now();
                            this.metrics.processedEmails++;
                            if (!gmailMessage || !gmailMessage.payload) {
                                this.metrics.errors++;
                                this.logger.error('Received invalid or empty gmailMessage object');
                                throw new common_1.BadRequestException('Invalid email data provided.');
                            }
                            subject = this.getHeaderValue(gmailMessage.payload.headers, 'Subject');
                            sender = this.getHeaderValue(gmailMessage.payload.headers, 'From');
                            bodyText = this.extractTextFromGmailPart(gmailMessage.payload);
                            if (!bodyText && gmailMessage.snippet) {
                                this.logger.warn("No main body extracted for message ".concat(gmailMessage.id, ", using snippet."));
                                bodyText = gmailMessage.snippet;
                            }
                            if (!bodyText) {
                                this.metrics.errors++;
                                this.logger.error("Could not extract text body for message ".concat(gmailMessage.id));
                                throw new common_1.BadRequestException('Could not extract readable text from the email.');
                            }
                            this.logger.log("Processing Gmail email. Subject: \"".concat(subject, "\", Sender: \"").concat(sender, "\""));
                            emailHash = this.generateEmailHash(bodyText, userId, subject, sender, gmailMessage.id);
                            // Check if email was already processed
                            if (this.isEmailAlreadyProcessed(emailHash)) {
                                this.metrics.duplicatesSkipped++;
                                this.logger.warn("Skipping already processed Gmail email. Subject: \"".concat(subject, "\", Sender: \"").concat(sender, "\", MessageId: ").concat(gmailMessage.id));
                                return [2 /*return*/, 'Email already processed - skipped'];
                            }
                            // Mark as being processed
                            this.markEmailAsProcessed(emailHash);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.processEmailWithExtractedData(bodyText, userId, subject, sender)];
                        case 2:
                            result = _a.sent();
                            processingTime = Date.now() - startTime;
                            this.metrics.totalProcessingTime += processingTime;
                            return [2 /*return*/, result];
                        case 3:
                            error_1 = _a.sent();
                            this.metrics.errors++;
                            this.logger.error("Erreur avec l'API claudeAI ou lors du traitement: ".concat(error_1.message), error_1.stack);
                            return [2 /*return*/, error_1.message];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        MailFilterService_1.prototype.processEmailWithExtractedData = function (emailText, userId, emailSubject, emailSender) {
            return __awaiter(this, void 0, void 0, function () {
                var startTime, emailId, preFilterResult, analysis, existingJobs, emailContext, isComplex, optimizedPrompt, cacheKey, cachedResponse, parsedData, jobComparison, similarJob, newJobResult, idMatch, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            startTime = Date.now();
                            emailId = this.generateEmailHash(emailText, userId, emailSubject, emailSender);
                            this.logger.log("Processing email for user ".concat(userId, ". Subject: \"").concat(emailSubject, "\", Sender: \"").concat(emailSender, "\""));
                            return [4 /*yield*/, this.preFilterService.shouldProcessWithClaudeAI(emailText, emailSubject || '', emailSender || '')];
                        case 1:
                            preFilterResult = _a.sent();
                            analysis = {
                                emailId: emailId,
                                timestamp: new Date(),
                                userId: userId,
                                emailSubject: emailSubject || '',
                                emailSender: emailSender || '',
                                emailBodyPreview: emailText.substring(0, 500),
                                preFilterResult: preFilterResult,
                                processingTime: 0,
                                claudeAIUsed: false,
                                systemReflection: {
                                    preFilterDecision: this.generatePreFilterDecision(preFilterResult),
                                    contentAnalysis: this.generateContentAnalysis(emailText, emailSubject, emailSender),
                                    finalDecision: '',
                                },
                                finalResult: '',
                            };
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 11, , 12]);
                            if (!preFilterResult.shouldProcess) {
                                analysis.systemReflection.finalDecision = "Email filtr\u00E9: ".concat(preFilterResult.reason);
                                analysis.finalResult = "Email filtered: ".concat(preFilterResult.reason, " (confidence: ").concat(preFilterResult.confidence, ")");
                                analysis.processingTime = Date.now() - startTime;
                                this.addAnalysisToHistory(analysis);
                                this.logger.log("Email pre-filtered out: ".concat(preFilterResult.reason));
                                return [2 /*return*/, analysis.finalResult];
                            }
                            this.logger.log("Email passed pre-filtering with confidence ".concat(preFilterResult.confidence));
                            return [4 /*yield*/, this.getExistingJobsForComparison(userId)];
                        case 3:
                            existingJobs = _a.sent();
                            console.log('existingJobs', existingJobs);
                            emailContext = "Email Body:\n".concat(emailText, "\n");
                            if (emailSubject) {
                                emailContext += "\nEmail Subject: ".concat(emailSubject, "\n");
                            }
                            if (emailSender) {
                                emailContext += "\nEmail Sender: ".concat(emailSender, "\n");
                            }
                            isComplex = this.isComplexEmail(emailText);
                            optimizedPrompt = this.generateOptimizedPrompt(emailText, isComplex, existingJobs);
                            cacheKey = this.generateCacheKey(emailText, emailSubject);
                            cachedResponse = this.getCachedResponse(cacheKey);
                            parsedData = null;
                            if (!cachedResponse) return [3 /*break*/, 4];
                            this.logger.log("Using cached response for similar email");
                            parsedData = cachedResponse;
                            analysis.systemReflection.claudeAIReasoning =
                                'Réponse trouvée en cache';
                            return [3 /*break*/, 6];
                        case 4:
                            // Make claudeAI call with fallback mechanism
                            analysis.claudeAIUsed = true;
                            return [4 /*yield*/, this.callclaudeAIWithFallback(optimizedPrompt, emailContext, isComplex)];
                        case 5:
                            parsedData = _a.sent();
                            analysis.systemReflection.claudeAIReasoning =
                                this.generateClaudeAIReasoning(parsedData, isComplex, existingJobs);
                            // Cache the response
                            if (parsedData) {
                                this.setCachedResponse(cacheKey, parsedData);
                            }
                            _a.label = 6;
                        case 6:
                            analysis.extractedData = parsedData;
                            if (!parsedData) {
                                analysis.systemReflection.finalDecision = 'Échec extraction Claude AI';
                                analysis.finalResult =
                                    'Erreur lors du parsing du JSON de la réponse claudeAI.';
                                analysis.processingTime = Date.now() - startTime;
                                this.addAnalysisToHistory(analysis);
                                this.logger.error('Failed to get valid response from claudeAI or cache.');
                                return [2 /*return*/, analysis.finalResult];
                            }
                            else if (!parsedData.title || !parsedData.company) {
                                analysis.systemReflection.finalDecision =
                                    'Données insuffisantes extraites';
                                analysis.finalResult =
                                    'Email analyzed but no valid job application data found';
                                analysis.processingTime = Date.now() - startTime;
                                this.addAnalysisToHistory(analysis);
                                this.logger.warn("Didn't create jobApply for this mail: ".concat(emailSender + ' ' + emailSubject));
                                return [2 /*return*/, analysis.finalResult];
                            }
                            if (!parsedData.status ||
                                !Object.values(application_status_enum_1.ApplicationStatus).includes(parsedData.status)) {
                                this.logger.warn("Invalid or missing status from claudeAI: '".concat(parsedData.status, "'. Defaulting to PENDING."));
                                parsedData.status = application_status_enum_1.ApplicationStatus.PENDING;
                            }
                            return [4 /*yield*/, this.compareWithExistingJobs(parsedData, userId, existingJobs)];
                        case 7:
                            jobComparison = _a.sent();
                            analysis.existingJobsComparison = jobComparison;
                            if (!jobComparison.foundSimilar) return [3 /*break*/, 8];
                            similarJob = jobComparison.similarJobs[0];
                            if (similarJob.action === 'updated') {
                                analysis.systemReflection.finalDecision = "Existing job updated: ".concat(similarJob.title, " at ").concat(similarJob.company);
                                analysis.finalResult = "Job application updated successfully (ID: ".concat(similarJob.id, ")");
                                analysis.jobApplyId = similarJob.id;
                            }
                            else {
                                analysis.systemReflection.finalDecision = "Similar job found but no action taken: ".concat(similarJob.title, " at ").concat(similarJob.company);
                                analysis.finalResult = "Similar job found but no action taken (ID: ".concat(similarJob.id, ")");
                            }
                            return [3 /*break*/, 10];
                        case 8: return [4 /*yield*/, this.createJobApply(parsedData, userId)];
                        case 9:
                            newJobResult = _a.sent();
                            analysis.systemReflection.finalDecision = "New job created: ".concat(parsedData.title, " at ").concat(parsedData.company);
                            analysis.finalResult = newJobResult;
                            idMatch = newJobResult.match(/ID: ([^)]+)/);
                            if (idMatch) {
                                analysis.jobApplyId = idMatch[1];
                            }
                            _a.label = 10;
                        case 10:
                            analysis.processingTime = Date.now() - startTime;
                            this.addAnalysisToHistory(analysis);
                            return [2 /*return*/, analysis.finalResult];
                        case 11:
                            error_2 = _a.sent();
                            analysis.systemReflection.finalDecision = "Erreur: ".concat(error_2.message);
                            analysis.finalResult = error_2.message;
                            analysis.processingTime = Date.now() - startTime;
                            this.addAnalysisToHistory(analysis);
                            this.logger.error("Erreur avec l'API claudeAI ou lors du traitement: ".concat(error_2.message), error_2.stack);
                            return [2 /*return*/, error_2.message];
                        case 12: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Call claudeAI with fallback mechanism for better reliability
         */
        MailFilterService_1.prototype.callclaudeAIWithFallback = function (prompt_1, emailContext_1, isComplex_1) {
            return __awaiter(this, arguments, void 0, function (prompt, emailContext, isComplex, retryCount) {
                var maxRetries, response, rawResponse, parsedData, error_3, delay_1, simplifiedPrompt;
                if (retryCount === void 0) { retryCount = 0; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            maxRetries = 2;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 6]);
                            this.metrics.claudeAICalls++;
                            return [4 /*yield*/, this.claudeAI.messages.create({
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
                                    temperature: 0.3,
                                    max_tokens: isComplex ? 1200 : 800,
                                })];
                        case 2:
                            response = _a.sent();
                            rawResponse = response.content[0];
                            if (!rawResponse) {
                                throw new Error('ClaudeAI returned an empty response.');
                            }
                            if (rawResponse.type !== 'text') {
                                throw new Error("ClaudeAI returned an unexpected content block type: ".concat(rawResponse.type));
                            }
                            parsedData = extractJsonFromString(rawResponse.text);
                            return [2 /*return*/, parsedData];
                        case 3:
                            error_3 = _a.sent();
                            this.logger.warn("claudeAI call failed (attempt ".concat(retryCount + 1, "): ").concat(error_3.message));
                            if (!(retryCount < maxRetries)) return [3 /*break*/, 5];
                            delay_1 = Math.pow(2, retryCount) * 1000;
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay_1); })];
                        case 4:
                            _a.sent();
                            return [2 /*return*/, this.callclaudeAIWithFallback(prompt, emailContext, isComplex, retryCount + 1)];
                        case 5:
                            // If all retries failed, try with simpler prompt
                            if (isComplex && retryCount >= maxRetries) {
                                this.logger.log('Retrying with simplified prompt for complex email');
                                simplifiedPrompt = this.generateOptimizedPrompt(emailContext.substring(0, 1000), false);
                                return [2 /*return*/, this.callclaudeAIWithFallback(simplifiedPrompt, emailContext.substring(0, 1000), false, 0)];
                            }
                            throw error_3;
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        MailFilterService_1.prototype.createJobApply = function (parsedData, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var jobApplyDto, createdJobApply;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            jobApplyDto = {
                                title: parsedData.title || 'Titre non spécifié',
                                company: parsedData.company || 'Entreprise non spécifiée',
                                location: parsedData.location ? parsedData.location : undefined,
                                salary: parsedData.salary
                                    ? Number.parseInt(parsedData.salary.replace(/\s/g, ''))
                                    : undefined,
                                status: parsedData.status,
                                contractType: parsedData.contractType
                                    ? parsedData.contractType
                                    : undefined,
                                interviewDate: parsedData.interviewDate &&
                                    parsedData.interviewDate !== 'null' &&
                                    parsedData.interviewDate.trim() !== ''
                                    ? new Date(parsedData.interviewDate)
                                    : undefined,
                            };
                            this.logger.log("Creating job apply entry with DTO: ".concat(JSON.stringify(jobApplyDto)));
                            return [4 /*yield*/, this.jobApplyService.createJobApply(userId, jobApplyDto)];
                        case 1:
                            createdJobApply = _a.sent();
                            return [2 /*return*/, "Job application processed successfully (ID: ".concat(createdJobApply.id, ").")];
                    }
                });
            });
        };
        MailFilterService_1.prototype.processEmailAndCreateJobApplyFromOutlook = function (outlookMessage, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var startTime, subject, sender, bodyText, emailHash, result, processingTime, error_4;
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            startTime = Date.now();
                            this.metrics.processedEmails++;
                            if (!outlookMessage) {
                                this.metrics.errors++;
                                this.logger.error('Received invalid or empty outlookMessage object');
                                throw new common_1.BadRequestException('Invalid email data provided.');
                            }
                            subject = outlookMessage.subject || '';
                            sender = "".concat(((_b = (_a = outlookMessage.from) === null || _a === void 0 ? void 0 : _a.emailAddress) === null || _b === void 0 ? void 0 : _b.name) || '', " <").concat(((_d = (_c = outlookMessage.from) === null || _c === void 0 ? void 0 : _c.emailAddress) === null || _d === void 0 ? void 0 : _d.address) || '', ">");
                            bodyText = this.extractTextFromOutlookMessage(outlookMessage);
                            if (!bodyText && outlookMessage.bodyPreview) {
                                this.logger.warn("No main body extracted for message ".concat(outlookMessage.id, ", using bodyPreview."));
                                bodyText = outlookMessage.bodyPreview;
                            }
                            if (!bodyText) {
                                this.metrics.errors++;
                                this.logger.error("Could not extract text body for message ".concat(outlookMessage.id));
                                throw new common_1.BadRequestException('Could not extract readable text from the email.');
                            }
                            this.logger.log("Processing Outlook email without pre-filtering. Subject: \"".concat(subject, "\", Sender: \"").concat(sender, "\""));
                            emailHash = this.generateEmailHash(bodyText, userId, subject, sender);
                            // Check if email was already processed
                            if (this.isEmailAlreadyProcessed(emailHash)) {
                                this.metrics.duplicatesSkipped++;
                                this.logger.warn("Skipping already processed Outlook email. Subject: \"".concat(subject, "\", Sender: \"").concat(sender, "\", MessageId: ").concat(outlookMessage.id));
                                return [2 /*return*/, 'Email already processed - skipped'];
                            }
                            // Mark as being processed
                            this.markEmailAsProcessed(emailHash);
                            _e.label = 1;
                        case 1:
                            _e.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.processEmailWithExtractedData(bodyText, userId, subject, sender)];
                        case 2:
                            result = _e.sent();
                            processingTime = Date.now() - startTime;
                            this.metrics.totalProcessingTime += processingTime;
                            return [2 /*return*/, result];
                        case 3:
                            error_4 = _e.sent();
                            this.metrics.errors++;
                            this.logger.error("Error with claudeAI API or during processing: ".concat(error_4.message), error_4.stack);
                            return [2 /*return*/, error_4.message];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Extract readable text content from Outlook message
         */
        MailFilterService_1.prototype.extractTextFromOutlookMessage = function (outlookMessage) {
            var _a;
            if (!((_a = outlookMessage.body) === null || _a === void 0 ? void 0 : _a.content)) {
                return outlookMessage.bodyPreview || '';
            }
            var content = outlookMessage.body.content;
            // If HTML content, convert to plain text
            if (outlookMessage.body.contentType === 'html') {
                content = (0, html_to_text_1.convert)(content, {
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
        };
        /**
         * Initialize monitoring system
         */
        MailFilterService_1.prototype.onModuleInit = function () {
            var _this = this;
            // Start cache cleanup every 20 minutes
            setInterval(function () {
                _this.performCacheCleanup();
            }, 20 * 60 * 1000);
            // Log performance metrics every 30 minutes
            setInterval(function () {
                _this.logPerformanceMetrics();
            }, 30 * 60 * 1000);
            this.logger.log('MailFilter Service initialized - ALL EMAILS WILL BE PROCESSED BY AI');
            this.logger.log("Pre-filtering DISABLED - All emails will be sent to Claude AI for analysis");
        };
        /**
         * Enhanced cache cleanup with memory management
         */
        MailFilterService_1.prototype.performCacheCleanup = function () {
            var _this = this;
            var now = Date.now();
            // Clear expired processed emails
            var expiredProcessedEmails = [];
            for (var _i = 0, _a = this.processedEmails; _i < _a.length; _i++) {
                var email = _a[_i];
                var _b = email.split(':'), timestamp = _b[1];
                if (now - parseInt(timestamp) > this.EMAIL_CACHE_TTL) {
                    expiredProcessedEmails.push(email);
                }
            }
            expiredProcessedEmails.forEach(function (email) {
                return _this.processedEmails.delete(email);
            });
            // LRU cleanup if cache is too large
            if (this.processedEmails.size > this.MAX_CACHE_SIZE) {
                var sortedEmails = Array.from(this.processedEmails).sort(function (a, b) {
                    var timestampA = parseInt(a.split(':')[1]);
                    var timestampB = parseInt(b.split(':')[1]);
                    return timestampA - timestampB; // Oldest first
                });
                var toRemove = sortedEmails.slice(0, this.processedEmails.size - this.MAX_CACHE_SIZE);
                toRemove.forEach(function (email) { return _this.processedEmails.delete(email); });
                this.logger.warn("Cache size exceeded ".concat(this.MAX_CACHE_SIZE, ". Removed ").concat(toRemove.length, " oldest entries."));
            }
            // Clear expired cache entries
            var expiredCacheKeys = [];
            for (var _c = 0, _d = this.responseCache.entries(); _c < _d.length; _c++) {
                var _e = _d[_c], key = _e[0], entry = _e[1];
                if (now - entry.timestamp > this.RESPONSE_CACHE_TTL) {
                    expiredCacheKeys.push(key);
                }
            }
            expiredCacheKeys.forEach(function (key) { return _this.responseCache.delete(key); });
            // LRU cleanup for response cache
            if (this.responseCache.size > this.MAX_RESPONSE_CACHE_SIZE) {
                var sortedEntries = Array.from(this.responseCache.entries()).sort(function (a, b) { return a[1].timestamp - b[1].timestamp; });
                var toRemove = sortedEntries.slice(0, this.responseCache.size - this.MAX_RESPONSE_CACHE_SIZE);
                toRemove.forEach(function (_a) {
                    var key = _a[0];
                    return _this.responseCache.delete(key);
                });
            }
            var memoryUsage = this.estimateMemoryUsage();
            this.logger.log("Cache cleanup: Removed ".concat(expiredProcessedEmails.length, " processed emails and ").concat(expiredCacheKeys.length, " cached responses. Memory: ").concat(memoryUsage.totalMB, "MB"));
        };
        /**
         * Estimate current memory usage
         */
        MailFilterService_1.prototype.estimateMemoryUsage = function () {
            var processedEmailsSize = Array.from(this.processedEmails).join('').length * 2; // UTF-16
            var responseCacheSize = JSON.stringify(Array.from(this.responseCache.values())).length * 2;
            return {
                processedEmailsMB: +(processedEmailsSize / 1024 / 1024).toFixed(2),
                responseCacheMB: +(responseCacheSize / 1024 / 1024).toFixed(2),
                totalMB: +((processedEmailsSize + responseCacheSize) /
                    1024 /
                    1024).toFixed(2),
            };
        };
        /**
         * Get cache statistics for monitoring
         */
        MailFilterService_1.prototype.getCacheStats = function () {
            var memoryUsage = this.estimateMemoryUsage();
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
        };
        /**
         * Get cache optimization recommendations
         */
        MailFilterService_1.prototype.getCacheRecommendation = function (totalMemoryMB) {
            if (totalMemoryMB > 50) {
                return 'HIGH MEMORY USAGE - Consider Redis or reducing TTL';
            }
            if (totalMemoryMB > 20) {
                return 'MEDIUM MEMORY USAGE - Monitor and consider optimizations';
            }
            return 'OPTIMAL MEMORY USAGE - Current setup is efficient';
        };
        /**
         * Get performance metrics
         */
        MailFilterService_1.prototype.getPerformanceMetrics = function () {
            return __assign(__assign({}, this.metrics), { duplicateRate: this.metrics.processedEmails > 0
                    ? ((this.metrics.duplicatesSkipped / this.metrics.processedEmails) *
                        100).toFixed(1) + '%'
                    : '0%', cacheHitRate: this.metrics.claudeAICalls > 0
                    ? ((this.metrics.cacheHits /
                        (this.metrics.claudeAICalls + this.metrics.cacheHits)) *
                        100).toFixed(1) + '%'
                    : '0%', cacheSize: this.responseCache.size, uptime: Math.floor((Date.now() - this.metrics.startTime) / 1000) });
        };
        /**
         * Log performance metrics periodically
         */
        MailFilterService_1.prototype.logPerformanceMetrics = function () {
            var metrics = this.getPerformanceMetrics();
            this.logger.log("Performance Metrics:\n  Uptime: ".concat(metrics.uptime, "s\n  Processed Emails: ").concat(metrics.processedEmails, "\n  claudeAI Calls: ").concat(metrics.claudeAICalls, "\n  Cache Hits: ").concat(metrics.cacheHits, " (").concat(metrics.cacheHitRate, "% hit rate)\n  Duplicates Skipped: ").concat(metrics.duplicatesSkipped, "\n  Errors: ").concat(metrics.errors, "\n  Avg Processing Time: ").concat(metrics.averageProcessingTime, "ms"));
        };
        /**
         * Get the current user count from database with caching
         */
        MailFilterService_1.prototype.getUserCount = function () {
            return __awaiter(this, void 0, void 0, function () {
                var now, users, userCount, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            now = Date.now();
                            // Check if we have a valid cached count
                            if (this.userCountCache &&
                                now - this.userCountCache.timestamp < this.USER_COUNT_CACHE_TTL) {
                                return [2 /*return*/, this.userCountCache.count];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.userService.findAll()];
                        case 2:
                            users = _a.sent();
                            userCount = users.length;
                            // Cache the result
                            this.userCountCache = {
                                count: userCount,
                                timestamp: now,
                            };
                            this.logger.log("Updated user count cache: ".concat(userCount, " users"));
                            return [2 /*return*/, userCount];
                        case 3:
                            error_5 = _a.sent();
                            this.logger.error("Failed to get user count: ".concat(error_5.message, ". Using fallback of 100."));
                            // Fallback to a conservative estimate
                            return [2 /*return*/, 100];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get the concurrent email processing limit (dynamically calculated from real user count)
         */
        MailFilterService_1.prototype.getConcurrentEmailLimit = function () {
            return __awaiter(this, void 0, void 0, function () {
                var userCount;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getUserCount()];
                        case 1:
                            userCount = _a.sent();
                            // Calculate optimal limit based on actual user scale
                            if (userCount <= 100)
                                return [2 /*return*/, 5]; // Small scale: 5 concurrent
                            if (userCount <= 500)
                                return [2 /*return*/, 10]; // Medium scale: 10 concurrent
                            if (userCount <= 1000)
                                return [2 /*return*/, 15]; // Large scale: 15 concurrent (RECOMMANDÉ pour 1000 users)
                            if (userCount <= 5000)
                                return [2 /*return*/, 25]; // Enterprise: 25 concurrent
                            return [2 /*return*/, 35]; // Massive scale: 35 concurrent
                    }
                });
            });
        };
        /**
         * Get current performance status and recommendations (with real user count)
         */
        MailFilterService_1.prototype.getPerformanceRecommendations = function () {
            return __awaiter(this, void 0, void 0, function () {
                var userCount, currentLimit, errorRate, avgLatency;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getUserCount()];
                        case 1:
                            userCount = _a.sent();
                            return [4 /*yield*/, this.getConcurrentEmailLimit()];
                        case 2:
                            currentLimit = _a.sent();
                            errorRate = this.metrics.errors / Math.max(this.metrics.processedEmails, 1);
                            avgLatency = this.metrics.totalProcessingTime /
                                Math.max(this.metrics.processedEmails, 1);
                            return [2 /*return*/, {
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
                                }];
                    }
                });
            });
        };
        MailFilterService_1.prototype.getPerformanceStatus = function (errorRate, avgLatency) {
            if (errorRate > 0.05 || avgLatency > 2000)
                return 'POOR - Consider reducing concurrency';
            if (errorRate < 0.01 && avgLatency < 500)
                return 'EXCELLENT - Can increase concurrency';
            return 'GOOD - Current settings optimal';
        };
        // Methods for analysis and dashboard
        MailFilterService_1.prototype.generatePreFilterDecision = function (preFilterResult) {
            if (!preFilterResult.shouldProcess) {
                return "FILTERED: ".concat(preFilterResult.reason, " (Confidence: ").concat(Math.round(preFilterResult.confidence * 100), "%)");
            }
            return "PASSED: ".concat(preFilterResult.reason, " (Confidence: ").concat(Math.round(preFilterResult.confidence * 100), "%)");
        };
        MailFilterService_1.prototype.generateContentAnalysis = function (emailText, subject, sender) {
            var analysis = [];
            // Length analysis
            if (emailText.length < 100) {
                analysis.push('Very short email');
            }
            else if (emailText.length > 2000) {
                analysis.push('Long/complex email');
            }
            else {
                analysis.push('Normal length');
            }
            // Keywords analysis (both French and English)
            var jobKeywords = [
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
            var foundKeywords = jobKeywords.filter(function (keyword) {
                return (emailText + ' ' + (subject || '')).toLowerCase().includes(keyword);
            });
            if (foundKeywords.length > 0) {
                analysis.push("Job keywords: ".concat(foundKeywords.join(', ')));
            }
            else {
                analysis.push('No job keywords detected');
            }
            // Sender analysis
            if ((sender === null || sender === void 0 ? void 0 : sender.includes('linkedin.com')) || (sender === null || sender === void 0 ? void 0 : sender.includes('indeed.com'))) {
                analysis.push('Sender: Job platform');
            }
            else if ((sender === null || sender === void 0 ? void 0 : sender.includes('no-reply')) || (sender === null || sender === void 0 ? void 0 : sender.includes('noreply'))) {
                analysis.push('Sender: Automatic email');
            }
            else {
                analysis.push('Sender: Personal/company email');
            }
            return analysis.join(' | ');
        };
        MailFilterService_1.prototype.generateClaudeAIReasoning = function (extractedData, isComplex, existingJobs) {
            if (!extractedData) {
                return 'Claude AI: Unable to extract valid data';
            }
            var reasoning = [];
            reasoning.push("Analysis ".concat(isComplex ? 'complex' : 'simple'));
            if (extractedData.company && extractedData.title) {
                reasoning.push("Company: ".concat(extractedData.company, ", Position: ").concat(extractedData.title));
            }
            if (extractedData.status) {
                reasoning.push("Status detected: ".concat(extractedData.status));
            }
            if (existingJobs.length > 0) {
                reasoning.push("Compared with ".concat(existingJobs.length, " existing jobs"));
            }
            return reasoning.join(' | ');
        };
        MailFilterService_1.prototype.getExistingJobsForComparison = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var existingJobs, jobsForComparison, error_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.jobApplyService.getAllJobApplies(userId)];
                        case 1:
                            existingJobs = _a.sent();
                            jobsForComparison = existingJobs
                                .sort(function (a, b) {
                                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                            })
                                .slice(0, 50)
                                .map(function (job) { return ({
                                id: job.id,
                                title: job.title,
                                company: job.company,
                                location: job.location || null,
                                status: job.status,
                                contractType: job.contractType || null,
                                createdAt: job.createdAt,
                                similarity: 0, // Valeur par défaut, sera calculée lors de la comparaison
                                matchReason: '', // Valeur par défaut, sera définie lors de la comparaison
                            }); });
                            this.logger.log("Found ".concat(jobsForComparison.length, " existing jobs for user ").concat(userId));
                            return [2 /*return*/, jobsForComparison];
                        case 2:
                            error_6 = _a.sent();
                            this.logger.warn("Could not fetch existing jobs for user ".concat(userId, ": ").concat(error_6.message));
                            return [2 /*return*/, []];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        MailFilterService_1.prototype.compareWithExistingJobs = function (parsedData, userId, existingJobs) {
            return __awaiter(this, void 0, void 0, function () {
                var similarJobs, _i, existingJobs_1, existingJob, similarity, companySimilarity, action, updateJobApply, error_7;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            similarJobs = [];
                            this.logger.log("Comparing new job \"".concat(parsedData.title, "\" at \"").concat(parsedData.company, "\" with ").concat(existingJobs.length, " existing jobs"));
                            _i = 0, existingJobs_1 = existingJobs;
                            _c.label = 1;
                        case 1:
                            if (!(_i < existingJobs_1.length)) return [3 /*break*/, 7];
                            existingJob = existingJobs_1[_i];
                            similarity = this.calculateJobSimilarity(parsedData, existingJob);
                            this.logger.log("Similarity with \"".concat(existingJob.title, "\" at \"").concat(existingJob.company, "\": ").concat((similarity * 100).toFixed(1), "%"));
                            if (!(similarity > 0.75)) return [3 /*break*/, 6];
                            companySimilarity = this.stringSimilarity(((_a = parsedData.company) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '', ((_b = existingJob.company) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || '');
                            if (companySimilarity < 0.5) {
                                this.logger.log("Rejecting match due to different companies: \"".concat(parsedData.company, "\" vs \"").concat(existingJob.company, "\" (").concat((companySimilarity * 100).toFixed(1), "% similar)"));
                                return [3 /*break*/, 6]; // Skip this job if companies are too different
                            }
                            action = 'ignored';
                            if (!(similarity > 0.8)) return [3 /*break*/, 5];
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 4, , 5]);
                            updateJobApply = {
                                location: parsedData.location,
                                salary: parsedData.salary
                                    ? Number.parseInt(parsedData.salary)
                                    : undefined,
                                status: parsedData.status,
                                interviewDate: parsedData.interviewDate &&
                                    parsedData.interviewDate !== 'null' &&
                                    parsedData.interviewDate.trim() !== ''
                                    ? new Date(parsedData.interviewDate)
                                    : null,
                                contractType: parsedData.contractType,
                            };
                            return [4 /*yield*/, this.jobApplyService.updateJobApplyByMail(existingJob.id, userId, updateJobApply)];
                        case 3:
                            _c.sent();
                            action = 'updated';
                            this.logger.log("Updated existing job ".concat(existingJob.id, ": ").concat(existingJob.title, " at ").concat(existingJob.company));
                            return [3 /*break*/, 5];
                        case 4:
                            error_7 = _c.sent();
                            this.logger.error("Failed to update job ".concat(existingJob.id, ": ").concat(error_7.message));
                            return [3 /*break*/, 5];
                        case 5:
                            similarJobs.push({
                                id: existingJob.id,
                                title: existingJob.title,
                                company: existingJob.company,
                                similarity: similarity,
                                action: action,
                            });
                            _c.label = 6;
                        case 6:
                            _i++;
                            return [3 /*break*/, 1];
                        case 7:
                            if (similarJobs.length === 0) {
                                this.logger.log("No similar jobs found. Creating new job for \"".concat(parsedData.title, "\" at \"").concat(parsedData.company, "\""));
                            }
                            return [2 /*return*/, {
                                    foundSimilar: similarJobs.length > 0,
                                    similarJobs: similarJobs.sort(function (a, b) { return b.similarity - a.similarity; }),
                                }];
                    }
                });
            });
        };
        MailFilterService_1.prototype.calculateJobSimilarity = function (parsedData, existingJob) {
            var score = 0;
            var maxScore = 0;
            maxScore += 0.5;
            if (parsedData.company && existingJob.company) {
                var companySimilarity = this.stringSimilarity(parsedData.company.toLowerCase(), existingJob.company.toLowerCase());
                score += companySimilarity * 0.5;
            }
            maxScore += 0.3;
            if (parsedData.title && existingJob.title) {
                var titleSimilarity = this.stringSimilarity(parsedData.title.toLowerCase(), existingJob.title.toLowerCase());
                score += titleSimilarity * 0.3;
            }
            // Comparaison localisation (poids: 10%)
            maxScore += 0.1;
            if (parsedData.location && existingJob.location) {
                var locationSimilarity = this.stringSimilarity(parsedData.location.toLowerCase(), existingJob.location.toLowerCase());
                score += locationSimilarity * 0.1;
            }
            else if (!parsedData.location && !existingJob.location) {
                score += 0.1; // Bonus si les deux sont null
            }
            // Comparaison type contrat (poids: 10%)
            maxScore += 0.1;
            if (parsedData.contractType && existingJob.contractType) {
                if (parsedData.contractType === existingJob.contractType) {
                    score += 0.1;
                }
            }
            else if (!parsedData.contractType && !existingJob.contractType) {
                score += 0.1; // Bonus si les deux sont null
            }
            var finalScore = maxScore > 0 ? score / maxScore : 0;
            this.logger.debug("Similarity calculation: Company(".concat(((score / maxScore) * 0.5 * 100).toFixed(1), "%) + Title(").concat(((score / maxScore) * 0.3 * 100).toFixed(1), "%) = ").concat((finalScore * 100).toFixed(1), "%"));
            return finalScore;
        };
        MailFilterService_1.prototype.stringSimilarity = function (str1, str2) {
            // Calcul simple de similarité basé sur Levenshtein distance
            var longer = str1.length > str2.length ? str1 : str2;
            var shorter = str1.length > str2.length ? str2 : str1;
            if (longer.length === 0)
                return 1;
            var editDistance = this.levenshteinDistance(longer, shorter);
            return (longer.length - editDistance) / longer.length;
        };
        MailFilterService_1.prototype.levenshteinDistance = function (str1, str2) {
            var matrix = [];
            for (var i = 0; i <= str2.length; i++) {
                matrix[i] = [i];
            }
            for (var j = 0; j <= str1.length; j++) {
                matrix[0][j] = j;
            }
            for (var i = 1; i <= str2.length; i++) {
                for (var j = 1; j <= str1.length; j++) {
                    if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    }
                    else {
                        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                    }
                }
            }
            return matrix[str2.length][str1.length];
        };
        MailFilterService_1.prototype.addAnalysisToHistory = function (analysis) {
            this.recentAnalyses.unshift(analysis);
            if (this.recentAnalyses.length > this.MAX_RECENT_ANALYSES) {
                this.recentAnalyses = this.recentAnalyses.slice(0, this.MAX_RECENT_ANALYSES);
            }
        };
        // Méthodes pour le dashboard
        MailFilterService_1.prototype.getRecentAnalyses = function (limit) {
            if (limit === void 0) { limit = 10; }
            return this.recentAnalyses.slice(0, limit);
        };
        MailFilterService_1.prototype.getDashboardStats = function () {
            var filterStats = this.preFilterService.getFilteringStats();
            var currentMetrics = this.getPerformanceMetrics();
            var totalCreated = this.recentAnalyses.filter(function (a) { var _a; return a.jobApplyId && !((_a = a.existingJobsComparison) === null || _a === void 0 ? void 0 : _a.foundSimilar); }).length;
            var totalUpdated = this.recentAnalyses.filter(function (a) { var _a; return (_a = a.existingJobsComparison) === null || _a === void 0 ? void 0 : _a.foundSimilar; }).length;
            return {
                totalEmailsProcessed: filterStats.totalEmails,
                emailsFilteredOut: filterStats.totalEmails - filterStats.processedByClaude,
                emailsProcessedByClaudeAI: filterStats.processedByClaude,
                jobApplicationsCreated: totalCreated,
                jobApplicationsUpdated: totalUpdated,
                filteringEfficiency: filterStats.filteringEfficiency,
                performanceMetrics: {
                    averageProcessingTime: this.recentAnalyses.length > 0
                        ? this.recentAnalyses.reduce(function (sum, a) { return sum + a.processingTime; }, 0) / this.recentAnalyses.length
                        : 0,
                    claudeAICostSavings: filterStats.filteringEfficiency * 100,
                    errorRate: currentMetrics.errorRate,
                },
                recentAnalyses: this.getRecentAnalyses(20),
            };
        };
        MailFilterService_1.prototype.getScaleRecommendations = function (userCount) {
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
                    recommendation: 'Limit of 15 is OPTIMAL for 1000 users - Monitor Claude AI usage',
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
                recommendation: "Limit of ".concat(this.getConcurrentEmailLimit(), " for high-volume AI processing"),
                expectedPeak: '250+ emails/minute (100% AI processed)',
            };
        };
        return MailFilterService_1;
    }());
    __setFunctionName(_classThis, "MailFilterService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MailFilterService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MailFilterService = _classThis;
}();
exports.MailFilterService = MailFilterService;
