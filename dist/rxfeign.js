"use strict";
/**
 * @author Juan David Correa
 */
Object.defineProperty(exports, "__esModule", { value: true });
const operators_1 = require("rxjs/operators");
require("reflect-metadata");
const axios_1 = require("axios");
const rxjs_1 = require("rxjs");
const utils_1 = require("./utils");
const types_1 = require("./types");
const constans_1 = require("./constans");
/**
 *
 */
exports.interceptors = [];
/**
 *
 * @param {T} interceptor
 */
exports.addInterceptors = (...interceptor) => interceptor.forEach(i => exports.interceptors.unshift(i));
/**
 *
 * @param {string | Partial<ConfigHttp>} config
 * @returns {(target) => void}
 */
exports.Client = (config) => target => Reflect.defineMetadata(constans_1.classMetadataKey, config, target);
/**
 *
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {Function}
 */
exports.Get = (url, statusCodeOk = 400) => request('get', url, statusCodeOk);
/**
 *
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {Function}
 */
exports.Post = (url, statusCodeOk = 400) => request('post', url, statusCodeOk);
/**
 *
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {Function}
 */
exports.Put = (url, statusCodeOk = 400) => request('put', url, statusCodeOk);
/**
 *
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {Function}
 */
exports.Patch = (url, statusCodeOk = 400) => request('patch', url, statusCodeOk);
/**
 *
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {Function}
 */
exports.Delete = (url, statusCodeOk = 400) => request('delete', url, statusCodeOk);
/**
 * @param {string} method
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void}
 */
function request(method, urlToMatch = '', statusCodeOk) {
    return (target, propertyKey, descriptor) => {
        descriptor.value = (...argumentsHttp) => {
            let classConfiguration = Reflect.getMetadata(constans_1.classMetadataKey, target.constructor);
            const pathParams = Reflect.getMetadata(constans_1.pathParamMetadataKey, target, propertyKey) || [];
            const queryParams = Reflect.getMetadata(constans_1.queryMetadataKey, target, propertyKey) || [];
            const bodyParams = Reflect.getMetadata(constans_1.bodyMetadataKey, target, propertyKey) || [];
            const mapper = Reflect.getMetadata(constans_1.mapperMetadataKey, target, propertyKey) || null;
            const headersParams = Reflect.getMetadata(constans_1.headersMetadataKey, target, propertyKey) || [];
            const before = Reflect.getMetadata(constans_1.beforeMetadataKey, target, propertyKey) || null;
            const exceptionHandler = Reflect.getMetadata(constans_1.exceptionHandlerMetadataKey, target, propertyKey) || null;
            const configMethod = Reflect.getMetadata(constans_1.configMetadataKey, target, propertyKey) || Object();
            if (urlToMatch.charAt(0) == '/')
                urlToMatch = urlToMatch.substr(1, urlToMatch.length);
            let mainUrl = typeof classConfiguration === 'object' ? classConfiguration.url : classConfiguration;
            let url = String(urlToMatch);
            url = utils_1.UtilsHttp.preparePathParams(pathParams, argumentsHttp, url);
            const queryParamsUrl = utils_1.UtilsHttp.prepareQueryParams(queryParams, argumentsHttp);
            if (mainUrl.charAt(mainUrl.length - 1) !== '/')
                mainUrl = mainUrl.concat('/');
            mainUrl = mainUrl.concat(url).concat(queryParamsUrl === '?' ? '' : queryParamsUrl);
            const body_ = utils_1.UtilsHttp.prepareBody(bodyParams, argumentsHttp);
            const headers = Object.assign(Object.assign({}, utils_1.UtilsHttp.prepareHeaders(headersParams, argumentsHttp)), (typeof classConfiguration === 'object' ? (classConfiguration.headers || {}) : {}));
            let request = {
                url: mainUrl,
                body: body_,
                headers,
                method: method,
            };
            request = before ? target[before](request) : request;
            exports.interceptors.forEach(i => request = i.intercep(request));
            return rxjs_1.from(axios_1.default.request(Object.assign(Object.assign(Object.assign({}, (typeof classConfiguration === 'object' ? classConfiguration : Object())), configMethod), { method: request.method, data: request.body, headers: request.headers, url: request.url })))
                .pipe(operators_1.map(({ data }) => mapper ? target[mapper](data) : data), operators_1.catchError(Error => mapError(Error, target[exceptionHandler], statusCodeOk)));
        };
    };
}
/**
 *
 * @param value
 * @param {FeignHandler} exceptionHandler
 * @param statusCodeOk
 * @returns {any}
 */
function mapError(error, exceptionHandler, statusCodeOk) {
    return rxjs_1.throwError(exceptionHandler ? exceptionHandler(error) : new types_1.FeignRequestException(error));
}
/**
 *
 * @param {string} param
 * @returns {Function}
 */
exports.PathParam = (param) => (target, propertyKey, index_param) => {
    const pathParams = Reflect.getOwnMetadata(constans_1.pathParamMetadataKey, target, propertyKey) || [];
    pathParams.unshift({ index_param, key: param });
    Reflect.defineMetadata(constans_1.pathParamMetadataKey, pathParams, target, propertyKey);
};
/**
 *
 * @param {FeignConfigClient} config
 * @returns {(target: Object, propertyKey: (string | symbol)) => void}
 * @constructor
 */
exports.Config = (config) => (target, propertyKey) => Reflect.defineMetadata(constans_1.configMetadataKey, config, target, propertyKey);
/**
 *
 * @param {string} param_
 * @returns {Function}
 */
exports.Query = (param_) => (target, propertyKey, index_param) => {
    const queryParams = Reflect.getOwnMetadata(constans_1.queryMetadataKey, target, propertyKey) || [];
    queryParams.unshift({ index_param, key: param_, });
    Reflect.defineMetadata(constans_1.queryMetadataKey, queryParams, target, propertyKey);
};
/**
 *
 * @param key
 */
exports.Body = (key = undefined) => (target, propertyKey, index_param) => {
    const bodyParams = Reflect.getOwnMetadata(constans_1.bodyMetadataKey, target, propertyKey) || [];
    bodyParams.unshift({ index_param, key });
    Reflect.defineMetadata(constans_1.bodyMetadataKey, bodyParams, target, propertyKey);
};
/**
 *
 * @returns {(target, propertyName) => void}
 * @constructor
 */
exports.PathParamProperty = () => (target, propertyName) => Reflect.defineMetadata(constans_1.pathParamPropertyMetadataKey, { name: propertyName }, target, propertyName);
/**
 *
 * @param {Function} mapper
 * @returns {(target: Object, propertyKey: (string | symbol)) => void}
 * @constructor
 */
exports.Mapper = (mapper) => (target, propertyKey) => Reflect.defineMetadata(constans_1.mapperMetadataKey, mapper, target, propertyKey);
/**
 *
 * @returns {(target: Object, propertyKey: string) => void}
 * @constructor
 * @param key
 */
exports.Header = (key = undefined) => (target, propertyKey, index_param) => {
    const headers = Reflect.getOwnMetadata(constans_1.headersMetadataKey, target, propertyKey) || [];
    headers.unshift({ index_param, key });
    Reflect.defineMetadata(constans_1.headersMetadataKey, headers, target, propertyKey);
};
/**
 *
 * @param {(request: Request_) => Request_} before_
 * @returns {(target: Object, propertyKey: string) => void}
 * @constructor
 */
exports.Before = (before_) => (target, propertyKey) => Reflect.defineMetadata(constans_1.beforeMetadataKey, before_, target, propertyKey);
/**
 *
 * @param {FeignHandler} handler
 * @returns {(target: Object, propertyKey: string) => void}
 * @constructor
 */
exports.HandlerError = (handler) => (target, propertyKey) => Reflect.defineMetadata(constans_1.exceptionHandlerMetadataKey, handler, target, propertyKey);
