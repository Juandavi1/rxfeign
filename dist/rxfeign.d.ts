/**
 * @author Juan David Correa
 */
import { Observable } from 'rxjs/internal/Observable';
import 'reflect-metadata';
import { AxiosError } from 'axios';
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
export declare function Client(config: string | Partial<ConfigHttp>): (target: any) => void;
/**
 *
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {Function}
 */
export declare function Get(url?: string, statusCodeOk?: number): Function;
/**
 *
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {Function}
 */
export declare function Post(url?: string, statusCodeOk?: number): Function;
/**
 *
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {Function}
 */
export declare function Put(url?: string, statusCodeOk?: number): Function;
/**
 *
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {Function}
 */
export declare function Patch(url?: string, statusCodeOk?: number): Function;
/**
 *
 * @param {string} url
 * @param {Function} component
 * @param {number} statusCodeOk
 * @returns {Function}
 */
export declare function Delete(url?: string, statusCodeOk?: number): Function;
/**
 *
 * @param {string} param
 * @returns {Function}
 */
export declare function PathParam(param?: string): Function;
/**
 *
 * @param {string} param_
 * @returns {Function}
 */
export declare function Query(param_?: string): Function;
/**
 *
 * @param {Object} target
 * @param {string | symbol} propertyKey
 * @param {number} parameterIndex
 */
export declare function Body(target: Object, propertyKey: string | symbol, parameterIndex: number): void;
/**
 *
 * @param {boolean} enable
 * @returns {Function}
 */
export declare function PathParamProperty(enable?: boolean): Function;
/**
 *
 * @param {Function} mapper
 * @returns {Function}
 */
export declare function Mapper(mapper: Function): Function;
/**
 *
 * @param {{[p: string]: T}} headers
 * @returns {Function}
 */
export declare function Headers<T extends any>(headers: {
    [key: string]: T;
}): Function;
/**
 *
 * @param {(request: Request_) => Request_} before_
 * @returns {(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void}
 */
export declare function Before(before_: (request: Request_) => Request_): (target: Object, propertyKey: string) => void;
/**
 *
 * @param {Handler} handler
 * @returns {(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void}
 */
export declare function HandlerError(handler: Handler): (target: Object, propertyKey: string) => void;
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
