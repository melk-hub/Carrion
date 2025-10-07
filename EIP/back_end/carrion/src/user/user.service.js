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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
var common_1 = require("@nestjs/common");
var UserService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var UserService = _classThis = /** @class */ (function () {
        function UserService_1(prisma, s3Service) {
            this.prisma = prisma;
            this.s3Service = s3Service;
        }
        UserService_1.prototype.updateHashedRefreshToken = function (userId, hashedRefreshToken) {
            return __awaiter(this, void 0, void 0, function () {
                var error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: userId },
                                    data: { hashedRefreshToken: hashedRefreshToken },
                                })];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            error_1 = _a.sent();
                            if (error_1.code === 'P2025') {
                                throw new common_1.NotFoundException("User with id ".concat(userId, " not found"));
                            }
                            throw error_1;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        UserService_1.prototype.create = function (createUserDto) {
            return __awaiter(this, void 0, void 0, function () {
                var normalizedEmail, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            normalizedEmail = createUserDto.email.toLowerCase();
                            return [4 /*yield*/, this.prisma.user.create({
                                    data: __assign(__assign({}, createUserDto), { email: normalizedEmail }),
                                })];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            error_2 = _a.sent();
                            if (error_2.code === 'P2002') {
                                throw new common_1.ConflictException('User with this email or username already exists');
                            }
                            throw error_2;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        UserService_1.prototype.findByIdentifier = function (identifier, isEmail) {
            return __awaiter(this, void 0, void 0, function () {
                var normalizedIdentifier;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!isEmail) return [3 /*break*/, 2];
                            normalizedIdentifier = identifier.toLowerCase();
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { email: normalizedIdentifier },
                                })];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2: return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { username: identifier },
                            })];
                        case 3: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        UserService_1.prototype.findAll = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findMany()];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        UserService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!id) {
                                throw new common_1.BadRequestException('User ID is required');
                            }
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { id: id },
                                    select: {
                                        id: true,
                                        username: true,
                                        email: true,
                                        hashedRefreshToken: true,
                                        role: true,
                                    },
                                })];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                throw new common_1.NotFoundException("User with id ".concat(id, " not found"));
                            }
                            return [2 /*return*/, user];
                    }
                });
            });
        };
        UserService_1.prototype.update = function (id, updateUserDto) {
            return __awaiter(this, void 0, void 0, function () {
                var error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            if (updateUserDto.email) {
                                updateUserDto.email = updateUserDto.email.toLowerCase();
                            }
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: id },
                                    data: updateUserDto,
                                })];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            error_3 = _a.sent();
                            if (error_3.code === 'P2025') {
                                throw new common_1.NotFoundException("User with id ".concat(id, " not found"));
                            }
                            if (error_3.code === 'P2002') {
                                throw new common_1.ConflictException('User with this email or username already exists');
                            }
                            throw error_3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        UserService_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var deletedUser, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.prisma.user.delete({
                                    where: { id: id },
                                })];
                        case 1:
                            deletedUser = _a.sent();
                            common_1.Logger.warn("User with id ".concat(id, " and all related data have been deleted successfully."));
                            return [2 /*return*/, deletedUser];
                        case 2:
                            error_4 = _a.sent();
                            if (error_4.code === 'P2025') {
                                throw new common_1.NotFoundException("User with id ".concat(id, " not found"));
                            }
                            throw error_4;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        UserService_1.prototype.addDocument = function (userId, newDocument) {
            return __awaiter(this, void 0, void 0, function () {
                var userExists, userSettings, updatedDocuments, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!userId || !newDocument) {
                                throw new common_1.BadRequestException('User ID and document name are required');
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 7, , 8]);
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { id: userId },
                                    select: { id: true },
                                })];
                        case 2:
                            userExists = _a.sent();
                            if (!userExists) {
                                throw new common_1.NotFoundException("User with id ".concat(userId, " not found"));
                            }
                            return [4 /*yield*/, this.prisma.settings.findUnique({
                                    where: { userId: userId },
                                    select: { document: true, id: true },
                                })];
                        case 3:
                            userSettings = _a.sent();
                            if (!!userSettings) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.prisma.settings.create({
                                    data: {
                                        userId: userId,
                                        document: [newDocument],
                                    },
                                    select: { document: true, id: true },
                                })];
                        case 4:
                            userSettings = _a.sent();
                            return [2 /*return*/, userSettings];
                        case 5:
                            if (userSettings.document.includes(newDocument)) {
                                throw new common_1.ConflictException("Document ".concat(newDocument, " already exists for this user"));
                            }
                            updatedDocuments = __spreadArray(__spreadArray([], userSettings.document, true), [newDocument], false);
                            return [4 /*yield*/, this.prisma.settings.update({
                                    where: { userId: userId },
                                    data: { document: updatedDocuments },
                                    select: { document: true, id: true },
                                })];
                        case 6: return [2 /*return*/, _a.sent()];
                        case 7:
                            error_5 = _a.sent();
                            if (error_5 instanceof common_1.NotFoundException ||
                                error_5 instanceof common_1.ConflictException ||
                                error_5 instanceof common_1.BadRequestException) {
                                throw error_5;
                            }
                            if (error_5.code === 'P2025') {
                                throw new common_1.NotFoundException("Settings not found for user ".concat(userId));
                            }
                            throw new common_1.BadRequestException("Failed to add document: ".concat(error_5.message));
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
        UserService_1.prototype.getUsersWithStats = function () {
            return __awaiter(this, void 0, void 0, function () {
                var users;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findMany({
                                include: {
                                    jobApplies: true,
                                    userProfile: true,
                                },
                            })];
                        case 1:
                            users = _a.sent();
                            return [2 /*return*/, users.map(function (user) {
                                    var _a, _b, _c;
                                    var totalApplications = user.jobApplies.length;
                                    var acceptedApplications = user.jobApplies.filter(function (app) { return app.status === 'APPLIED'; }).length;
                                    var pendingApplications = user.jobApplies.filter(function (app) { return app.status === 'PENDING'; }).length;
                                    var rejectedApplications = user.jobApplies.filter(function (app) { return app.status === 'REJECTED_BY_COMPANY'; }).length;
                                    return {
                                        id: user.id,
                                        username: user.username,
                                        email: user.email,
                                        firstName: ((_a = user.userProfile) === null || _a === void 0 ? void 0 : _a.firstName) || '',
                                        lastName: ((_b = user.userProfile) === null || _b === void 0 ? void 0 : _b.lastName) || '',
                                        avatar: (_c = user.userProfile) === null || _c === void 0 ? void 0 : _c.imageUrl,
                                        totalApplications: totalApplications,
                                        acceptedApplications: acceptedApplications,
                                        pendingApplications: pendingApplications,
                                        rejectedApplications: rejectedApplications,
                                    };
                                })];
                    }
                });
            });
        };
        UserService_1.prototype.getUsersRanking = function () {
            return __awaiter(this, void 0, void 0, function () {
                var users, usersWithAvatars;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findMany({
                                include: {
                                    jobApplies: true,
                                    userProfile: true,
                                },
                            })];
                        case 1:
                            users = _a.sent();
                            return [4 /*yield*/, Promise.all(users.map(function (user) { return __awaiter(_this, void 0, void 0, function () {
                                    var totalApplications, acceptedApplications, pendingApplications, rejectedApplications, avatarUrl, res;
                                    var _a, _b, _c;
                                    return __generator(this, function (_d) {
                                        switch (_d.label) {
                                            case 0:
                                                totalApplications = user.jobApplies.length;
                                                acceptedApplications = user.jobApplies.filter(function (app) { return app.status === 'APPLIED'; }).length;
                                                pendingApplications = user.jobApplies.filter(function (app) { return app.status === 'PENDING'; }).length;
                                                rejectedApplications = user.jobApplies.filter(function (app) { return app.status === 'REJECTED_BY_COMPANY'; }).length;
                                                avatarUrl = null;
                                                if (!((_a = user.userProfile) === null || _a === void 0 ? void 0 : _a.imageUrl)) return [3 /*break*/, 2];
                                                return [4 /*yield*/, this.s3Service.getSignedDownloadUrl(user.id, 'profile')];
                                            case 1:
                                                res = _d.sent();
                                                avatarUrl = res.signedUrl;
                                                _d.label = 2;
                                            case 2: return [2 /*return*/, {
                                                    id: user.id,
                                                    username: user.username,
                                                    email: user.email,
                                                    firstName: ((_b = user.userProfile) === null || _b === void 0 ? void 0 : _b.firstName) || '',
                                                    lastName: ((_c = user.userProfile) === null || _c === void 0 ? void 0 : _c.lastName) || '',
                                                    avatar: avatarUrl,
                                                    totalApplications: totalApplications,
                                                    acceptedApplications: acceptedApplications,
                                                    pendingApplications: pendingApplications,
                                                    rejectedApplications: rejectedApplications,
                                                }];
                                        }
                                    });
                                }); }))];
                        case 2:
                            usersWithAvatars = _a.sent();
                            return [2 /*return*/, usersWithAvatars];
                    }
                });
            });
        };
        return UserService_1;
    }());
    __setFunctionName(_classThis, "UserService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UserService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UserService = _classThis;
}();
exports.UserService = UserService;
