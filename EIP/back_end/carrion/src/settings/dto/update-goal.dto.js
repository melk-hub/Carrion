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
exports.UpdateGoalDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var UpdateGoalDto = function () {
    var _a;
    var _weeklyGoal_decorators;
    var _weeklyGoal_initializers = [];
    var _weeklyGoal_extraInitializers = [];
    var _monthlyGoal_decorators;
    var _monthlyGoal_initializers = [];
    var _monthlyGoal_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UpdateGoalDto() {
                this.weeklyGoal = __runInitializers(this, _weeklyGoal_initializers, void 0);
                this.monthlyGoal = (__runInitializers(this, _weeklyGoal_extraInitializers), __runInitializers(this, _monthlyGoal_initializers, void 0));
                __runInitializers(this, _monthlyGoal_extraInitializers);
            }
            return UpdateGoalDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _weeklyGoal_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Weekly goal for job applications',
                    example: 10,
                    minimum: 1,
                    maximum: 100,
                    required: false,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.IsPositive)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(100)];
            _monthlyGoal_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Monthly goal for job applications',
                    example: 30,
                    minimum: 1,
                    maximum: 500,
                    required: false,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.IsPositive)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(500)];
            __esDecorate(null, null, _weeklyGoal_decorators, { kind: "field", name: "weeklyGoal", static: false, private: false, access: { has: function (obj) { return "weeklyGoal" in obj; }, get: function (obj) { return obj.weeklyGoal; }, set: function (obj, value) { obj.weeklyGoal = value; } }, metadata: _metadata }, _weeklyGoal_initializers, _weeklyGoal_extraInitializers);
            __esDecorate(null, null, _monthlyGoal_decorators, { kind: "field", name: "monthlyGoal", static: false, private: false, access: { has: function (obj) { return "monthlyGoal" in obj; }, get: function (obj) { return obj.monthlyGoal; }, set: function (obj, value) { obj.monthlyGoal = value; } }, metadata: _metadata }, _monthlyGoal_initializers, _monthlyGoal_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateGoalDto = UpdateGoalDto;
