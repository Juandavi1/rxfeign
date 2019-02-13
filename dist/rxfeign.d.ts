/**
 * @author Juan David Correa
 */
import { Observable } from 'rxjs/internal/Observable';
import 'reflect-metadata';
/**
 *
 */
export interface HttpInterceptor {
    intercep: (req: Request_) => Request_;
}
/**
 *
 */
export declare type Handler = (...request: any[]) => HttpRequestException;
/**
 *
 */
export declare class Http {
    private static interceptors;
    /**
     *
     * @param {T} interceptor
     */
    static addInterceptor<T extends {
        new (): HttpInterceptor;
    }>(interceptor: T): void;
    /**
     *
     * @param {string | Partial<ConfigHttp>} config
     * @returns {(target) => void}
     */
    static client(config: string | Partial<ConfigHttp>): (target: any) => void;
    /**
     *
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {Function}
     */
    static get(url: string, statusCodeOk?: number): Function;
    /**
     *
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {Function}
     */
    static post(url: string, statusCodeOk?: number): Function;
    /**
     *
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {Function}
     */
    static put(url: string, statusCodeOk?: number): Function;
    /**
     *
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {Function}
     */
    static patch(url: string, statusCodeOk?: number): Function;
    /**
     *
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {Function}
     */
    static delete(url: string, statusCodeOk?: number): Function;
    /**
     * @param {string} method
     * @param {string} url
     * @param {Function} component
     * @param {number} statusCodeOk
     * @returns {(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void}
     */
    private static request;
    /**
     *
     * @param value
     * @param {Handler} exceptionHandler
     * @param statusCodeOk
     * @returns {any}
     */
    private static mapBodyAndControlError;
    /**
     *
     * @param {string} param
     * @returns {Function}
     */
    static pathParam(param?: string): Function;
    /**
     *
     * @param {string} param_
     * @returns {Function}
     */
    static query(param_?: string): Function;
    /**
     *
     * @param {Object} target
     * @param {string | symbol} propertyKey
     * @param {number} parameterIndex
     */
    static body(target: Object, propertyKey: string | symbol, parameterIndex: number): void;
    /**
     *
     * @param {boolean} enable
     * @returns {Function}
     */
    static pathParamProperty(enable?: boolean): Function;
    /**
     *
     * @param {Function} mapper
     * @returns {Function}
     */
    static mapper(mapper: Function): Function;
    /**
     *
     * @param {{[p: string]: T}} headers
     * @returns {Function}
     */
    static headers<T extends any>(headers: {
        [key: string]: T;
    }): Function;
    /**
     *
     * @param {(request: Request_) => Request_} before_
     * @returns {(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void}
     */
    static before(before_: (request: Request_) => Request_): (target: Object, propertyKey: string) => void;
    /**
     *
     * @param {Handler} handler
     * @returns {(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void}
     */
    static handlerError(handler: Handler): (target: Object, propertyKey: string) => void;
}
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
declare class Headers {
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
    readonly headers: Headers;
    readonly url: string;
}
export {};
