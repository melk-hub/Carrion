"use strict";
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
exports.SettingsController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../auth/guards/jwt/jwt-auth.guard");
var swagger_1 = require("@nestjs/swagger");
var SettingsController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('Settings'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Controller)('settings'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getGoalSettings_decorators;
    var _getWeeklyGoal_decorators;
    var _updateGoalSettings_decorators;
    var _updateWeeklyGoal_decorators;
    var _getUserSettings_decorators;
    var SettingsController = _classThis = /** @class */ (function () {
        function SettingsController_1(settingsService) {
            this.settingsService = (__runInitializers(this, _instanceExtraInitializers), settingsService);
        }
        SettingsController_1.prototype.getGoalSettings = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.settingsService.getGoalSettings(req.user.id)];
                });
            });
        };
        SettingsController_1.prototype.getWeeklyGoal = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.settingsService.getWeeklyGoal(req.user.id)];
                });
            });
        };
        SettingsController_1.prototype.updateGoalSettings = function (req, updateGoalDto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.settingsService.updateGoalSettings(req.user.id, updateGoalDto.weeklyGoal, updateGoalDto.monthlyGoal)];
                });
            });
        };
        SettingsController_1.prototype.updateWeeklyGoal = function (req, updateGoalDto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.settingsService.updateWeeklyGoal(req.user.id, updateGoalDto.weeklyGoal)];
                });
            });
        };
        SettingsController_1.prototype.getUserSettings = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.settingsService.getUserSettings(req.user.id)];
                });
            });
        };
        return SettingsController_1;
    }());
    __setFunctionName(_classThis, "SettingsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getGoalSettings_decorators = [(0, common_1.Get)('goal'), (0, swagger_1.ApiOperation)({ summary: 'Get user goal settings' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Goal settings retrieved successfully',
            }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Settings not found' })];
        _getWeeklyGoal_decorators = [(0, common_1.Get)('goal/weekly'), (0, swagger_1.ApiOperation)({ summary: 'Get user weekly goal' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Weekly goal retrieved successfully',
            }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Settings not found' })];
        _updateGoalSettings_decorators = [(0, common_1.Put)('goal'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Update user goal settings' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Goal settings updated successfully',
            }), (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid goal value' })];
        _updateWeeklyGoal_decorators = [(0, common_1.Put)('goal/weekly'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Update user weekly goal' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Weekly goal updated successfully' }), (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid goal value' })];
        _getUserSettings_decorators = [(0, common_1.Get)(), (0, swagger_1.ApiOperation)({ summary: 'Get all user settings' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Settings retrieved successfully' })];
        __esDecorate(_classThis, null, _getGoalSettings_decorators, { kind: "method", name: "getGoalSettings", static: false, private: false, access: { has: function (obj) { return "getGoalSettings" in obj; }, get: function (obj) { return obj.getGoalSettings; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getWeeklyGoal_decorators, { kind: "method", name: "getWeeklyGoal", static: false, private: false, access: { has: function (obj) { return "getWeeklyGoal" in obj; }, get: function (obj) { return obj.getWeeklyGoal; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateGoalSettings_decorators, { kind: "method", name: "updateGoalSettings", static: false, private: false, access: { has: function (obj) { return "updateGoalSettings" in obj; }, get: function (obj) { return obj.updateGoalSettings; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateWeeklyGoal_decorators, { kind: "method", name: "updateWeeklyGoal", static: false, private: false, access: { has: function (obj) { return "updateWeeklyGoal" in obj; }, get: function (obj) { return obj.updateWeeklyGoal; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUserSettings_decorators, { kind: "method", name: "getUserSettings", static: false, private: false, access: { has: function (obj) { return "getUserSettings" in obj; }, get: function (obj) { return obj.getUserSettings; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SettingsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SettingsController = _classThis;
}();
exports.SettingsController = SettingsController;
