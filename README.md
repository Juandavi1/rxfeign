### RxFeign (Request en Cliente y Servidor)
#### IMPORTANTE
Este primer release solo tiene unas cuantas funcionalidades basicas,
si necesitas hacer request con mucha mas configuracion mejor busca otra libreria. 
#### Motivacion
realizar peticiones por medio de anotaciones
#### Instalacion 
```sh
$ yarn add @akanass/rx-http-request rxjs rxfeign

or

$ npm install --save @akanass/rx-http-request rxjs rxfeign
```
```typescript
import { Get , Client,PathParam, Query, HttpObservable } from 'rxfeign';
```
#### Anotaciones
   - *@Client*
   recibe dos tipos de parametro, un string o un objeto
        * string : url base (http://domain/)
        * objecto : este objeto por el momento solo tiene dos atributos, la url base y los headers 
            globales para todos los request que se hacen dentro de esa clase.  
            Si no se define el header __Content-Type__ por defecto es __application/json__.
   
```typescript
@Client({
 url: 'https://jsonplaceholder.typicode.com/posts/',
 headers:{}  // opcional
})
export class Post{}

o

@Client('https://jsonplaceholder.typicode.com/posts/')
export class Post{}
```
   
   - *@Get/@Post/@Put/@Patch/@Delete*   
   recibe por parametro la url que ira junto con la url base y el segundo parametro sera
    la clase en la que se encuentra.
   
```typescript
    @Client('https://jsonplaceholder.typicode.com/posts/')
    export class Post {
    
      constructor(){}
    
      @Get('{id}')
      public findById(
        @PathParam('id') id: number,
      ): HttpObservable<PostModel> {}
    }
```
   - *@pathParam*       
   recibe por parametro el string que contiene el id que coincide con la expresion en la url como se    ve en el ejemplo   anterio. Este parametro es opcional, si no se define entonces se agregara al     final de la url. 
   
   - *@query*  
   recibe por parametro un string con el nombre que ira el query en la url.  
   el resultado del siguiente ejemplo seria :
   __/1?attr=holaa__
   
```typescript
@Get('{id}')
public findById(
    @PathParam('id') id: number, // 1
    @Query('attr') value: number|string // holaa
): HttpObservable<PostModel> {}
```
   si el parametro que se pasa es un objeto, se mapeara cada atributo valor en la url 
   y no se define el string que se pasa por parametro. 
   la salida del siguiente ejemplo seria la siguiente:  
   __/1?attr=holaa&name=lord&id=99__
   
```typescript

class PostModel{
    constructor(
        public name: string,
        public id: string
    ){}
}

@Get('{id}')
public findById(
    @PathParam('id') id: number, // 1
    @Query('attr') value: number|string // holaa
    @Query() value: PostModel // new PostModel('lord',99)
): HttpObservable<PostModel> {}
```
