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
exports.UserProfileDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var UserProfileDto = function () {
    var _a;
    var _firstName_decorators;
    var _firstName_initializers = [];
    var _firstName_extraInitializers = [];
    var _lastName_decorators;
    var _lastName_initializers = [];
    var _lastName_extraInitializers = [];
    var _birthDate_decorators;
    var _birthDate_initializers = [];
    var _birthDate_extraInitializers = [];
    var _school_decorators;
    var _school_initializers = [];
    var _school_extraInitializers = [];
    var _city_decorators;
    var _city_initializers = [];
    var _city_extraInitializers = [];
    var _phoneNumber_decorators;
    var _phoneNumber_initializers = [];
    var _phoneNumber_extraInitializers = [];
    var _personalDescription_decorators;
    var _personalDescription_initializers = [];
    var _personalDescription_extraInitializers = [];
    var _portfolioLink_decorators;
    var _portfolioLink_initializers = [];
    var _portfolioLink_extraInitializers = [];
    var _linkedin_decorators;
    var _linkedin_initializers = [];
    var _linkedin_extraInitializers = [];
    var _goal_decorators;
    var _goal_initializers = [];
    var _goal_extraInitializers = [];
    var _jobSought_decorators;
    var _jobSought_initializers = [];
    var _jobSought_extraInitializers = [];
    var _contractSought_decorators;
    var _contractSought_initializers = [];
    var _contractSought_extraInitializers = [];
    var _locationSought_decorators;
    var _locationSought_initializers = [];
    var _locationSought_extraInitializers = [];
    var _sector_decorators;
    var _sector_initializers = [];
    var _sector_extraInitializers = [];
    var _resume_decorators;
    var _resume_initializers = [];
    var _resume_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UserProfileDto() {
                this.firstName = __runInitializers(this, _firstName_initializers, void 0);
                this.lastName = (__runInitializers(this, _firstName_extraInitializers), __runInitializers(this, _lastName_initializers, void 0));
                this.birthDate = (__runInitializers(this, _lastName_extraInitializers), __runInitializers(this, _birthDate_initializers, void 0));
                this.school = (__runInitializers(this, _birthDate_extraInitializers), __runInitializers(this, _school_initializers, void 0));
                this.city = (__runInitializers(this, _school_extraInitializers), __runInitializers(this, _city_initializers, void 0));
                this.phoneNumber = (__runInitializers(this, _city_extraInitializers), __runInitializers(this, _phoneNumber_initializers, void 0));
                this.personalDescription = (__runInitializers(this, _phoneNumber_extraInitializers), __runInitializers(this, _personalDescription_initializers, void 0));
                this.portfolioLink = (__runInitializers(this, _personalDescription_extraInitializers), __runInitializers(this, _portfolioLink_initializers, void 0));
                this.linkedin = (__runInitializers(this, _portfolioLink_extraInitializers), __runInitializers(this, _linkedin_initializers, void 0));
                this.goal = (__runInitializers(this, _linkedin_extraInitializers), __runInitializers(this, _goal_initializers, void 0));
                this.jobSought = (__runInitializers(this, _goal_extraInitializers), __runInitializers(this, _jobSought_initializers, void 0));
                this.contractSought = (__runInitializers(this, _jobSought_extraInitializers), __runInitializers(this, _contractSought_initializers, void 0));
                this.locationSought = (__runInitializers(this, _contractSought_extraInitializers), __runInitializers(this, _locationSought_initializers, void 0));
                this.sector = (__runInitializers(this, _locationSought_extraInitializers), __runInitializers(this, _sector_initializers, void 0));
                this.resume = (__runInitializers(this, _sector_extraInitializers), __runInitializers(this, _resume_initializers, void 0));
                __runInitializers(this, _resume_extraInitializers);
            }
            return UserProfileDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _firstName_decorators = [(0, swagger_1.ApiProperty)({ required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _lastName_decorators = [(0, swagger_1.ApiProperty)({ required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _birthDate_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Date in YYYY-MM-DD format',
                    required: false,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            _school_decorators = [(0, swagger_1.ApiProperty)({ required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _city_decorators = [(0, swagger_1.ApiProperty)({ required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _phoneNumber_decorators = [(0, swagger_1.ApiProperty)({ required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _personalDescription_decorators = [(0, swagger_1.ApiProperty)({ required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _portfolioLink_decorators = [(0, swagger_1.ApiProperty)({ required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _linkedin_decorators = [(0, swagger_1.ApiProperty)({ required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _goal_decorators = [(0, swagger_1.ApiProperty)({ required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _jobSought_decorators = [(0, swagger_1.ApiProperty)({ required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _contractSought_decorators = [(0, swagger_1.ApiProperty)({ type: [String], required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _locationSought_decorators = [(0, swagger_1.ApiProperty)({ type: [String], required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _sector_decorators = [(0, swagger_1.ApiProperty)({ type: [String], required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _resume_decorators = [(0, swagger_1.ApiProperty)({ required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _firstName_decorators, { kind: "field", name: "firstName", static: false, private: false, access: { has: function (obj) { return "firstName" in obj; }, get: function (obj) { return obj.firstName; }, set: function (obj, value) { obj.firstName = value; } }, metadata: _metadata }, _firstName_initializers, _firstName_extraInitializers);
            __esDecorate(null, null, _lastName_decorators, { kind: "field", name: "lastName", static: false, private: false, access: { has: function (obj) { return "lastName" in obj; }, get: function (obj) { return obj.lastName; }, set: function (obj, value) { obj.lastName = value; } }, metadata: _metadata }, _lastName_initializers, _lastName_extraInitializers);
            __esDecorate(null, null, _birthDate_decorators, { kind: "field", name: "birthDate", static: false, private: false, access: { has: function (obj) { return "birthDate" in obj; }, get: function (obj) { return obj.birthDate; }, set: function (obj, value) { obj.birthDate = value; } }, metadata: _metadata }, _birthDate_initializers, _birthDate_extraInitializers);
            __esDecorate(null, null, _school_decorators, { kind: "field", name: "school", static: false, private: false, access: { has: function (obj) { return "school" in obj; }, get: function (obj) { return obj.school; }, set: function (obj, value) { obj.school = value; } }, metadata: _metadata }, _school_initializers, _school_extraInitializers);
            __esDecorate(null, null, _city_decorators, { kind: "field", name: "city", static: false, private: false, access: { has: function (obj) { return "city" in obj; }, get: function (obj) { return obj.city; }, set: function (obj, value) { obj.city = value; } }, metadata: _metadata }, _city_initializers, _city_extraInitializers);
            __esDecorate(null, null, _phoneNumber_decorators, { kind: "field", name: "phoneNumber", static: false, private: false, access: { has: function (obj) { return "phoneNumber" in obj; }, get: function (obj) { return obj.phoneNumber; }, set: function (obj, value) { obj.phoneNumber = value; } }, metadata: _metadata }, _phoneNumber_initializers, _phoneNumber_extraInitializers);
            __esDecorate(null, null, _personalDescription_decorators, { kind: "field", name: "personalDescription", static: false, private: false, access: { has: function (obj) { return "personalDescription" in obj; }, get: function (obj) { return obj.personalDescription; }, set: function (obj, value) { obj.personalDescription = value; } }, metadata: _metadata }, _personalDescription_initializers, _personalDescription_extraInitializers);
            __esDecorate(null, null, _portfolioLink_decorators, { kind: "field", name: "portfolioLink", static: false, private: false, access: { has: function (obj) { return "portfolioLink" in obj; }, get: function (obj) { return obj.portfolioLink; }, set: function (obj, value) { obj.portfolioLink = value; } }, metadata: _metadata }, _portfolioLink_initializers, _portfolioLink_extraInitializers);
            __esDecorate(null, null, _linkedin_decorators, { kind: "field", name: "linkedin", static: false, private: false, access: { has: function (obj) { return "linkedin" in obj; }, get: function (obj) { return obj.linkedin; }, set: function (obj, value) { obj.linkedin = value; } }, metadata: _metadata }, _linkedin_initializers, _linkedin_extraInitializers);
            __esDecorate(null, null, _goal_decorators, { kind: "field", name: "goal", static: false, private: false, access: { has: function (obj) { return "goal" in obj; }, get: function (obj) { return obj.goal; }, set: function (obj, value) { obj.goal = value; } }, metadata: _metadata }, _goal_initializers, _goal_extraInitializers);
            __esDecorate(null, null, _jobSought_decorators, { kind: "field", name: "jobSought", static: false, private: false, access: { has: function (obj) { return "jobSought" in obj; }, get: function (obj) { return obj.jobSought; }, set: function (obj, value) { obj.jobSought = value; } }, metadata: _metadata }, _jobSought_initializers, _jobSought_extraInitializers);
            __esDecorate(null, null, _contractSought_decorators, { kind: "field", name: "contractSought", static: false, private: false, access: { has: function (obj) { return "contractSought" in obj; }, get: function (obj) { return obj.contractSought; }, set: function (obj, value) { obj.contractSought = value; } }, metadata: _metadata }, _contractSought_initializers, _contractSought_extraInitializers);
            __esDecorate(null, null, _locationSought_decorators, { kind: "field", name: "locationSought", static: false, private: false, access: { has: function (obj) { return "locationSought" in obj; }, get: function (obj) { return obj.locationSought; }, set: function (obj, value) { obj.locationSought = value; } }, metadata: _metadata }, _locationSought_initializers, _locationSought_extraInitializers);
            __esDecorate(null, null, _sector_decorators, { kind: "field", name: "sector", static: false, private: false, access: { has: function (obj) { return "sector" in obj; }, get: function (obj) { return obj.sector; }, set: function (obj, value) { obj.sector = value; } }, metadata: _metadata }, _sector_initializers, _sector_extraInitializers);
            __esDecorate(null, null, _resume_decorators, { kind: "field", name: "resume", static: false, private: false, access: { has: function (obj) { return "resume" in obj; }, get: function (obj) { return obj.resume; }, set: function (obj, value) { obj.resume = value; } }, metadata: _metadata }, _resume_initializers, _resume_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UserProfileDto = UserProfileDto;
