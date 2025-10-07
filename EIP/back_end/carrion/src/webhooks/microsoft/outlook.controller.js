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
exports.OutlookController = void 0;
var common_1 = require("@nestjs/common");
var logging_service_1 = require("../../common/services/logging.service");
var public_decorator_1 = require("../../auth/decorators/public.decorator");
var OutlookController = function () {
    var _classDecorators = [(0, common_1.Controller)('webhook/outlook')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _testWebhook_decorators;
    var _handleValidation_decorators;
    var _handleNotification_decorators;
    var OutlookController = _classThis = /** @class */ (function () {
        function OutlookController_1(outlookService, logger, mailFilterService, userService) {
            var _this = this;
            this.outlookService = (__runInitializers(this, _instanceExtraInitializers), outlookService);
            this.logger = logger;
            this.mailFilterService = mailFilterService;
            this.userService = userService;
            this.processedMessages = new Set();
            this.MESSAGE_CACHE_TTL = 24 * 60 * 60 * 1000;
            setInterval(function () {
                _this.processedMessages.clear();
            }, 6 * 60 * 60 * 1000);
        }
        /**
         * Test endpoint to verify webhook accessibility
         */
        OutlookController_1.prototype.testWebhook = function () {
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    response = {
                        message: 'Outlook webhook is accessible',
                        timestamp: new Date().toISOString(),
                        url: 'GET /webhook/outlook/test',
                    };
                    this.logger.logWebhookEvent('Test endpoint accessed', response);
                    return [2 /*return*/, response];
                });
            });
        };
        /**
         * Handle validation requests that come as GET
         */
        OutlookController_1.prototype.handleValidation = function (validationToken) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.logger.logWebhookEvent('GET validation request received', {
                        validationToken: validationToken || 'none',
                    });
                    if (validationToken) {
                        this.logger.logWebhookEvent('Returning validation token from GET', {
                            validationToken: validationToken,
                        });
                        return [2 /*return*/, validationToken];
                    }
                    return [2 /*return*/, { status: 'no_validation_token' }];
                });
            });
        };
        /**
         * Handle incoming Outlook webhook notifications
         */
        OutlookController_1.prototype.handleNotification = function (notification, headers, req) {
            return __awaiter(this, void 0, void 0, function () {
                var startTime, validationToken, requestContext, possibleValidationToken, processingPromises, CONCURRENT_LIMIT, i, batch, error_1, duration;
                var _this = this;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            startTime = Date.now();
                            validationToken = headers['validation-token'] ||
                                headers['validationtoken'] ||
                                headers['x-validation-token'] ||
                                (notification === null || notification === void 0 ? void 0 : notification.validationToken) ||
                                req.query.validationToken;
                            requestContext = {
                                notification: JSON.stringify(notification),
                                validationToken: validationToken || 'none',
                                headers: JSON.stringify(headers),
                                timestamp: new Date().toISOString(),
                            };
                            // Log incoming notification for debugging
                            this.logger.logWebhookEvent('Outlook notification received', notification, {
                                validationToken: validationToken || 'none',
                                allHeaders: headers,
                            });
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 8, , 9]);
                            // Handle subscription validation
                            if (validationToken) {
                                this.logger.logWebhookEvent('Subscription validation requested', {
                                    validationToken: validationToken,
                                    willReturn: validationToken,
                                });
                                // Microsoft expects just the validation token as plain text response
                                return [2 /*return*/, validationToken];
                            }
                            // Check if this is a validation request with no explicit token
                            if (Object.keys(notification).length === 0 || !notification.value) {
                                this.logger.logWebhookEvent('Empty notification received - might be validation', {
                                    notification: notification,
                                    headers: headers,
                                    queryParams: req.query,
                                });
                                possibleValidationToken = headers['validation-token'] ||
                                    headers['validationtoken'] ||
                                    headers['x-validation-token'] ||
                                    req.query.validationToken ||
                                    req.query.ValidationToken;
                                if (possibleValidationToken) {
                                    this.logger.logWebhookEvent('Found validation token in empty request', {
                                        validationToken: possibleValidationToken,
                                        source: 'headers_or_query',
                                    });
                                    return [2 /*return*/, possibleValidationToken];
                                }
                                // For completely empty requests, Microsoft might expect a 200 with specific response
                                this.logger.logWebhookEvent('No validation token found - returning plain OK', {
                                    contentType: headers['content-type'],
                                    acceptHeader: headers['accept'],
                                });
                                // Return plain text response since Microsoft expects text/plain
                                return [2 /*return*/, 'OK'];
                            }
                            if (!((notification === null || notification === void 0 ? void 0 : notification.value) && Array.isArray(notification.value))) return [3 /*break*/, 7];
                            processingPromises = notification.value.map(function (item) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, this.processNotificationItem(item, requestContext)];
                                });
                            }); });
                            return [4 /*yield*/, this.mailFilterService.getConcurrentEmailLimit()];
                        case 2:
                            CONCURRENT_LIMIT = _b.sent();
                            i = 0;
                            _b.label = 3;
                        case 3:
                            if (!(i < processingPromises.length)) return [3 /*break*/, 6];
                            batch = processingPromises.slice(i, i + CONCURRENT_LIMIT);
                            return [4 /*yield*/, Promise.all(batch)];
                        case 4:
                            _b.sent();
                            this.logger.logPerformance('Outlook batch processing completed', Date.now() - startTime, {
                                processed: batch.length,
                                batchNumber: Math.floor(i / CONCURRENT_LIMIT) + 1,
                                totalNotifications: notification.value.length,
                            });
                            _b.label = 5;
                        case 5:
                            i += CONCURRENT_LIMIT;
                            return [3 /*break*/, 3];
                        case 6:
                            // Log performance metrics
                            this.logger.logPerformance('Outlook notification processing completed', Date.now() - startTime, {
                                totalNotifications: notification.value.length,
                                batches: Math.ceil(processingPromises.length / CONCURRENT_LIMIT),
                            });
                            _b.label = 7;
                        case 7: return [2 /*return*/, { status: 'success', processed: ((_a = notification === null || notification === void 0 ? void 0 : notification.value) === null || _a === void 0 ? void 0 : _a.length) || 0 }];
                        case 8:
                            error_1 = _b.sent();
                            duration = Date.now() - startTime;
                            this.logger.error('Outlook webhook processing failed', undefined, logging_service_1.LogCategory.WEBHOOK, {
                                error: error_1.message,
                                duration: duration,
                                requestContext: requestContext,
                            });
                            // Return success to prevent Microsoft from retrying
                            return [2 /*return*/, { status: 'error_handled', message: error_1.message }];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Process individual notification item
         */
        OutlookController_1.prototype.processNotificationItem = function (item, requestContext) {
            return __awaiter(this, void 0, void 0, function () {
                var resourceData, messageId, subscriptionId, cacheKey, token, user, emailMessage, error_2;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 6, , 7]);
                            resourceData = item.resourceData;
                            if (!resourceData) {
                                this.logger.warn('Notification item missing resourceData', logging_service_1.LogCategory.WEBHOOK, { item: item });
                                return [2 /*return*/];
                            }
                            messageId = resourceData.id;
                            subscriptionId = item.subscriptionId;
                            cacheKey = "".concat(subscriptionId, "-").concat(messageId);
                            if (this.processedMessages.has(cacheKey)) {
                                this.logger.warn("Skipping already processed message. MessageId: ".concat(messageId, ", SubscriptionId: ").concat(subscriptionId), logging_service_1.LogCategory.WEBHOOK);
                                return [2 /*return*/];
                            }
                            // Mark as being processed immediately to prevent race conditions
                            this.processedMessages.add(cacheKey);
                            this.logger.log("Processing new Outlook message. MessageId: ".concat(messageId, ", SubscriptionId: ").concat(subscriptionId));
                            return [4 /*yield*/, this.outlookService.getTokenForUser(subscriptionId)];
                        case 1:
                            token = _c.sent();
                            if (!token) {
                                this.logger.warn('Token not found for subscription', logging_service_1.LogCategory.WEBHOOK, {
                                    subscriptionId: subscriptionId,
                                    messageId: messageId,
                                });
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, this.userService.findOne(token.userId)];
                        case 2:
                            user = _c.sent();
                            if (!user) {
                                this.logger.warn('User not found for token', logging_service_1.LogCategory.WEBHOOK, {
                                    userId: token.userId,
                                    subscriptionId: subscriptionId,
                                    messageId: messageId,
                                });
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, this.outlookService.fetchMessageWithRefresh(resourceData.id, user.id)];
                        case 3:
                            emailMessage = _c.sent();
                            if (!emailMessage) {
                                this.logger.warn('Could not fetch email message', logging_service_1.LogCategory.WEBHOOK, {
                                    messageId: resourceData.id,
                                    userId: user.id,
                                    subscriptionId: subscriptionId,
                                });
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, this.isUserSentEmail(emailMessage, user)];
                        case 4:
                            if (_c.sent()) {
                                this.logger.log("Skipping Outlook email ".concat(resourceData.id, " - sent by user to themselves"));
                                return [2 /*return*/];
                            }
                            // Log email processing start
                            this.logger.logEmailProcessing('Processing Outlook email', {
                                subject: emailMessage.subject,
                                from: (_b = (_a = emailMessage.from) === null || _a === void 0 ? void 0 : _a.emailAddress) === null || _b === void 0 ? void 0 : _b.address,
                                messageId: emailMessage.id,
                            }, { userId: user.id });
                            return [4 /*yield*/, this.mailFilterService.processEmailAndCreateJobApplyFromOutlook(emailMessage, user.id)];
                        case 5:
                            _c.sent();
                            return [3 /*break*/, 7];
                        case 6:
                            error_2 = _c.sent();
                            this.logger.error('Error processing notification item', undefined, logging_service_1.LogCategory.WEBHOOK, {
                                error: error_2.message,
                                item: item,
                                requestContext: requestContext,
                            });
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        OutlookController_1.prototype.isUserSentEmail = function (emailMessage, user) {
            return __awaiter(this, void 0, void 0, function () {
                var userEmail, fromEmail, isSelfSent;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    try {
                        if (!(user === null || user === void 0 ? void 0 : user.email)) {
                            this.logger.warn("User ".concat(user === null || user === void 0 ? void 0 : user.id, " has no email address"));
                            return [2 /*return*/, false];
                        }
                        userEmail = user.email.toLowerCase();
                        fromEmail = (_c = (_b = (_a = emailMessage.from) === null || _a === void 0 ? void 0 : _a.emailAddress) === null || _b === void 0 ? void 0 : _b.address) === null || _c === void 0 ? void 0 : _c.toLowerCase();
                        if (!fromEmail) {
                            return [2 /*return*/, false];
                        }
                        isSelfSent = fromEmail === userEmail;
                        if (isSelfSent) {
                            this.logger.log("Outlook email detected as self-sent: ".concat(fromEmail, " = ").concat(userEmail));
                        }
                        return [2 /*return*/, isSelfSent];
                    }
                    catch (error) {
                        this.logger.error('Error checking if Outlook email is self-sent', undefined, logging_service_1.LogCategory.WEBHOOK, { error: error.message });
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/];
                });
            });
        };
        return OutlookController_1;
    }());
    __setFunctionName(_classThis, "OutlookController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _testWebhook_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('test')];
        _handleValidation_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)(), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _handleNotification_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)(), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        __esDecorate(_classThis, null, _testWebhook_decorators, { kind: "method", name: "testWebhook", static: false, private: false, access: { has: function (obj) { return "testWebhook" in obj; }, get: function (obj) { return obj.testWebhook; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleValidation_decorators, { kind: "method", name: "handleValidation", static: false, private: false, access: { has: function (obj) { return "handleValidation" in obj; }, get: function (obj) { return obj.handleValidation; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleNotification_decorators, { kind: "method", name: "handleNotification", static: false, private: false, access: { has: function (obj) { return "handleNotification" in obj; }, get: function (obj) { return obj.handleNotification; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OutlookController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OutlookController = _classThis;
}();
exports.OutlookController = OutlookController;
