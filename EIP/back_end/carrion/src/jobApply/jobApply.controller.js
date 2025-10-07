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
exports.JobApplyController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var jwt_auth_guard_1 = require("../auth/guards/jwt/jwt-auth.guard");
var JobApplyController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('jobApply'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiCookieAuth)('access_token'), (0, common_1.Controller)('job_applies')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getAllJobApplies_decorators;
    var _addNewJobApply_decorators;
    var _deleteJob_decorators;
    var _deleteArchivedJob_decorators;
    var _updateJobApplicationPut_decorators;
    var _updateJobStatus_decorators;
    var _updateArchivedJobStatus_decorators;
    var _archiveJobApplication_decorators;
    var _unarchiveJobApplication_decorators;
    var _getAllArchivedJobApplies_decorators;
    var JobApplyController = _classThis = /** @class */ (function () {
        function JobApplyController_1(jobApplyService) {
            this.jobApplyService = (__runInitializers(this, _instanceExtraInitializers), jobApplyService);
        }
        JobApplyController_1.prototype.getAllJobApplies = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                var userId;
                return __generator(this, function (_a) {
                    userId = req.user.id;
                    return [2 /*return*/, this.jobApplyService.getAllJobApplies(userId)];
                });
            });
        };
        JobApplyController_1.prototype.addNewJobApply = function (req, createJobApplyDto) {
            return __awaiter(this, void 0, void 0, function () {
                var userId;
                return __generator(this, function (_a) {
                    userId = req.user.id;
                    return [2 /*return*/, this.jobApplyService.createJobApply(userId, createJobApplyDto)];
                });
            });
        };
        JobApplyController_1.prototype.deleteJob = function (jobApplyId, req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.jobApplyService.deleteJobApply(jobApplyId, req.user.id)];
                });
            });
        };
        JobApplyController_1.prototype.deleteArchivedJob = function (jobApplyId, req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.jobApplyService.deleteArchivedJobApply(jobApplyId, req.user.id)];
                });
            });
        };
        JobApplyController_1.prototype.updateJobApplicationPut = function (jobApplyId, updateJobApplyDto, req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.jobApplyService.updateJobApplyByData(jobApplyId, req.user.id, updateJobApplyDto)];
                });
            });
        };
        JobApplyController_1.prototype.updateJobStatus = function (jobApplyId, updateJobApplyDto, req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.jobApplyService.updateJobApplyByData(jobApplyId, req.user.id, updateJobApplyDto)];
                });
            });
        };
        JobApplyController_1.prototype.updateArchivedJobStatus = function (archivedJobApplyId, updateJobApplyDto, req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.jobApplyService.updateArchivedJobApplyByData(archivedJobApplyId, req.user.id, updateJobApplyDto)];
                });
            });
        };
        JobApplyController_1.prototype.archiveJobApplication = function (jobApplyId, req) {
            return __awaiter(this, void 0, void 0, function () {
                var userId;
                return __generator(this, function (_a) {
                    userId = req.user.id;
                    return [2 /*return*/, this.jobApplyService.archiveJobApplication(jobApplyId, userId)];
                });
            });
        };
        JobApplyController_1.prototype.unarchiveJobApplication = function (archivedJobId, req) {
            return __awaiter(this, void 0, void 0, function () {
                var userId;
                return __generator(this, function (_a) {
                    userId = req.user.id;
                    return [2 /*return*/, this.jobApplyService.unarchiveJobApplication(archivedJobId, userId)];
                });
            });
        };
        JobApplyController_1.prototype.getAllArchivedJobApplies = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                var userId;
                return __generator(this, function (_a) {
                    userId = req.user.id;
                    return [2 /*return*/, this.jobApplyService.getAllArchivedJobApplies(userId)];
                });
            });
        };
        return JobApplyController_1;
    }());
    __setFunctionName(_classThis, "JobApplyController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getAllJobApplies_decorators = [(0, common_1.Get)('get_jobApply'), (0, swagger_1.ApiOperation)({ summary: 'Get jobApply information' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Get successfully get jobApply' }), (0, swagger_1.ApiResponse)({ status: 400, description: "Can't get jobApply error" }), (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }), (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' })];
        _addNewJobApply_decorators = [(0, common_1.Post)('add_jobApply'), (0, swagger_1.ApiOperation)({ summary: 'Add new job application' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Job application added successfully',
            }), (0, swagger_1.ApiResponse)({ status: 400, description: "Can't add job application" }), (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }), (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' })];
        _deleteJob_decorators = [(0, common_1.Delete)(':id'), (0, swagger_1.ApiOperation)({ summary: 'Delete a job application' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Job application deleted successfully',
            }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Job application not found' })];
        _deleteArchivedJob_decorators = [(0, common_1.Delete)(':id/archived'), (0, swagger_1.ApiOperation)({ summary: 'Delete a job application' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Job application deleted successfully',
            }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Job application not found' })];
        _updateJobApplicationPut_decorators = [(0, common_1.Put)(':id/status'), (0, swagger_1.ApiOperation)({ summary: 'Update job application (PUT method)' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Job application updated successfully',
            }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Job application not found' })];
        _updateJobStatus_decorators = [(0, common_1.Patch)(':id/status'), (0, swagger_1.ApiOperation)({ summary: 'Update job application status' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Job application status updated successfully',
            }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Job application not found' })];
        _updateArchivedJobStatus_decorators = [(0, common_1.Put)(':id/archived-status'), (0, swagger_1.ApiOperation)({ summary: 'Update job application status' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Job application status updated successfully',
            }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Job application not found' })];
        _archiveJobApplication_decorators = [(0, common_1.Post)(':id/archive'), (0, swagger_1.ApiOperation)({ summary: 'Archive a job application' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Successfully archived the job application',
            }), (0, swagger_1.ApiResponse)({
                status: 400,
                description: "Can't archive job application error",
            }), (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }), (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' })];
        _unarchiveJobApplication_decorators = [(0, common_1.Post)(':id/unarchive'), (0, swagger_1.ApiOperation)({ summary: 'Unarchive a job application' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Successfully unarchived the job application',
            }), (0, swagger_1.ApiResponse)({
                status: 400,
                description: "Can't unarchive job application error",
            }), (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }), (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' })];
        _getAllArchivedJobApplies_decorators = [(0, common_1.Get)('get_archivedJobApply'), (0, swagger_1.ApiOperation)({ summary: 'Get archivedJobApply information' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Successfully get archivedJobApply',
            }), (0, swagger_1.ApiResponse)({ status: 400, description: "Can't get archivedJobApply error" }), (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }), (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' })];
        __esDecorate(_classThis, null, _getAllJobApplies_decorators, { kind: "method", name: "getAllJobApplies", static: false, private: false, access: { has: function (obj) { return "getAllJobApplies" in obj; }, get: function (obj) { return obj.getAllJobApplies; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _addNewJobApply_decorators, { kind: "method", name: "addNewJobApply", static: false, private: false, access: { has: function (obj) { return "addNewJobApply" in obj; }, get: function (obj) { return obj.addNewJobApply; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteJob_decorators, { kind: "method", name: "deleteJob", static: false, private: false, access: { has: function (obj) { return "deleteJob" in obj; }, get: function (obj) { return obj.deleteJob; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteArchivedJob_decorators, { kind: "method", name: "deleteArchivedJob", static: false, private: false, access: { has: function (obj) { return "deleteArchivedJob" in obj; }, get: function (obj) { return obj.deleteArchivedJob; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateJobApplicationPut_decorators, { kind: "method", name: "updateJobApplicationPut", static: false, private: false, access: { has: function (obj) { return "updateJobApplicationPut" in obj; }, get: function (obj) { return obj.updateJobApplicationPut; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateJobStatus_decorators, { kind: "method", name: "updateJobStatus", static: false, private: false, access: { has: function (obj) { return "updateJobStatus" in obj; }, get: function (obj) { return obj.updateJobStatus; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateArchivedJobStatus_decorators, { kind: "method", name: "updateArchivedJobStatus", static: false, private: false, access: { has: function (obj) { return "updateArchivedJobStatus" in obj; }, get: function (obj) { return obj.updateArchivedJobStatus; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _archiveJobApplication_decorators, { kind: "method", name: "archiveJobApplication", static: false, private: false, access: { has: function (obj) { return "archiveJobApplication" in obj; }, get: function (obj) { return obj.archiveJobApplication; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _unarchiveJobApplication_decorators, { kind: "method", name: "unarchiveJobApplication", static: false, private: false, access: { has: function (obj) { return "unarchiveJobApplication" in obj; }, get: function (obj) { return obj.unarchiveJobApplication; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAllArchivedJobApplies_decorators, { kind: "method", name: "getAllArchivedJobApplies", static: false, private: false, access: { has: function (obj) { return "getAllArchivedJobApplies" in obj; }, get: function (obj) { return obj.getAllArchivedJobApplies; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        JobApplyController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return JobApplyController = _classThis;
}();
exports.JobApplyController = JobApplyController;
