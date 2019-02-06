"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var rx_http_request_1 = require("@akanass/rx-http-request");
var operators_1 = require("rxjs/operators");
/**
 *
 */
var pathParamMetadataKey = Symbol('__pathParam__');
var queryMetadataKey = Symbol('__queryParam__');
var classMetadataKey = Symbol('__class__');
var bodyMetadataKey = Symbol('__body__');
var pathParamPropertyMetadataKey = Symbol('__pathParamProperty__');
var mapperMetadataKey = Symbol('__mapper__');
var headersMetadataKey = Symbol('__headers__');
var beforeMetadataKey = Symbol('__headers__');
var exceptionHandlerMetadataKey = Symbol('__handlerError__');
/**
 *
 */
var Http = /** @class */ (function () {
    function Http() {
    }
    /**
     *
     * @param {T} interceptor
     */
    Http.addInterceptor = function (interceptor) {
        this.interceptors.unshift(new interceptor());
    };
    /**
     *
     * @param {string | Partial<ConfigHttp>} config
     * @returns {(target) => void}
     */
    Http.client = function (config) {
        return function (target) { return Reflect.defineMetadata(classMetadataKey, config, target); };
    };
    /**
     *
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {Function}
     */
    Http.get = function (url, component, statusCodeOk) {
        if (statusCodeOk === void 0) { statusCodeOk = 400; }
        return this.request('get', url, component, statusCodeOk);
    };
    /**
     *
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {Function}
     */
    Http.post = function (url, component, statusCodeOk) {
        if (statusCodeOk === void 0) { statusCodeOk = 400; }
        return this.request('post', url, component, statusCodeOk);
    };
    /**
     *
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {Function}
     */
    Http.put = function (url, component, statusCodeOk) {
        if (statusCodeOk === void 0) { statusCodeOk = 400; }
        return this.request('put', url, component, statusCodeOk);
    };
    /**
     *
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {Function}
     */
    Http.patch = function (url, component, statusCodeOk) {
        if (statusCodeOk === void 0) { statusCodeOk = 400; }
        return this.request('patch', url, component, statusCodeOk);
    };
    /**
     *
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {Function}
     */
    Http.delete = function (url, component, statusCodeOk) {
        if (statusCodeOk === void 0) { statusCodeOk = 400; }
        return this.request('delete', url, component, statusCodeOk);
    };
    /**
     * @param {string} method
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void}
     */
    Http.request = function (method, urlToMatch, component, statusCodeOk) {
        var _this = this;
        return function (target, propertyKey, descriptor) {
            descriptor.value = function () {
                var arguments_ = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    arguments_[_i] = arguments[_i];
                }
                var mainConfig = Reflect.getMetadata(classMetadataKey, component);
                var pathParams = Reflect.getMetadata(pathParamMetadataKey, target, propertyKey) || [];
                var queryParams = Reflect.getMetadata(queryMetadataKey, target, propertyKey) || [];
                var bodyParams = Reflect.getMetadata(bodyMetadataKey, target, propertyKey) || [];
                var mapper = Reflect.getMetadata(mapperMetadataKey, target, propertyKey) || null;
                var especificHeaders = Reflect.getMetadata(headersMetadataKey, target, propertyKey) || null;
                var before = Reflect.getMetadata(beforeMetadataKey, target, propertyKey) || null;
                var exceptionHandler = Reflect.getMetadata(exceptionHandlerMetadataKey, target, propertyKey) || null;
                // Reflect.deleteMetadata(pathParamMetadataKey, target, propertyKey);
                var headers = new Headers();
                var mainUrl = String();
                var argumentsHttp = arguments_;
                var url = String(urlToMatch);
                url = UtilsHttp.buildPathParams(pathParams, argumentsHttp, url);
                var queryParamsUrl = UtilsHttp.buildQueryParams(queryParams, argumentsHttp);
                if (typeof mainConfig === 'object') {
                    mainUrl = mainConfig.url;
                    UtilsHttp.prepareHeaders(mainConfig.headers, headers);
                }
                else
                    mainUrl = mainConfig;
                mainUrl = mainUrl.concat(url).concat(queryParamsUrl === '?' ? '' : queryParamsUrl);
                var body_ = method !== 'get' ? UtilsHttp.prepareBody(bodyParams, argumentsHttp) : null;
                if (especificHeaders)
                    Object.keys(especificHeaders)
                        .forEach(function (i) { return headers.set(i, especificHeaders[i]); });
                var request = {
                    url: mainUrl,
                    body: body_,
                    headers: headers.getHeaders(),
                    method: method,
                };
                request = before ? before(request) : request;
                _this.interceptors.forEach(function (i) { return request = i.intercep(request); });
                return rx_http_request_1.RxHR[method](request.url, {
                    headers: request.headers,
                    body: request.body,
                    qsStringifyOptions: {
                        arrayFormat: 'repeat',
                    },
                })
                    .pipe(operators_1.map(function (value) { return _this.mapBodyAndControlError(value, exceptionHandler, statusCodeOk); }), operators_1.map(function (body) { return mapper ? mapper(body) : body; }));
            };
        };
    };
    /**
     *
     * @param value
     * @param {Handler} exceptionHandler
     * @param statusCodeOk
     * @returns {any}
     */
    Http.mapBodyAndControlError = function (value, exceptionHandler, statusCodeOk) {
        var _a = value.response, body = _a.body, statusCode = _a.statusCode, request = _a.request;
        if (statusCode < statusCodeOk) {
            return body ? JSON.parse(body) : body;
        }
        else if (exceptionHandler) {
            throw exceptionHandler(body, statusCode, request);
        }
        else {
            if (body && body.message && body.error) {
                throw new HttpRequestException(body.error, statusCode, body.message);
            }
            else {
                throw new HttpRequestException(JSON.stringify(body), statusCode, String());
            }
        }
    };
    /**
     *
     * @param {string} param
     * @returns {Function}
     */
    Http.pathParam = function (param) {
        return function (target, propertyKey, parameterIndex) {
            var pathParams = Reflect.getOwnMetadata(pathParamMetadataKey, target, propertyKey) || [];
            pathParams.unshift({
                indexArgument: parameterIndex,
                paramValue: param,
            });
            Reflect.defineMetadata(pathParamMetadataKey, pathParams, target, propertyKey);
        };
    };
    /**
     *
     * @param {string} param_
     * @returns {Function}
     */
    Http.query = function (param_) {
        return function (target, propertyKey, parameterIndex) {
            var queryParams = Reflect.getOwnMetadata(queryMetadataKey, target, propertyKey) || [];
            queryParams.unshift({
                indexArgument: parameterIndex,
                paramValue: param_,
            });
            Reflect.defineMetadata(queryMetadataKey, queryParams, target, propertyKey);
        };
    };
    /**
     *
     * @param {Object} target
     * @param {string | symbol} propertyKey
     * @param {number} parameterIndex
     */
    Http.body = function (target, propertyKey, parameterIndex) {
        var bodyParams = Reflect.getOwnMetadata(bodyMetadataKey, target, propertyKey) || [];
        bodyParams.unshift(parameterIndex);
        Reflect.defineMetadata(bodyMetadataKey, bodyParams, target, propertyKey);
    };
    /**
     *
     * @param {boolean} enable
     * @returns {Function}
     */
    Http.pathParamProperty = function (enable) {
        if (enable === void 0) { enable = true; }
        return function (target, propertyName) {
            return Reflect.defineMetadata(pathParamPropertyMetadataKey, { name: propertyName }, target, propertyName);
        };
    };
    /**
     *
     * @param {Function} mapper
     * @returns {Function}
     */
    Http.mapper = function (mapper) {
        return function (target, propertyKey) {
            return Reflect.defineMetadata(mapperMetadataKey, mapper, target, propertyKey);
        };
    };
    /**
     *
     * @param {{[p: string]: T}} headers
     * @returns {Function}
     */
    Http.headers = function (headers) {
        return function (target, propertyKey) {
            return Reflect.defineMetadata(headersMetadataKey, headers, target, propertyKey);
        };
    };
    /**
     *
     * @param {(request: Request_) => Request_} before_
     * @returns {(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void}
     */
    Http.before = function (before_) {
        return function (target, propertyKey) {
            return Reflect.defineMetadata(beforeMetadataKey, before_, target, propertyKey);
        };
    };
    /**
     *
     * @param {Handler} handler
     * @returns {(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void}
     */
    Http.handlerError = function (handler) {
        return function (target, propertyKey) {
            return Reflect.defineMetadata(exceptionHandlerMetadataKey, handler, target, propertyKey);
        };
    };
    Http.interceptors = [];
    return Http;
}());
exports.Http = Http;
/**
 *
 */
var UtilsHttp = /** @class */ (function () {
    function UtilsHttp() {
    }
    /**
     *
     * @param obj
     * @param {Headers} headers
     */
    UtilsHttp.prepareHeaders = function (obj, headers) {
        Object.keys(obj).forEach(function (key) {
            return !headers.has(obj[key]) ? headers.set(key, obj[key]) : null;
        });
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }
    };
    /**
     *
     * @param {Param[]} params
     * @param argumentsHttp
     * @returns {string}
     */
    UtilsHttp.buildQueryParams = function (params, argumentsHttp) {
        var queryParamsUrl = '?';
        var ampersan = '&';
        var empty = String();
        params = params
            .filter(function (param) { return argumentsHttp[param.indexArgument]; });
        params
            .forEach(function (param, index) {
            if (typeof argumentsHttp[param.indexArgument] === 'object') {
                var keys = Object.keys(argumentsHttp[param.indexArgument]) || [];
                var tempCont = 0;
                for (var key in argumentsHttp[param.indexArgument]) {
                    queryParamsUrl = queryParamsUrl.concat(key + "=" + argumentsHttp[param.indexArgument][key] + (tempCont === keys.length - 1 ? empty : ampersan));
                    tempCont++;
                }
            }
            else {
                if (!param.paramValue)
                    return;
                queryParamsUrl = queryParamsUrl.length > 1 ? queryParamsUrl.concat(ampersan) : queryParamsUrl;
                queryParamsUrl = queryParamsUrl.concat(param.paramValue + "=" + argumentsHttp[param.indexArgument] + (index === params.length - 1 ? empty : ampersan));
            }
        });
        return queryParamsUrl;
    };
    /**
     *
     * @param {Param[]} pathParam
     * @param argumentsHttp
     * @param {string} url
     * @returns {string}
     */
    UtilsHttp.buildPathParams = function (pathParam, argumentsHttp, url) {
        url = url.replace(/\s/g, '').trim();
        var wrapOpen = '¿';
        var wrapClose = '?';
        pathParam
            .filter(function (param) { return param.paramValue; })
            .forEach(function (param) {
            if (!param.paramValue)
                return;
            var pathParam = wrapOpen.concat(param.paramValue.toString()).concat(wrapClose);
            if (url.includes(pathParam))
                url = url.replace(pathParam, argumentsHttp[param.indexArgument]);
        });
        pathParam
            .filter(function (param) { return !param.paramValue; })
            .map(function (param) { return url += "/" + argumentsHttp[param.indexArgument]; });
        argumentsHttp
            .filter(function (arg) { return typeof arg === 'object'; })
            .forEach(function (obj) {
            Object.keys(obj).forEach(function (key) {
                var keyPathParam = Reflect.getMetadata(pathParamPropertyMetadataKey, obj, key);
                if (keyPathParam)
                    url = url.replace("\u00BF" + keyPathParam.name + "?", obj[keyPathParam.name]);
            });
        });
        return url;
    };
    /**
     *
     * @param {number[]} params
     * @param argumentsHttp
     * @returns {any}
     */
    UtilsHttp.prepareBody = function (params, argumentsHttp) {
        var body = {};
        params.forEach(function (i) { return body = Object.assign({}, body, argumentsHttp[i]); });
        return params.length ? JSON.stringify(body) : String();
    };
    return UtilsHttp;
}());
/**
 *
 */
var HttpRequestException = /** @class */ (function () {
    function HttpRequestException(error, statusCode, message) {
        this.error = error;
        this.statusCode = statusCode;
        this.message = message;
    }
    return HttpRequestException;
}());
exports.HttpRequestException = HttpRequestException;
/**
 *
 */
var Headers = /** @class */ (function () {
    function Headers() {
        /**
         *
         * @type {Map<any, any>}
         */
        this.headers = new Map();
    }
    /**
     *
     * @param {string} key
     * @returns {boolean}
     */
    Headers.prototype.has = function (key) {
        return this.headers.has(key);
    };
    /**
     *
     * @param {string} key
     * @param header
     * @returns {this}
     */
    Headers.prototype.set = function (key, header) {
        this.headers.set(key, header);
        return this;
    };
    /**
     *
     * @returns {any}
     */
    Headers.prototype.getHeaders = function () {
        var _this = this;
        var headers = Object();
        Array.from(this.headers.keys())
            .forEach(function (key) { return headers[key] = _this.headers.get(key); });
        return headers;
    };
    return Headers;
}());
