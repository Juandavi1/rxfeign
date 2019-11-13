import {
	addInterceptors,
	Body,
	Client,
	FeignInterceptor,
	FeignRequest,
	Get,
	HttpObservable,
	PathParam,
	Query,
	Post, Header, PathParamProperty, Put, Mapper, Before, HandlerError
} from "../src";


export class Posts{
	@PathParamProperty()
	public id: number;
	public userId: string;
	public title: string;
	public body: string
	constructor(){}
}

export const URL = 'https://jsonplaceholder.typicode.com/posts'

@Client({
	url: URL
})
export class RepoPost implements FeignInterceptor{

	constructor(){
		addInterceptors(this)
	}

	@Get('{id}')
	public getPost(@PathParam('id') id: number): HttpObservable<Posts>{}

	@Get()
	public getPostWithQuery(@PathParam() id: number, @Query('name') query: string): HttpObservable<Posts>{}

	@Post()
	public createPost(@Body() body): HttpObservable<Posts>{}

	@Post()
	public createPost2(@Body('data') body: Posts): HttpObservable<Posts>{}

	@Put('{id}')
	public update(@Body() body: Posts): HttpObservable<Posts>{}

	@Get('{id}')
	@Mapper<RepoPost>('map')
	public getAndMap(@PathParam('id') id: number): HttpObservable<Posts>{}

	public map(response){
		return {}
	}

	public intercep(req: FeignRequest): FeignRequest {
		// console.log(req.headers)
		return req;
	}

}

