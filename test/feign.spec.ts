import axios from 'axios';
import MockAdapter from "axios-mock-adapter";
import {ResponseMock} from "./mock";
import {Posts, RepoPost, URL} from "./Post";
import {FeignRequestException} from "../src";

const mock = new MockAdapter(axios, { delayResponse: 0 });
const req = new RepoPost()

describe('RxFeign', () => {


	it('should make request with path param', () => {

		const response = ResponseMock.getPost()

		mock.onGet(URL + '/1', )
			.reply(200, response, );

		return req
			.getPost(1)
			.toPromise()
			.then(a => {
				expect(a).toBeTruthy()
				expect(a).toEqual(response)
				expect(a.title).toEqual(response.title)
			})
	});

	it('should make request with a query', () => {

		const response = ResponseMock.getPost()

		mock
			.onGet(URL+'//2?name=juan')
			.reply(200, response,)

		return req
			.getPostWithQuery(2, 'juan')
			.toPromise()
			.then(a => {
				expect(a).toBeTruthy()
				expect(a).toEqual(response)
				expect(a.title).toEqual(response.title)
				expect(a.id).toEqual(response.id)
				expect(a.body).toEqual(response.body)
			})
	});


	it('should to do request post with body', () => {

		const response = ResponseMock.getPost()

		mock
			.onPost(URL+'/', response)
			.reply(201, response,)

		return req
			.createPost(response)
			.toPromise()
			.then(a => {
				expect(a).toBeTruthy()
				expect(a).toEqual(response)
			})
	});

	it('should to do request post with body into key data', () => {

		const response = ResponseMock.getPost()

		mock
			.onPost(URL+'/', { data: response })
			.reply(201, response)

		return req
			.createPost2(response)
			.toPromise()
			.then(a => {
				expect(a).toBeTruthy()
				expect(a).toEqual(response)
			})
	});

	it('should to do request and throw exception', () => {

		const response = ResponseMock.getPost()

		mock
			.onPost(URL+'/', { data: response })
			.networkError()

		return req
			.createPost2(response)
			.toPromise()
			.then()
			.catch(a => {
				expect(a).toBeInstanceOf(FeignRequestException)
				expect(a.error).toBeTruthy()
			})
	});

	it('should to do request to update post', () => {

		const response = new Posts()
		response.id = 1
		response.body = 'dfg'
		response.title = 'ddvf'
		response.body = 'sfgdsjg'

		mock
			.onPut(URL+'/1', response)
			.replyOnce(204, response)

		return req
			.update(response)
			.toPromise()
			.then(resp => {
				expect(resp).toEqual(response)
			})
	});


	it('should make request and map response', () => {

		const response = ResponseMock.getPost()

		mock.onGet(URL + '/1', )
			.reply(200, response, );

		return req
			.getAndMap(1)
			.toPromise()
			.then(a => {
				expect(a).toBeTruthy()
				expect(a).not.toEqual(response.title)
				expect(a).not.toEqual(response.body)
				expect(a).not.toEqual(response.id)
				expect(a).toEqual(Object())
			})
	});


});
