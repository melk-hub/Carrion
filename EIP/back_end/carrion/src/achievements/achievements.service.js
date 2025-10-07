"use strict";
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
exports.AchievementsService = void 0;
var common_1 = require("@nestjs/common");
var AchievementsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AchievementsService = _classThis = /** @class */ (function () {
        function AchievementsService_1(prisma) {
            this.prisma = prisma;
        }
        AchievementsService_1.prototype.getAllAchievements = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.carrionAchievement.findMany({
                            where: { isActive: true },
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                category: true,
                                type: true,
                                threshold: true,
                                condition: true,
                                points: true,
                                isActive: true,
                                createdAt: true,
                            },
                            orderBy: [{ category: 'asc' }, { points: 'asc' }],
                        })];
                });
            });
        };
        AchievementsService_1.prototype.getUserAchievements = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.userAchievement.findMany({
                            where: { userId: userId },
                            include: {
                                achievement: {
                                    select: {
                                        id: true,
                                        title: true,
                                        description: true,
                                        category: true,
                                        type: true,
                                        threshold: true,
                                        condition: true,
                                        points: true,
                                        isActive: true,
                                        createdAt: true,
                                    },
                                },
                            },
                            orderBy: { unlockedAt: 'desc' },
                        })];
                });
            });
        };
        AchievementsService_1.prototype.checkAndUnlockAchievements = function (userId, statsData) {
            return __awaiter(this, void 0, void 0, function () {
                var userAchievements, unlockedAchievementIds, availableAchievements, newlyUnlocked, _i, availableAchievements_1, achievement, userAchievement;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getUserAchievements(userId)];
                        case 1:
                            userAchievements = _a.sent();
                            unlockedAchievementIds = userAchievements.map(function (ua) { return ua.achievementId; });
                            return [4 /*yield*/, this.prisma.carrionAchievement.findMany({
                                    where: {
                                        isActive: true,
                                        id: { notIn: unlockedAchievementIds },
                                    },
                                })];
                        case 2:
                            availableAchievements = _a.sent();
                            newlyUnlocked = [];
                            _i = 0, availableAchievements_1 = availableAchievements;
                            _a.label = 3;
                        case 3:
                            if (!(_i < availableAchievements_1.length)) return [3 /*break*/, 6];
                            achievement = availableAchievements_1[_i];
                            if (!this.checkAchievementCondition(achievement, statsData)) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.prisma.userAchievement.create({
                                    data: {
                                        userId: userId,
                                        achievementId: achievement.id,
                                        unlockedAt: new Date(),
                                    },
                                    include: {
                                        achievement: {
                                            select: {
                                                id: true,
                                                title: true,
                                                description: true,
                                                category: true,
                                                type: true,
                                                threshold: true,
                                                condition: true,
                                                points: true,
                                                isActive: true,
                                                createdAt: true,
                                            },
                                        },
                                    },
                                })];
                        case 4:
                            userAchievement = _a.sent();
                            newlyUnlocked.push(userAchievement);
                            _a.label = 5;
                        case 5:
                            _i++;
                            return [3 /*break*/, 3];
                        case 6: return [2 /*return*/, newlyUnlocked];
                    }
                });
            });
        };
        AchievementsService_1.prototype.checkAchievementCondition = function (achievement, statsData) {
            // Logique simple pour vérifier les conditions
            switch (achievement.type) {
                case 'CUMULATIVE':
                    if (achievement.condition.includes('applications_count')) {
                        return statsData.applicationsCount >= achievement.threshold;
                    }
                    if (achievement.condition.includes('interviews_count')) {
                        return statsData.interviewsCount >= achievement.threshold;
                    }
                    if (achievement.condition.includes('offers_count')) {
                        return statsData.offersCount >= achievement.threshold;
                    }
                    break;
                case 'CONSECUTIVE':
                    if (achievement.condition.includes('consecutive_days')) {
                        return statsData.consecutiveDays >= achievement.threshold;
                    }
                    break;
                case 'PERCENTAGE':
                    if (achievement.condition.includes('interview_rate')) {
                        return statsData.interviewRate >= achievement.threshold;
                    }
                    if (achievement.condition.includes('response_rate')) {
                        return statsData.responseRate >= achievement.threshold;
                    }
                    break;
                case 'ACTION':
                    if (achievement.condition.includes('registration')) {
                        return true; // L'utilisateur existe, donc il est inscrit
                    }
                    break;
                default:
                    return false;
            }
            return false;
        };
        AchievementsService_1.prototype.getUserStats = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var achievements, totalPoints;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getUserAchievements(userId)];
                        case 1:
                            achievements = _a.sent();
                            totalPoints = achievements.reduce(function (sum, ua) { return sum + ua.achievement.points; }, 0);
                            return [2 /*return*/, {
                                    totalAchievements: achievements.length,
                                    totalPoints: totalPoints,
                                    achievements: achievements.map(function (ua) { return ua.achievement; }),
                                }];
                    }
                });
            });
        };
        return AchievementsService_1;
    }());
    __setFunctionName(_classThis, "AchievementsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AchievementsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AchievementsService = _classThis;
}();
exports.AchievementsService = AchievementsService;
