### RxFeign

#### Motivacion
realizar peticiones por medio de anotaciones. servidor y cliente.

#### Instalacion 
```sh
$ yarn add rxfeign

$ npm install --save rxfeign
```

#### Anotaciones
   - *@Client*  
   Esta anotacion permite definir la configuracion global para todos los request dentro de la clase.
   
   Recibe dos tipos de parametro, un string u objeto
   
        * string : url base (http://domain/)
        * objecto : Los atributos seran pasados a la instancia de axios

```typescript
    export interface FeignConfig {
        url?: string;
        headers?: { [key: string]: any };
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
```   
   ejemplo: 
```typescript
    @Client({
        url: 'https://jsonplaceholder.typicode.com/posts/',
        headers:{}, 
        timeout:99
    })
    export class User{}
    
    o
    
    @Client('https://jsonplaceholder.typicode.com/posts/')
    export class User{}
```
   - *@Config*  
   Esta anotacion recibe por parametro el mismo objeto que se define en la anotacion *@Client*
   pero esta configuracion solo aplicara para el metodo anotado, si hay atributos igual que en *@Client* entonces seran sobrescritos. En el siguiente ejemplo, el timeout del request sera *1*.
   
```typescript
    @Client({
     url: 'https://jsonplaceholder.typicode.com/posts/',
     timeout:99 // sobrescrito
    })
    export class Post{
        
        @Get()
        @Config({
            timeout: 1
        })
        public findById(
            @PathParam() id: number
        ): HttpObservable<MyClass>{}
    }
```
   
   - *@Get/@Post/@Put/@Patch/@Delete*   
   Recibe por parametro la url que ira junto con la url base.
```typescript
    @Client('https://jsonplaceholder.typicode.com/posts/')
    export class Post {
    
      constructor(){}
    
      @Get('{id}/any')
      public findById(
        @PathParam('id') id: number,
      ): HttpObservable<MyClass> {}
    }
```
   - *@PathParam*       
   Recibe por parametro el string que contiene el id que coincide con la expresion en la url como se ve en el ejemplo anterior. Este parametro es opcional, si no se define entonces se agregara al final de la url. 

```typescript
    @Client('https://jsonplaceholder.typicode.com/posts/')
    export class User {
    
      constructor(){}
    
      @Get('{id}')
      public findById(
        @PathParam('id') id: number,
      ): HttpObservable<PostModel> {}
    }
    
    es equivalente a 
    
    @Client('https://jsonplaceholder.typicode.com/posts/')
    export class User {
    
      constructor(){}
    
      @Get()
      public findById(
        @PathParam() id: number,
      ): HttpObservable<PostModel> {}
    }

    new User().findById(1).subscribe(console.log)
```
   
   
   - *@Query*  
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
   y no se define el string que se pasa por parametro en la anotacion. 
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
    
   - *@Body*  
   El objeto que se reciba por parametro en el metodo sera el body de la peticion. 
   
   Ademas de eso, con anotacion *@PathParamProperty* se puede
   definir el parametro que ira en la url a traves del objecto que ira en el body. 
   La salida del siguiente ejemplo sera la siguiente:   

```typescript

    class PostModel{
    
        @PathParamProperty() // el valor que tenga este atributo ira en la url.
        public id: string
        
        public name: string
        
        constructor(id, name){
            this.name = name
            this.id = id
        }
    }
    
    @Post('{id}/any')
    public create(
        @Body() object: PostModel // new PostModel(88,"Bodyy")
    ): HttpObservable<PostModel> {}

    Tambien se puede definir un string en el parametro de la anotacion para que sea el key dentro del objeto en el body del request. 
    En el ejemplo anterior el body del request sera el objeto que se reciba por parametro, en este caso una instancia de PostModel.
    Pero de esta forma:
  
    @Post('{id}/any')
    public create(
        @Body('payload') object: PostModel // new PostModel(88,"Bodyy")
    ): HttpObservable<PostModel> {}

    El objeto en el body sera:
    
    {
      payload: {
        ...instancePostModel
      }   
    } 
     
```

   - *@Mapper*:  
   Es el map de rxjs. Lo que retorne esta funcion, sera lo que retorna el metodo con la anotacion. 
   
```typescript
    @Client(...)
    export class Class {
        
        public map(body): number{
            return body.id as number
        }
    
        @Mapper<Class>('map')
        @Post('{id}')
        public create(
            @Body object: PostModel // new PostModel(88,"Bodyy")
        ): HttpObservable<number> {}
    }

    new Class().create(new PostModel(88,"Bodyy")).subscribe(console.log)

```

   - *@Before*:  
   Este metodo permite interceptar el request antes de enviar la peticion.
   Se llamara antes que los interceptores (ya veremos los interceptores).  
   El metodo pasado por parametro recibe un objeto de tipo Request que esta definido de la siguiente manera: 
   
```typescript
    export interface FeignRequest {
        readonly method: string,
        body: any,
        readonly headers: HeadersHttp,
        readonly url: string
    }
```
```typescript
    @Client(...)
    export class Class {
        public before(req: FeignRequest): FeignRequest{
            req.headers.set("otro","header")
            req.body = {
                ...body,
                otro:"atributo en el body"
            }
            return req
        }
    
        @Before<Class>('before')
        @Post('{id}')
        public create(
            @Body object: PostModel 
        ): HttpObservable<number> {}
    }

    new Class().create(new PostModel(88,"Bodyy")).subscribe(console.log)
```

   - *@Header*  
   Permite establecer headers especificos para ese request.
```typescript       
    @Post('{id}')
    public create(
        @Header() obj: Object
    ): HttpObservable<number> {}

    tambien se puede definir una key para el value que llega por parametro.

    @Post('{id}')
    public create(
        @Header('auth') value: string
    ): HttpObservable<number> {}

```

   - *@HandlerError*  
   Este metodo que se pasa por parametro recibe una instancia de tipo *__AxiosError__* y debe retornar la instancia que sera lanzada como excepcion.
   Se espera que el usuario tenga establecido un manejador de excepciones global.
   Se puede lanzar una excepcion custom heredando de __FeignRequestException__
   Si no se define esta anotacion y hay un error entonces se lanzara una excepcion de tipo __FeignRequestException__
   el cual esta definido de la siguiente manera: 

```typescript        
        export class FeignRequestException {
            constructor(
                public error: AxiosError,
            ) {}
        }
```
   
   
```typescript
    export class Class {
        
        public error<MyClass extends FeignRequestException>(error: AxiosError): MyClase {
            if(error.response.status === 404){
                return new NotFoundHttp(...)
            }else{
                return new MyClass(...)
            }
        }
    
        @HandlerError<Class>('error')
        @Post('{id}')
        public create(
            @Body object: PostModel // new PostModel(88,"Bodyy")
        ): HttpObservable<number> {}
    }
```

   - *addInterceptor*  
   Los interceptores se deben agregar en el main de la aplicacion.
   Recibe por parametro instancias que implemente la interfaz *FeignInterceptor* 
   Estos interceptores se llaman en todos los request que se realicen y despues de la anotacion *@Before* que este definida en los metodos. Es similar a la anotacion @Before solo que esta forma es global, todos los request pasaran por ahi.

```typescript
    
    import { addInterceptors, FeignInterceptor } from 'rxfeign';


    export class Main implements FeignInterceptor {
        
        public start(): void{
            addInterceptors(this)
        }
        
        public intercep(req: Request_): Request_{
            this.logger.info(req) // for example
            return req
        }
    }
```
