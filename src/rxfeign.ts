/**
 * @author Juan David Correa
 */

import {catchError, map} from 'rxjs/operators';
import {Observable} from 'rxjs/internal/Observable';
import 'reflect-metadata'
import axios, {AxiosError, AxiosRequestConfig} from 'axios'
import {from, throwError} from "rxjs";

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

type RemoveAttr<T> = Pick<T, Exclude<keyof T, 'url' | 'data' | 'params' | 'headers' | 'baseURL' | 'method'>>

export type FeignConfig = Partial<RemoveAttr<AxiosRequestConfig>>

/**
 *
 */
export interface HttpInterceptor {
    intercep: (req: Request_) => Request_
}

/**
 *
 */
export type Handler = <U extends HttpRequestException>(error: AxiosError) => U

/**
 *
 */

export const interceptors: HttpInterceptor[] = [];

/**
 *
 * @param {T} interceptor
 */
export function addInterceptors<T extends { new(): HttpInterceptor }>(...interceptor: T[]): void {
    interceptor.forEach(i => interceptors.unshift(new i()))
}

/**
 *
 * @param {string | Partial<ConfigHttp>} config
 * @returns {(target) => void}
 */
export const Client = (config: string | Partial<ConfigHttp>) =>
    target => Reflect.defineMetadata(classMetadataKey, config, target)

/**
 *
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {Function}
 */
export const Get = (url?: string, statusCodeOk: number = 400) => request('get', url, statusCodeOk)


/**
 *
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {Function}
 */
export const Post = (url?: string, statusCodeOk: number = 400) => request('post', url, statusCodeOk);


/**
 *
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {Function}
 */
export const Put = (url?: string, statusCodeOk: number = 400) => request('put', url, statusCodeOk);


/**
 *
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {Function}
 */
export const Patch = (url?: string, statusCodeOk: number = 400) => request('patch', url, statusCodeOk);


/**
 *
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {Function}
 */
export const Delete = (url?: string, statusCodeOk: number = 400) => request('delete', url, statusCodeOk);

/**
 * @param {string} method
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void}
 */
function request(method: string, urlToMatch: string = '', statusCodeOk: number) {

    return (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {

        descriptor.value = (...arguments_) => {

            const mainConfig: ConfigHttp = Reflect.getMetadata(classMetadataKey, target.constructor);
            const pathParams: Param[] = Reflect.getMetadata(pathParamMetadataKey, target, propertyKey) || [];
            const queryParams: Param[] = Reflect.getMetadata(queryMetadataKey, target, propertyKey) || [];
            const bodyParams: number[] = Reflect.getMetadata(bodyMetadataKey, target, propertyKey) || [];
            const mapper: Function = Reflect.getMetadata(mapperMetadataKey, target, propertyKey) || null;
            const especificHeaders: Function = Reflect.getMetadata(headersMetadataKey, target, propertyKey) || null;
            const before: (r: Request_) => Request_ = Reflect.getMetadata(beforeMetadataKey, target, propertyKey) || null;
            const exceptionHandler: Handler = Reflect.getMetadata(exceptionHandlerMetadataKey, target, propertyKey) || null;
            let config: FeignConfig = Reflect.getMetadata(configMetadataKey, target, propertyKey) || {};

            if (urlToMatch.charAt(0) == '/')
                urlToMatch = urlToMatch.substr(1, urlToMatch.length)

            const headers: HeadersHttp = new HeadersHttp();
            let mainUrl = String();
            const argumentsHttp = arguments_;
            let url = String(urlToMatch);
            url = UtilsHttp.buildPathParams(pathParams, argumentsHttp, url);

            const queryParamsUrl = UtilsHttp.buildQueryParams(queryParams, argumentsHttp);

            if (typeof mainConfig === 'object') {
                mainUrl = mainConfig.url;
                UtilsHttp.prepareHeaders(mainConfig.headers, headers);
                config = mainConfig.config ? {
                    ...mainConfig.config,
                    ...config
                } : config
            } else
                mainUrl = mainConfig;

            if (mainUrl.charAt(mainUrl.length - 1) !== '/')
                mainUrl = mainUrl.concat('/')

            mainUrl = mainUrl.concat(url).concat(queryParamsUrl === '?' ? '' : queryParamsUrl);

            const body_ = method !== 'get' ? UtilsHttp.prepareBody(bodyParams, argumentsHttp) : {};

            if (especificHeaders)
                Object.keys(especificHeaders)
                    .forEach(i => headers.set(i, especificHeaders[i]));

            let request: Request_ = {
                url: mainUrl,
                body: body_,
                headers: headers.getHeaders(),
                method: method,
            };

            request = before ? before(request) : request;
            interceptors.forEach(i => request = i.intercep(request));

            return from(axios.request({
                method: request.method,
                data: request.body,
                headers: request.headers,
                url: request.url,
                responseType: "json",
                ...config,
            }))
                .pipe(
                    map(({data}) => mapper ? mapper(data) : data),
                    catchError((Error) =>
                        mapError(Error, exceptionHandler, statusCodeOk)
                    ),
                );
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
function mapError(error: AxiosError, exceptionHandler: Handler, statusCodeOk): Observable<never> {
    const {config} = error
    const {response} = error
    const {data} = config
    const objError = exceptionHandler ? exceptionHandler(error) : (data && data.message && data.error) ?
        new HttpRequestException(data.error, response ? response.status : 504, data.message) :
        new HttpRequestException(JSON.stringify(data), response ? response.status : 504, String());
    return throwError(objError)
}

/**
 *
 * @param {string} param
 * @returns {Function}
 */
export const PathParam = (param?: string) =>
    (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const pathParams: Param[] = Reflect.getOwnMetadata(pathParamMetadataKey, target, propertyKey) || [];
        pathParams.unshift({
            indexArgument: parameterIndex,
            paramValue: param,
        });
        Reflect.defineMetadata(pathParamMetadataKey, pathParams, target, propertyKey);
    };

/**
 *
 * @param {FeignConfig} config
 * @returns {(target: Object, propertyKey: (string | symbol)) => void}
 * @constructor
 */
export const Config = (config: FeignConfig) =>
    (target: Object, propertyKey: string | symbol) =>
        Reflect.defineMetadata(configMetadataKey, config, target, propertyKey);

/**
 *
 * @param {string} param_
 * @returns {Function}
 */
export const Query = (param_?: string) =>
    (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const queryParams: Param[] = Reflect.getOwnMetadata(queryMetadataKey, target, propertyKey) || [];
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
export function Body(target: Object, propertyKey: string | symbol, parameterIndex: number) {
    const bodyParams: number[] = Reflect.getOwnMetadata(bodyMetadataKey, target, propertyKey) || [];
    bodyParams.unshift(parameterIndex);
    Reflect.defineMetadata(bodyMetadataKey, bodyParams, target, propertyKey);
}

/**
 *
 * @returns {(target, propertyName) => void}
 * @constructor
 */
export const PathParamProperty = () =>
    (target, propertyName) =>
        Reflect.defineMetadata(pathParamPropertyMetadataKey, {name: propertyName}, target, propertyName)

/**
 *
 * @param {Function} mapper
 * @returns {(target: Object, propertyKey: (string | symbol)) => void}
 * @constructor
 */
export const Mapper = (mapper: Function) =>
    (target: Object, propertyKey: string | symbol) =>
        Reflect.defineMetadata(mapperMetadataKey, mapper, target, propertyKey);

/**
 *
 * @param {{[p: string]: T}} headers
 * @returns {(target: Object, propertyKey: string) => void}
 * @constructor
 */
export const Headers = <T extends any>(headers: { [key: string]: T }) =>
    (target: Object, propertyKey: string) =>
        Reflect.defineMetadata(headersMetadataKey, headers, target, propertyKey);

/**
 *
 * @param {(request: Request_) => Request_} before_
 * @returns {(target: Object, propertyKey: string) => void}
 * @constructor
 */
export const Before = (before_: (request: Request_) => Request_) =>
    (target: Object, propertyKey: string) =>
        Reflect.defineMetadata(beforeMetadataKey, before_, target, propertyKey);


/**
 *
 * @param {Handler} handler
 * @returns {(target: Object, propertyKey: string) => void}
 * @constructor
 */
export const HandlerError = (handler: Handler) =>
    (target: Object, propertyKey: string) =>
        Reflect.defineMetadata(exceptionHandlerMetadataKey, handler, target, propertyKey);


/**
 *
 */
class UtilsHttp {

    /**
     *
     * @param obj
     * @param {Headers} headers
     */
    public static prepareHeaders(obj = {}, headers: HeadersHttp): void {
        Object.keys(obj).forEach(key =>
            !headers.has(obj[key]) ? headers.set(key, obj[key]) : null,
        );

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
    public static buildQueryParams(params: Param[], argumentsHttp): string {

        let queryParamsUrl: string = '?';
        const ampersan: string = '&';
        const empty: string = String();

        params = params
            .filter(param => argumentsHttp[param.indexArgument]);

        params
            .forEach((param, index) => {
                if (typeof argumentsHttp[param.indexArgument] === 'object') {
                    const keys = Object.keys(argumentsHttp[param.indexArgument]) || [];
                    let tempCont = 0;
                    for (const key in argumentsHttp[param.indexArgument]) {
                        queryParamsUrl = queryParamsUrl.concat(
                            `${key}=${argumentsHttp[param.indexArgument][key]}${tempCont === keys.length - 1 ? empty : ampersan}`,
                        );
                        tempCont++;
                    }
                } else {
                    if (!param.paramValue)
                        return;
                    queryParamsUrl = queryParamsUrl.length > 1 ? queryParamsUrl.concat(ampersan) : queryParamsUrl;
                    queryParamsUrl = queryParamsUrl.concat(
                        `${param.paramValue}=${argumentsHttp[param.indexArgument]}${index === params.length - 1 ? empty : ampersan}`,
                    );
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
    public static buildPathParams(pathParam: Param[], argumentsHttp, url: string): string {

        url = url.replace(/\s/g, '').trim();
        const wrapOpen = '{';
        const wrapClose = '}';

        pathParam
            .filter(param => param.paramValue)
            .forEach(param => {
                if (!param.paramValue)
                    return;
                const pathParam: string = wrapOpen.concat(param.paramValue.toString()).concat(wrapClose);
                if (url.includes(pathParam))
                    url = url.replace(pathParam, argumentsHttp[param.indexArgument]);
            });

        pathParam
            .filter(param => !param.paramValue)
            .map(param => url += `/${argumentsHttp[param.indexArgument]}`);

        argumentsHttp
            .filter(arg => arg && typeof arg === 'object')
            .forEach(obj =>
                Object.keys(obj).forEach(key => {
                    const keyPathParam: PathProperty = Reflect.getMetadata(pathParamPropertyMetadataKey, obj, key);
                    if (keyPathParam)
                        url = url.replace(`{${keyPathParam.name}}`, obj[keyPathParam.name]);
                })
            );
        return url;
    }

    /**
     *
     * @param {number[]} params
     * @param argumentsHttp
     * @returns {any}
     */
    public static prepareBody(params: number[] = [], argumentsHttp = []): any {
        let body = {};
        params
            .filter(i => typeof argumentsHttp[i] === 'object' && argumentsHttp[i])
            .forEach(i => body = Object.assign({}, body, argumentsHttp[i]));
        return body
    }
}

/**
 *
 */
export class HttpRequestException {
    constructor(
        public error: string,
        public statusCode: number,
        public message: string,
    ) {
    }
}

/**
 *
 */

class HeadersHttp {

    /**
     *
     * @type {Map<any, any>}
     */
    private headers: Map<string, any> = new Map();

    constructor() {
    }

    /**
     *
     * @param {string} key
     * @returns {boolean}
     */
    public has(key: string): boolean {
        return this.headers.has(key);
    }

    /**
     *
     * @param {string} key
     * @param header
     * @returns {this}
     */
    public set(key: string, header: any): this {
        this.headers.set(key, header);
        return this;
    }

    /**
     *
     * @returns {any}
     */
    public getHeaders() {
        const headers = Object();
        Array.from(this.headers.keys())
            .forEach(key => headers[key] = this.headers.get(key));
        return headers;
    }
}

/**
 *
 */
export type HttpObservable<t> = Observable<t> & void

/**
 *
 */
interface Param {
    indexArgument: number
    paramValue: string | object
}

/**
 *
 */
interface PathProperty {
    name: string
}

/**
 *
 */
interface ConfigHttp {
    url: string,
    headers: { [key: string]: any },
    config?: FeignConfig
}

/**
 *
 */
export interface Request_ {
    readonly method: string,
    body: any,
    readonly headers: HeadersHttp,
    readonly url: string
}