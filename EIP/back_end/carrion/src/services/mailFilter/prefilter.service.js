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
exports.EmailPreFilterService = void 0;
var common_1 = require("@nestjs/common");
var fs = require("fs");
var path = require("path");
var EmailPreFilterService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var EmailPreFilterService = _classThis = /** @class */ (function () {
        function EmailPreFilterService_1() {
            this.logger = new common_1.Logger(EmailPreFilterService.name);
            this.stats = {
                totalEmails: 0,
                processedByClaude: 0,
                filteredOut: 0,
                certainRecruitment: 0,
                startTime: Date.now(),
            };
            this.loadConfiguration();
        }
        EmailPreFilterService_1.prototype.loadConfiguration = function () {
            try {
                var configPath = path.join(process.cwd(), 'src', 'services', 'mailFilter', 'config', 'recruitment-patterns.json');
                var configData = fs.readFileSync(configPath, 'utf8');
                this.config = JSON.parse(configData);
                this.logger.log('Smart prefilter configuration loaded successfully');
            }
            catch (error) {
                this.logger.error('Failed to load recruitment patterns configuration:', error);
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
        };
        EmailPreFilterService_1.prototype.shouldProcessWithClaudeAI = function (emailText, subject, sender) {
            return __awaiter(this, void 0, void 0, function () {
                var subjectLower, senderLower, emailTextLower, score, strongIndicators, mediumIndicators, exclusionFound, isLinkedInJobConfirmation, _i, _a, pattern, _b, _c, pattern, _d, _e, pattern, _f, _g, domain, _h, _j, pattern, _k, _l, pattern, shouldProcess, confidence, reason;
                return __generator(this, function (_m) {
                    this.stats.totalEmails++;
                    subjectLower = subject.toLowerCase();
                    senderLower = sender.toLowerCase();
                    emailTextLower = emailText.toLowerCase();
                    score = 0;
                    strongIndicators = [];
                    mediumIndicators = [];
                    exclusionFound = [];
                    isLinkedInJobConfirmation = this.isLinkedInJobConfirmation(subjectLower, senderLower, emailTextLower);
                    if (isLinkedInJobConfirmation) {
                        this.stats.processedByClaude++;
                        this.logger.log("LinkedIn job confirmation detected - bypassing normal filtering. Subject: \"".concat(subject, "\""));
                        return [2 /*return*/, {
                                shouldProcess: true,
                                score: 25, // High score for LinkedIn confirmations
                                confidence: 0.95,
                                reason: 'LinkedIn job application confirmation email - automatically processed',
                                details: {
                                    senderCheck: { isValid: true, reason: 'LinkedIn job confirmation' },
                                    contentScore: 25,
                                    mlPrediction: true,
                                    strongIndicators: ['linkedin-job-confirmation'],
                                    mediumIndicators: [],
                                    exclusionFound: [],
                                    finalScore: 25,
                                },
                            }];
                    }
                    // 1. Check for obvious exclusions first (highest priority)
                    for (_i = 0, _a = this.config.exclusionPatterns.obvious; _i < _a.length; _i++) {
                        pattern = _a[_i];
                        if (subjectLower.includes(pattern) ||
                            senderLower.includes(pattern) ||
                            emailTextLower.includes(pattern)) {
                            exclusionFound.push(pattern);
                            score += this.config.scoring.exclusionPenalty;
                        }
                    }
                    // If strong exclusion found, filter directly
                    if (exclusionFound.length > 0 && score <= -10) {
                        this.stats.filteredOut++;
                        return [2 /*return*/, {
                                shouldProcess: false,
                                score: score,
                                confidence: 0.9,
                                reason: "Email excluded - obvious patterns: ".concat(exclusionFound.join(', ')),
                                details: {
                                    senderCheck: { isValid: false, reason: 'Exclusion patterns found' },
                                    contentScore: score,
                                    mlPrediction: false,
                                    strongIndicators: strongIndicators,
                                    mediumIndicators: mediumIndicators,
                                    exclusionFound: exclusionFound,
                                    finalScore: score,
                                },
                            }];
                    }
                    // 2. Positive scoring for recruitment indicators
                    // Strong indicators in subject
                    for (_b = 0, _c = this.config.recruitmentIndicators.strong.subjects; _b < _c.length; _b++) {
                        pattern = _c[_b];
                        if (subjectLower.includes(pattern)) {
                            strongIndicators.push("subject:".concat(pattern));
                            score += this.config.scoring.strongSubject;
                        }
                    }
                    // Strong indicators in sender
                    for (_d = 0, _e = this.config.recruitmentIndicators.strong.senders; _d < _e.length; _d++) {
                        pattern = _e[_d];
                        if (senderLower.includes(pattern)) {
                            strongIndicators.push("sender:".concat(pattern));
                            score += this.config.scoring.strongSender;
                        }
                    }
                    // Recruitment domains
                    for (_f = 0, _g = this.config.recruitmentIndicators.strong.domains; _f < _g.length; _f++) {
                        domain = _g[_f];
                        if (senderLower.includes(domain)) {
                            strongIndicators.push("domain:".concat(domain));
                            score += this.config.scoring.strongDomain;
                        }
                    }
                    // Medium indicators in subject
                    for (_h = 0, _j = this.config.recruitmentIndicators.medium.subjects; _h < _j.length; _h++) {
                        pattern = _j[_h];
                        if (subjectLower.includes(pattern)) {
                            mediumIndicators.push("subject:".concat(pattern));
                            score += this.config.scoring.mediumSubject;
                        }
                    }
                    // Medium indicators in content
                    for (_k = 0, _l = this.config.recruitmentIndicators.medium.content; _k < _l.length; _k++) {
                        pattern = _l[_k];
                        if (emailTextLower.includes(pattern)) {
                            mediumIndicators.push("content:".concat(pattern));
                            score += this.config.scoring.mediumContent;
                        }
                    }
                    shouldProcess = score >= this.config.thresholds.processWithClaude;
                    confidence = this.calculateConfidence(score, strongIndicators.length, exclusionFound.length);
                    if (shouldProcess) {
                        this.stats.processedByClaude++;
                        if (score >= this.config.thresholds.certainRecruitment) {
                            this.stats.certainRecruitment++;
                        }
                    }
                    else {
                        this.stats.filteredOut++;
                    }
                    reason = shouldProcess
                        ? "Email sent to Claude AI (score: ".concat(score, ", indicators: ").concat(strongIndicators.length + mediumIndicators.length, ")")
                        : "Email filtered - insufficient score (".concat(score, " < ").concat(this.config.thresholds.processWithClaude, ")");
                    this.logger.log("Smart prefilter - Subject: \"".concat(subject, "\", Score: ").concat(score, ", Decision: ").concat(shouldProcess ? 'PROCESS' : 'FILTER'));
                    return [2 /*return*/, {
                            shouldProcess: shouldProcess,
                            score: score,
                            confidence: confidence,
                            reason: reason,
                            details: {
                                senderCheck: {
                                    isValid: shouldProcess,
                                    reason: shouldProcess ? 'Passed smart filter' : 'Failed smart filter',
                                },
                                contentScore: score,
                                mlPrediction: shouldProcess,
                                strongIndicators: strongIndicators,
                                mediumIndicators: mediumIndicators,
                                exclusionFound: exclusionFound,
                                finalScore: score,
                            },
                        }];
                });
            });
        };
        EmailPreFilterService_1.prototype.calculateConfidence = function (score, strongCount, exclusionCount) {
            // Base confidence on score
            var confidence = Math.min(Math.max(score / 20, 0), 1);
            // Bonus for strong indicators
            confidence += strongCount * 0.1;
            // Penalty for exclusions
            confidence -= exclusionCount * 0.2;
            return Math.min(Math.max(confidence, 0), 1);
        };
        EmailPreFilterService_1.prototype.getFilteringStats = function () {
            var runtime = Date.now() - this.stats.startTime;
            var processingRate = this.stats.totalEmails > 0
                ? this.stats.processedByClaude / this.stats.totalEmails
                : 0;
            var filteringEfficiency = this.stats.totalEmails > 0
                ? this.stats.filteredOut / this.stats.totalEmails
                : 0;
            return __assign(__assign({}, this.stats), { runtime: runtime, processingRate: processingRate, filteringEfficiency: filteringEfficiency, 
                // Legacy compatibility mappings
                filteredBySender: 0, filteredByContent: this.stats.filteredOut, filteredByML: 0, passedToClaudeAI: this.stats.processedByClaude, filteringRate: filteringEfficiency, efficiency: {
                    senderFiltering: 0,
                    contentFiltering: filteringEfficiency,
                    mlFiltering: 0,
                    claudeAIUsage: processingRate,
                } });
        };
        EmailPreFilterService_1.prototype.resetStats = function () {
            this.stats = {
                totalEmails: 0,
                processedByClaude: 0,
                filteredOut: 0,
                certainRecruitment: 0,
                startTime: Date.now(),
            };
        };
        // Method to reload configuration without restart
        EmailPreFilterService_1.prototype.reloadConfiguration = function () {
            this.loadConfiguration();
            this.logger.log('Configuration reloaded');
        };
        // Method to add patterns dynamically (for maintenance)
        EmailPreFilterService_1.prototype.addExclusionPattern = function (pattern) {
            if (!this.config.exclusionPatterns.obvious.includes(pattern)) {
                this.config.exclusionPatterns.obvious.push(pattern);
                this.logger.log("Exclusion pattern added: ".concat(pattern));
            }
        };
        EmailPreFilterService_1.prototype.addRecruitmentPattern = function (type, category, pattern) {
            var target = this.config.recruitmentIndicators[type];
            if (category in target && Array.isArray(target[category])) {
                if (!target[category].includes(pattern)) {
                    target[category].push(pattern);
                    this.logger.log("Recruitment pattern added: ".concat(type, ".").concat(category, ".").concat(pattern));
                }
            }
        };
        EmailPreFilterService_1.prototype.isLinkedInJobConfirmation = function (subject, sender, emailText) {
            // Check if it's from LinkedIn
            var isLinkedInSender = sender.includes('linkedin.com');
            // Check for job application confirmation patterns
            var jobConfirmationPatterns = [
                'candidature a été envoyée',
                'candidature envoyée',
                'application sent',
                'application submitted',
                'votre candidature a été envoyée',
                'your application has been sent',
            ];
            var hasJobConfirmation = jobConfirmationPatterns.some(function (pattern) { return subject.includes(pattern) || emailText.includes(pattern); });
            // Check for job-related content
            var jobContentPatterns = [
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
            var hasJobContent = jobContentPatterns.some(function (pattern) { return subject.includes(pattern) || emailText.includes(pattern); });
            return isLinkedInSender && hasJobConfirmation && hasJobContent;
        };
        return EmailPreFilterService_1;
    }());
    __setFunctionName(_classThis, "EmailPreFilterService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EmailPreFilterService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EmailPreFilterService = _classThis;
}();
exports.EmailPreFilterService = EmailPreFilterService;
