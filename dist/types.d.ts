/**
 *
 */
import { AxiosAdapter, AxiosBasicCredentials, AxiosError, AxiosProxyConfig } from "axios";
import { Observable } from "rxjs";
/**
 *
 */
export declare class FeignRequestException {
    error: AxiosError;
    constructor(error: AxiosError);
}
/**
 *
 */
export declare type HttpObservable<O> = void & Observable<O>;
/**
 *
 */
/**
 *
 */
export interface PathProperty {
    name: string;
}
/**
 *
 */
interface Param {
    index_param: number;
    key?: string;
}
/**
 *
 */
export declare type BodyParam = Param;
export declare type HeaderParam = Param;
export declare type PathParams = Param;
export declare type QueryParam = Param;
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
/**
 *
 */
export declare type FeignConfigMethod = Partial<Pick<FeignConfig, Exclude<keyof FeignConfig, 'url' | 'headers'>>>;
/**
 *
 */
export interface FeignInterceptor {
    intercep(req: FeignRequest): FeignRequest;
}
/**
 *
 */
export declare type FeignHandler = <U extends FeignRequestException>(error: AxiosError) => U;
export {};
/**
 *
 */
