/**
 * @author Juan David Correa
 */

import {catchError, map} from 'rxjs/operators';
import 'reflect-metadata'
import axios, {AxiosError} from 'axios'
import {from, Observable, throwError} from "rxjs";
import {UtilsHttp} from "./utils";
import {
    FeignConfig,
    FeignConfigMethod,
    FeignHandler,
    FeignInterceptor,
    FeignRequest,
    FeignRequestException,
    PathParams,
    QueryParam,
    BodyParam, HeaderParam
} from "./types";
import {
    beforeMetadataKey,
    bodyMetadataKey,
    classMetadataKey,
    configMetadataKey,
    exceptionHandlerMetadataKey,
    headersMetadataKey,
    mapperMetadataKey,
    pathParamMetadataKey,
    pathParamPropertyMetadataKey,
    queryMetadataKey
} from "./constans";


/**
 *
 */

export const interceptors: FeignInterceptor[] = [];

/**
 *
 * @param {T} interceptor
 */
export const addInterceptors = <T extends FeignInterceptor>(...interceptor: T[]) =>
    interceptor.forEach(i => interceptors.unshift(i))

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

            let classConfiguration: FeignConfig | string = Reflect.getMetadata(classMetadataKey, target.constructor);
            const pathParams: PathParams[] = Reflect.getMetadata(pathParamMetadataKey, target, propertyKey) || [];
            const queryParams: QueryParam[] = Reflect.getMetadata(queryMetadataKey, target, propertyKey) || [];
            const bodyParams: BodyParam[] = Reflect.getMetadata(bodyMetadataKey, target, propertyKey) || [];
            const mapper: string = Reflect.getMetadata(mapperMetadataKey, target, propertyKey) || null;
            const headersParams: HeaderParam[] = Reflect.getMetadata(headersMetadataKey, target, propertyKey) || [];
            const before: string = Reflect.getMetadata(beforeMetadataKey, target, propertyKey) || null;
            const exceptionHandler: string = Reflect.getMetadata(exceptionHandlerMetadataKey, target, propertyKey) || null;
            const configMethod: FeignConfigMethod = Reflect.getMetadata(configMetadataKey, target, propertyKey) || Object();

            if (urlToMatch.charAt(0) == '/')
                urlToMatch = urlToMatch.substr(1, urlToMatch.length)

            let mainUrl = typeof classConfiguration === 'object' ? classConfiguration.url : classConfiguration;
            let url = String(urlToMatch);

            url = UtilsHttp.preparePathParams(pathParams, argumentsHttp, url);
            const queryParamsUrl = UtilsHttp.prepareQueryParams(queryParams, argumentsHttp);

            if (mainUrl.charAt(mainUrl.length - 1) !== '/')
                mainUrl = mainUrl.concat('/')

            mainUrl = mainUrl.concat(url).concat(queryParamsUrl === '?' ? '' : queryParamsUrl);

            const body_ = UtilsHttp.prepareBody(bodyParams, argumentsHttp);

            const headers = {
                ...UtilsHttp.prepareHeaders(headersParams, argumentsHttp),
                ...(typeof classConfiguration === 'object'?(classConfiguration.headers || {}):{})
            }

            let request: FeignRequest = {
                url: mainUrl,
                body: body_,
                headers,
                method: method,
            };

            request = before ? target[before](request) : request;
            interceptors.forEach(i => request = i.intercep(request));

            return from(axios.request({
                ... (typeof classConfiguration === 'object' ? classConfiguration : Object()),
                ...configMethod,
                method: request.method,
                data: request.body,
                headers: request.headers,
                url: request.url
            }))
                .pipe(
                    map(({data}) => mapper ? target[mapper](data) : data),
                    catchError(Error =>
                        mapError(Error, target[exceptionHandler], statusCodeOk)
                    ),
                );
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
function mapError(error: AxiosError, exceptionHandler: FeignHandler, statusCodeOk): Observable<never> {
    return throwError(exceptionHandler ? exceptionHandler(error) : new FeignRequestException(error))
}

/**
 *
 * @param {string} param
 * @returns {Function}
 */
export const PathParam = (param?: string) =>
    (target: Object, propertyKey: string | symbol, index_param: number) => {
        const pathParams: PathParams[] = Reflect.getOwnMetadata(pathParamMetadataKey, target, propertyKey) || [];
        pathParams.unshift({index_param, key: param});
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
    (target: Object, propertyKey: string | symbol, index_param: number) => {
        const queryParams: QueryParam[] = Reflect.getOwnMetadata(queryMetadataKey, target, propertyKey) || [];
        queryParams.unshift({index_param, key: param_,});
        Reflect.defineMetadata(queryMetadataKey, queryParams, target, propertyKey);
    };

/**
 *
 * @param key
 */
export const Body = (key: string = undefined) =>
    (target: Object, propertyKey: string | symbol, index_param: number) => {
        const bodyParams: BodyParam[] = Reflect.getOwnMetadata(bodyMetadataKey, target, propertyKey) || [];
        bodyParams.unshift({index_param, key});
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
export const Mapper = <T>(mapper: keyof T) =>
    (target: Object, propertyKey: string | symbol) =>
        Reflect.defineMetadata(mapperMetadataKey, mapper, target, propertyKey);

/**
 *
 * @returns {(target: Object, propertyKey: string) => void}
 * @constructor
 * @param key
 */
export const Header = (key: string = undefined) =>
    (target: Object, propertyKey: string | symbol, index_param: number) => {
        const headers: HeaderParam[] = Reflect.getOwnMetadata(headersMetadataKey, target, propertyKey) || [];
        headers.unshift({index_param, key});
        Reflect.defineMetadata(headersMetadataKey, headers, target, propertyKey);
    }


/**
 *
 * @param {(request: Request_) => Request_} before_
 * @returns {(target: Object, propertyKey: string) => void}
 * @constructor
 */
export const Before = <T>(before_: keyof T) =>
    (target: Object, propertyKey: string) =>
        Reflect.defineMetadata(beforeMetadataKey, before_, target, propertyKey);


/**
 *
 * @param {FeignHandler} handler
 * @returns {(target: Object, propertyKey: string) => void}
 * @constructor
 */
export const HandlerError = <T>(handler: keyof T) =>
    (target: Object, propertyKey: string) =>
        Reflect.defineMetadata(exceptionHandlerMetadataKey, handler, target, propertyKey);
