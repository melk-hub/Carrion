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
exports.GlobalExceptionFilter = void 0;
var common_1 = require("@nestjs/common");
var library_1 = require("@prisma/client/runtime/library");
var GlobalExceptionFilter = function () {
    var _classDecorators = [(0, common_1.Catch)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var GlobalExceptionFilter = _classThis = /** @class */ (function () {
        function GlobalExceptionFilter_1() {
            this.logger = new common_1.Logger(GlobalExceptionFilter.name);
        }
        GlobalExceptionFilter_1.prototype.catch = function (exception, host) {
            var ctx = host.switchToHttp();
            var response = ctx.getResponse();
            var request = ctx.getRequest();
            var status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            var message = 'Internal server error';
            var error = 'Internal Server Error';
            // Log the full error for debugging
            this.logger.error("Exception caught: ".concat(JSON.stringify({
                url: request.url,
                method: request.method,
                body: request.body,
                params: request.params,
                query: request.query,
                exception: exception instanceof Error ? exception.message : exception,
                stack: exception instanceof Error ? exception.stack : undefined,
            })));
            if (exception instanceof common_1.HttpException) {
                // Handle NestJS HTTP exceptions
                status = exception.getStatus();
                var responseBody = exception.getResponse();
                if (typeof responseBody === 'string') {
                    message = responseBody;
                }
                else if (typeof responseBody === 'object' && responseBody !== null) {
                    message = responseBody.message || message;
                    error = responseBody.error || error;
                }
            }
            else if (exception instanceof library_1.PrismaClientKnownRequestError) {
                // Handle Prisma specific errors
                status = common_1.HttpStatus.BAD_REQUEST;
                error = 'Database Error';
                switch (exception.code) {
                    case 'P2002':
                        message = 'A unique constraint violation occurred';
                        break;
                    case 'P2025':
                        message = 'Record not found';
                        status = common_1.HttpStatus.NOT_FOUND;
                        break;
                    case 'P2003':
                        message = 'Foreign key constraint violation';
                        break;
                    case 'P2014':
                        message = 'Invalid relation data provided';
                        break;
                    default:
                        message = 'Database operation failed';
                }
            }
            else if (exception instanceof Error) {
                // Handle generic errors
                message = exception.message;
                error = exception.name;
                // Check for specific error patterns
                if (message.includes('not found')) {
                    status = common_1.HttpStatus.NOT_FOUND;
                    error = 'Not Found';
                }
                else if (message.includes('already exists')) {
                    status = common_1.HttpStatus.CONFLICT;
                    error = 'Conflict';
                }
                else if (message.includes('validation')) {
                    status = common_1.HttpStatus.BAD_REQUEST;
                    error = 'Validation Error';
                }
            }
            // Ensure we don't expose sensitive information in production
            if (process.env.NODE_ENV === 'production' &&
                status === common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
                message = 'Internal server error';
            }
            response.status(status).json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
                error: error,
                message: message,
            });
        };
        return GlobalExceptionFilter_1;
    }());
    __setFunctionName(_classThis, "GlobalExceptionFilter");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        GlobalExceptionFilter = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return GlobalExceptionFilter = _classThis;
}();
exports.GlobalExceptionFilter = GlobalExceptionFilter;
