"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constans_1 = require("./constans");
class UtilsHttp {
    /**
     *
     * @param {Param[]} params
     * @param argumentsHttp
     * @returns {string}
     */
    static prepareQueryParams(params, argumentsHttp) {
        let queryParamsUrl = '?';
        const ampersan = '&';
        const empty = String();
        params = params
            .filter(param => argumentsHttp[param.index_param]);
        params
            .forEach((param, index) => {
            if (typeof argumentsHttp[param.index_param] === 'object') {
                const keys = Object.keys(argumentsHttp[param.index_param]) || [];
                let tempCont = 0;
                for (const key in argumentsHttp[param.index_param]) {
                    queryParamsUrl = queryParamsUrl.concat(`${key}=${argumentsHttp[param.index_param][key]}${tempCont === keys.length - 1 ? empty : ampersan}`);
                    tempCont++;
                }
            }
            else {
                if (!param.key)
                    return;
                queryParamsUrl = queryParamsUrl.length > 1 ? queryParamsUrl.concat(ampersan) : queryParamsUrl;
                queryParamsUrl = queryParamsUrl.concat(`${param.key}=${argumentsHttp[param.index_param]}${index === params.length - 1 ? empty : ampersan}`);
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
    static preparePathParams(pathParam, argumentsHttp, url) {
        url = url.replace(/\s/g, '').trim();
        const wrapOpen = '{';
        const wrapClose = '}';
        pathParam
            .filter(param => param.key)
            .forEach(param => {
            if (!param.key)
                return;
            const pathParam = wrapOpen.concat(param.key.toString()).concat(wrapClose);
            if (url.includes(pathParam))
                url = url.replace(pathParam, argumentsHttp[param.index_param]);
        });
        pathParam
            .filter(param => !param.key)
            .map(param => url += `/${argumentsHttp[param.index_param]}`);
        argumentsHttp
            .filter(arg => arg && typeof arg === 'object')
            .forEach(obj => Object.keys(obj).forEach(key => {
            const keyPathParam = Reflect.getMetadata(constans_1.pathParamPropertyMetadataKey, obj, key);
            if (keyPathParam)
                url = url.replace(`{${keyPathParam.name}}`, obj[keyPathParam.name]);
        }));
        return url;
    }
    /**
     *
     * @param {number[]} params
     * @param argumentsHttp
     * @returns {any}
     */
    static prepareBody(params = [], argumentsHttp = []) {
        if (params.length === 1 && !params[0].key) {
            return argumentsHttp[params[0].index_param];
        }
        let body = {};
        params
            .forEach(i => body = Object.assign(Object(), body, i.key ? { [i.key]: argumentsHttp[i.index_param] } : argumentsHttp[i.index_param]));
        return body;
    }
    /**
     *
     * @param params
     * @param argumentsHttp
     */
    static prepareHeaders(params = [], argumentsHttp = []) {
        let headers = {};
        params
            .filter(i => argumentsHttp[i.index_param])
            .forEach(i => headers = Object.assign(Object(), headers, i.key ? { [i.key]: argumentsHttp[i.index_param] } : argumentsHttp[i.index_param]));
        return headers;
    }
}
exports.UtilsHttp = UtilsHttp;
