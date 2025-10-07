"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.CustomLoggingService = exports.LogCategory = void 0;
var common_1 = require("@nestjs/common");
var LogCategory;
(function (LogCategory) {
    LogCategory["WEBHOOK"] = "WEBHOOK";
    LogCategory["AUTH"] = "AUTH";
    LogCategory["MAILFILTER"] = "MAILFILTER";
    LogCategory["DATABASE"] = "DATABASE";
    LogCategory["API"] = "API";
    LogCategory["SECURITY"] = "SECURITY";
    LogCategory["PERFORMANCE"] = "PERFORMANCE";
    LogCategory["CRON"] = "CRON";
})(LogCategory || (exports.LogCategory = LogCategory = {}));
var CustomLoggingService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var CustomLoggingService = _classThis = /** @class */ (function () {
        function CustomLoggingService_1() {
            this.isDevelopment = process.env.NODE_ENV !== 'production';
        }
        CustomLoggingService_1.prototype.log = function (message, category, context) {
            this.writeLog('log', message, category, context);
        };
        CustomLoggingService_1.prototype.error = function (message, trace, category, context) {
            this.writeLog('error', message, category, context, trace);
        };
        CustomLoggingService_1.prototype.warn = function (message, category, context) {
            this.writeLog('warn', message, category, context);
        };
        CustomLoggingService_1.prototype.debug = function (message, category, context) {
            if (this.isDevelopment) {
                this.writeLog('debug', message, category, context);
            }
        };
        CustomLoggingService_1.prototype.verbose = function (message, category, context) {
            if (this.isDevelopment) {
                this.writeLog('verbose', message, category, context);
            }
        };
        CustomLoggingService_1.prototype.writeLog = function (level, message, category, context, trace) {
            var timestamp = new Date().toISOString();
            var categoryStr = category ? "[".concat(category, "]") : '';
            var contextStr = context ? "Context: ".concat(JSON.stringify(context)) : '';
            var logEntry = __assign({ timestamp: timestamp, level: level.toUpperCase(), category: category, message: message, context: context }, (trace && { trace: trace }));
            if (this.isDevelopment) {
                // Colored console output for development
                var colorCode = this.getColorCode(level);
                console.log("\u001B[".concat(colorCode, "m[").concat(timestamp, "] [").concat(level.toUpperCase(), "]").concat(categoryStr, " ").concat(message, "\u001B[0m"), contextStr ? "\n".concat(contextStr) : '', trace ? "\n".concat(trace) : '');
            }
            else {
                // Structured JSON for production
                console.log(JSON.stringify(logEntry));
            }
        };
        CustomLoggingService_1.prototype.getColorCode = function (level) {
            switch (level) {
                case 'error':
                    return 31; // Red
                case 'warn':
                    return 33; // Yellow
                case 'log':
                    return 32; // Green
                case 'debug':
                    return 36; // Cyan
                case 'verbose':
                    return 35; // Magenta
                default:
                    return 37; // White
            }
        };
        // Specialized methods for different contexts
        CustomLoggingService_1.prototype.logWebhookEvent = function (event, data, context) {
            this.log("Webhook event: ".concat(event), LogCategory.WEBHOOK, __assign(__assign({}, context), { eventData: data }));
        };
        CustomLoggingService_1.prototype.logEmailProcessing = function (action, emailData, context) {
            this.log("Email processing: ".concat(action), LogCategory.MAILFILTER, __assign(__assign({}, context), emailData));
        };
        CustomLoggingService_1.prototype.logAuthEvent = function (event, userId, context) {
            this.log("Auth event: ".concat(event), LogCategory.AUTH, __assign(__assign({}, context), { userId: userId }));
        };
        CustomLoggingService_1.prototype.logPerformance = function (operation, duration, context) {
            this.log("Performance: ".concat(operation, " completed in ").concat(duration, "ms"), LogCategory.PERFORMANCE, __assign(__assign({}, context), { duration: duration, operation: operation }));
        };
        CustomLoggingService_1.prototype.logSecurityEvent = function (event, severity, context) {
            var message = "Security event [".concat(severity, "]: ").concat(event);
            if (severity === 'CRITICAL' || severity === 'HIGH') {
                this.error(message, undefined, LogCategory.SECURITY, context);
            }
            else {
                this.warn(message, LogCategory.SECURITY, context);
            }
        };
        return CustomLoggingService_1;
    }());
    __setFunctionName(_classThis, "CustomLoggingService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CustomLoggingService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CustomLoggingService = _classThis;
}();
exports.CustomLoggingService = CustomLoggingService;
