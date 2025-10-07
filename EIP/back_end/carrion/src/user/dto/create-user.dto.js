"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.LoginDto = exports.CreateUserDto = void 0;
var class_validator_1 = require("class-validator");
var swagger_1 = require("@nestjs/swagger");
var user_dto_1 = require("./user.dto");
var CreateUserDto = function () {
    var _a;
    var _classSuper = user_dto_1.UserDto;
    var _hasProfile_decorators;
    var _hasProfile_initializers = [];
    var _hasProfile_extraInitializers = [];
    var _firstName_decorators;
    var _firstName_initializers = [];
    var _firstName_extraInitializers = [];
    var _lastName_decorators;
    var _lastName_initializers = [];
    var _lastName_extraInitializers = [];
    return _a = /** @class */ (function (_super) {
            __extends(CreateUserDto, _super);
            function CreateUserDto() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.hasProfile = __runInitializers(_this, _hasProfile_initializers, false);
                _this.firstName = (__runInitializers(_this, _hasProfile_extraInitializers), __runInitializers(_this, _firstName_initializers, void 0));
                _this.lastName = (__runInitializers(_this, _firstName_extraInitializers), __runInitializers(_this, _lastName_initializers, void 0));
                __runInitializers(_this, _lastName_extraInitializers);
                return _this;
            }
            return CreateUserDto;
        }(_classSuper)),
        (function () {
            var _b;
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _hasProfile_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'hasProfile',
                    description: 'Did the user complete the information window',
                    type: 'boolean',
                    example: false,
                    default: false,
                }), (0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsBoolean)()];
            _firstName_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'firstName',
                    description: 'Did the user complete the information window',
                    type: 'boolean',
                    example: false,
                    default: false,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _lastName_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'lastName',
                    description: 'Did the user complete the information window',
                    type: 'boolean',
                    example: false,
                    default: false,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _hasProfile_decorators, { kind: "field", name: "hasProfile", static: false, private: false, access: { has: function (obj) { return "hasProfile" in obj; }, get: function (obj) { return obj.hasProfile; }, set: function (obj, value) { obj.hasProfile = value; } }, metadata: _metadata }, _hasProfile_initializers, _hasProfile_extraInitializers);
            __esDecorate(null, null, _firstName_decorators, { kind: "field", name: "firstName", static: false, private: false, access: { has: function (obj) { return "firstName" in obj; }, get: function (obj) { return obj.firstName; }, set: function (obj, value) { obj.firstName = value; } }, metadata: _metadata }, _firstName_initializers, _firstName_extraInitializers);
            __esDecorate(null, null, _lastName_decorators, { kind: "field", name: "lastName", static: false, private: false, access: { has: function (obj) { return "lastName" in obj; }, get: function (obj) { return obj.lastName; }, set: function (obj, value) { obj.lastName = value; } }, metadata: _metadata }, _lastName_initializers, _lastName_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateUserDto = CreateUserDto;
var LoginDto = function () {
    var _a;
    var _identifier_decorators;
    var _identifier_initializers = [];
    var _identifier_extraInitializers = [];
    var _password_decorators;
    var _password_initializers = [];
    var _password_extraInitializers = [];
    var _rememberMe_decorators;
    var _rememberMe_initializers = [];
    var _rememberMe_extraInitializers = [];
    return _a = /** @class */ (function () {
            function LoginDto() {
                this.identifier = __runInitializers(this, _identifier_initializers, void 0);
                this.password = (__runInitializers(this, _identifier_extraInitializers), __runInitializers(this, _password_initializers, void 0));
                this.rememberMe = (__runInitializers(this, _password_extraInitializers), __runInitializers(this, _rememberMe_initializers, void 0));
                __runInitializers(this, _rememberMe_extraInitializers);
            }
            return LoginDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _identifier_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'identifier',
                    description: 'email of the user or username',
                    type: 'string',
                    example: 'carrion@gmail.com',
                }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _password_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'password',
                    description: 'password of the user',
                    type: 'string',
                    example: 'mysecretpassword123',
                }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _rememberMe_decorators = [(0, swagger_1.ApiProperty)({
                    name: 'rememberMe',
                    description: 'remember the user variable',
                    type: 'boolean',
                    example: true,
                }), (0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _identifier_decorators, { kind: "field", name: "identifier", static: false, private: false, access: { has: function (obj) { return "identifier" in obj; }, get: function (obj) { return obj.identifier; }, set: function (obj, value) { obj.identifier = value; } }, metadata: _metadata }, _identifier_initializers, _identifier_extraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: function (obj) { return "password" in obj; }, get: function (obj) { return obj.password; }, set: function (obj, value) { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
            __esDecorate(null, null, _rememberMe_decorators, { kind: "field", name: "rememberMe", static: false, private: false, access: { has: function (obj) { return "rememberMe" in obj; }, get: function (obj) { return obj.rememberMe; }, set: function (obj, value) { obj.rememberMe = value; } }, metadata: _metadata }, _rememberMe_initializers, _rememberMe_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.LoginDto = LoginDto;
