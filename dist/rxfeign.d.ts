/**
 * @author Juan David Correa
 */
import { Observable } from 'rxjs/internal/Observable';
import 'reflect-metadata';
import { AxiosAdapter, AxiosBasicCredentials, AxiosError, AxiosProxyConfig } from 'axios';
/**
 *
 */
export interface FeignConfig {
    url?: string;
    headers?: {
        [key: string]: any;
    };
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
export declare type FeignConfigMethod = Partial<Pick<FeignConfig, Exclude<keyof FeignConfig, 'url' | 'headers'>>>;
/**
 *
 */
export interface FeignInterceptor {
    intercep: (req: FeignRequest) => FeignRequest;
}
/**
 *
 */
export declare type FeignHandler = <U extends FeignRequestException>(error: AxiosError) => U;
/**
 *
 */
export declare const interceptors: FeignInterceptor[];
/**
 *
 * @param {T} interceptor
 */
export declare const addInterceptors: <T extends new () => FeignInterceptor>(...interceptor: T[]) => void;
/**
 *
 * @param {string | Partial<ConfigHttp>} config
 * @returns {(target) => void}
 */
export declare const Client: (config: string | Partial<FeignConfig>) => (target: any) => void;
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
 * @param {FeignConfigClient} config
 * @returns {(target: Object, propertyKey: (string | symbol)) => void}
 * @constructor
 */
export declare const Config: (config: Partial<Pick<FeignConfig, "auth" | "timeout" | "withCredentials" | "adapter" | "responseType" | "xsrfCookieName" | "xsrfHeaderName" | "maxContentLength" | "maxRedirects" | "httpAgent" | "httpsAgent" | "proxy">>) => (target: Object, propertyKey: string | symbol) => void;
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
export declare const Before: (before_: (request: FeignRequest) => FeignRequest) => (target: Object, propertyKey: string) => void;
/**
 *
 * @param {FeignHandler} handler
 * @returns {(target: Object, propertyKey: string) => void}
 * @constructor
 */
export declare const HandlerError: (handler: FeignHandler) => (target: Object, propertyKey: string) => void;
/**
 *
 */
export declare class FeignRequestException {
    error: string;
    statusCode: number;
    message: string;
    constructor(error: string, statusCode: number, message: string);
}
/**
 *
 */
export declare type HttpObservable<O> = void & Observable<O>;
/**
 *
 */
export interface FeignRequest {
    readonly method: string;
    body: any;
    readonly headers: {
        [key: string]: any;
    };
    readonly url: string;
}
