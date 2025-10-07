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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateJobApplyDto = exports.UpdateJobApplyDto = exports.JobApplyDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var application_status_enum_1 = require("../enum/application-status.enum");
var class_validator_1 = require("class-validator");
var JobApplyDto = function () {
    var _a;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _title_decorators;
    var _title_initializers = [];
    var _title_extraInitializers = [];
    var _company_decorators;
    var _company_initializers = [];
    var _company_extraInitializers = [];
    var _location_decorators;
    var _location_initializers = [];
    var _location_extraInitializers = [];
    var _salary_decorators;
    var _salary_initializers = [];
    var _salary_extraInitializers = [];
    var _imageUrl_decorators;
    var _imageUrl_initializers = [];
    var _imageUrl_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _interviewDate_decorators;
    var _interviewDate_initializers = [];
    var _interviewDate_extraInitializers = [];
    var _contractType_decorators;
    var _contractType_initializers = [];
    var _contractType_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    return _a = /** @class */ (function () {
            function JobApplyDto() {
                this.id = __runInitializers(this, _id_initializers, void 0);
                this.title = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _title_initializers, void 0));
                this.company = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _company_initializers, void 0));
                this.location = (__runInitializers(this, _company_extraInitializers), __runInitializers(this, _location_initializers, void 0));
                this.salary = (__runInitializers(this, _location_extraInitializers), __runInitializers(this, _salary_initializers, void 0));
                this.imageUrl = (__runInitializers(this, _salary_extraInitializers), __runInitializers(this, _imageUrl_initializers, void 0));
                this.status = (__runInitializers(this, _imageUrl_extraInitializers), __runInitializers(this, _status_initializers, void 0));
                this.interviewDate = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _interviewDate_initializers, void 0));
                this.contractType = (__runInitializers(this, _interviewDate_extraInitializers), __runInitializers(this, _contractType_initializers, void 0));
                this.createdAt = (__runInitializers(this, _contractType_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
                __runInitializers(this, _createdAt_extraInitializers);
            }
            return JobApplyDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, class_validator_1.IsUUID)()];
            _title_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(80)];
            _company_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(80)];
            _location_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(80)];
            _salary_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)(), (0, class_validator_1.MaxLength)(20)];
            _imageUrl_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(255)];
            _status_decorators = [(0, class_validator_1.IsEnum)(application_status_enum_1.ApplicationStatus)];
            _interviewDate_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(255)];
            _contractType_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.MaxLength)(255)];
            _createdAt_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsDate)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: function (obj) { return "title" in obj; }, get: function (obj) { return obj.title; }, set: function (obj, value) { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, null, _company_decorators, { kind: "field", name: "company", static: false, private: false, access: { has: function (obj) { return "company" in obj; }, get: function (obj) { return obj.company; }, set: function (obj, value) { obj.company = value; } }, metadata: _metadata }, _company_initializers, _company_extraInitializers);
            __esDecorate(null, null, _location_decorators, { kind: "field", name: "location", static: false, private: false, access: { has: function (obj) { return "location" in obj; }, get: function (obj) { return obj.location; }, set: function (obj, value) { obj.location = value; } }, metadata: _metadata }, _location_initializers, _location_extraInitializers);
            __esDecorate(null, null, _salary_decorators, { kind: "field", name: "salary", static: false, private: false, access: { has: function (obj) { return "salary" in obj; }, get: function (obj) { return obj.salary; }, set: function (obj, value) { obj.salary = value; } }, metadata: _metadata }, _salary_initializers, _salary_extraInitializers);
            __esDecorate(null, null, _imageUrl_decorators, { kind: "field", name: "imageUrl", static: false, private: false, access: { has: function (obj) { return "imageUrl" in obj; }, get: function (obj) { return obj.imageUrl; }, set: function (obj, value) { obj.imageUrl = value; } }, metadata: _metadata }, _imageUrl_initializers, _imageUrl_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _interviewDate_decorators, { kind: "field", name: "interviewDate", static: false, private: false, access: { has: function (obj) { return "interviewDate" in obj; }, get: function (obj) { return obj.interviewDate; }, set: function (obj, value) { obj.interviewDate = value; } }, metadata: _metadata }, _interviewDate_initializers, _interviewDate_extraInitializers);
            __esDecorate(null, null, _contractType_decorators, { kind: "field", name: "contractType", static: false, private: false, access: { has: function (obj) { return "contractType" in obj; }, get: function (obj) { return obj.contractType; }, set: function (obj, value) { obj.contractType = value; } }, metadata: _metadata }, _contractType_initializers, _contractType_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.JobApplyDto = JobApplyDto;
var UpdateJobApplyDto = function () {
    var _a;
    var _title_decorators;
    var _title_initializers = [];
    var _title_extraInitializers = [];
    var _company_decorators;
    var _company_initializers = [];
    var _company_extraInitializers = [];
    var _location_decorators;
    var _location_initializers = [];
    var _location_extraInitializers = [];
    var _salary_decorators;
    var _salary_initializers = [];
    var _salary_extraInitializers = [];
    var _imageUrl_decorators;
    var _imageUrl_initializers = [];
    var _imageUrl_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _contractType_decorators;
    var _contractType_initializers = [];
    var _contractType_extraInitializers = [];
    var _interviewDate_decorators;
    var _interviewDate_initializers = [];
    var _interviewDate_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UpdateJobApplyDto() {
                this.title = __runInitializers(this, _title_initializers, void 0);
                this.company = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _company_initializers, void 0));
                this.location = (__runInitializers(this, _company_extraInitializers), __runInitializers(this, _location_initializers, void 0));
                this.salary = (__runInitializers(this, _location_extraInitializers), __runInitializers(this, _salary_initializers, void 0));
                this.imageUrl = (__runInitializers(this, _salary_extraInitializers), __runInitializers(this, _imageUrl_initializers, void 0));
                this.status = (__runInitializers(this, _imageUrl_extraInitializers), __runInitializers(this, _status_initializers, void 0));
                this.contractType = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _contractType_initializers, void 0));
                this.interviewDate = (__runInitializers(this, _contractType_extraInitializers), __runInitializers(this, _interviewDate_initializers, void 0));
                __runInitializers(this, _interviewDate_extraInitializers);
            }
            return UpdateJobApplyDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _title_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'title',
                    description: 'Title of job',
                    type: 'string',
                    example: 'Computer engineer senior H/F',
                }), (0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(80)];
            _company_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'company',
                    description: 'Company name',
                    type: 'string',
                    example: 'Chanel',
                }), (0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(40)];
            _location_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'location',
                    description: 'Location of job',
                    type: 'string',
                    example: 'Paris',
                }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)(), (0, class_validator_1.MaxLength)(40)];
            _salary_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'salary',
                    description: 'Salary of job',
                    type: 'number',
                    example: '10000',
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _imageUrl_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'imageUrl',
                    description: 'imageUrl aws db',
                    type: 'string',
                    example: 'https://test.fr',
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(255)];
            _status_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'status',
                    description: 'Status of job',
                    type: 'string',
                    example: 'PENDING',
                }), (0, class_validator_1.IsEnum)(application_status_enum_1.ApplicationStatus)];
            _contractType_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'contractType',
                    description: 'Contract Type of job',
                    type: 'string',
                    example: 'Internship',
                }), (0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.MaxLength)(255)];
            _interviewDate_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'interviewDate',
                    description: 'Interview Date of job',
                    type: Date,
                    example: '2025-06-09 09:08:22',
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDate)(), (0, class_validator_1.MaxLength)(255)];
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: function (obj) { return "title" in obj; }, get: function (obj) { return obj.title; }, set: function (obj, value) { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, null, _company_decorators, { kind: "field", name: "company", static: false, private: false, access: { has: function (obj) { return "company" in obj; }, get: function (obj) { return obj.company; }, set: function (obj, value) { obj.company = value; } }, metadata: _metadata }, _company_initializers, _company_extraInitializers);
            __esDecorate(null, null, _location_decorators, { kind: "field", name: "location", static: false, private: false, access: { has: function (obj) { return "location" in obj; }, get: function (obj) { return obj.location; }, set: function (obj, value) { obj.location = value; } }, metadata: _metadata }, _location_initializers, _location_extraInitializers);
            __esDecorate(null, null, _salary_decorators, { kind: "field", name: "salary", static: false, private: false, access: { has: function (obj) { return "salary" in obj; }, get: function (obj) { return obj.salary; }, set: function (obj, value) { obj.salary = value; } }, metadata: _metadata }, _salary_initializers, _salary_extraInitializers);
            __esDecorate(null, null, _imageUrl_decorators, { kind: "field", name: "imageUrl", static: false, private: false, access: { has: function (obj) { return "imageUrl" in obj; }, get: function (obj) { return obj.imageUrl; }, set: function (obj, value) { obj.imageUrl = value; } }, metadata: _metadata }, _imageUrl_initializers, _imageUrl_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _contractType_decorators, { kind: "field", name: "contractType", static: false, private: false, access: { has: function (obj) { return "contractType" in obj; }, get: function (obj) { return obj.contractType; }, set: function (obj, value) { obj.contractType = value; } }, metadata: _metadata }, _contractType_initializers, _contractType_extraInitializers);
            __esDecorate(null, null, _interviewDate_decorators, { kind: "field", name: "interviewDate", static: false, private: false, access: { has: function (obj) { return "interviewDate" in obj; }, get: function (obj) { return obj.interviewDate; }, set: function (obj, value) { obj.interviewDate = value; } }, metadata: _metadata }, _interviewDate_initializers, _interviewDate_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateJobApplyDto = UpdateJobApplyDto;
var CreateJobApplyDto = function () {
    var _a;
    var _title_decorators;
    var _title_initializers = [];
    var _title_extraInitializers = [];
    var _company_decorators;
    var _company_initializers = [];
    var _company_extraInitializers = [];
    var _location_decorators;
    var _location_initializers = [];
    var _location_extraInitializers = [];
    var _salary_decorators;
    var _salary_initializers = [];
    var _salary_extraInitializers = [];
    var _imageUrl_decorators;
    var _imageUrl_initializers = [];
    var _imageUrl_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _contractType_decorators;
    var _contractType_initializers = [];
    var _contractType_extraInitializers = [];
    var _interviewDate_decorators;
    var _interviewDate_initializers = [];
    var _interviewDate_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateJobApplyDto() {
                this.title = __runInitializers(this, _title_initializers, void 0);
                this.company = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _company_initializers, void 0));
                this.location = (__runInitializers(this, _company_extraInitializers), __runInitializers(this, _location_initializers, void 0));
                this.salary = (__runInitializers(this, _location_extraInitializers), __runInitializers(this, _salary_initializers, void 0));
                this.imageUrl = (__runInitializers(this, _salary_extraInitializers), __runInitializers(this, _imageUrl_initializers, void 0));
                this.status = (__runInitializers(this, _imageUrl_extraInitializers), __runInitializers(this, _status_initializers, void 0));
                this.contractType = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _contractType_initializers, void 0));
                this.interviewDate = (__runInitializers(this, _contractType_extraInitializers), __runInitializers(this, _interviewDate_initializers, void 0));
                __runInitializers(this, _interviewDate_extraInitializers);
            }
            return CreateJobApplyDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _title_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'title',
                    description: 'Title of job',
                    type: 'string',
                    example: 'Computer engineer senior H/F',
                }), (0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(80)];
            _company_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'company',
                    description: 'Company name',
                    type: 'string',
                    example: 'Chanel',
                }), (0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(40)];
            _location_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'location',
                    description: 'Location of job',
                    type: 'string',
                    example: 'Paris',
                }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)(), (0, class_validator_1.MaxLength)(40)];
            _salary_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'salary',
                    description: 'Salary of job',
                    type: 'number',
                    example: '10000',
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _imageUrl_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'imageUrl',
                    description: 'imageUrl aws db',
                    type: 'string',
                    example: 'https://test.fr',
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(255)];
            _status_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'status',
                    description: 'Status of job',
                    type: 'string',
                    example: 'PENDING',
                }), (0, class_validator_1.IsEnum)(application_status_enum_1.ApplicationStatus)];
            _contractType_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'contractType',
                    description: 'Contract Type of job',
                    type: 'string',
                    example: 'Internship',
                }), (0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.MaxLength)(255)];
            _interviewDate_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'interviewDate',
                    description: 'Interview Date of job',
                    type: Date,
                    example: '2025-06-09 09:08:22',
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDate)(), (0, class_validator_1.MaxLength)(255)];
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: function (obj) { return "title" in obj; }, get: function (obj) { return obj.title; }, set: function (obj, value) { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, null, _company_decorators, { kind: "field", name: "company", static: false, private: false, access: { has: function (obj) { return "company" in obj; }, get: function (obj) { return obj.company; }, set: function (obj, value) { obj.company = value; } }, metadata: _metadata }, _company_initializers, _company_extraInitializers);
            __esDecorate(null, null, _location_decorators, { kind: "field", name: "location", static: false, private: false, access: { has: function (obj) { return "location" in obj; }, get: function (obj) { return obj.location; }, set: function (obj, value) { obj.location = value; } }, metadata: _metadata }, _location_initializers, _location_extraInitializers);
            __esDecorate(null, null, _salary_decorators, { kind: "field", name: "salary", static: false, private: false, access: { has: function (obj) { return "salary" in obj; }, get: function (obj) { return obj.salary; }, set: function (obj, value) { obj.salary = value; } }, metadata: _metadata }, _salary_initializers, _salary_extraInitializers);
            __esDecorate(null, null, _imageUrl_decorators, { kind: "field", name: "imageUrl", static: false, private: false, access: { has: function (obj) { return "imageUrl" in obj; }, get: function (obj) { return obj.imageUrl; }, set: function (obj, value) { obj.imageUrl = value; } }, metadata: _metadata }, _imageUrl_initializers, _imageUrl_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _contractType_decorators, { kind: "field", name: "contractType", static: false, private: false, access: { has: function (obj) { return "contractType" in obj; }, get: function (obj) { return obj.contractType; }, set: function (obj, value) { obj.contractType = value; } }, metadata: _metadata }, _contractType_initializers, _contractType_extraInitializers);
            __esDecorate(null, null, _interviewDate_decorators, { kind: "field", name: "interviewDate", static: false, private: false, access: { has: function (obj) { return "interviewDate" in obj; }, get: function (obj) { return obj.interviewDate; }, set: function (obj, value) { obj.interviewDate = value; } }, metadata: _metadata }, _interviewDate_initializers, _interviewDate_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateJobApplyDto = CreateJobApplyDto;
