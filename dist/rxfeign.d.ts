/**
 * @author Juan David Correa
 */
import { Observable } from 'rxjs/internal/Observable';
import 'reflect-metadata';
import { AxiosError, AxiosRequestConfig } from 'axios';
/**
 *
 */
declare type RemoveAttr<T> = Pick<T, Exclude<keyof T, 'url' | 'data' | 'params' | 'headers' | 'baseURL' | 'method'>>;
export declare type FeignConfig = Partial<RemoveAttr<AxiosRequestConfig>>;
/**
 *
 */
export interface HttpInterceptor {
    intercep: (req: Request_) => Request_;
}
/**
 *
 */
export declare type Handler = <U extends HttpRequestException>(error: AxiosError) => U;
/**
 *
 */
export declare const interceptors: HttpInterceptor[];
/**
 *
 * @param {T} interceptor
 */
export declare function addInterceptors<T extends {
    new (): HttpInterceptor;
}>(...interceptor: T[]): void;
/**
 *
 * @param {string | Partial<ConfigHttp>} config
 * @returns {(target) => void}
 */
export declare const Client: (config: string | Partial<ConfigHttp>) => (target: any) => void;
/**
 *
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {Function}
 */
export declare const Get: (url?: string, statusCodeOk?: number) => (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void;
/**
 *
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {Function}
 */
export declare const Post: (url?: string, statusCodeOk?: number) => (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void;
/**
 *
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {Function}
 */
export declare const Put: (url?: string, statusCodeOk?: number) => (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void;
/**
 *
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {Function}
 */
export declare const Patch: (url?: string, statusCodeOk?: number) => (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void;
/**
 *
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {Function}
 */
export declare const Delete: (url?: string, statusCodeOk?: number) => (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void;
/**
 *
 * @param {string} param
 * @returns {Function}
 */
export declare const PathParam: (param?: string) => (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
/**
 *
 * @param {FeignConfig} config
 * @returns {(target: Object, propertyKey: (string | symbol)) => void}
 * @constructor
 */
export declare const Config: (config: Partial<Pick<AxiosRequestConfig, "transformRequest" | "transformResponse" | "paramsSerializer" | "timeout" | "withCredentials" | "adapter" | "auth" | "responseType" | "xsrfCookieName" | "xsrfHeaderName" | "onUploadProgress" | "onDownloadProgress" | "maxContentLength" | "validateStatus" | "maxRedirects" | "httpAgent" | "httpsAgent" | "proxy" | "cancelToken">>) => (target: Object, propertyKey: string | symbol) => void;
/**
 *
 * @param {string} param_
 * @returns {Function}
 */
export declare const Query: (param_?: string) => (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
/**
 *
 * @param {Object} target
 * @param {string | symbol} propertyKey
 * @param {number} parameterIndex
 */
export declare function Body(target: Object, propertyKey: string | symbol, parameterIndex: number): void;
/**
 *
 * @returns {(target, propertyName) => void}
 * @constructor
 */
export declare const PathParamProperty: () => (target: any, propertyName: any) => void;
/**
 *
 * @param {Function} mapper
 * @returns {(target: Object, propertyKey: (string | symbol)) => void}
 * @constructor
 */
export declare const Mapper: (mapper: Function) => (target: Object, propertyKey: string | symbol) => void;
/**
 *
 * @param {{[p: string]: T}} headers
 * @returns {(target: Object, propertyKey: string) => void}
 * @constructor
 */
export declare const Headers: <T extends any>(headers: {
    [key: string]: T;
}) => (target: Object, propertyKey: string) => void;
/**
 *
 * @param {(request: Request_) => Request_} before_
 * @returns {(target: Object, propertyKey: string) => void}
 * @constructor
 */
export declare const Before: (before_: (request: Request_) => Request_) => (target: Object, propertyKey: string) => void;
/**
 *
 * @param {Handler} handler
 * @returns {(target: Object, propertyKey: string) => void}
 * @constructor
 */
export declare const HandlerError: (handler: Handler) => (target: Object, propertyKey: string) => void;
/**
 *
 */
export declare class HttpRequestException {
    error: string;
    statusCode: number;
    message: string;
    constructor(error: string, statusCode: number, message: string);
}
/**
 *
 */
declare class HeadersHttp {
    /**
     *
     * @type {Map<any, any>}
     */
    private headers;
    constructor();
    /**
     *
     * @param {string} key
     * @returns {boolean}
     */
    has(key: string): boolean;
    /**
     *
     * @param {string} key
     * @param header
     * @returns {this}
     */
    set(key: string, header: any): this;
    /**
     *
     * @returns {any}
     */
    getHeaders(): any;
}
/**
 *
 */
export declare type HttpObservable<t> = Observable<t> & void;
/**
 *
 */
interface ConfigHttp {
    url: string;
    headers: {
        [key: string]: any;
    };
    config?: FeignConfig;
}
/**
 *
 */
export interface Request_ {
    readonly method: string;
    body: any;
    readonly headers: HeadersHttp;
    readonly url: string;
}
export {};
