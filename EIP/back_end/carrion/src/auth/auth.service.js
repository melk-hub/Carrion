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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
var common_1 = require("@nestjs/common");
var argon2 = require("argon2");
var bcrypt = require("bcrypt");
var rxjs_1 = require("rxjs");
var logging_service_1 = require("../common/services/logging.service");
var crypto = require("crypto");
var SibApiV3Sdk = require("@getbrevo/brevo");
var schedule_1 = require("@nestjs/schedule");
var AuthService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _handleWebhookRenewalCron_decorators;
    var AuthService = _classThis = /** @class */ (function () {
        function AuthService_1(userService, jwtService, refreshTokenConfig, prisma, httpService, logger) {
            this.userService = (__runInitializers(this, _instanceExtraInitializers), userService);
            this.jwtService = jwtService;
            this.refreshTokenConfig = refreshTokenConfig;
            this.prisma = prisma;
            this.httpService = httpService;
            this.logger = logger;
            if (!AuthService.webhookRenewalInitialized) {
                AuthService.webhookRenewalInitialized = true;
                this.initializeWebhookMonitoring();
            }
        }
        AuthService_1.prototype.initializeWebhookMonitoring = function () {
            this.logger.log('CRON job for webhook renewal is scheduled.');
        };
        AuthService_1.prototype.handleWebhookRenewalCron = function () {
            return __awaiter(this, void 0, void 0, function () {
                var thirtySixHoursFromNow, expiringTokens, _i, expiringTokens_1, token, validAccessToken, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.logger.log('Running daily webhook renewal CRON job...', logging_service_1.LogCategory.CRON);
                            thirtySixHoursFromNow = new Date(Date.now() + 36 * 60 * 60 * 1000);
                            return [4 /*yield*/, this.prisma.token.findMany({
                                    where: { webhookExpiry: { lte: thirtySixHoursFromNow } },
                                })];
                        case 1:
                            expiringTokens = _a.sent();
                            if (expiringTokens.length === 0) {
                                this.logger.log('CRON job complete. No webhooks needed renewal.', logging_service_1.LogCategory.CRON);
                                return [2 /*return*/];
                            }
                            this.logger.log("CRON job found ".concat(expiringTokens.length, " webhook(s) to renew."));
                            _i = 0, expiringTokens_1 = expiringTokens;
                            _a.label = 2;
                        case 2:
                            if (!(_i < expiringTokens_1.length)) return [3 /*break*/, 11];
                            token = expiringTokens_1[_i];
                            _a.label = 3;
                        case 3:
                            _a.trys.push([3, 9, , 10]);
                            return [4 /*yield*/, this.getValidToken(token.userId, token.name)];
                        case 4:
                            validAccessToken = _a.sent();
                            if (!validAccessToken) return [3 /*break*/, 8];
                            if (!(token.name === 'Google_oauth2')) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.createGmailWebhook(validAccessToken, token.userId)];
                        case 5:
                            _a.sent();
                            return [3 /*break*/, 8];
                        case 6:
                            if (!(token.name === 'Microsoft_oauth2' && token.externalId)) return [3 /*break*/, 8];
                            return [4 /*yield*/, this.renewOutlookWebhook(token.userId, token.externalId, validAccessToken)];
                        case 7:
                            _a.sent();
                            _a.label = 8;
                        case 8: return [3 /*break*/, 10];
                        case 9:
                            error_1 = _a.sent();
                            this.logger.error("Error during CRON renewal for user ".concat(token.userId), error_1.stack, logging_service_1.LogCategory.CRON);
                            return [3 /*break*/, 10];
                        case 10:
                            _i++;
                            return [3 /*break*/, 2];
                        case 11: return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.checkAndRenewWebhook = function (tokenRecord, accessToken) {
            return __awaiter(this, void 0, void 0, function () {
                var isWebhookExpiringSoon, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            isWebhookExpiringSoon = !tokenRecord.webhookExpiry ||
                                new Date(tokenRecord.webhookExpiry) <
                                    new Date(Date.now() + 36 * 60 * 60 * 1000);
                            if (!isWebhookExpiringSoon)
                                return [2 /*return*/];
                            this.logger.log("Proactively renewing webhook for ".concat(tokenRecord.name, " user ").concat(tokenRecord.userId, "."), logging_service_1.LogCategory.WEBHOOK);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 8, , 9]);
                            if (!(tokenRecord.name === 'Google_oauth2')) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.createGmailWebhook(accessToken, tokenRecord.userId)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 7];
                        case 3:
                            if (!(tokenRecord.name === 'Microsoft_oauth2')) return [3 /*break*/, 7];
                            if (!tokenRecord.externalId) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.renewOutlookWebhook(tokenRecord.userId, tokenRecord.externalId, accessToken)];
                        case 4:
                            _a.sent();
                            return [3 /*break*/, 7];
                        case 5: return [4 /*yield*/, this.createOutlookWebhook(accessToken, tokenRecord.userId)];
                        case 6:
                            _a.sent();
                            _a.label = 7;
                        case 7: return [3 /*break*/, 9];
                        case 8:
                            error_2 = _a.sent();
                            this.logger.error("On-demand webhook renewal failed for user ".concat(tokenRecord.userId), error_2.stack, logging_service_1.LogCategory.WEBHOOK);
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.updateTokenWebhookData = function (userId, provider, data) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.token.updateMany({
                                where: { userId: userId, name: provider },
                                data: data,
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.updateGoogleTokenWithHistoryId = function (userId, historyId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.updateTokenWebhookData(userId, 'Google_oauth2', {
                                externalId: historyId,
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.updateMicrosoftTokenWithSubscription = function (userId, subscriptionId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.updateTokenWebhookData(userId, 'Microsoft_oauth2', {
                                externalId: subscriptionId,
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.validateOAuthUser = function (provider, providerId, oauthProfile, loggedInUserId) {
            return __awaiter(this, void 0, void 0, function () {
                var providerNameDisplay, existingTokenLink, userWithOauthEmail_1, user, userWithOauthEmail, firstName, lastName, coreUserData, newUser;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            providerNameDisplay = provider === 'Google_oauth2' ? 'Google' : 'Microsoft';
                            return [4 /*yield*/, this.prisma.token.findUnique({
                                    where: { name_providerId: { name: provider, providerId: providerId } },
                                    include: { user: true },
                                })];
                        case 1:
                            existingTokenLink = _a.sent();
                            if (existingTokenLink) {
                                if (loggedInUserId && existingTokenLink.userId !== loggedInUserId)
                                    throw new common_1.ConflictException("This ".concat(providerNameDisplay, " account is already linked to another user."));
                                return [2 /*return*/, existingTokenLink.user];
                            }
                            if (!loggedInUserId) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.userService.findByIdentifier(oauthProfile.email, true)];
                        case 2:
                            userWithOauthEmail_1 = _a.sent();
                            if (userWithOauthEmail_1 && userWithOauthEmail_1.id !== loggedInUserId)
                                throw new common_1.ConflictException("The email address ".concat(oauthProfile.email, " is already used by another account."));
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { id: loggedInUserId },
                                })];
                        case 3:
                            user = _a.sent();
                            if (!user)
                                throw new common_1.UnauthorizedException('Logged in user not found.');
                            return [2 /*return*/, user];
                        case 4: return [4 /*yield*/, this.userService.findByIdentifier(oauthProfile.email, true)];
                        case 5:
                            userWithOauthEmail = _a.sent();
                            if (userWithOauthEmail)
                                return [2 /*return*/, userWithOauthEmail];
                            firstName = oauthProfile.firstName, lastName = oauthProfile.lastName, coreUserData = __rest(oauthProfile, ["firstName", "lastName"]);
                            return [4 /*yield*/, this.userService.create(__assign(__assign({}, coreUserData), { password: '' }))];
                        case 6:
                            newUser = _a.sent();
                            if (!(firstName || lastName)) return [3 /*break*/, 8];
                            return [4 /*yield*/, this.prisma.userProfile.create({
                                    data: { userId: newUser.id, firstName: firstName, lastName: lastName },
                                })];
                        case 7:
                            _a.sent();
                            _a.label = 8;
                        case 8: return [2 /*return*/, newUser];
                    }
                });
            });
        };
        AuthService_1.prototype.forgotPassword = function (email) {
            return __awaiter(this, void 0, void 0, function () {
                var user, resetToken, passwordResetToken, passwordResetExpires, resetUrl, apiInstance, sendSmtpEmail, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findUnique({ where: { email: email } })];
                        case 1:
                            user = _a.sent();
                            if (!user)
                                return [2 /*return*/];
                            resetToken = crypto.randomBytes(32).toString('hex');
                            passwordResetToken = crypto
                                .createHash('sha256')
                                .update(resetToken)
                                .digest('hex');
                            passwordResetExpires = new Date(Date.now() + 3600000);
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { email: email },
                                    data: { passwordResetToken: passwordResetToken, passwordResetExpires: passwordResetExpires },
                                })];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            _a.trys.push([3, 5, , 7]);
                            resetUrl = "".concat(process.env.FRONT, "/reset-password/").concat(resetToken);
                            apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
                            apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
                            sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
                            sendSmtpEmail.subject = 'Your Password Reset Request';
                            sendSmtpEmail.htmlContent = "<p>Click here to reset: <a href=\"".concat(resetUrl, "\">Reset Password</a></p>");
                            sendSmtpEmail.sender = {
                                name: 'Carrion',
                                email: 'your-validated-sender@example.com',
                            };
                            sendSmtpEmail.to = [{ email: user.email, name: user.username }];
                            return [4 /*yield*/, apiInstance.sendTransacEmail(sendSmtpEmail)];
                        case 4:
                            _a.sent();
                            return [3 /*break*/, 7];
                        case 5:
                            error_3 = _a.sent();
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { email: email },
                                    data: { passwordResetToken: null, passwordResetExpires: null },
                                })];
                        case 6:
                            _a.sent();
                            throw new Error('Could not send reset password email.');
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.resetPassword = function (token, resetPasswordDto) {
            return __awaiter(this, void 0, void 0, function () {
                var hashedToken, user, hashedPassword;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            hashedToken = crypto.createHash('sha256').update(token).digest('hex');
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { passwordResetToken: hashedToken },
                                })];
                        case 1:
                            user = _a.sent();
                            if (!user || user.passwordResetExpires < new Date())
                                throw new common_1.UnauthorizedException('Invalid or expired token.');
                            return [4 /*yield*/, bcrypt.hash(resetPasswordDto.password, 10)];
                        case 2:
                            hashedPassword = _a.sent();
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: user.id },
                                    data: {
                                        password: hashedPassword,
                                        passwordResetToken: null,
                                        passwordResetExpires: null,
                                        hashedRefreshToken: null,
                                    },
                                })];
                        case 3:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.saveTokens = function (userId, accessToken, refreshToken, days, name, providerId, userEmail) {
            return __awaiter(this, void 0, void 0, function () {
                var expirationTime, refreshTokenExpires;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            expirationTime = this.calculateTokenExpiration(days);
                            refreshTokenExpires = name === 'Microsoft_oauth2'
                                ? this.calculateTokenExpiration(90)
                                : new Date('9999-12-31T23:59:59Z');
                            return [4 /*yield*/, this.prisma.token.upsert({
                                    where: { name_providerId: { name: name, providerId: providerId } },
                                    update: {
                                        accessToken: accessToken,
                                        refreshToken: refreshToken,
                                        userEmail: userEmail,
                                        accessTokenValidity: expirationTime,
                                        tokenTimeValidity: refreshTokenExpires,
                                    },
                                    create: {
                                        userId: userId,
                                        name: name,
                                        providerId: providerId,
                                        accessToken: accessToken,
                                        refreshToken: refreshToken,
                                        userEmail: userEmail,
                                        accessTokenValidity: expirationTime,
                                        tokenTimeValidity: refreshTokenExpires,
                                    },
                                })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.validateUser = function (identifier, password, isEmail) {
            return __awaiter(this, void 0, void 0, function () {
                var user, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.userService.findByIdentifier(identifier, isEmail)];
                        case 1:
                            user = _b.sent();
                            _a = user;
                            if (!_a) return [3 /*break*/, 3];
                            return [4 /*yield*/, bcrypt.compare(password, user.password)];
                        case 2:
                            _a = (_b.sent());
                            _b.label = 3;
                        case 3:
                            if (_a)
                                return [2 /*return*/, user];
                            return [2 /*return*/, null];
                    }
                });
            });
        };
        AuthService_1.prototype.login = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, rememberMe) {
                var tokens, _a, _b, _c;
                if (rememberMe === void 0) { rememberMe = false; }
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, this.generateTokens(userId, rememberMe)];
                        case 1:
                            tokens = _d.sent();
                            _b = (_a = this.userService).updateHashedRefreshToken;
                            _c = [userId];
                            return [4 /*yield*/, argon2.hash(tokens.refreshToken)];
                        case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent()]))];
                        case 3:
                            _d.sent();
                            return [2 /*return*/, __assign({ id: userId }, tokens)];
                    }
                });
            });
        };
        AuthService_1.prototype.generateTokens = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, rememberMe) {
                var payload, accessTokenExpiresIn;
                var _a;
                if (rememberMe === void 0) { rememberMe = false; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            payload = { sub: userId };
                            accessTokenExpiresIn = rememberMe ? '15d' : '1d';
                            _a = {};
                            return [4 /*yield*/, this.jwtService.signAsync(payload, {
                                    expiresIn: accessTokenExpiresIn,
                                })];
                        case 1:
                            _a.accessToken = _b.sent();
                            return [4 /*yield*/, this.jwtService.signAsync(payload, this.refreshTokenConfig)];
                        case 2: return [2 /*return*/, (_a.refreshToken = _b.sent(),
                                _a)];
                    }
                });
            });
        };
        AuthService_1.prototype.signUp = function (createUserDto) {
            return __awaiter(this, void 0, void 0, function () {
                var hashedPassword, user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.userService.findByIdentifier(createUserDto.email, true)];
                        case 1:
                            if (_a.sent())
                                throw new common_1.ConflictException('A user with this email already exists.');
                            return [4 /*yield*/, this.userService.findByIdentifier(createUserDto.username, false)];
                        case 2:
                            if (_a.sent())
                                throw new common_1.ConflictException('A user with this username already exists.');
                            return [4 /*yield*/, bcrypt.hash(createUserDto.password, 10)];
                        case 3:
                            hashedPassword = _a.sent();
                            return [4 /*yield*/, this.userService.create(__assign(__assign({}, createUserDto), { password: hashedPassword }))];
                        case 4:
                            user = _a.sent();
                            return [2 /*return*/, this.login(user.id)];
                    }
                });
            });
        };
        AuthService_1.prototype.refreshTokens = function (refreshToken) {
            return __awaiter(this, void 0, void 0, function () {
                var decoded, user, _a, tokens, _b, _c, _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            _f.trys.push([0, 7, , 8]);
                            decoded = this.jwtService.verify(refreshToken, {
                                secret: this.refreshTokenConfig.secret,
                            });
                            if (!(decoded === null || decoded === void 0 ? void 0 : decoded.sub))
                                return [2 /*return*/, null];
                            return [4 /*yield*/, this.userService.findOne(decoded.sub)];
                        case 1:
                            user = _f.sent();
                            _a = !user ||
                                !user.hashedRefreshToken;
                            if (_a) return [3 /*break*/, 3];
                            return [4 /*yield*/, argon2.verify(user.hashedRefreshToken, refreshToken)];
                        case 2:
                            _a = !(_f.sent());
                            _f.label = 3;
                        case 3:
                            if (_a)
                                return [2 /*return*/, null];
                            return [4 /*yield*/, this.generateTokens(user.id)];
                        case 4:
                            tokens = _f.sent();
                            _c = (_b = this.userService).updateHashedRefreshToken;
                            _d = [user.id];
                            return [4 /*yield*/, argon2.hash(tokens.refreshToken)];
                        case 5: return [4 /*yield*/, _c.apply(_b, _d.concat([_f.sent()]))];
                        case 6:
                            _f.sent();
                            return [2 /*return*/, __assign(__assign({}, tokens), { userId: user.id })];
                        case 7:
                            _e = _f.sent();
                            return [2 /*return*/, null];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.signOut = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.userService.updateHashedRefreshToken(userId, null)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.validateCookie = function (token) {
            return __awaiter(this, void 0, void 0, function () {
                var decoded, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            decoded = this.jwtService.verify(token);
                            if (!decoded || !decoded.sub)
                                return [2 /*return*/, null];
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { id: decoded.sub },
                                    select: { id: true, email: true, role: true },
                                })];
                        case 1: return [2 /*return*/, _b.sent()];
                        case 2:
                            _a = _b.sent();
                            return [2 /*return*/, null];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.validateJwtUser = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.userService.findOne(userId)];
                        case 1:
                            user = _a.sent();
                            if (!user)
                                throw new common_1.UnauthorizedException('User not found!');
                            return [2 /*return*/, { id: user.id, role: user.role }];
                    }
                });
            });
        };
        AuthService_1.prototype.validateRefreshToken = function (userId, refreshToken) {
            return __awaiter(this, void 0, void 0, function () {
                var user, refreshTokenMatches;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.userService.findOne(userId)];
                        case 1:
                            user = _a.sent();
                            if (!user || !user.hashedRefreshToken)
                                throw new common_1.UnauthorizedException('Access Denied');
                            return [4 /*yield*/, argon2.verify(user.hashedRefreshToken, refreshToken)];
                        case 2:
                            refreshTokenMatches = _a.sent();
                            if (!refreshTokenMatches)
                                throw new common_1.UnauthorizedException('Access Denied');
                            return [2 /*return*/, { id: user.id, email: user.email, role: user.role }];
                    }
                });
            });
        };
        AuthService_1.prototype.createGmailWebhook = function (accessToken, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var url, payload, response, expiration, error_4;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            url = 'https://gmail.googleapis.com/gmail/v1/users/me/watch';
                            payload = {
                                labelIds: ['INBOX'],
                                topicName: "projects/".concat(process.env.GOOGLE_PROJECT_ID, "/topics/").concat(process.env.GOOGLE_PROJECT_WEBHOOK),
                            };
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 4, , 7]);
                            return [4 /*yield*/, this.httpService
                                    .post(url, payload, {
                                    headers: { Authorization: "Bearer ".concat(accessToken) },
                                })
                                    .toPromise()];
                        case 2:
                            response = _c.sent();
                            expiration = new Date(parseInt(response.data.expiration, 10));
                            return [4 /*yield*/, this.updateTokenWebhookData(userId, 'Google_oauth2', {
                                    webhookExpiry: expiration,
                                })];
                        case 3:
                            _c.sent();
                            return [3 /*break*/, 7];
                        case 4:
                            error_4 = _c.sent();
                            if (!(((_a = error_4.response) === null || _a === void 0 ? void 0 : _a.status) >= 400 && ((_b = error_4.response) === null || _b === void 0 ? void 0 : _b.status) < 500)) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.handleTokenRevocation(userId, 'Google_oauth2')];
                        case 5:
                            _c.sent();
                            _c.label = 6;
                        case 6: throw error_4;
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.createOutlookWebhook = function (accessToken, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var webhookUrl, expirationDateTime, response, subscriptionId, actualExpiration, error_5;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            webhookUrl = "".concat(process.env.BACK, "/webhook/outlook");
                            expirationDateTime = new Date(Date.now() + 4230 * 60 * 1000);
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 4, , 7]);
                            return [4 /*yield*/, (0, rxjs_1.firstValueFrom)(this.httpService.post('https://graph.microsoft.com/v1.0/subscriptions', {
                                    changeType: 'created',
                                    notificationUrl: webhookUrl,
                                    resource: "me/mailFolders('inbox')/messages",
                                    expirationDateTime: expirationDateTime.toISOString(),
                                    clientState: "".concat(userId, "-outlook"),
                                }, { headers: { Authorization: "Bearer ".concat(accessToken) } }))];
                        case 2:
                            response = _c.sent();
                            subscriptionId = response.data.id;
                            actualExpiration = new Date(response.data.expirationDateTime);
                            return [4 /*yield*/, this.updateTokenWebhookData(userId, 'Microsoft_oauth2', {
                                    externalId: subscriptionId,
                                    webhookExpiry: actualExpiration,
                                })];
                        case 3:
                            _c.sent();
                            return [2 /*return*/, subscriptionId];
                        case 4:
                            error_5 = _c.sent();
                            if (!(((_a = error_5.response) === null || _a === void 0 ? void 0 : _a.status) >= 400 && ((_b = error_5.response) === null || _b === void 0 ? void 0 : _b.status) < 500)) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.handleTokenRevocation(userId, 'Microsoft_oauth2')];
                        case 5:
                            _c.sent();
                            _c.label = 6;
                        case 6: throw error_5;
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.renewOutlookWebhook = function (userId, subscriptionId, accessToken) {
            return __awaiter(this, void 0, void 0, function () {
                var newExpiration, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            newExpiration = new Date(Date.now() + 4230 * 60 * 1000);
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 4, , 6]);
                            return [4 /*yield*/, (0, rxjs_1.firstValueFrom)(this.httpService.patch("https://graph.microsoft.com/v1.0/subscriptions/".concat(subscriptionId), { expirationDateTime: newExpiration.toISOString() }, { headers: { Authorization: "Bearer ".concat(accessToken) } }))];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, this.updateTokenWebhookData(userId, 'Microsoft_oauth2', {
                                    webhookExpiry: newExpiration,
                                })];
                        case 3:
                            _b.sent();
                            return [3 /*break*/, 6];
                        case 4:
                            _a = _b.sent();
                            return [4 /*yield*/, this.createOutlookWebhook(accessToken, userId)];
                        case 5:
                            _b.sent();
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.handleTokenRevocation = function (userId, provider) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.token.deleteMany({ where: { userId: userId, name: provider } })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.getValidToken = function (userId, tokenName) {
            return __awaiter(this, void 0, void 0, function () {
                var token, refreshed, _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.prisma.token.findFirst({
                                where: { userId: userId, name: tokenName },
                            })];
                        case 1:
                            token = _c.sent();
                            if (!token)
                                return [2 /*return*/, null];
                            if (token.accessTokenValidity &&
                                new Date(token.accessTokenValidity) > new Date(Date.now() + 5 * 60 * 1000)) {
                                return [2 /*return*/, token.accessToken];
                            }
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 7, , 9]);
                            if (!(tokenName === 'Microsoft_oauth2')) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.refreshMicrosoftToken(userId)];
                        case 3:
                            _a = _c.sent();
                            return [3 /*break*/, 6];
                        case 4: return [4 /*yield*/, this.refreshGoogleToken(userId)];
                        case 5:
                            _a = _c.sent();
                            _c.label = 6;
                        case 6:
                            refreshed = _a;
                            return [2 /*return*/, (refreshed === null || refreshed === void 0 ? void 0 : refreshed.accessToken) || null];
                        case 7:
                            _b = _c.sent();
                            return [4 /*yield*/, this.handleTokenRevocation(userId, tokenName)];
                        case 8:
                            _c.sent();
                            return [2 /*return*/, null];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.calculateTokenExpiration = function (days) {
            return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        };
        AuthService_1.prototype.refreshMicrosoftToken = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var token, params, response, _a, access_token, refresh_token, error_6;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.token.findFirst({
                                where: { userId: userId, name: 'Microsoft_oauth2' },
                            })];
                        case 1:
                            token = _b.sent();
                            if (!(token === null || token === void 0 ? void 0 : token.refreshToken))
                                return [2 /*return*/, null];
                            params = new URLSearchParams({
                                client_id: process.env.MICROSOFT_CLIENT_ID,
                                client_secret: process.env.MICROSOFT_CLIENT_SECRET,
                                refresh_token: token.refreshToken,
                                grant_type: 'refresh_token',
                                scope: 'openid profile offline_access User.Read Mail.Read',
                            });
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 5, , 7]);
                            return [4 /*yield*/, (0, rxjs_1.firstValueFrom)(this.httpService.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', params))];
                        case 3:
                            response = _b.sent();
                            _a = response.data, access_token = _a.access_token, refresh_token = _a.refresh_token;
                            return [4 /*yield*/, this.saveTokens(userId, access_token, refresh_token || token.refreshToken, 25 / (60 * 24), 'Microsoft_oauth2', token.providerId, token.userEmail)];
                        case 4:
                            _b.sent();
                            return [2 /*return*/, { accessToken: access_token, refreshToken: refresh_token }];
                        case 5:
                            error_6 = _b.sent();
                            return [4 /*yield*/, this.handleTokenRevocation(userId, 'Microsoft_oauth2')];
                        case 6:
                            _b.sent();
                            throw error_6;
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.refreshGoogleToken = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var token, params, response, _a, access_token, refresh_token, error_7;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.token.findFirst({
                                where: { userId: userId, name: 'Google_oauth2' },
                            })];
                        case 1:
                            token = _b.sent();
                            if (!(token === null || token === void 0 ? void 0 : token.refreshToken))
                                return [2 /*return*/, null];
                            params = new URLSearchParams({
                                client_id: process.env.GOOGLE_CLIENT_ID,
                                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                                refresh_token: token.refreshToken,
                                grant_type: 'refresh_token',
                            });
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 5, , 7]);
                            return [4 /*yield*/, (0, rxjs_1.firstValueFrom)(this.httpService.post('https://oauth2.googleapis.com/token', params))];
                        case 3:
                            response = _b.sent();
                            _a = response.data, access_token = _a.access_token, refresh_token = _a.refresh_token;
                            return [4 /*yield*/, this.saveTokens(userId, access_token, refresh_token || token.refreshToken, 25 / (60 * 24), 'Google_oauth2', token.providerId, token.userEmail)];
                        case 4:
                            _b.sent();
                            return [2 /*return*/, { accessToken: access_token, refreshToken: refresh_token }];
                        case 5:
                            error_7 = _b.sent();
                            return [4 /*yield*/, this.handleTokenRevocation(userId, 'Google_oauth2')];
                        case 6:
                            _b.sent();
                            throw error_7;
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        return AuthService_1;
    }());
    __setFunctionName(_classThis, "AuthService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _handleWebhookRenewalCron_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_3AM, { name: 'webhook_renewal' })];
        __esDecorate(_classThis, null, _handleWebhookRenewalCron_decorators, { kind: "method", name: "handleWebhookRenewalCron", static: false, private: false, access: { has: function (obj) { return "handleWebhookRenewalCron" in obj; }, get: function (obj) { return obj.handleWebhookRenewalCron; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    _classThis.webhookRenewalInitialized = false;
    (function () {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthService = _classThis;
}();
exports.AuthService = AuthService;
