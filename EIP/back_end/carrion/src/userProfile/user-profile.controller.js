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
exports.UserProfileController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../auth/guards/jwt/jwt-auth.guard");
var swagger_1 = require("@nestjs/swagger");
var UserProfileController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('user-profile'), (0, common_1.Controller)('user-profile'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getUserProfile_decorators;
    var _createOrUpdateUserProfile_decorators;
    var _getUserServicesList_decorators;
    var _disconnectAllServices_decorators;
    var _disconnectService_decorators;
    var _getUserProfilePicture_decorators;
    var UserProfileController = _classThis = /** @class */ (function () {
        function UserProfileController_1(userProfileService) {
            this.userProfileService = (__runInitializers(this, _instanceExtraInitializers), userProfileService);
        }
        UserProfileController_1.prototype.getUserProfile = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                var userId, profile;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            userId = req.user.id;
                            return [4 /*yield*/, this.userProfileService.getUserProfileByUserId(userId)];
                        case 1:
                            profile = _a.sent();
                            if (!profile) {
                                throw new common_1.NotFoundException('User profile not found.');
                            }
                            return [2 /*return*/, profile];
                    }
                });
            });
        };
        UserProfileController_1.prototype.createOrUpdateUserProfile = function (req, userProfileDto) {
            return __awaiter(this, void 0, void 0, function () {
                var userId, message, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            userId = req.user.id;
                            return [4 /*yield*/, this.userProfileService.createOrUpdateProfile(userId, userProfileDto)];
                        case 1:
                            message = _a.sent();
                            return [2 /*return*/, { message: message }];
                        case 2:
                            error_1 = _a.sent();
                            common_1.Logger.error(error_1.message, 'UserProfileController');
                            return [2 /*return*/, { message: 'Error saving user profile' }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        UserProfileController_1.prototype.getUserServicesList = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                var userId, services;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            userId = req.user.id;
                            return [4 /*yield*/, this.userProfileService.getUserServicesList(userId)];
                        case 1:
                            services = _a.sent();
                            return [2 /*return*/, services];
                    }
                });
            });
        };
        UserProfileController_1.prototype.disconnectAllServices = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                var userId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            userId = req.user.id;
                            return [4 /*yield*/, this.userProfileService.disconnectAllServices(userId)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        UserProfileController_1.prototype.disconnectService = function (req, serviceName) {
            return __awaiter(this, void 0, void 0, function () {
                var userId, validServices;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            userId = req.user.id;
                            validServices = ['Google_oauth2', 'Microsoft_oauth2'];
                            if (!validServices.includes(serviceName)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.userProfileService.disconnectService(userId, serviceName)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            });
        };
        UserProfileController_1.prototype.getUserProfilePicture = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                var userId, profilePicture;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            userId = req.query.userId || req.user.id;
                            return [4 /*yield*/, this.userProfileService.getUserProfilePicture(userId)];
                        case 1:
                            profilePicture = _a.sent();
                            if (!profilePicture) {
                                throw new common_1.NotFoundException('User profile picture not found.');
                            }
                            return [2 /*return*/, profilePicture];
                    }
                });
            });
        };
        return UserProfileController_1;
    }());
    __setFunctionName(_classThis, "UserProfileController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getUserProfile_decorators = [(0, swagger_1.ApiOperation)({ summary: "Get the current user's profile" }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Returns the user profile.',
            }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Profile not found.' }), (0, common_1.Get)()];
        _createOrUpdateUserProfile_decorators = [(0, swagger_1.ApiOperation)({ summary: 'Create or update the user profile' }), (0, swagger_1.ApiResponse)({
                status: 201,
                description: 'User profile created or updated successfully.',
            }), (0, common_1.Post)()];
        _getUserServicesList_decorators = [(0, swagger_1.ApiOperation)({ summary: 'Get the user services list' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Returns the user services list.',
            }), (0, common_1.Get)('services')];
        _disconnectAllServices_decorators = [(0, common_1.Delete)('services/all'), (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT), (0, swagger_1.ApiOperation)({ summary: 'Disconnect all services from the user account' })];
        _disconnectService_decorators = [(0, common_1.Delete)('services/:serviceName'), (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT), (0, swagger_1.ApiOperation)({
                summary: 'Disconnect a single service from the user account',
            })];
        _getUserProfilePicture_decorators = [(0, swagger_1.ApiOperation)({ summary: "Get the current user's profile picture" }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: "Returns the user's profile picture.",
            }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Profile picture not found.' }), (0, common_1.Get)('imageUrl')];
        __esDecorate(_classThis, null, _getUserProfile_decorators, { kind: "method", name: "getUserProfile", static: false, private: false, access: { has: function (obj) { return "getUserProfile" in obj; }, get: function (obj) { return obj.getUserProfile; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createOrUpdateUserProfile_decorators, { kind: "method", name: "createOrUpdateUserProfile", static: false, private: false, access: { has: function (obj) { return "createOrUpdateUserProfile" in obj; }, get: function (obj) { return obj.createOrUpdateUserProfile; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUserServicesList_decorators, { kind: "method", name: "getUserServicesList", static: false, private: false, access: { has: function (obj) { return "getUserServicesList" in obj; }, get: function (obj) { return obj.getUserServicesList; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _disconnectAllServices_decorators, { kind: "method", name: "disconnectAllServices", static: false, private: false, access: { has: function (obj) { return "disconnectAllServices" in obj; }, get: function (obj) { return obj.disconnectAllServices; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _disconnectService_decorators, { kind: "method", name: "disconnectService", static: false, private: false, access: { has: function (obj) { return "disconnectService" in obj; }, get: function (obj) { return obj.disconnectService; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUserProfilePicture_decorators, { kind: "method", name: "getUserProfilePicture", static: false, private: false, access: { has: function (obj) { return "getUserProfilePicture" in obj; }, get: function (obj) { return obj.getUserProfilePicture; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UserProfileController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UserProfileController = _classThis;
}();
exports.UserProfileController = UserProfileController;
