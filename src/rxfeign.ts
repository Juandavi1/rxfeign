/**
 * @author Juan David Correa
 */


import {RxHR, RxHttpRequestResponse} from '@akanass/rx-http-request';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs/internal/Observable';
import 'reflect-metadata'

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
export interface HttpInterceptor {
    intercep: (req: Request_) => Request_
}

/**
 *
 */
export type Handler = (...request) => HttpRequestException

/**
 *
 */
export class Http {

    private static interceptors: HttpInterceptor[] = [];

    /**
     *
     * @param {T} interceptor
     */
    public static addInterceptor<T extends { new(): HttpInterceptor }>(interceptor: T): void {
        this.interceptors.unshift(new interceptor());
    }

    /**
     *
     * @param {string | Partial<ConfigHttp>} config
     * @returns {(target) => void}
     */
    public static client(config: string | Partial<ConfigHttp>) {
        return target => Reflect.defineMetadata(classMetadataKey, config, target);
    }

    /**
     *
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {Function}
     */
    public static get(url: string, component: Function, statusCodeOk: number = 400): Function {
        return this.request('get', url, component, statusCodeOk);
    }

    /**
     *
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {Function}
     */
    public static post(url: string, component: Function, statusCodeOk: number = 400): Function {
        return this.request('post', url, component, statusCodeOk);
    }

    /**
     *
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {Function}
     */
    public static put(url: string, component: Function, statusCodeOk: number = 400): Function {
        return this.request('put', url, component, statusCodeOk);
    }

    /**
     *
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {Function}
     */
    public static patch(url: string, component: Function, statusCodeOk: number = 400): Function {
        return this.request('patch', url, component, statusCodeOk);
    }

    /**
     *
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {Function}
     */
    public static delete(url: string, component: Function, statusCodeOk: number = 400): Function {
        return this.request('delete', url, component, statusCodeOk);
    }

    /**
     * @param {string} method
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void}
     */
    private static request(method: string, urlToMatch: string, component: Function, statusCodeOk: number) {

        return (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {

            descriptor.value = (...arguments_) => {

                const mainConfig = Reflect.getMetadata(classMetadataKey, component);
                const pathParams: Param[] = Reflect.getMetadata(pathParamMetadataKey, target, propertyKey) || [];
                const queryParams: Param[] = Reflect.getMetadata(queryMetadataKey, target, propertyKey) || [];
                const bodyParams: number[] = Reflect.getMetadata(bodyMetadataKey, target, propertyKey) || [];
                const mapper: Function = Reflect.getMetadata(mapperMetadataKey, target, propertyKey) || null;
                const especificHeaders: Function = Reflect.getMetadata(headersMetadataKey, target, propertyKey) || null;
                const before: (r: Request_) => Request_ = Reflect.getMetadata(beforeMetadataKey, target, propertyKey) || null;
                const exceptionHandler: Handler = Reflect.getMetadata(exceptionHandlerMetadataKey, target, propertyKey) || null;
                // Reflect.deleteMetadata(pathParamMetadataKey, target, propertyKey);

                const headers: Headers = new Headers();
                let mainUrl = String();
                const argumentsHttp = arguments_;
                let url = String(urlToMatch);
                url = UtilsHttp.buildPathParams(pathParams, argumentsHttp, url);

                const queryParamsUrl = UtilsHttp.buildQueryParams(queryParams, argumentsHttp);

                if (typeof mainConfig === 'object') {
                    mainUrl = mainConfig.url;
                    UtilsHttp.prepareHeaders(mainConfig.headers, headers);
                } else
                    mainUrl = mainConfig;

                mainUrl = mainUrl.concat(url).concat(queryParamsUrl === '?' ? '' : queryParamsUrl);

                const body_ = method !== 'get' ? UtilsHttp.prepareBody(bodyParams, argumentsHttp) : String();

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
                this.interceptors.forEach(i => request = i.intercep(request));

                return RxHR[method](request.url, {
                    headers: request.headers,
                    body: request.body,
                    qsStringifyOptions: {
                        arrayFormat: 'repeat',
                    },
                    
                })
                    .pipe(
                        map(value => this.mapBodyAndControlError(value as RxHttpRequestResponse, exceptionHandler, statusCodeOk)),
                        map(body => mapper ? mapper(body) : body),
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
    private static mapBodyAndControlError(value: RxHttpRequestResponse, exceptionHandler: Handler, statusCodeOk) {
        const {body, statusCode, request} = value.response;
        if (statusCode < statusCodeOk) {
            return body ? JSON.parse(body) : body;
        } else if (exceptionHandler) {
            throw exceptionHandler(body, statusCode, request);
        } else {
            if (body && body.message && body.error) {
                throw new HttpRequestException(body.error, statusCode, body.message);
            } else {
                throw new HttpRequestException(JSON.stringify(body), statusCode, String());
            }
        }
    }

    /**
     *
     * @param {string} param
     * @returns {Function}
     */
    public static pathParam(param?: string): Function {
        return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
            const pathParams: Param[] = Reflect.getOwnMetadata(pathParamMetadataKey, target, propertyKey) || [];
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
    public static query(param_?: string): Function {
        return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
            const queryParams: Param[] = Reflect.getOwnMetadata(queryMetadataKey, target, propertyKey) || [];
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
    public static body(target: Object, propertyKey: string | symbol, parameterIndex: number) {
        const bodyParams: number[] = Reflect.getOwnMetadata(bodyMetadataKey, target, propertyKey) || [];
        bodyParams.unshift(parameterIndex);
        Reflect.defineMetadata(bodyMetadataKey, bodyParams, target, propertyKey);
    }

    /**
     *
     * @param {boolean} enable
     * @returns {Function}
     */
    public static pathParamProperty(enable = true): Function {
        return (target, propertyName) =>
            Reflect.defineMetadata(pathParamPropertyMetadataKey, {name: propertyName}, target, propertyName);
    }

    /**
     *
     * @param {Function} mapper
     * @returns {Function}
     */
    public static mapper(mapper: Function): Function {
        return (target: Object, propertyKey: string | symbol) =>
            Reflect.defineMetadata(mapperMetadataKey, mapper, target, propertyKey);
    }

    /**
     *
     * @param {{[p: string]: T}} headers
     * @returns {Function}
     */
    public static headers<T extends any>(headers: { [key: string]: T }): Function {
        return (target: Object, propertyKey: string) =>
            Reflect.defineMetadata(headersMetadataKey, headers, target, propertyKey);
    }

    /**
     *
     * @param {(request: Request_) => Request_} before_
     * @returns {(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void}
     */
    public static before(before_: (request: Request_) => Request_) {
        return (target: Object, propertyKey: string) =>
            Reflect.defineMetadata(beforeMetadataKey, before_, target, propertyKey);
    }

    /**
     *
     * @param {Handler} handler
     * @returns {(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void}
     */
    public static handlerError(handler: Handler) {
        return (target: Object, propertyKey: string) =>
            Reflect.defineMetadata(exceptionHandlerMetadataKey, handler, target, propertyKey);
    }
}

/**
 *
 */
class UtilsHttp {

    /**
     *
     * @param obj
     * @param {Headers} headers
     */
    public static prepareHeaders(obj = {}, headers: Headers): void {
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
            .filter(arg => typeof arg === 'object')
            .forEach(obj => {
                Object.keys(obj).forEach(key => {
                    const keyPathParam: PathProperty = Reflect.getMetadata(pathParamPropertyMetadataKey, obj, key);
                    if (keyPathParam)
                        url = url.replace(`{${keyPathParam.name}}`, obj[keyPathParam.name]);
                });
            });
        return url;
    }

    /**
     *
     * @param {number[]} params
     * @param argumentsHttp
     * @returns {any}
     */
    public static prepareBody(params: number[], argumentsHttp) {
        let body = {};
        params.forEach(i => body = Object.assign({}, body, argumentsHttp[i]));
        return params.length ? JSON.stringify(body) as any : String();
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

class Headers {

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
    headers: { [key: string]: any }
}

/**
 *
 */
export interface Request_ {
    readonly method: string,
    body: any,
    readonly headers: Headers,
    readonly url: string
}