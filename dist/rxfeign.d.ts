/**
 * @author Juan David Correa
 */
import 'reflect-metadata';
import { FeignConfig, FeignInterceptor } from "./types";
/**
 *
 */
export declare const interceptors: FeignInterceptor[];
/**
 *
 * @param {T} interceptor
 */
export declare const addInterceptors: <T extends FeignInterceptor>(...interceptor: T[]) => void;
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
export declare const PathParam: (param?: string) => (target: Object, propertyKey: string | symbol, index_param: number) => void;
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
export declare const Query: (param_?: string) => (target: Object, propertyKey: string | symbol, index_param: number) => void;
/**
 *
 * @param key
 */
export declare const Body: (key?: string) => (target: Object, propertyKey: string | symbol, index_param: number) => void;
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
export declare const Mapper: <T>(mapper: keyof T) => (target: Object, propertyKey: string | symbol) => void;
/**
 *
 * @returns {(target: Object, propertyKey: string) => void}
 * @constructor
 * @param key
 */
export declare const Header: (key?: string) => (target: Object, propertyKey: string | symbol, index_param: number) => void;
/**
 *
 * @param {(request: Request_) => Request_} before_
 * @returns {(target: Object, propertyKey: string) => void}
 * @constructor
 */
export declare const Before: <T>(before_: keyof T) => (target: Object, propertyKey: string) => void;
/**
 *
 * @param {FeignHandler} handler
 * @returns {(target: Object, propertyKey: string) => void}
 * @constructor
 */
export declare const HandlerError: <T>(handler: keyof T) => (target: Object, propertyKey: string) => void;
