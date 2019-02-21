"use strict";
/**
 * @author Juan David Correa
 */
Object.defineProperty(exports, "__esModule", { value: true });
const operators_1 = require("rxjs/operators");
require("reflect-metadata");
const axios_1 = require("axios");
const rxjs_1 = require("rxjs");
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
const configMetadataKey = Symbol('__config__');
/**
 *
 */
exports.interceptors = [];
/**
 *
 * @param {T} interceptor
 */
exports.addInterceptors = (...interceptor) => interceptor.forEach(i => exports.interceptors.unshift(new i()));
/**
 *
 * @param {string | Partial<ConfigHttp>} config
 * @returns {(target) => void}
 */
exports.Client = (config) => target => Reflect.defineMetadata(classMetadataKey, config, target);
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
            let mainConfig = Reflect.getMetadata(classMetadataKey, target.constructor);
            const pathParams = Reflect.getMetadata(pathParamMetadataKey, target, propertyKey) || [];
            const queryParams = Reflect.getMetadata(queryMetadataKey, target, propertyKey) || [];
            const bodyParams = Reflect.getMetadata(bodyMetadataKey, target, propertyKey) || [];
            const mapper = Reflect.getMetadata(mapperMetadataKey, target, propertyKey) || null;
            const especificHeaders = Reflect.getMetadata(headersMetadataKey, target, propertyKey) || Object();
            const before = Reflect.getMetadata(beforeMetadataKey, target, propertyKey) || null;
            const exceptionHandler = Reflect.getMetadata(exceptionHandlerMetadataKey, target, propertyKey) || null;
            const config = Reflect.getMetadata(configMetadataKey, target, propertyKey) || Object();
            if (urlToMatch.charAt(0) == '/')
                urlToMatch = urlToMatch.substr(1, urlToMatch.length);
            let mainUrl = typeof mainConfig === 'object' ? mainConfig.url : mainConfig;
            let url = String(urlToMatch);
            url = UtilsHttp.buildPathParams(pathParams, argumentsHttp, url);
            const queryParamsUrl = UtilsHttp.buildQueryParams(queryParams, argumentsHttp);
            if (mainUrl.charAt(mainUrl.length - 1) !== '/')
                mainUrl = mainUrl.concat('/');
            mainUrl = mainUrl.concat(url).concat(queryParamsUrl === '?' ? '' : queryParamsUrl);
            const body_ = method !== 'get' ? UtilsHttp.prepareBody(bodyParams, argumentsHttp) : Object();
            if (typeof mainConfig === 'object') {
                mainConfig.headers = Object.assign({}, mainConfig.headers, especificHeaders);
            }
            let request = {
                url: mainUrl,
                body: body_,
                headers: typeof mainConfig === 'object' ? mainConfig.headers : especificHeaders ? especificHeaders : Object(),
                method: method,
            };
            request = before ? before(request) : request;
            exports.interceptors.forEach(i => request = i.intercep(request));
            return rxjs_1.from(axios_1.default.request(Object.assign({}, (typeof mainConfig === 'object' ? mainConfig : Object()), config, { method: request.method, data: request.body, headers: request.headers, url: request.url })))
                .pipe(operators_1.map(({ data }) => mapper ? mapper(data) : data), operators_1.catchError((Error) => mapError(Error, exceptionHandler, statusCodeOk)));
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
function mapError(error, exceptionHandler, statusCodeOk) {
    const { config } = error;
    const { response } = error;
    const { data } = config;
    const objError = exceptionHandler ? exceptionHandler(error) : (data && data.message && data.error) ?
        new FeignRequestException(data.error, response ? response.status : 504, data.message) :
        new FeignRequestException(JSON.stringify(data), response ? response.status : 504, String());
    return rxjs_1.throwError(objError);
}
/**
 *
 * @param {string} param
 * @returns {Function}
 */
exports.PathParam = (param) => (target, propertyKey, parameterIndex) => {
    const pathParams = Reflect.getOwnMetadata(pathParamMetadataKey, target, propertyKey) || [];
    pathParams.unshift({
        indexArgument: parameterIndex,
        paramValue: param,
    });
    Reflect.defineMetadata(pathParamMetadataKey, pathParams, target, propertyKey);
};
/**
 *
 * @param {FeignConfigClient} config
 * @returns {(target: Object, propertyKey: (string | symbol)) => void}
 * @constructor
 */
exports.Config = (config) => (target, propertyKey) => Reflect.defineMetadata(configMetadataKey, config, target, propertyKey);
/**
 *
 * @param {string} param_
 * @returns {Function}
 */
exports.Query = (param_) => (target, propertyKey, parameterIndex) => {
    const queryParams = Reflect.getOwnMetadata(queryMetadataKey, target, propertyKey) || [];
    queryParams.unshift({
        indexArgument: parameterIndex,
        paramValue: param_,
    });
    Reflect.defineMetadata(queryMetadataKey, queryParams, target, propertyKey);
};
/**
 *
 * @param {Object} target
 * @param {string | symbol} propertyKey
 * @param {number} parameterIndex
 */
function Body(target, propertyKey, parameterIndex) {
    const bodyParams = Reflect.getOwnMetadata(bodyMetadataKey, target, propertyKey) || [];
    bodyParams.unshift(parameterIndex);
    Reflect.defineMetadata(bodyMetadataKey, bodyParams, target, propertyKey);
}
exports.Body = Body;
/**
 *
 * @returns {(target, propertyName) => void}
 * @constructor
 */
exports.PathParamProperty = () => (target, propertyName) => Reflect.defineMetadata(pathParamPropertyMetadataKey, { name: propertyName }, target, propertyName);
/**
 *
 * @param {Function} mapper
 * @returns {(target: Object, propertyKey: (string | symbol)) => void}
 * @constructor
 */
exports.Mapper = (mapper) => (target, propertyKey) => Reflect.defineMetadata(mapperMetadataKey, mapper, target, propertyKey);
/**
 *
 * @param {{[p: string]: T}} headers
 * @returns {(target: Object, propertyKey: string) => void}
 * @constructor
 */
exports.Headers = (headers) => (target, propertyKey) => Reflect.defineMetadata(headersMetadataKey, headers, target, propertyKey);
/**
 *
 * @param {(request: Request_) => Request_} before_
 * @returns {(target: Object, propertyKey: string) => void}
 * @constructor
 */
exports.Before = (before_) => (target, propertyKey) => Reflect.defineMetadata(beforeMetadataKey, before_, target, propertyKey);
/**
 *
 * @param {Handler} handler
 * @returns {(target: Object, propertyKey: string) => void}
 * @constructor
 */
exports.HandlerError = (handler) => (target, propertyKey) => Reflect.defineMetadata(exceptionHandlerMetadataKey, handler, target, propertyKey);
/**
 *
 */
class UtilsHttp {
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
    static prepareBody(params = [], argumentsHttp = []) {
        let body = {};
        params
            .filter(i => typeof argumentsHttp[i] === 'object' && argumentsHttp[i])
            .forEach(i => body = Object.assign({}, body, argumentsHttp[i]));
        return body;
    }
}
/**
 *
 */
class FeignRequestException {
    constructor(error, statusCode, message) {
        this.error = error;
        this.statusCode = statusCode;
        this.message = message;
    }
}
exports.FeignRequestException = FeignRequestException;
