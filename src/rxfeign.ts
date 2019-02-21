/**
 * @author Juan David Correa
 */

import {catchError, map} from 'rxjs/operators';
import {Observable} from 'rxjs/internal/Observable';
import 'reflect-metadata'
import axios, {AxiosAdapter, AxiosBasicCredentials, AxiosError, AxiosProxyConfig} from 'axios'
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

export interface FeignConfig {
    url?: string;
    headers?: { [key: string]: any };
    timeout?: number;
    withCredentials?: boolean;
    adapter?: AxiosAdapter;
    auth?: AxiosBasicCredentials;
    responseType?: string;
    xsrfCookieName?: string;
    xsrfHeaderName?: string;
    maxContentLength?: number;
    maxRedirects?: number;
    httpAgent?: any;
    httpsAgent?: any;
    proxy?: AxiosProxyConfig | false;
}

export type FeignConfigMethod = Partial<Pick<FeignConfig, Exclude<keyof FeignConfig, 'url' | 'headers'>>>


/**
 *
 */
export interface HttpInterceptor {
    intercep: (req: FeignRequest) => FeignRequest
}

/**
 *
 */
export type Handler = <U extends FeignRequestException>(error: AxiosError) => U

/**
 *
 */

export const interceptors: HttpInterceptor[] = [];

/**
 *
 * @param {T} interceptor
 */
export const addInterceptors = <T extends { new(): HttpInterceptor }>(...interceptor: T[]) =>
    interceptor.forEach(i => interceptors.unshift(new i()))

/**
 *
 * @param {string | Partial<ConfigHttp>} config
 * @returns {(target) => void}
 */
export const Client = (config: string | Partial<FeignConfig>) =>
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

        descriptor.value = (...argumentsHttp) => {

            let mainConfig: FeignConfig | string = Reflect.getMetadata(classMetadataKey, target.constructor);
            const pathParams: Param[] = Reflect.getMetadata(pathParamMetadataKey, target, propertyKey) || [];
            const queryParams: Param[] = Reflect.getMetadata(queryMetadataKey, target, propertyKey) || [];
            const bodyParams: number[] = Reflect.getMetadata(bodyMetadataKey, target, propertyKey) || [];
            const mapper: Function = Reflect.getMetadata(mapperMetadataKey, target, propertyKey) || null;
            const especificHeaders: { [key: string]: any } = Reflect.getMetadata(headersMetadataKey, target, propertyKey) || Object();
            const before: (r: FeignRequest) => FeignRequest = Reflect.getMetadata(beforeMetadataKey, target, propertyKey) || null;
            const exceptionHandler: Handler = Reflect.getMetadata(exceptionHandlerMetadataKey, target, propertyKey) || null;
            const config: FeignConfigMethod = Reflect.getMetadata(configMetadataKey, target, propertyKey) || Object();

            if (urlToMatch.charAt(0) == '/')
                urlToMatch = urlToMatch.substr(1, urlToMatch.length)

            let mainUrl = typeof mainConfig === 'object' ? mainConfig.url : mainConfig;
            let url = String(urlToMatch);

            url = UtilsHttp.buildPathParams(pathParams, argumentsHttp, url);
            const queryParamsUrl = UtilsHttp.buildQueryParams(queryParams, argumentsHttp);

            if (mainUrl.charAt(mainUrl.length - 1) !== '/')
                mainUrl = mainUrl.concat('/')

            mainUrl = mainUrl.concat(url).concat(queryParamsUrl === '?' ? '' : queryParamsUrl);

            const body_ = method !== 'get' ? UtilsHttp.prepareBody(bodyParams, argumentsHttp) : Object();

            if (typeof mainConfig === 'object') {
                mainConfig.headers = {
                    ...mainConfig.headers,
                    ...especificHeaders
                }
            }

            let request: FeignRequest = {
                url: mainUrl,
                body: body_,
                headers: typeof mainConfig === 'object' ? mainConfig.headers : especificHeaders ? especificHeaders : Object(),
                method: method,
            };

            request = before ? before(request) : request;
            interceptors.forEach(i => request = i.intercep(request));

            return from(axios.request({
                ... (typeof mainConfig === 'object' ? mainConfig : Object()),
                ...config,
                method: request.method,
                data: request.body,
                headers: request.headers,
                url: request.url
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
        new FeignRequestException(data.error, response ? response.status : 504, data.message) :
        new FeignRequestException(JSON.stringify(data), response ? response.status : 504, String());
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
 * @param {FeignConfigClient} config
 * @returns {(target: Object, propertyKey: (string | symbol)) => void}
 * @constructor
 */
export const Config = (config: FeignConfigMethod) =>
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
export const Before = (before_: (request: FeignRequest) => FeignRequest) =>
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
export class FeignRequestException {
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
export type HttpObservable<O> = void & Observable<O>

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
export interface FeignRequest {
    readonly method: string,
    body: any,
    readonly headers: { [key: string]: any },
    readonly url: string
}