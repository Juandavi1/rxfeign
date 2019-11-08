import { BodyParam, HeaderParam, PathParams, QueryParam } from "./types";
export declare class UtilsHttp {
    /**
     *
     * @param {Param[]} params
     * @param argumentsHttp
     * @returns {string}
     */
    static prepareQueryParams(params: QueryParam[], argumentsHttp: any): string;
    /**
     *
     * @param {Param[]} pathParam
     * @param argumentsHttp
     * @param {string} url
     * @returns {string}
     */
    static preparePathParams(pathParam: PathParams[], argumentsHttp: any, url: string): string;
    /**
     *
     * @param {number[]} params
     * @param argumentsHttp
     * @returns {any}
     */
    static prepareBody(params?: BodyParam[], argumentsHttp?: any[]): any;
    /**
     *
     * @param params
     * @param argumentsHttp
     */
    static prepareHeaders(params?: HeaderParam[], argumentsHttp?: any[]): any;
}
