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
exports.S3Service = void 0;
var client_s3_1 = require("@aws-sdk/client-s3");
var s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
var common_1 = require("@nestjs/common");
var S3Service = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var S3Service = _classThis = /** @class */ (function () {
        function S3Service_1(configService, prismaService) {
            this.configService = configService;
            this.prismaService = prismaService;
            this.bucket = this.configService.get('AWS_BUCKET_NAME');
            this.s3 = new client_s3_1.S3Client({
                region: this.configService.get('AWS_REGION'),
                credentials: {
                    accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
                    secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
                },
            });
        }
        S3Service_1.prototype.getSignedUploadUrl = function (userId, filename, contentType) {
            return __awaiter(this, void 0, void 0, function () {
                var key, command, signedUrl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            key = "users/".concat(userId, "/").concat(filename);
                            command = new client_s3_1.PutObjectCommand({
                                Bucket: this.bucket,
                                Key: key,
                                ContentType: contentType,
                            });
                            return [4 /*yield*/, (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, { expiresIn: 300 })];
                        case 1:
                            signedUrl = _a.sent();
                            if (!(filename == 'profile')) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prismaService.userProfile.update({
                                    where: { userId: userId },
                                    data: {
                                        imageUrl: key,
                                    },
                                })];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 3:
                            if (!(filename == 'cv')) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.prismaService.userProfile.update({
                                    where: { userId: userId },
                                    data: {
                                        resume: key,
                                    },
                                })];
                        case 4:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 5: throw new common_1.BadRequestException('Filename must be "profile" or "cv"');
                        case 6: return [2 /*return*/, { signedUrl: signedUrl }];
                    }
                });
            });
        };
        S3Service_1.prototype.getSignedDownloadUrl = function (userId, filename) {
            return __awaiter(this, void 0, void 0, function () {
                var response, key, command, signedUrl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prismaService.userProfile.findUnique({
                                where: { userId: userId },
                                select: { imageUrl: true, resume: true },
                            })];
                        case 1:
                            response = _a.sent();
                            if (filename == 'profile' && !(response === null || response === void 0 ? void 0 : response.imageUrl))
                                return [2 /*return*/, null];
                            if (filename == 'cv' && !(response === null || response === void 0 ? void 0 : response.resume))
                                return [2 /*return*/, null];
                            key = "users/".concat(userId, "/").concat(filename);
                            command = new client_s3_1.GetObjectCommand({
                                Bucket: this.bucket,
                                Key: key,
                            });
                            return [4 /*yield*/, (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, { expiresIn: 300 })];
                        case 2:
                            signedUrl = _a.sent();
                            return [2 /*return*/, { signedUrl: signedUrl }];
                    }
                });
            });
        };
        S3Service_1.prototype.deleteCV = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var user, deleteParams, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            return [4 /*yield*/, this.prismaService.userProfile.findUnique({
                                    where: { userId: userId },
                                    select: { resume: true },
                                })];
                        case 1:
                            user = _a.sent();
                            if (!(user === null || user === void 0 ? void 0 : user.resume)) {
                                throw new common_1.BadRequestException('There is no résumé to delete');
                            }
                            deleteParams = {
                                Bucket: this.bucket,
                                Key: "users/".concat(userId, "/cv"),
                            };
                            return [4 /*yield*/, this.s3.send(new client_s3_1.DeleteObjectCommand(deleteParams))];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.prismaService.userProfile.update({
                                    where: { userId: userId },
                                    data: { resume: null },
                                })];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, { message: 'Résumé deleted successfully' }];
                        case 4:
                            error_1 = _a.sent();
                            throw new Error("Error deleting r\u00E9sum\u00E9: ".concat(error_1.message));
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        S3Service_1.prototype.deleteProfilePicture = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var user, deleteParams, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            return [4 /*yield*/, this.prismaService.userProfile.findUnique({
                                    where: { userId: userId },
                                    select: { imageUrl: true },
                                })];
                        case 1:
                            user = _a.sent();
                            if (!(user === null || user === void 0 ? void 0 : user.imageUrl)) {
                                throw new common_1.BadRequestException('There is no profile picture to delete');
                            }
                            deleteParams = {
                                Bucket: this.bucket,
                                Key: "users/".concat(userId, "/profile"),
                            };
                            return [4 /*yield*/, this.s3.send(new client_s3_1.DeleteObjectCommand(deleteParams))];
                        case 2:
                            _a.sent();
                            console.log("Profile picture deleted successfully from bucket ".concat(this.bucket, "."));
                            return [4 /*yield*/, this.prismaService.userProfile.update({
                                    where: { userId: userId },
                                    data: { imageUrl: null },
                                })];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, { message: 'Profile picture deleted successfully' }];
                        case 4:
                            error_2 = _a.sent();
                            throw new Error("Error deleting profile picture: ".concat(error_2.message));
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        return S3Service_1;
    }());
    __setFunctionName(_classThis, "S3Service");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        S3Service = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return S3Service = _classThis;
}();
exports.S3Service = S3Service;
