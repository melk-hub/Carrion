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
exports.StatisticsService = void 0;
var common_1 = require("@nestjs/common");
var date_fns_1 = require("date-fns");
var StatisticsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var StatisticsService = _classThis = /** @class */ (function () {
        function StatisticsService_1(prisma) {
            this.prisma = prisma;
        }
        StatisticsService_1.prototype.getStatistics = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var now, sevenDaysAgo, thirtyDaysAgo, _a, totalApplications, applicationsToday, applicationsLast7Days, applicationsLast30Days, applicationsGroupedByDate, statusDistribution, contractDistribution, companyDistribution, locationDistribution, interviewCount, lastApplication, streakData, milestones, PERSONAL_GOAL, personalGoalAchieved;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            now = new Date();
                            sevenDaysAgo = (0, date_fns_1.subDays)(now, 6);
                            thirtyDaysAgo = (0, date_fns_1.subDays)(now, 29);
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.jobApply.count({ where: { userId: userId } }),
                                    this.prisma.jobApply.count({
                                        where: { userId: userId, createdAt: { gte: (0, date_fns_1.startOfDay)(now) } },
                                    }),
                                    this.prisma.jobApply.count({
                                        where: { userId: userId, createdAt: { gte: sevenDaysAgo } },
                                    }),
                                    this.prisma.jobApply.count({
                                        where: { userId: userId, createdAt: { gte: thirtyDaysAgo } },
                                    }),
                                    this.getApplicationsGroupedByDate(userId),
                                    this.getGroupedCount(userId, 'status'),
                                    this.getGroupedCount(userId, 'contractType'),
                                    this.getGroupedCount(userId, 'company'),
                                    this.getGroupedCount(userId, 'location'),
                                    this.prisma.jobApply.count({
                                        where: { userId: userId, interviewDate: { not: null } },
                                    }),
                                    this.prisma.jobApply.findFirst({
                                        where: { userId: userId },
                                        orderBy: { createdAt: 'desc' },
                                        select: { createdAt: true },
                                    }),
                                ])];
                        case 1:
                            _a = _c.sent(), totalApplications = _a[0], applicationsToday = _a[1], applicationsLast7Days = _a[2], applicationsLast30Days = _a[3], applicationsGroupedByDate = _a[4], statusDistribution = _a[5], contractDistribution = _a[6], companyDistribution = _a[7], locationDistribution = _a[8], interviewCount = _a[9], lastApplication = _a[10];
                            streakData = this.calculateStreaks(applicationsGroupedByDate);
                            milestones = {
                                3: totalApplications >= 3,
                                5: totalApplications >= 5,
                                100: totalApplications >= 100,
                                200: totalApplications >= 200,
                            };
                            PERSONAL_GOAL = 10;
                            personalGoalAchieved = applicationsLast7Days >= PERSONAL_GOAL;
                            return [2 /*return*/, {
                                    totalApplications: totalApplications,
                                    applicationsToday: applicationsToday,
                                    applicationsThisWeek: applicationsLast7Days,
                                    applicationsThisMonth: applicationsLast30Days,
                                    applicationsPerDay: applicationsGroupedByDate,
                                    statusDistribution: statusDistribution,
                                    contractTypeDistribution: contractDistribution,
                                    companyDistribution: companyDistribution,
                                    locationDistribution: locationDistribution,
                                    interviewCount: interviewCount,
                                    lastApplicationDate: (_b = lastApplication === null || lastApplication === void 0 ? void 0 : lastApplication.createdAt) !== null && _b !== void 0 ? _b : null,
                                    streak: streakData.currentStreak,
                                    bestStreak: streakData.bestStreak,
                                    milestones: milestones,
                                    personalGoal: {
                                        target: PERSONAL_GOAL,
                                        achieved: personalGoalAchieved,
                                        current: applicationsLast7Days,
                                    },
                                }];
                    }
                });
            });
        };
        StatisticsService_1.prototype.getGroupedCount = function (userId, field) {
            return __awaiter(this, void 0, void 0, function () {
                var raw;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.jobApply.groupBy({
                                by: [field],
                                where: { userId: userId },
                                _count: { _all: true },
                            })];
                        case 1:
                            raw = _a.sent();
                            return [2 /*return*/, Object.fromEntries(raw.map(function (item) { var _a; return [(_a = item[field]) !== null && _a !== void 0 ? _a : 'Non renseigné', item._count._all]; }))];
                    }
                });
            });
        };
        StatisticsService_1.prototype.getApplicationsGroupedByDate = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var from, results, grouped;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            from = (0, date_fns_1.subDays)(new Date(), 30);
                            return [4 /*yield*/, this.prisma.jobApply.groupBy({
                                    by: ['createdAt'],
                                    where: {
                                        userId: userId,
                                        createdAt: { gte: from },
                                    },
                                    _count: { _all: true },
                                })];
                        case 1:
                            results = _a.sent();
                            grouped = {};
                            results.forEach(function (_a) {
                                var createdAt = _a.createdAt, _count = _a._count;
                                var dateStr = (0, date_fns_1.format)(createdAt, 'yyyy-MM-dd');
                                grouped[dateStr] = (grouped[dateStr] || 0) + _count._all;
                            });
                            return [2 /*return*/, grouped];
                    }
                });
            });
        };
        StatisticsService_1.prototype.calculateStreaks = function (groupedByDate) {
            var streak = 0;
            var bestStreak = 0;
            var currentDate = new Date();
            while (true) {
                var key = (0, date_fns_1.format)(currentDate, 'yyyy-MM-dd');
                if (groupedByDate[key]) {
                    streak++;
                    bestStreak = Math.max(bestStreak, streak);
                    currentDate = (0, date_fns_1.subDays)(currentDate, 1);
                }
                else {
                    break;
                }
            }
            return {
                currentStreak: streak,
                bestStreak: bestStreak,
            };
        };
        StatisticsService_1.prototype.getApplicationLocations = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var jobApplications, locationData;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.jobApply.findMany({
                                where: {
                                    userId: userId,
                                    location: {
                                        not: null,
                                    },
                                },
                                select: {
                                    id: true,
                                    location: true,
                                    company: true,
                                    title: true,
                                    status: true,
                                    createdAt: true,
                                },
                            })];
                        case 1:
                            jobApplications = _a.sent();
                            locationData = this.groupApplicationsByLocation(jobApplications);
                            return [2 /*return*/, {
                                    totalLocations: locationData.length,
                                    locations: locationData,
                                }];
                    }
                });
            });
        };
        StatisticsService_1.prototype.groupApplicationsByLocation = function (applications) {
            var _this = this;
            var locationMap = new Map();
            applications.forEach(function (app) {
                var location = app.location;
                if (!locationMap.has(location)) {
                    locationMap.set(location, {
                        location: location,
                        count: 0,
                        applications: [],
                        // Mock coordinates - in production, you'd geocode these
                        coordinates: _this.getMockCoordinates(location),
                    });
                }
                var locationData = locationMap.get(location);
                locationData.count++;
                locationData.applications.push({
                    id: app.id,
                    company: app.company,
                    jobTitle: app.title,
                    status: app.status,
                    date: app.createdAt,
                });
            });
            return Array.from(locationMap.values());
        };
        StatisticsService_1.prototype.getMockCoordinates = function (location) {
            // Mock coordinates for major French cities
            var coordinates = {
                Paris: [48.8566, 2.3522],
                Lyon: [45.764, 4.8357],
                Marseille: [43.2965, 5.3698],
                Toulouse: [43.6047, 1.4442],
                Nice: [43.7102, 7.262],
                Nantes: [47.2184, -1.5536],
                Strasbourg: [48.5734, 7.7521],
                Montpellier: [43.611, 3.8767],
                Bordeaux: [44.8378, -0.5792],
                Lille: [50.6292, 3.0573],
                Rennes: [48.1173, -1.6778],
                Reims: [49.2583, 4.0317],
                'Le Havre': [49.4944, 0.1079],
                'Saint-Étienne': [45.4397, 4.3872],
                Toulon: [43.1242, 5.928],
                Grenoble: [45.1885, 5.7245],
                Dijon: [47.322, 5.0415],
                Angers: [47.4784, -0.5632],
                Nîmes: [43.8367, 4.3601],
                Villeurbanne: [45.7663, 4.8795],
            };
            return coordinates[location] || [48.8566, 2.3522]; // Default to Paris
        };
        return StatisticsService_1;
    }());
    __setFunctionName(_classThis, "StatisticsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        StatisticsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return StatisticsService = _classThis;
}();
exports.StatisticsService = StatisticsService;
