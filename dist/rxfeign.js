"use strict";
/**
 * @author Juan David Correa
 */
Object.defineProperty(exports, "__esModule", { value: true });
const rx_http_request_1 = require("@akanass/rx-http-request");
const operators_1 = require("rxjs/operators");
require("reflect-metadata");
/**
 *
 */
const pathParamMetadataKey = Symbol('__pathParam__');
const queryMetadataKey = Symbol('__queryParam__');
const classMetadataKey = Symbol('__class__');
const bodyMetadataKey = Symbol('__body__');
const pathParamPropertyMetadataKey = Symbol('__pathParamProperty__');
const mapperMetadataKey = Symbol('__mapper__');
const headersMetadataKey = Symbol('__headers__');
const beforeMetadataKey = Symbol('__headers__');
const exceptionHandlerMetadataKey = Symbol('__handlerError__');
/**
 *
 */
class Http {
    /**
     *
     * @param {T} interceptor
     */
    static addInterceptor(interceptor) {
        this.interceptors.unshift(new interceptor());
    }
    /**
     *
     * @param {string | Partial<ConfigHttp>} config
     * @returns {(target) => void}
     */
    static client(config) {
        return target => Reflect.defineMetadata(classMetadataKey, config, target);
    }
    /**
     *
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {Function}
     */
    static get(url, statusCodeOk = 400) {
        return this.request('get', url, statusCodeOk);
    }
    /**
     *
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {Function}
     */
    static post(url, statusCodeOk = 400) {
        return this.request('post', url, statusCodeOk);
    }
    /**
     *
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {Function}
     */
    static put(url, statusCodeOk = 400) {
        return this.request('put', url, statusCodeOk);
    }
    /**
     *
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {Function}
     */
    static patch(url, statusCodeOk = 400) {
        return this.request('patch', url, statusCodeOk);
    }
    /**
     *
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {Function}
     */
    static delete(url, statusCodeOk = 400) {
        return this.request('delete', url, statusCodeOk);
    }
    /**
     * @param {string} method
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void}
     */
    static request(method, urlToMatch, statusCodeOk) {
        return (target, propertyKey, descriptor) => {
            descriptor.value = (...arguments_) => {
                const mainConfig = Reflect.getMetadata(classMetadataKey, target.constructor);
                const pathParams = Reflect.getMetadata(pathParamMetadataKey, target, propertyKey) || [];
                const queryParams = Reflect.getMetadata(queryMetadataKey, target, propertyKey) || [];
                const bodyParams = Reflect.getMetadata(bodyMetadataKey, target, propertyKey) || [];
                const mapper = Reflect.getMetadata(mapperMetadataKey, target, propertyKey) || null;
                const especificHeaders = Reflect.getMetadata(headersMetadataKey, target, propertyKey) || null;
                const before = Reflect.getMetadata(beforeMetadataKey, target, propertyKey) || null;
                const exceptionHandler = Reflect.getMetadata(exceptionHandlerMetadataKey, target, propertyKey) || null;
                // Reflect.deleteMetadata(pathParamMetadataKey, target, propertyKey);
                const headers = new Headers();
                let mainUrl = String();
                const argumentsHttp = arguments_;
                let url = String(urlToMatch);
                url = UtilsHttp.buildPathParams(pathParams, argumentsHttp, url);
                const queryParamsUrl = UtilsHttp.buildQueryParams(queryParams, argumentsHttp);
                if (typeof mainConfig === 'object') {
                    mainUrl = mainConfig.url;
                    UtilsHttp.prepareHeaders(mainConfig.headers, headers);
                }
                else
                    mainUrl = mainConfig;
                mainUrl = mainUrl.concat(url).concat(queryParamsUrl === '?' ? '' : queryParamsUrl);
                const body_ = method !== 'get' ? UtilsHttp.prepareBody(bodyParams, argumentsHttp) : String();
                if (especificHeaders)
                    Object.keys(especificHeaders)
                        .forEach(i => headers.set(i, especificHeaders[i]));
                let request = {
                    url: mainUrl,
                    body: body_,
                    headers: headers.getHeaders(),
                    method: method,
                };
                request = before ? before(request) : request;
                this.interceptors.forEach(i => request = i.intercep(request));
                return rx_http_request_1.RxHR[method](request.url, {
                    headers: request.headers,
                    body: request.body,
                    qsStringifyOptions: {
                        arrayFormat: 'repeat',
                    },
                })
                    .pipe(operators_1.map(value => this.mapBodyAndControlError(value, exceptionHandler, statusCodeOk)), operators_1.map(body => mapper ? mapper(body) : body));
            };
        };
    }
    /**
     *
     * @param value
     * @param {Handler} exceptionHandler
     * @param statusCodeOk
     * @returns {any}
     */
    static mapBodyAndControlError(value, exceptionHandler, statusCodeOk) {
        const { body, statusCode, request } = value.response;
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
    }
    /**
     *
     * @param {string} param
     * @returns {Function}
     */
    static pathParam(param) {
        return (target, propertyKey, parameterIndex) => {
            const pathParams = Reflect.getOwnMetadata(pathParamMetadataKey, target, propertyKey) || [];
            pathParams.unshift({
                indexArgument: parameterIndex,
                paramValue: param,
            });
            Reflect.defineMetadata(pathParamMetadataKey, pathParams, target, propertyKey);
        };
    }
    /**
     *
     * @param {string} param_
     * @returns {Function}
     */
    static query(param_) {
        return (target, propertyKey, parameterIndex) => {
            const queryParams = Reflect.getOwnMetadata(queryMetadataKey, target, propertyKey) || [];
            queryParams.unshift({
                indexArgument: parameterIndex,
                paramValue: param_,
            });
            Reflect.defineMetadata(queryMetadataKey, queryParams, target, propertyKey);
        };
    }
    /**
     *
     * @param {Object} target
     * @param {string | symbol} propertyKey
     * @param {number} parameterIndex
     */
    static body(target, propertyKey, parameterIndex) {
        const bodyParams = Reflect.getOwnMetadata(bodyMetadataKey, target, propertyKey) || [];
        bodyParams.unshift(parameterIndex);
        Reflect.defineMetadata(bodyMetadataKey, bodyParams, target, propertyKey);
    }
    /**
     *
     * @param {boolean} enable
     * @returns {Function}
     */
    static pathParamProperty(enable = true) {
        return (target, propertyName) => Reflect.defineMetadata(pathParamPropertyMetadataKey, { name: propertyName }, target, propertyName);
    }
    /**
     *
     * @param {Function} mapper
     * @returns {Function}
     */
    static mapper(mapper) {
        return (target, propertyKey) => Reflect.defineMetadata(mapperMetadataKey, mapper, target, propertyKey);
    }
    /**
     *
     * @param {{[p: string]: T}} headers
     * @returns {Function}
     */
    static headers(headers) {
        return (target, propertyKey) => Reflect.defineMetadata(headersMetadataKey, headers, target, propertyKey);
    }
    /**
     *
     * @param {(request: Request_) => Request_} before_
     * @returns {(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void}
     */
    static before(before_) {
        return (target, propertyKey) => Reflect.defineMetadata(beforeMetadataKey, before_, target, propertyKey);
    }
    /**
     *
     * @param {Handler} handler
     * @returns {(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void}
     */
    static handlerError(handler) {
        return (target, propertyKey) => Reflect.defineMetadata(exceptionHandlerMetadataKey, handler, target, propertyKey);
    }
}
Http.interceptors = [];
exports.Http = Http;
/**
 *
 */
class UtilsHttp {
    /**
     *
     * @param obj
     * @param {Headers} headers
     */
    static prepareHeaders(obj = {}, headers) {
        Object.keys(obj).forEach(key => !headers.has(obj[key]) ? headers.set(key, obj[key]) : null);
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }
    }
    /**
     *
     * @param {Param[]} params
     * @param argumentsHttp
     * @returns {string}
     */
    static buildQueryParams(params, argumentsHttp) {
        let queryParamsUrl = '?';
        const ampersan = '&';
        const empty = String();
        params = params
            .filter(param => argumentsHttp[param.indexArgument]);
        params
            .forEach((param, index) => {
            if (typeof argumentsHttp[param.indexArgument] === 'object') {
                const keys = Object.keys(argumentsHttp[param.indexArgument]) || [];
                let tempCont = 0;
                for (const key in argumentsHttp[param.indexArgument]) {
                    queryParamsUrl = queryParamsUrl.concat(`${key}=${argumentsHttp[param.indexArgument][key]}${tempCont === keys.length - 1 ? empty : ampersan}`);
                    tempCont++;
                }
            }
            else {
                if (!param.paramValue)
                    return;
                queryParamsUrl = queryParamsUrl.length > 1 ? queryParamsUrl.concat(ampersan) : queryParamsUrl;
                queryParamsUrl = queryParamsUrl.concat(`${param.paramValue}=${argumentsHttp[param.indexArgument]}${index === params.length - 1 ? empty : ampersan}`);
            }
        });
        return queryParamsUrl;
    }
    /**
     *
     * @param {Param[]} pathParam
     * @param argumentsHttp
     * @param {string} url
     * @returns {string}
     */
    static buildPathParams(pathParam, argumentsHttp, url) {
        url = url.replace(/\s/g, '').trim();
        const wrapOpen = '{';
        const wrapClose = '}';
        pathParam
            .filter(param => param.paramValue)
            .forEach(param => {
            if (!param.paramValue)
                return;
            const pathParam = wrapOpen.concat(param.paramValue.toString()).concat(wrapClose);
            if (url.includes(pathParam))
                url = url.replace(pathParam, argumentsHttp[param.indexArgument]);
        });
        pathParam
            .filter(param => !param.paramValue)
            .map(param => url += `/${argumentsHttp[param.indexArgument]}`);
        argumentsHttp
            .filter(arg => arg && typeof arg === 'object')
            .forEach(obj => Object.keys(obj).forEach(key => {
            const keyPathParam = Reflect.getMetadata(pathParamPropertyMetadataKey, obj, key);
            if (keyPathParam)
                url = url.replace(`{${keyPathParam.name}}`, obj[keyPathParam.name]);
        }));
        return url;
    }
    /**
     *
     * @param {number[]} params
     * @param argumentsHttp
     * @returns {any}
     */
    static prepareBody(params, argumentsHttp) {
        let body = {};
        params.forEach(i => body = Object.assign({}, body, argumentsHttp[i]));
        return params.length ? JSON.stringify(body) : String();
    }
}
/**
 *
 */
class HttpRequestException {
    constructor(error, statusCode, message) {
        this.error = error;
        this.statusCode = statusCode;
        this.message = message;
    }
}
exports.HttpRequestException = HttpRequestException;
/**
 *
 */
class Headers {
    constructor() {
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
    has(key) {
        return this.headers.has(key);
    }
    /**
     *
     * @param {string} key
     * @param header
     * @returns {this}
     */
    set(key, header) {
        this.headers.set(key, header);
        return this;
    }
    /**
     *
     * @returns {any}
     */
    getHeaders() {
        const headers = Object();
        Array.from(this.headers.keys())
            .forEach(key => headers[key] = this.headers.get(key));
        return headers;
    }
}
