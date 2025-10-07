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
exports.AuthController = void 0;
var common_1 = require("@nestjs/common");
var passport_1 = require("@nestjs/passport");
var local_auth_guard_1 = require("./guards/local/local-auth.guard");
var jwt_auth_guard_1 = require("./guards/jwt/jwt-auth.guard");
var public_decorator_1 = require("./decorators/public.decorator");
var google_auth_guard_1 = require("./guards/google/google-auth.guard");
var swagger_1 = require("@nestjs/swagger");
var microsoft_auth_guard_1 = require("./guards/microsoft/microsoft-auth.guard");
var AuthController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('Authentication'), (0, common_1.Controller)('auth')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _login_decorators;
    var _signUp_decorators;
    var _refreshAccessToken_decorators;
    var _signOut_decorators;
    var _logout_decorators;
    var _checkAuth_decorators;
    var _linkGoogleAccount_decorators;
    var _linkMicrosoftAccount_decorators;
    var _googleLoginInitiate_decorators;
    var _microsoftLoginInitiate_decorators;
    var _googleCallback_decorators;
    var _microsoftCallback_decorators;
    var _forgotPassword_decorators;
    var _resetPassword_decorators;
    var AuthController = _classThis = /** @class */ (function () {
        function AuthController_1(authService, jwtService) {
            this.authService = (__runInitializers(this, _instanceExtraInitializers), authService);
            this.jwtService = jwtService;
        }
        AuthController_1.prototype.login = function (req, res) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, rememberMe, tokens, cookieMaxAge;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = req.body.rememberMe, rememberMe = _a === void 0 ? false : _a;
                            return [4 /*yield*/, this.authService.login(req.user.id, rememberMe)];
                        case 1:
                            tokens = _b.sent();
                            cookieMaxAge = rememberMe
                                ? 1000 * 60 * 60 * 24 * 15
                                : 1000 * 60 * 60 * 24;
                            res.cookie('access_token', tokens.accessToken, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'Strict',
                                maxAge: cookieMaxAge,
                            });
                            return [2 /*return*/, res
                                    .status(common_1.HttpStatus.OK)
                                    .send({ message: 'User logged in successfully' })];
                    }
                });
            });
        };
        AuthController_1.prototype.signUp = function (userInfo, res) {
            return __awaiter(this, void 0, void 0, function () {
                var tokens;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.authService.signUp(userInfo)];
                        case 1:
                            tokens = _a.sent();
                            res.cookie('access_token', tokens.accessToken, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'Strict',
                                maxAge: 1000 * 60 * 60 * 24,
                            });
                            return [2 /*return*/, res
                                    .status(common_1.HttpStatus.OK)
                                    .send({ message: 'User created successfully' })];
                    }
                });
            });
        };
        AuthController_1.prototype.refreshAccessToken = function (req, res) {
            return __awaiter(this, void 0, void 0, function () {
                var refreshToken, tokens, error_1;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a['refresh_token'];
                            if (!refreshToken)
                                return [2 /*return*/, res.status(401).json({ message: 'No refresh token provided' })];
                            return [4 /*yield*/, this.authService.refreshTokens(refreshToken)];
                        case 1:
                            tokens = _b.sent();
                            if (!tokens)
                                return [2 /*return*/, res.status(401).json({ message: 'Invalid refresh token' })];
                            res.cookie('access_token', tokens.accessToken, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'strict',
                                maxAge: 1000 * 60 * 60 * 24 * 7,
                            });
                            if (tokens.refreshToken) {
                                res.cookie('refresh_token', tokens.refreshToken, {
                                    httpOnly: true,
                                    secure: process.env.NODE_ENV === 'production',
                                    sameSite: 'strict',
                                    maxAge: 1000 * 60 * 60 * 24 * 30,
                                });
                            }
                            return [2 /*return*/, res.status(200).json({ message: 'Token refreshed successfully' })];
                        case 2:
                            error_1 = _b.sent();
                            common_1.Logger.error(error_1);
                            return [2 /*return*/, res.status(401).json({ message: 'Token refresh failed' })];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        AuthController_1.prototype.signOut = function (req, res) {
            this.authService.signOut(req.user.id);
            res.clearCookie('access_token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
            res.clearCookie('refresh_token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
            return res.status(common_1.HttpStatus.OK).json({ message: 'Signout successful' });
        };
        AuthController_1.prototype.logout = function (res) {
            res.clearCookie('access_token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
            res.clearCookie('refresh_token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
            return res.status(common_1.HttpStatus.OK).json({ message: 'Logout successful' });
        };
        AuthController_1.prototype.checkAuth = function (req, res) {
            return __awaiter(this, void 0, void 0, function () {
                var token, user, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            token = req.cookies['access_token'];
                            if (!token)
                                return [2 /*return*/, res.status(200).json({ isAuthenticated: false })];
                            return [4 /*yield*/, this.authService.validateCookie(token)];
                        case 1:
                            user = _a.sent();
                            if (!user)
                                return [2 /*return*/, res.status(200).json({ isAuthenticated: false })];
                            return [2 /*return*/, res.status(200).json({ isAuthenticated: true, user: user })];
                        case 2:
                            error_2 = _a.sent();
                            return [2 /*return*/, res
                                    .status(500)
                                    .json({ message: "Server error: ".concat(error_2.message) })];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        AuthController_1.prototype.linkGoogleAccount = function (req, res) {
            var stateToken = this.jwtService.sign({ sub: req.user.id }, { expiresIn: '5m' });
            var params = new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                scope: 'email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.labels',
                response_type: 'code',
                access_type: 'offline',
                prompt: 'consent',
                state: stateToken,
            });
            res.redirect("https://accounts.google.com/o/oauth2/v2/auth?".concat(params.toString()));
        };
        AuthController_1.prototype.linkMicrosoftAccount = function (req, res) {
            var stateToken = this.jwtService.sign({ sub: req.user.id }, { expiresIn: '5m' });
            var params = new URLSearchParams({
                client_id: process.env.MICROSOFT_CLIENT_ID,
                redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
                scope: 'openid profile offline_access User.Read Mail.Read',
                response_type: 'code',
                response_mode: 'query',
                state: stateToken,
            });
            res.redirect("https://login.microsoftonline.com/common/oauth2/v2.0/authorize?".concat(params.toString()));
        };
        AuthController_1.prototype.googleLoginInitiate = function () { };
        AuthController_1.prototype.microsoftLoginInitiate = function () { };
        AuthController_1.prototype.googleCallback = function (req, res) {
            return __awaiter(this, void 0, void 0, function () {
                var user, twentyFiveMinutesInDays, error_3, tokens;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            user = req.user;
                            if (!user || user.redirected)
                                return [2 /*return*/];
                            twentyFiveMinutesInDays = 25 / (60 * 24);
                            return [4 /*yield*/, this.authService.saveTokens(user.id, user.accessToken, user.refreshToken || '', twentyFiveMinutesInDays, 'Google_oauth2', user.providerId, user.oauthEmail)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, this.authService.createGmailWebhook(user.accessToken, user.id)];
                        case 3:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            error_3 = _a.sent();
                            common_1.Logger.error(error_3);
                            return [3 /*break*/, 5];
                        case 5:
                            if (user.isLinkFlow)
                                return [2 /*return*/, res.redirect("".concat(process.env.FRONT, "/profile?link_success=google"))];
                            return [4 /*yield*/, this.authService.login(user.id)];
                        case 6:
                            tokens = _a.sent();
                            res.cookie('access_token', tokens.accessToken, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'strict',
                                maxAge: 1000 * 60 * 60 * 24 * 7,
                            });
                            if (tokens.refreshToken) {
                                res.cookie('refresh_token', tokens.refreshToken, {
                                    httpOnly: true,
                                    secure: process.env.NODE_ENV === 'production',
                                    sameSite: 'strict',
                                    maxAge: 1000 * 60 * 60 * 24 * 30,
                                });
                            }
                            res.redirect("".concat(process.env.FRONT, "/?auth=success"));
                            return [2 /*return*/];
                    }
                });
            });
        };
        AuthController_1.prototype.microsoftCallback = function (req, res) {
            return __awaiter(this, void 0, void 0, function () {
                var user, twentyFiveMinutesInDays, error_4, tokens;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            user = req.user;
                            if (!user || user.redirected)
                                return [2 /*return*/];
                            twentyFiveMinutesInDays = 25 / (60 * 24);
                            return [4 /*yield*/, this.authService.saveTokens(user.id, user.accessToken, user.refreshToken || '', twentyFiveMinutesInDays, 'Microsoft_oauth2', user.providerId, user.oauthEmail)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, this.authService.createOutlookWebhook(user.accessToken, user.id)];
                        case 3:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            error_4 = _a.sent();
                            common_1.Logger.error(error_4);
                            return [3 /*break*/, 5];
                        case 5:
                            if (user.isLinkFlow)
                                return [2 /*return*/, res.redirect("".concat(process.env.FRONT, "/profile?link_success=microsoft"))];
                            return [4 /*yield*/, this.authService.login(user.id)];
                        case 6:
                            tokens = _a.sent();
                            res.cookie('access_token', tokens.accessToken, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'strict',
                                maxAge: 1000 * 60 * 60 * 24 * 7,
                            });
                            if (tokens.refreshToken) {
                                res.cookie('refresh_token', tokens.refreshToken, {
                                    httpOnly: true,
                                    secure: process.env.NODE_ENV === 'production',
                                    sameSite: 'strict',
                                    maxAge: 1000 * 60 * 60 * 24 * 30,
                                });
                            }
                            res.redirect("".concat(process.env.FRONT, "/?auth=success"));
                            return [2 /*return*/];
                    }
                });
            });
        };
        AuthController_1.prototype.forgotPassword = function (forgotPasswordDto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.authService.forgotPassword(forgotPasswordDto.email)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, {
                                    message: 'If an account with this email exists, a reset link has been sent.',
                                }];
                    }
                });
            });
        };
        AuthController_1.prototype.resetPassword = function (token, resetPasswordDto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.authService.resetPassword(token, resetPasswordDto)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, { message: 'Your password has been reset successfully.' }];
                    }
                });
            });
        };
        return AuthController_1;
    }());
    __setFunctionName(_classThis, "AuthController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _login_decorators = [(0, public_decorator_1.Public)(), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, common_1.UseGuards)(local_auth_guard_1.LocalAuthGuard), (0, common_1.Post)('signin'), (0, swagger_1.ApiOperation)({ summary: 'User sign in' })];
        _signUp_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('signup'), (0, swagger_1.ApiOperation)({ summary: 'User signup' })];
        _refreshAccessToken_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('refresh'), (0, swagger_1.ApiOperation)({ summary: 'Refresh JWT token' })];
        _signOut_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.Post)('signout'), (0, swagger_1.ApiOperation)({ summary: 'User sign out' })];
        _logout_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('logout'), (0, swagger_1.ApiOperation)({ summary: 'Logout' })];
        _checkAuth_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('check'), (0, swagger_1.ApiOperation)({ summary: 'Check login status' })];
        _linkGoogleAccount_decorators = [(0, common_1.Get)('google/link'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _linkMicrosoftAccount_decorators = [(0, common_1.Get)('microsoft/link'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _googleLoginInitiate_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('google/login'), (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google'))];
        _microsoftLoginInitiate_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('microsoft/login'), (0, common_1.UseGuards)((0, passport_1.AuthGuard)('microsoft'))];
        _googleCallback_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('google/callback'), (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard)];
        _microsoftCallback_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('microsoft/callback'), (0, common_1.UseGuards)(microsoft_auth_guard_1.MicrosoftAuthGuard)];
        _forgotPassword_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('forgot-password'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Send password reset link' })];
        _resetPassword_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('reset-password/:token'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Reset user password' })];
        __esDecorate(_classThis, null, _login_decorators, { kind: "method", name: "login", static: false, private: false, access: { has: function (obj) { return "login" in obj; }, get: function (obj) { return obj.login; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _signUp_decorators, { kind: "method", name: "signUp", static: false, private: false, access: { has: function (obj) { return "signUp" in obj; }, get: function (obj) { return obj.signUp; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _refreshAccessToken_decorators, { kind: "method", name: "refreshAccessToken", static: false, private: false, access: { has: function (obj) { return "refreshAccessToken" in obj; }, get: function (obj) { return obj.refreshAccessToken; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _signOut_decorators, { kind: "method", name: "signOut", static: false, private: false, access: { has: function (obj) { return "signOut" in obj; }, get: function (obj) { return obj.signOut; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _logout_decorators, { kind: "method", name: "logout", static: false, private: false, access: { has: function (obj) { return "logout" in obj; }, get: function (obj) { return obj.logout; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _checkAuth_decorators, { kind: "method", name: "checkAuth", static: false, private: false, access: { has: function (obj) { return "checkAuth" in obj; }, get: function (obj) { return obj.checkAuth; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _linkGoogleAccount_decorators, { kind: "method", name: "linkGoogleAccount", static: false, private: false, access: { has: function (obj) { return "linkGoogleAccount" in obj; }, get: function (obj) { return obj.linkGoogleAccount; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _linkMicrosoftAccount_decorators, { kind: "method", name: "linkMicrosoftAccount", static: false, private: false, access: { has: function (obj) { return "linkMicrosoftAccount" in obj; }, get: function (obj) { return obj.linkMicrosoftAccount; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _googleLoginInitiate_decorators, { kind: "method", name: "googleLoginInitiate", static: false, private: false, access: { has: function (obj) { return "googleLoginInitiate" in obj; }, get: function (obj) { return obj.googleLoginInitiate; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _microsoftLoginInitiate_decorators, { kind: "method", name: "microsoftLoginInitiate", static: false, private: false, access: { has: function (obj) { return "microsoftLoginInitiate" in obj; }, get: function (obj) { return obj.microsoftLoginInitiate; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _googleCallback_decorators, { kind: "method", name: "googleCallback", static: false, private: false, access: { has: function (obj) { return "googleCallback" in obj; }, get: function (obj) { return obj.googleCallback; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _microsoftCallback_decorators, { kind: "method", name: "microsoftCallback", static: false, private: false, access: { has: function (obj) { return "microsoftCallback" in obj; }, get: function (obj) { return obj.microsoftCallback; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _forgotPassword_decorators, { kind: "method", name: "forgotPassword", static: false, private: false, access: { has: function (obj) { return "forgotPassword" in obj; }, get: function (obj) { return obj.forgotPassword; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _resetPassword_decorators, { kind: "method", name: "resetPassword", static: false, private: false, access: { has: function (obj) { return "resetPassword" in obj; }, get: function (obj) { return obj.resetPassword; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthController = _classThis;
}();
exports.AuthController = AuthController;
