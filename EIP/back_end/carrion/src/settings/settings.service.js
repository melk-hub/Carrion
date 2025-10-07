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
exports.SettingsService = void 0;
var common_1 = require("@nestjs/common");
var SettingsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var SettingsService = _classThis = /** @class */ (function () {
        function SettingsService_1(prisma, notificationService) {
            this.prisma = prisma;
            this.notificationService = notificationService;
        }
        SettingsService_1.prototype.getWeeklyGoal = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var settings, newSettings;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.settings.findUnique({
                                where: { userId: userId },
                                select: { weeklyGoal: true },
                            })];
                        case 1:
                            settings = _a.sent();
                            if (!!settings) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.settings.create({
                                    data: {
                                        userId: userId,
                                        weeklyGoal: 10,
                                        monthlyGoal: 30,
                                    },
                                    select: { weeklyGoal: true },
                                })];
                        case 2:
                            newSettings = _a.sent();
                            return [2 /*return*/, newSettings];
                        case 3: return [2 /*return*/, settings];
                    }
                });
            });
        };
        SettingsService_1.prototype.getGoalSettings = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var settings, newSettings;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.settings.findUnique({
                                where: { userId: userId },
                                select: { weeklyGoal: true, monthlyGoal: true },
                            })];
                        case 1:
                            settings = _a.sent();
                            if (!!settings) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.settings.create({
                                    data: {
                                        userId: userId,
                                        weeklyGoal: 10,
                                        monthlyGoal: 30,
                                    },
                                    select: { weeklyGoal: true, monthlyGoal: true },
                                })];
                        case 2:
                            newSettings = _a.sent();
                            return [2 /*return*/, newSettings];
                        case 3: return [2 /*return*/, settings];
                    }
                });
            });
        };
        SettingsService_1.prototype.updateWeeklyGoal = function (userId, weeklyGoal) {
            return __awaiter(this, void 0, void 0, function () {
                var existingSettings, oldWeeklyGoal, result_1, result, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (weeklyGoal < 1 || weeklyGoal > 100) {
                                throw new common_1.BadRequestException('Weekly goal must be between 1 and 100');
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 9, , 10]);
                            return [4 /*yield*/, this.prisma.settings.findUnique({
                                    where: { userId: userId },
                                })];
                        case 2:
                            existingSettings = _a.sent();
                            oldWeeklyGoal = (existingSettings === null || existingSettings === void 0 ? void 0 : existingSettings.weeklyGoal) || 10;
                            if (!!existingSettings) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.prisma.settings.create({
                                    data: {
                                        userId: userId,
                                        weeklyGoal: weeklyGoal,
                                        monthlyGoal: 30,
                                    },
                                    select: { weeklyGoal: true },
                                })];
                        case 3:
                            result_1 = _a.sent();
                            // Notification pour création initiale
                            return [4 /*yield*/, this.notificationService.createNotification({
                                    userId: userId,
                                    titleKey: 'notifications.titles.goal.weekly',
                                    messageKey: 'notifications.goal.weekly.created',
                                    type: 'INFO',
                                    variables: {
                                        weeklyGoal: weeklyGoal,
                                    },
                                })];
                        case 4:
                            // Notification pour création initiale
                            _a.sent();
                            return [2 /*return*/, result_1];
                        case 5: return [4 /*yield*/, this.prisma.settings.update({
                                where: { userId: userId },
                                data: { weeklyGoal: weeklyGoal },
                                select: { weeklyGoal: true },
                            })];
                        case 6:
                            result = _a.sent();
                            if (!(oldWeeklyGoal !== weeklyGoal)) return [3 /*break*/, 8];
                            return [4 /*yield*/, this.notificationService.createNotification({
                                    userId: userId,
                                    titleKey: 'notifications.titles.goal.weekly.updated',
                                    messageKey: 'notifications.goal.weekly.updated',
                                    type: 'INFO',
                                    variables: {
                                        oldGoal: oldWeeklyGoal,
                                        newGoal: weeklyGoal,
                                    },
                                })];
                        case 7:
                            _a.sent();
                            _a.label = 8;
                        case 8: return [2 /*return*/, result];
                        case 9:
                            error_1 = _a.sent();
                            throw new common_1.BadRequestException("Failed to update weekly goal: ".concat(error_1.message));
                        case 10: return [2 /*return*/];
                    }
                });
            });
        };
        SettingsService_1.prototype.updateGoalSettings = function (userId, weeklyGoal, monthlyGoal) {
            return __awaiter(this, void 0, void 0, function () {
                var existingSettings, oldWeeklyGoal, oldMonthlyGoal, updateData, result_2, result, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (weeklyGoal !== undefined && (weeklyGoal < 1 || weeklyGoal > 100)) {
                                throw new common_1.BadRequestException('Weekly goal must be between 1 and 100');
                            }
                            if (monthlyGoal !== undefined && (monthlyGoal < 1 || monthlyGoal > 500)) {
                                throw new common_1.BadRequestException('Monthly goal must be between 1 and 500');
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 14, , 15]);
                            return [4 /*yield*/, this.prisma.settings.findUnique({
                                    where: { userId: userId },
                                })];
                        case 2:
                            existingSettings = _a.sent();
                            oldWeeklyGoal = (existingSettings === null || existingSettings === void 0 ? void 0 : existingSettings.weeklyGoal) || 10;
                            oldMonthlyGoal = (existingSettings === null || existingSettings === void 0 ? void 0 : existingSettings.monthlyGoal) || 30;
                            updateData = {};
                            if (weeklyGoal !== undefined)
                                updateData.weeklyGoal = weeklyGoal;
                            if (monthlyGoal !== undefined)
                                updateData.monthlyGoal = monthlyGoal;
                            if (!!existingSettings) return [3 /*break*/, 8];
                            return [4 /*yield*/, this.prisma.settings.create({
                                    data: {
                                        userId: userId,
                                        weeklyGoal: weeklyGoal || 10,
                                        monthlyGoal: monthlyGoal || 30,
                                    },
                                    select: { weeklyGoal: true, monthlyGoal: true },
                                })];
                        case 3:
                            result_2 = _a.sent();
                            if (!(weeklyGoal !== undefined)) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.notificationService.createNotification({
                                    userId: userId,
                                    titleKey: 'notifications.titles.goal.weekly',
                                    messageKey: 'notifications.goal.weekly.created',
                                    type: 'INFO',
                                    variables: {
                                        weeklyGoal: weeklyGoal,
                                    },
                                })];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5:
                            if (!(monthlyGoal !== undefined)) return [3 /*break*/, 7];
                            return [4 /*yield*/, this.notificationService.createNotification({
                                    userId: userId,
                                    titleKey: 'notifications.titles.goal.monthly',
                                    messageKey: 'notifications.goal.monthly.created',
                                    type: 'INFO',
                                    variables: {
                                        monthlyGoal: monthlyGoal,
                                    },
                                })];
                        case 6:
                            _a.sent();
                            _a.label = 7;
                        case 7: return [2 /*return*/, result_2];
                        case 8: return [4 /*yield*/, this.prisma.settings.update({
                                where: { userId: userId },
                                data: updateData,
                                select: { weeklyGoal: true, monthlyGoal: true },
                            })];
                        case 9:
                            result = _a.sent();
                            if (!(weeklyGoal !== undefined && oldWeeklyGoal !== weeklyGoal)) return [3 /*break*/, 11];
                            return [4 /*yield*/, this.notificationService.createNotification({
                                    userId: userId,
                                    titleKey: 'notifications.titles.goal.weekly.updated',
                                    messageKey: 'notifications.goal.weekly.updated',
                                    type: 'INFO',
                                    variables: {
                                        oldGoal: oldWeeklyGoal,
                                        newGoal: weeklyGoal,
                                    },
                                })];
                        case 10:
                            _a.sent();
                            _a.label = 11;
                        case 11:
                            if (!(monthlyGoal !== undefined && oldMonthlyGoal !== monthlyGoal)) return [3 /*break*/, 13];
                            return [4 /*yield*/, this.notificationService.createNotification({
                                    userId: userId,
                                    titleKey: 'notifications.titles.goal.monthly.updated',
                                    messageKey: 'notifications.goal.monthly.updated',
                                    type: 'INFO',
                                    variables: {
                                        oldGoal: oldMonthlyGoal,
                                        newGoal: monthlyGoal,
                                    },
                                })];
                        case 12:
                            _a.sent();
                            _a.label = 13;
                        case 13: return [2 /*return*/, result];
                        case 14:
                            error_2 = _a.sent();
                            throw new common_1.BadRequestException("Failed to update goal settings: ".concat(error_2.message));
                        case 15: return [2 /*return*/];
                    }
                });
            });
        };
        SettingsService_1.prototype.getUserSettings = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var settings;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.settings.findUnique({
                                where: { userId: userId },
                            })];
                        case 1:
                            settings = _a.sent();
                            if (!!settings) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.settings.create({
                                    data: {
                                        userId: userId,
                                        weeklyGoal: 10,
                                        monthlyGoal: 30,
                                    },
                                })];
                        case 2: return [2 /*return*/, _a.sent()];
                        case 3: return [2 /*return*/, settings];
                    }
                });
            });
        };
        SettingsService_1.prototype.createOrUpdateSettings = function (userId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var existingSettings, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, , 6]);
                            return [4 /*yield*/, this.prisma.settings.findUnique({
                                    where: { userId: userId },
                                })];
                        case 1:
                            existingSettings = _a.sent();
                            if (!!existingSettings) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.settings.create({
                                    data: __assign({ UserId: userId }, data),
                                })];
                        case 2: return [2 /*return*/, _a.sent()];
                        case 3: return [4 /*yield*/, this.prisma.settings.update({
                                where: { userId: userId },
                                data: data,
                            })];
                        case 4: return [2 /*return*/, _a.sent()];
                        case 5:
                            error_3 = _a.sent();
                            throw new common_1.BadRequestException("Failed to update settings: ".concat(error_3.message));
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        return SettingsService_1;
    }());
    __setFunctionName(_classThis, "SettingsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SettingsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SettingsService = _classThis;
}();
exports.SettingsService = SettingsService;
