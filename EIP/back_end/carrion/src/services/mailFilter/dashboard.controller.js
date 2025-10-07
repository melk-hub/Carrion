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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
exports.DashboardMailController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var dashboard_response_dto_1 = require("./dto/dashboard-response.dto");
var public_decorator_1 = require("../../auth/decorators/public.decorator");
var DashboardMailController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('dashboard-mail'), (0, public_decorator_1.Public)(), (0, common_1.Controller)('dashboard_mail')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getDashboardOverview_decorators;
    var _getDashboardStats_decorators;
    var _getRecentAnalyses_decorators;
    var _getEmailAnalysis_decorators;
    var _getFilteringStats_decorators;
    var _getSystemPerformance_decorators;
    var _testEmailFiltering_decorators;
    var _getSystemReflection_decorators;
    var DashboardMailController = _classThis = /** @class */ (function () {
        function DashboardMailController_1(mailFilterService, preFilterService) {
            this.mailFilterService = (__runInitializers(this, _instanceExtraInitializers), mailFilterService);
            this.preFilterService = preFilterService;
        }
        DashboardMailController_1.prototype.getDashboardOverview = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, dashboardStats, recentAnalyses, filteringStats, performanceMetrics, systemRecommendations, systemReflection, enrichedFilteringStats, systemHealth;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, Promise.all([
                                this.mailFilterService.getDashboardStats(),
                                this.mailFilterService.getRecentAnalyses(50),
                                this.preFilterService.getFilteringStats(),
                                this.mailFilterService.getPerformanceMetrics(),
                                this.mailFilterService.getPerformanceRecommendations(),
                            ])];
                        case 1:
                            _a = _c.sent(), dashboardStats = _a[0], recentAnalyses = _a[1], filteringStats = _a[2], performanceMetrics = _a[3], systemRecommendations = _a[4];
                            systemReflection = {
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
                            enrichedFilteringStats = __assign(__assign({}, filteringStats), { performance: {
                                    costSavingsEstimate: "".concat(Math.round(filteringStats.filteringRate * 100), "% reduction in Claude AI calls"),
                                    processingTimeReduction: "".concat(Math.round(filteringStats.filteringRate * 70), "% faster processing"),
                                    estimatedMonthlySavings: "\u20AC".concat(Math.round(filteringStats.filteringRate * 2000), " per 1000 users"),
                                }, filteringBreakdown: {
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
                                } });
                            _b = {
                                status: 'healthy',
                                timestamp: new Date().toISOString()
                            };
                            return [4 /*yield*/, this.mailFilterService.getConcurrentEmailLimit()];
                        case 2:
                            systemHealth = (_b.concurrencyLimit = _c.sent(),
                                _b.performance = {
                                    cacheHitRate: performanceMetrics.cacheHitRate,
                                    errorRate: systemRecommendations.currentPerformance.errorRate,
                                    avgLatency: systemRecommendations.currentPerformance.avgLatency,
                                    status: systemRecommendations.currentPerformance.status,
                                },
                                _b.recommendations = systemRecommendations.recommendations,
                                _b);
                            return [2 /*return*/, {
                                    // Vue d'ensemble
                                    overview: {
                                        totalEmailsProcessed: dashboardStats.totalEmailsProcessed,
                                        emailsFilteredOut: dashboardStats.emailsFilteredOut,
                                        claudeAIUsage: dashboardStats.emailsProcessedByClaudeAI,
                                        jobApplicationsCreated: dashboardStats.jobApplicationsCreated,
                                        jobApplicationsUpdated: dashboardStats.jobApplicationsUpdated,
                                        filteringEfficiency: Math.round(filteringStats.filteringRate * 100),
                                        costSavings: "\u20AC".concat(Math.round(filteringStats.filteringRate * 2000), "/month"),
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
                                            successful: recentAnalyses.filter(function (a) { return a.finalResult === 'success'; })
                                                .length,
                                            filtered: recentAnalyses.filter(function (a) { return !a.preFilterResult.shouldProcess; }).length,
                                            processed: recentAnalyses.filter(function (a) { return a.preFilterResult.shouldProcess; }).length,
                                        },
                                    },
                                    // Réflexion système
                                    systemInsights: systemReflection,
                                    // Santé système
                                    systemHealth: systemHealth,
                                    // Alertes et recommandations
                                    alerts: this.generateAlerts(recentAnalyses, filteringStats, systemRecommendations),
                                    // Métriques en temps réel
                                    realTimeMetrics: {
                                        timestamp: new Date().toISOString(),
                                        uptime: Math.floor((Date.now() - filteringStats.startTime) / 1000),
                                        processingRate: filteringStats.totalEmails > 0
                                            ? Math.round(filteringStats.totalEmails /
                                                ((Date.now() - filteringStats.startTime) / 1000 / 60))
                                            : 0, // emails/minute
                                        cacheHitRate: Math.round(performanceMetrics.cacheHitRate * 100),
                                    },
                                }];
                    }
                });
            });
        };
        DashboardMailController_1.prototype.getDashboardStats = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.mailFilterService.getDashboardStats()];
                });
            });
        };
        DashboardMailController_1.prototype.getRecentAnalyses = function (limit) {
            return __awaiter(this, void 0, void 0, function () {
                var actualLimit;
                return __generator(this, function (_a) {
                    actualLimit = Math.min(limit || 20, 100);
                    return [2 /*return*/, this.mailFilterService.getRecentAnalyses(actualLimit)];
                });
            });
        };
        DashboardMailController_1.prototype.getEmailAnalysis = function (emailId) {
            return __awaiter(this, void 0, void 0, function () {
                var analyses;
                return __generator(this, function (_a) {
                    analyses = this.mailFilterService.getRecentAnalyses(100);
                    return [2 /*return*/, analyses.find(function (analysis) { return analysis.emailId === emailId; }) || null];
                });
            });
        };
        DashboardMailController_1.prototype.getFilteringStats = function () {
            return __awaiter(this, void 0, void 0, function () {
                var stats;
                return __generator(this, function (_a) {
                    stats = this.preFilterService.getFilteringStats();
                    return [2 /*return*/, __assign(__assign({}, stats), { performance: {
                                costSavingsEstimate: "".concat(Math.round(stats.filteringRate * 100), "% reduction in Claude AI calls"),
                                processingTimeReduction: "".concat(Math.round(stats.filteringRate * 70), "% faster processing"),
                                estimatedMonthlySavings: "\u20AC".concat(Math.round(stats.filteringRate * 2000), " per 1000 users"),
                            }, filteringBreakdown: {
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
                            } })];
                });
            });
        };
        DashboardMailController_1.prototype.getSystemPerformance = function () {
            return __awaiter(this, void 0, void 0, function () {
                var performanceMetrics, recommendations, health;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            performanceMetrics = this.mailFilterService.getPerformanceMetrics();
                            return [4 /*yield*/, this.mailFilterService.getPerformanceRecommendations()];
                        case 1:
                            recommendations = _b.sent();
                            _a = {
                                status: 'healthy',
                                timestamp: new Date().toISOString()
                            };
                            return [4 /*yield*/, this.mailFilterService.getConcurrentEmailLimit()];
                        case 2:
                            health = (_a.concurrencyLimit = _b.sent(),
                                _a.performance = {
                                    cacheHitRate: performanceMetrics.cacheHitRate,
                                    errorRate: recommendations.currentPerformance.errorRate,
                                    avgLatency: recommendations.currentPerformance.avgLatency,
                                    status: recommendations.currentPerformance.status,
                                },
                                _a.recommendations = recommendations.recommendations,
                                _a);
                            return [2 /*return*/, {
                                    health: health,
                                    metrics: performanceMetrics,
                                    recommendations: recommendations.recommendations,
                                }];
                    }
                });
            });
        };
        DashboardMailController_1.prototype.testEmailFiltering = function () {
            return __awaiter(this, void 0, void 0, function () {
                var testEmails, results, _i, testEmails_1, email, filterResult;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            testEmails = [
                                {
                                    id: 'test-1',
                                    subject: 'Re: Votre candidature au poste de Développeur/se Full-Stack',
                                    body: "Bonjour Lin, \n\nJe vous contacte suite \u00E0 votre candidature au poste de D\u00E9veloppeur/se Full-Stack chez ADVANCED SCHEMA. Je vous recontacterais dans quelques jours si votre profils nous interesse\n\nJe vous souhaite une tr\u00E8s bonne continuation et n'ai aucun doute sur le fait que vous trouviez une opportunit\u00E9 \u00E0 votre convenance.\n\nCordialement,\nFlavie Puschmann\nTalent Acquisition\nADVANCED SCHEMA",
                                    sender: 'flavie.puschmann@advanced-schema.com',
                                },
                                {
                                    id: 'test-2',
                                    subject: 'Votre candidature a été envoyée à HONOR',
                                    body: "LinkedIn\t\nPascal Lin\nVotre candidature a \u00E9t\u00E9 envoy\u00E9e \u00E0 HONOR\nHONOR\t\nData Engineer Intern (pour une dur\u00E9e de 3 \u00E0 6 mois, ASAP)\nHONOR \u00B7 Issy-les-Moulineaux (Sur site)\n\nCandidature envoy\u00E9e le 3 juillet 2025\n\n\u00C0 vous de jouer, suivez les \u00E9tapes suivantes pour encore plus de succ\u00E8s\nVoir des offres d'emploi similaires qui pourraient vous int\u00E9resser",
                                    sender: 'noreply@linkedin.com',
                                },
                            ];
                            results = [];
                            _i = 0, testEmails_1 = testEmails;
                            _a.label = 1;
                        case 1:
                            if (!(_i < testEmails_1.length)) return [3 /*break*/, 4];
                            email = testEmails_1[_i];
                            return [4 /*yield*/, this.preFilterService.shouldProcessWithClaudeAI(email.body, email.subject, email.sender)];
                        case 2:
                            filterResult = _a.sent();
                            results.push({
                                emailId: email.id,
                                subject: email.subject,
                                sender: email.sender,
                                bodyPreview: email.body.substring(0, 200) + '...',
                                filterResult: filterResult,
                                analysis: {
                                    senderCheck: filterResult.details.senderCheck,
                                    contentScore: filterResult.details.contentScore,
                                    mlPrediction: filterResult.details.mlPrediction,
                                    features: {
                                        subjectKeywords: filterResult.details.strongIndicators || [],
                                        senderDomain: '',
                                        contentAnalysis: filterResult.details,
                                    },
                                },
                            });
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/, {
                                testResults: results,
                                summary: {
                                    totalTested: testEmails.length,
                                    passed: results.filter(function (r) { return r.filterResult.shouldProcess; }).length,
                                    filtered: results.filter(function (r) { return !r.filterResult.shouldProcess; }).length,
                                },
                                recommendations: results
                                    .filter(function (r) { return !r.filterResult.shouldProcess; })
                                    .map(function (r) { return ({
                                    emailId: r.emailId,
                                    issue: r.filterResult.reason,
                                    suggestion: _this.getSuggestionForFilteredEmail(r.filterResult),
                                }); }),
                            }];
                    }
                });
            });
        };
        DashboardMailController_1.prototype.getSystemReflection = function () {
            return __awaiter(this, void 0, void 0, function () {
                var recentAnalyses;
                return __generator(this, function (_a) {
                    recentAnalyses = this.mailFilterService.getRecentAnalyses(50);
                    return [2 /*return*/, {
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
                        }];
                });
            });
        };
        DashboardMailController_1.prototype.analyzePreFilterReasons = function (analyses) {
            var reasons = analyses
                .filter(function (a) { return !a.preFilterResult.shouldProcess; })
                .map(function (a) { return a.preFilterResult.reason; });
            return this.getTopReasons(reasons);
        };
        DashboardMailController_1.prototype.analyzeClaudeAISuccess = function (analyses) {
            var claudeAnalyses = analyses.filter(function (a) { return a.preFilterResult.shouldProcess; });
            var successful = claudeAnalyses.filter(function (a) { return a.extractedData && a.finalResult === 'success'; });
            return {
                successRate: claudeAnalyses.length > 0
                    ? successful.length / claudeAnalyses.length
                    : 0,
                totalProcessed: claudeAnalyses.length,
                successful: successful.length,
                failed: claudeAnalyses.length - successful.length,
                failureReasons: this.getFailureReasons(claudeAnalyses.filter(function (a) { return a.finalResult !== 'success'; })),
            };
        };
        DashboardMailController_1.prototype.analyzeJobComparisons = function (analyses) {
            var withComparisons = analyses.filter(function (a) {
                return a.existingJobsComparison &&
                    a.existingJobsComparison.similarJobs.length > 0;
            });
            var similarJobs = withComparisons.filter(function (a) {
                return a.existingJobsComparison.similarJobs.some(function (c) { return c.similarity > 0.7; });
            });
            return {
                totalWithComparisons: withComparisons.length,
                withSimilarJobs: similarJobs.length,
                avgSimilarity: withComparisons.reduce(function (acc, a) {
                    return acc +
                        a.existingJobsComparison.similarJobs.reduce(function (sum, c) { return sum + c.similarity; }, 0) /
                            a.existingJobsComparison.similarJobs.length;
                }, 0) / withComparisons.length,
                commonActions: this.getComparisonActions(withComparisons),
            };
        };
        DashboardMailController_1.prototype.identifyCommonIssues = function (analyses) {
            var issues = [];
            // High pre-filter rate
            var preFilterRate = analyses.filter(function (a) { return !a.preFilterResult.shouldProcess; }).length /
                analyses.length;
            if (preFilterRate > 0.9) {
                issues.push('Very high pre-filter rate - may be filtering too aggressively');
            }
            // Low Claude AI success rate
            var claudeAnalyses = analyses.filter(function (a) { return a.preFilterResult.shouldProcess; });
            var claudeSuccessRate = claudeAnalyses.filter(function (a) { return a.finalResult === 'success'; }).length /
                claudeAnalyses.length;
            if (claudeSuccessRate < 0.8) {
                issues.push('Low Claude AI success rate - prompt may need optimization');
            }
            return issues;
        };
        DashboardMailController_1.prototype.getFailureReasons = function (failedAnalyses) {
            return failedAnalyses
                .map(function (a) { return a.systemReflection.finalDecision; })
                .filter(Boolean);
        };
        DashboardMailController_1.prototype.getComparisonActions = function (similarAnalyses) {
            return similarAnalyses
                .map(function (a) { return a.existingJobsComparison.similarJobs.map(function (c) { return c.action; }); })
                .flat();
        };
        DashboardMailController_1.prototype.getTopReasons = function (reasons) {
            var counts = reasons.reduce(function (acc, reason) {
                acc[reason] = (acc[reason] || 0) + 1;
                return acc;
            }, {});
            return Object.entries(counts)
                .sort(function (_a, _b) {
                var a = _a[1];
                var b = _b[1];
                return b - a;
            })
                .slice(0, 5)
                .map(function (_a) {
                var reason = _a[0], count = _a[1];
                return ({ reason: reason, count: count });
            });
        };
        DashboardMailController_1.prototype.getMostEffectiveFilters = function (analyses) {
            return this.getTopReasons(analyses
                .filter(function (a) { return !a.preFilterResult.shouldProcess; })
                .map(function (a) { return a.preFilterResult.reason; }));
        };
        DashboardMailController_1.prototype.getImprovementAreas = function (analyses) {
            var areas = [];
            // Analyze processing failures
            var failures = analyses.filter(function (a) { return a.finalResult !== 'success'; });
            if (failures.length > 0) {
                areas.push({
                    area: 'Processing Failures',
                    description: 'Reduce processing errors and improve success rate',
                    count: failures.length,
                });
            }
            return areas;
        };
        DashboardMailController_1.prototype.getSuccessFactors = function (analyses) {
            var successful = analyses.filter(function (a) { return a.finalResult === 'success' && a.extractedData; });
            return {
                count: successful.length,
                factors: [
                    'Clean email content',
                    'Proper sender domain',
                    'Clear job description format',
                    'Structured email layout',
                ],
            };
        };
        DashboardMailController_1.prototype.generateAlerts = function (analyses, filteringStats, systemRecommendations) {
            var alerts = [];
            // Alerte taux de filtrage élevé
            if (filteringStats.filteringRate > 0.95) {
                alerts.push({
                    type: 'warning',
                    title: 'High filtering rate detected',
                    message: "".concat(Math.round(filteringStats.filteringRate * 100), "% of emails are being filtered out. Consider reviewing filter settings."),
                    severity: 'medium',
                });
            }
            // Alerte taux d'erreur élevé
            if (systemRecommendations.currentPerformance.errorRate > 0.1) {
                alerts.push({
                    type: 'error',
                    title: 'High error rate',
                    message: "".concat(Math.round(systemRecommendations.currentPerformance.errorRate * 100), "% error rate detected. System may need attention."),
                    severity: 'high',
                });
            }
            // Alerte latence élevée
            if (systemRecommendations.currentPerformance.avgLatency > 5000) {
                alerts.push({
                    type: 'warning',
                    title: 'High latency',
                    message: "Average processing time is ".concat(Math.round(systemRecommendations.currentPerformance.avgLatency), "ms. Consider optimizing."),
                    severity: 'medium',
                });
            }
            // Alerte analyses récentes faibles
            var recentSuccessRate = analyses.filter(function (a) { return a.finalResult === 'success'; }).length /
                analyses.length;
            if (recentSuccessRate < 0.7) {
                alerts.push({
                    type: 'warning',
                    title: 'Low success rate',
                    message: "Only ".concat(Math.round(recentSuccessRate * 100), "% of recent analyses were successful."),
                    severity: 'medium',
                });
            }
            return alerts;
        };
        DashboardMailController_1.prototype.getSuggestionForFilteredEmail = function (filterResult) {
            if (filterResult.reason.includes('Sender filtered')) {
                return "Consider adding this sender domain to the whitelist if it's a legitimate recruitment source";
            }
            if (filterResult.reason.includes('Content score too low')) {
                return 'Email lacks sufficient job-related keywords. Consider adding more recruitment terms to the keyword list';
            }
            if (filterResult.reason.includes('ML classifier rejected')) {
                return 'ML classifier deemed this email as non-recruitment. Consider adjusting ML thresholds or adding more training data';
            }
            return 'Review the filtering criteria and consider adjusting the pre-filter settings';
        };
        return DashboardMailController_1;
    }());
    __setFunctionName(_classThis, "DashboardMailController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getDashboardOverview_decorators = [(0, common_1.Get)('overview'), (0, swagger_1.ApiOperation)({
                summary: 'Get complete dashboard overview',
                description: 'All dashboard data in one response: stats, analyses, filtering performance, and system metrics',
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Complete dashboard overview retrieved successfully',
            })];
        _getDashboardStats_decorators = [(0, common_1.Get)('stats'), (0, swagger_1.ApiOperation)({
                summary: 'Get mail filtering dashboard statistics',
                description: 'Comprehensive statistics about email processing, filtering efficiency, and job application creation',
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Dashboard statistics retrieved successfully',
                type: dashboard_response_dto_1.DashboardStatsDto,
            })];
        _getRecentAnalyses_decorators = [(0, common_1.Get)('analyses'), (0, swagger_1.ApiOperation)({
                summary: 'Get recent email analyses',
                description: 'Detailed analysis results for recent emails including pre-filtering decisions and Claude AI reasoning',
            }), (0, swagger_1.ApiQuery)({
                name: 'limit',
                required: false,
                type: Number,
                description: 'Number of analyses to return (default: 20, max: 100)',
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Recent analyses retrieved successfully',
                type: [dashboard_response_dto_1.EmailAnalysisResult],
            })];
        _getEmailAnalysis_decorators = [(0, common_1.Get)('analysis/:emailId'), (0, swagger_1.ApiOperation)({
                summary: 'Get detailed analysis for specific email',
                description: 'Complete analysis breakdown including pre-filtering, Claude AI reasoning, and comparison results',
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Email analysis retrieved successfully',
                type: dashboard_response_dto_1.EmailAnalysisResult,
            }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Email analysis not found' })];
        _getFilteringStats_decorators = [(0, common_1.Get)('filtering-stats'), (0, swagger_1.ApiOperation)({
                summary: 'Get pre-filtering statistics',
                description: 'Detailed statistics about the email pre-filtering system performance',
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Pre-filtering statistics retrieved successfully',
            })];
        _getSystemPerformance_decorators = [(0, common_1.Get)('system-performance'), (0, swagger_1.ApiOperation)({
                summary: 'Get system performance metrics',
                description: 'Real-time performance metrics and system health indicators',
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'System performance metrics retrieved successfully',
            })];
        _testEmailFiltering_decorators = [(0, common_1.Get)('debug/email-test'), (0, swagger_1.ApiOperation)({
                summary: 'Test email filtering with sample content',
                description: 'Test the pre-filtering system with sample email content to debug filtering decisions',
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Email filtering test results',
            })];
        _getSystemReflection_decorators = [(0, common_1.Get)('debug/reflection'), (0, swagger_1.ApiOperation)({
                summary: 'Get system reflection and debugging information',
                description: 'Advanced debugging information including system reasoning and decision patterns',
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'System reflection data retrieved successfully',
            })];
        __esDecorate(_classThis, null, _getDashboardOverview_decorators, { kind: "method", name: "getDashboardOverview", static: false, private: false, access: { has: function (obj) { return "getDashboardOverview" in obj; }, get: function (obj) { return obj.getDashboardOverview; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getDashboardStats_decorators, { kind: "method", name: "getDashboardStats", static: false, private: false, access: { has: function (obj) { return "getDashboardStats" in obj; }, get: function (obj) { return obj.getDashboardStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getRecentAnalyses_decorators, { kind: "method", name: "getRecentAnalyses", static: false, private: false, access: { has: function (obj) { return "getRecentAnalyses" in obj; }, get: function (obj) { return obj.getRecentAnalyses; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getEmailAnalysis_decorators, { kind: "method", name: "getEmailAnalysis", static: false, private: false, access: { has: function (obj) { return "getEmailAnalysis" in obj; }, get: function (obj) { return obj.getEmailAnalysis; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getFilteringStats_decorators, { kind: "method", name: "getFilteringStats", static: false, private: false, access: { has: function (obj) { return "getFilteringStats" in obj; }, get: function (obj) { return obj.getFilteringStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSystemPerformance_decorators, { kind: "method", name: "getSystemPerformance", static: false, private: false, access: { has: function (obj) { return "getSystemPerformance" in obj; }, get: function (obj) { return obj.getSystemPerformance; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _testEmailFiltering_decorators, { kind: "method", name: "testEmailFiltering", static: false, private: false, access: { has: function (obj) { return "testEmailFiltering" in obj; }, get: function (obj) { return obj.testEmailFiltering; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSystemReflection_decorators, { kind: "method", name: "getSystemReflection", static: false, private: false, access: { has: function (obj) { return "getSystemReflection" in obj; }, get: function (obj) { return obj.getSystemReflection; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DashboardMailController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DashboardMailController = _classThis;
}();
exports.DashboardMailController = DashboardMailController;
