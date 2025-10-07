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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutlookModule = void 0;
var common_1 = require("@nestjs/common");
var axios_1 = require("@nestjs/axios");
var outlook_controller_1 = require("./outlook.controller");
var outlook_service_1 = require("./outlook.service");
var auth_module_1 = require("../../auth/auth.module");
var config_1 = require("@nestjs/config");
var microsoft_oauth_config_1 = require("../../auth/config/microsoft-oauth.config");
var refresh_jwt_config_1 = require("../../auth/config/refresh-jwt.config");
var prisma_module_1 = require("../../prisma/prisma.module");
var user_module_1 = require("../../user/user.module");
var mailFilter_module_1 = require("../../services/mailFilter/mailFilter.module");
var microsoft_strategy_1 = require("../../auth/strategies/microsoft.strategy");
var mailFilter_service_1 = require("../../services/mailFilter/mailFilter.service");
var logging_service_1 = require("../../common/services/logging.service");
var user_service_1 = require("../../user/user.service");
var auth_service_1 = require("../../auth/auth.service");
var jwt_1 = require("@nestjs/jwt");
var s3_module_1 = require("../../aws/s3.module");
var OutlookModule = function () {
    var _classDecorators = [(0, common_1.Module)({
            imports: [
                axios_1.HttpModule,
                jwt_1.JwtModule,
                auth_module_1.AuthModule,
                config_1.ConfigModule.forFeature(microsoft_oauth_config_1.default),
                config_1.ConfigModule.forFeature(refresh_jwt_config_1.default),
                prisma_module_1.PrismaModule,
                user_module_1.UserModule,
                mailFilter_module_1.MailFilterModule,
                s3_module_1.S3Module,
            ],
            controllers: [outlook_controller_1.OutlookController],
            providers: [
                outlook_service_1.OutlookService,
                logging_service_1.CustomLoggingService,
                mailFilter_service_1.MailFilterService,
                user_service_1.UserService,
                auth_service_1.AuthService,
                microsoft_strategy_1.MicrosoftStrategy,
            ],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var OutlookModule = _classThis = /** @class */ (function () {
        function OutlookModule_1() {
        }
        return OutlookModule_1;
    }());
    __setFunctionName(_classThis, "OutlookModule");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OutlookModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OutlookModule = _classThis;
}();
exports.OutlookModule = OutlookModule;
