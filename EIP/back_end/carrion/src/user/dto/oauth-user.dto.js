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
exports.OAuthUserDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var user_dto_1 = require("./user.dto");
var OAuthUserDto = function () {
    var _a;
    var _classSuper = user_dto_1.UserDto;
    var _firstName_decorators;
    var _firstName_initializers = [];
    var _firstName_extraInitializers = [];
    var _lastName_decorators;
    var _lastName_initializers = [];
    var _lastName_extraInitializers = [];
    var _username_decorators;
    var _username_initializers = [];
    var _username_extraInitializers = [];
    var _birthDate_decorators;
    var _birthDate_initializers = [];
    var _birthDate_extraInitializers = [];
    var _email_decorators;
    var _email_initializers = [];
    var _email_extraInitializers = [];
    var _password_decorators;
    var _password_initializers = [];
    var _password_extraInitializers = [];
    return _a = /** @class */ (function (_super) {
            __extends(OAuthUserDto, _super);
            function OAuthUserDto() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.firstName = __runInitializers(_this, _firstName_initializers, void 0);
                _this.lastName = (__runInitializers(_this, _firstName_extraInitializers), __runInitializers(_this, _lastName_initializers, void 0));
                _this.username = (__runInitializers(_this, _lastName_extraInitializers), __runInitializers(_this, _username_initializers, void 0));
                _this.birthDate = (__runInitializers(_this, _username_extraInitializers), __runInitializers(_this, _birthDate_initializers, void 0));
                _this.email = (__runInitializers(_this, _birthDate_extraInitializers), __runInitializers(_this, _email_initializers, void 0));
                _this.password = (__runInitializers(_this, _email_extraInitializers), __runInitializers(_this, _password_initializers, void 0));
                __runInitializers(_this, _password_extraInitializers);
                return _this;
            }
            return OAuthUserDto;
        }(_classSuper)),
        (function () {
            var _b;
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _firstName_decorators = [(0, swagger_1.ApiProperty)({
                    description: "The user's first name",
                    example: 'John',
                    type: 'string',
                    required: true,
                })];
            _lastName_decorators = [(0, swagger_1.ApiProperty)({
                    description: "The user's last name",
                    example: 'Doe',
                    type: 'string',
                    required: true,
                })];
            _username_decorators = [(0, swagger_1.ApiProperty)({
                    description: "The user's username",
                    example: 'JohnnyJohnnyDoeDoe',
                    type: 'string',
                    required: true,
                })];
            _birthDate_decorators = [(0, swagger_1.ApiProperty)({
                    description: "The user's birthdate",
                    example: '1990-01-01',
                    type: 'string',
                    required: false,
                })];
            _email_decorators = [(0, swagger_1.ApiProperty)({
                    description: "The user's email",
                    example: 'johndoe@example.com',
                    type: 'string',
                    required: true,
                })];
            _password_decorators = [(0, swagger_1.ApiProperty)({
                    description: "The user's password",
                    example: "password123 (empty because it's oauth",
                    type: 'string',
                    required: true,
                })];
            __esDecorate(null, null, _firstName_decorators, { kind: "field", name: "firstName", static: false, private: false, access: { has: function (obj) { return "firstName" in obj; }, get: function (obj) { return obj.firstName; }, set: function (obj, value) { obj.firstName = value; } }, metadata: _metadata }, _firstName_initializers, _firstName_extraInitializers);
            __esDecorate(null, null, _lastName_decorators, { kind: "field", name: "lastName", static: false, private: false, access: { has: function (obj) { return "lastName" in obj; }, get: function (obj) { return obj.lastName; }, set: function (obj, value) { obj.lastName = value; } }, metadata: _metadata }, _lastName_initializers, _lastName_extraInitializers);
            __esDecorate(null, null, _username_decorators, { kind: "field", name: "username", static: false, private: false, access: { has: function (obj) { return "username" in obj; }, get: function (obj) { return obj.username; }, set: function (obj, value) { obj.username = value; } }, metadata: _metadata }, _username_initializers, _username_extraInitializers);
            __esDecorate(null, null, _birthDate_decorators, { kind: "field", name: "birthDate", static: false, private: false, access: { has: function (obj) { return "birthDate" in obj; }, get: function (obj) { return obj.birthDate; }, set: function (obj, value) { obj.birthDate = value; } }, metadata: _metadata }, _birthDate_initializers, _birthDate_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: function (obj) { return "email" in obj; }, get: function (obj) { return obj.email; }, set: function (obj, value) { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: function (obj) { return "password" in obj; }, get: function (obj) { return obj.password; }, set: function (obj, value) { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.OAuthUserDto = OAuthUserDto;
