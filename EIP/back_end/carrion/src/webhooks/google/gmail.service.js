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
exports.GmailService = void 0;
var common_1 = require("@nestjs/common");
var googleapis_1 = require("googleapis");
var GmailService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var GmailService = _classThis = /** @class */ (function () {
        function GmailService_1(prisma, mailFilter, authService) {
            var _this = this;
            this.prisma = prisma;
            this.mailFilter = mailFilter;
            this.authService = authService;
            this.logger = new common_1.Logger(GmailService.name);
            this.processedMessages = new Set();
            this.MESSAGE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
            setInterval(function () {
                _this.processedMessages.clear();
                _this.logger.log('Cleared Gmail processed messages cache');
            }, 6 * 60 * 60 * 1000);
        }
        GmailService_1.prototype.processHistoryUpdate = function (emailAddress, historyId) {
            return __awaiter(this, void 0, void 0, function () {
                var normalizedEmail, tokenRecord, validAccessToken, oauth2Client, gmail, lastKnownHistoryId, history_1, messageIds, _i, _a, historyRecord, _b, _c, messageAdded, uniqueMessageIds, messageProcessingPromises, CONCURRENT_LIMIT, i, batch, error_1;
                var _this = this;
                var _d, _e, _f, _g, _h;
                return __generator(this, function (_j) {
                    switch (_j.label) {
                        case 0:
                            this.logger.log("Processing history update for ".concat(emailAddress, " with historyId: ").concat(historyId));
                            normalizedEmail = emailAddress.toLowerCase();
                            return [4 /*yield*/, this.prisma.token.findFirst({
                                    where: {
                                        userEmail: normalizedEmail,
                                        name: 'Google_oauth2',
                                    },
                                })];
                        case 1:
                            tokenRecord = _j.sent();
                            if (!tokenRecord) {
                                this.logger.warn("Webhook received for ".concat(normalizedEmail, ", but no corresponding Google token was found."));
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, this.authService.getValidToken(tokenRecord.userId, 'Google_oauth2')];
                        case 2:
                            validAccessToken = _j.sent();
                            if (!validAccessToken) {
                                this.logger.error("Could not get a valid access token for user ".concat(tokenRecord.userId, " (").concat(normalizedEmail, ")."));
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, this.authService.checkAndRenewWebhook(tokenRecord, validAccessToken)];
                        case 3:
                            _j.sent();
                            oauth2Client = new googleapis_1.google.auth.OAuth2();
                            oauth2Client.setCredentials({ access_token: validAccessToken });
                            gmail = googleapis_1.google.gmail({ version: 'v1', auth: oauth2Client });
                            _j.label = 4;
                        case 4:
                            _j.trys.push([4, 12, , 13]);
                            lastKnownHistoryId = tokenRecord.externalId;
                            this.logger.log("Retrieving history from ".concat(lastKnownHistoryId || 'beginning', " to ").concat(historyId));
                            return [4 /*yield*/, gmail.users.history.list({
                                    userId: 'me',
                                    startHistoryId: lastKnownHistoryId || historyId, // Use last known or fallback to current
                                })];
                        case 5:
                            history_1 = _j.sent();
                            // Update the stored historyId with the new one
                            return [4 /*yield*/, this.authService.updateGoogleTokenWithHistoryId(tokenRecord.userId, historyId.toString())];
                        case 6:
                            // Update the stored historyId with the new one
                            _j.sent();
                            if (!history_1.data.history) {
                                this.logger.log("No history data found between ".concat(lastKnownHistoryId, " and ").concat(historyId));
                                return [2 /*return*/];
                            }
                            this.logger.log("Processing ".concat(history_1.data.history.length, " history records between ").concat(lastKnownHistoryId, " and ").concat(historyId));
                            messageIds = new Set();
                            for (_i = 0, _a = history_1.data.history; _i < _a.length; _i++) {
                                historyRecord = _a[_i];
                                // Log all available events for debugging
                                this.logger.log("History record contains: ".concat(JSON.stringify({
                                    messagesAdded: !!historyRecord.messagesAdded,
                                    messagesDeleted: !!historyRecord.messagesDeleted,
                                    labelsAdded: !!historyRecord.labelsAdded,
                                    labelsRemoved: !!historyRecord.labelsRemoved,
                                    messagesAddedCount: ((_d = historyRecord.messagesAdded) === null || _d === void 0 ? void 0 : _d.length) || 0,
                                    messagesDeletedCount: ((_e = historyRecord.messagesDeleted) === null || _e === void 0 ? void 0 : _e.length) || 0,
                                    labelsAddedCount: ((_f = historyRecord.labelsAdded) === null || _f === void 0 ? void 0 : _f.length) || 0,
                                    labelsRemovedCount: ((_g = historyRecord.labelsRemoved) === null || _g === void 0 ? void 0 : _g.length) || 0,
                                })));
                                // ONLY process newly added messages - ignore read/delete/label events
                                if (historyRecord.messagesAdded) {
                                    for (_b = 0, _c = historyRecord.messagesAdded; _b < _c.length; _b++) {
                                        messageAdded = _c[_b];
                                        if ((_h = messageAdded.message) === null || _h === void 0 ? void 0 : _h.id) {
                                            messageIds.add(messageAdded.message.id);
                                            this.logger.log("New message added: ".concat(messageAdded.message.id));
                                        }
                                    }
                                }
                                // Optional: Log other events but don't process them
                                if (historyRecord.messagesDeleted) {
                                    this.logger.log("Messages deleted (ignored): ".concat(historyRecord.messagesDeleted.length));
                                }
                                if (historyRecord.labelsAdded) {
                                    this.logger.log("Labels added (ignored): ".concat(historyRecord.labelsAdded.length));
                                }
                                if (historyRecord.labelsRemoved) {
                                    this.logger.log("Labels removed (ignored): ".concat(historyRecord.labelsRemoved.length));
                                }
                            }
                            if (messageIds.size === 0) {
                                this.logger.warn("No new messages found to process in history update for ".concat(emailAddress));
                                return [2 /*return*/];
                            }
                            this.logger.log("Found ".concat(messageIds.size, " new messages to process: ").concat(Array.from(messageIds).join(', ')));
                            uniqueMessageIds = Array.from(messageIds);
                            messageProcessingPromises = uniqueMessageIds.map(function (messageId) {
                                return _this.processMessage(gmail, messageId, tokenRecord.userId);
                            });
                            return [4 /*yield*/, this.mailFilter.getConcurrentEmailLimit()];
                        case 7:
                            CONCURRENT_LIMIT = _j.sent();
                            i = 0;
                            _j.label = 8;
                        case 8:
                            if (!(i < messageProcessingPromises.length)) return [3 /*break*/, 11];
                            batch = messageProcessingPromises.slice(i, i + CONCURRENT_LIMIT);
                            return [4 /*yield*/, Promise.all(batch)];
                        case 9:
                            _j.sent();
                            _j.label = 10;
                        case 10:
                            i += CONCURRENT_LIMIT;
                            return [3 /*break*/, 8];
                        case 11: return [3 /*break*/, 13];
                        case 12:
                            error_1 = _j.sent();
                            this.logger.error('Error processing history update: ' + error_1.message, error_1.stack);
                            return [3 /*break*/, 13];
                        case 13: return [2 /*return*/];
                    }
                });
            });
        };
        GmailService_1.prototype.processMessage = function (gmail, messageId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var cacheKey, messageRes, message, gmailMessage, result, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.logger.log("Processing message ".concat(messageId, " for user ").concat(userId));
                            cacheKey = "".concat(userId, "-").concat(messageId);
                            if (this.processedMessages.has(cacheKey)) {
                                this.logger.log("Skipping already processed Gmail message: ".concat(messageId, " for user ").concat(userId));
                                return [2 /*return*/];
                            }
                            // Mark as being processed to prevent race conditions
                            this.processedMessages.add(cacheKey);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 5, , 6]);
                            return [4 /*yield*/, gmail.users.messages.get({
                                    userId: 'me',
                                    id: messageId,
                                    format: 'full',
                                })];
                        case 2:
                            messageRes = _a.sent();
                            this.logger.log("Retrieved message ".concat(messageId, " from Gmail API"));
                            message = messageRes.data;
                            gmailMessage = this.mapToGmailMessage(message);
                            return [4 /*yield*/, this.isUserSentEmail(gmailMessage, userId)];
                        case 3:
                            if (_a.sent()) {
                                this.logger.log("Skipping email ".concat(messageId, " - sent by user to themselves"));
                                return [2 /*return*/];
                            }
                            this.logger.log("Mapped message ".concat(messageId, " to GmailMessage format"));
                            return [4 /*yield*/, this.mailFilter.processEmailAndCreateJobApplyFromGmail(gmailMessage, userId)];
                        case 4:
                            result = _a.sent();
                            this.logger.log("MailFilter processing result for message ".concat(messageId, ": ").concat(result));
                            return [3 /*break*/, 6];
                        case 5:
                            error_2 = _a.sent();
                            this.logger.error("Error processing message ".concat(messageId, ": ").concat(error_2.message), error_2.stack);
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        GmailService_1.prototype.isUserSentEmail = function (gmailMessage, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var user, userEmail, fromHeader, fromEmail, isSelfSent, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { id: userId },
                                    select: { email: true },
                                })];
                        case 1:
                            user = _a.sent();
                            if (!(user === null || user === void 0 ? void 0 : user.email)) {
                                this.logger.warn("User ".concat(userId, " not found or has no email"));
                                return [2 /*return*/, false];
                            }
                            userEmail = user.email.toLowerCase();
                            fromHeader = gmailMessage.payload.headers.find(function (header) { return header.name.toLowerCase() === 'from'; });
                            if (!fromHeader) {
                                return [2 /*return*/, false];
                            }
                            fromEmail = this.extractEmailFromHeader(fromHeader.value);
                            isSelfSent = fromEmail.toLowerCase() === userEmail;
                            if (isSelfSent) {
                                this.logger.log("Email detected as self-sent: ".concat(fromEmail, " = ").concat(userEmail));
                            }
                            return [2 /*return*/, isSelfSent];
                        case 2:
                            error_3 = _a.sent();
                            this.logger.error("Error checking if email is self-sent: ".concat(error_3.message));
                            return [2 /*return*/, false];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        GmailService_1.prototype.extractEmailFromHeader = function (headerValue) {
            var emailMatch = headerValue.match(/<([^>]+)>/);
            return emailMatch ? emailMatch[1] : headerValue.trim();
        };
        GmailService_1.prototype.mapToGmailMessage = function (sourceData) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            if (!(sourceData === null || sourceData === void 0 ? void 0 : sourceData.id) || !(sourceData === null || sourceData === void 0 ? void 0 : sourceData.payload)) {
                throw new Error('Invalid message structure received from API.');
            }
            var sourcePayload = sourceData.payload;
            return {
                id: sourceData.id,
                threadId: (_a = sourceData.threadId) !== null && _a !== void 0 ? _a : '',
                snippet: (_b = sourceData.snippet) !== null && _b !== void 0 ? _b : '',
                payload: {
                    partId: (_c = sourcePayload.partId) !== null && _c !== void 0 ? _c : '',
                    mimeType: (_d = sourcePayload.mimeType) !== null && _d !== void 0 ? _d : 'application/octet-stream',
                    filename: (_e = sourcePayload.filename) !== null && _e !== void 0 ? _e : '',
                    headers: ((_f = sourcePayload.headers) !== null && _f !== void 0 ? _f : []).map(function (header) {
                        var _a, _b;
                        return ({
                            name: (_a = header.name) !== null && _a !== void 0 ? _a : 'Unknown-Header',
                            value: (_b = header.value) !== null && _b !== void 0 ? _b : '',
                        });
                    }),
                    body: {
                        size: (_h = (_g = sourcePayload.body) === null || _g === void 0 ? void 0 : _g.size) !== null && _h !== void 0 ? _h : 0,
                        data: (_j = sourcePayload.body) === null || _j === void 0 ? void 0 : _j.data,
                        attachmentId: (_k = sourcePayload.body) === null || _k === void 0 ? void 0 : _k.attachmentId,
                    },
                    parts: sourcePayload.parts ? sourcePayload.parts : undefined,
                },
            };
        };
        return GmailService_1;
    }());
    __setFunctionName(_classThis, "GmailService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        GmailService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return GmailService = _classThis;
}();
exports.GmailService = GmailService;
