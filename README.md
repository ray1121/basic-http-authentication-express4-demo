Node作为前后端分离的”利器“由于它使用JS语法的特殊性，可以使得前端更好的利用Node来作为中间层十分方便得调用后台提供的“黑盒”API。即便是使用Node为主作为服务端开发在项目中也会经常用到要去其他的系统调用服务的场景。

请求的认证一直是一个web系统很重要的一环，直接关系到了系统的安全。对于Node在服务端方面，稍微复杂的认证机制使用的最多的就是[passport](https://www.npmjs.com/package/passport)模块，通过它强大而又灵活的Strategy机制，官方同时也提供了很多策略满足很多常见的场景。当然今天的主题是最简单的基础认证 HTTP Basic Authentication，提供了对http最为基础的认证策略，即用户名和密码。对于服务端调用API的场景加上这个基本认证也会比在前端直接使用这种比较“空”的更加合适。

本文将介绍使用Node在服务端调用API时面对最基本的HTTP认证 -- HTTP Basic Authentication认证的处理方式。即不同的服务端`http client`诸如[axios](https://www.npmjs.com/package/axios),[request](https://www.npmjs.com/package/request),[restler](https://www.npmjs.com/package/restler)的使用。

## HTTP Basic Authentication

首先对HTTP Basic Authentication这个最简单的http认证形式进行简单介绍

![HTTP Basic Authentication](https://user-images.githubusercontent.com/22891804/35735459-ccbcd13a-085f-11e8-9a6d-16924a934312.jpg)

上图所示，在客户端进行资源请求的时候由于该接口API设置了http基本认证对资源的访问进行了限制，则客户端必须提供用户名和密码并且服务端验证通过时才会得到资源。

下面将使用使用express搭建一个简单的需要基本认证的接口，需要说明的是在express3中express还集成了很丰富的中间件系统，比如你可以直接通过`app.use(express.basicAuth('username', 'password'));`来设置一个基本认证。在express4开始由于分离了中间件系统,你需要多出一步手动安装[basic-auth](https://www.npmjs.com/package/basic-auth)中间件的过程。

```js
//app.js
const express = require('express')
const basicAuth = require('basic-auth')
const bodyParser = require('body-parser')
const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended:true
   }))
app.all('/api', function (req, res) {
    const credentials = basicAuth(req)
    if (!credentials || credentials.name !== 'ray' || credentials.pass !== '123') {
        res.statusCode = 401
        res.setHeader('WWW-Authenticate', 'Basic realm="example"')
        res.end('go away')
    } else {
        console.log(req.body)
        if(req.body.need && req.body.need === 'money'){
            res.json({
                key: 'show me the money'
            });
        }else{
            res.json({
                key: 'show me the gold'
            })  
        }            
    }
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
```
先简单的搭建起一个提供api的服务器，当你执行`node app.js`之后访问`localhost:3000/api`的时候就会看到浏览器弹出让你输入用户名和密码的对话框，你如果点击了取消，即不提供用户名和密码，或者错误密码，就会验证失败，你将看到‘go away’。当你提供了正确的密码则将得到'show me the gold'。

值得一提的是，express的搭建中,我使用了[body-parser](https://www.npmjs.com/package/body-parser)这个中间件，原因是接下来我们使用node在服务端请求api的时候会使用POST方法传递参数，即我想得到的是'show me the money'这句话。而**http的post请求默认的数据格式是`www-form-urlencoded`**解析的时候需要`bodyParser.urlencoded`支持。

## 在服务端调用API

其实在Node端可以用的`http client`模块有很多，比如可以使用pipe进行流式操作的[request](https://www.npmjs.com/package/request),以及我现在在做的项目中使用的[restler](https://www.npmjs.com/package/restler),当然还有现在很火爆的前后端都可以使用，并且基于现代异步基础--**Promise**的[axios](https://www.npmjs.com/package/axios),接下来就介绍对于这三个模块在服务端去请求一个设了HTTP Basic Authentication认证的API接口，就是从我们上面用express搭起来的简单的服务器得到`'show me the money'`这句话。

### request模块

`npm install --save request`安装request模块到我们项目目录，然后新建`req.js`文件。

```js
//req.js
const request = require('request')

request.post('http://localhost:3000/api', {
    'auth': {
        'user': 'ray',
        'pass': '123',
        'sendImmediately': false
    },
    'form': {
        need: 'money'
    }
}, function (err, httpResponse, data) {
    if (err) {
        console.log(err);
    } else {
        console.log(`data:${data}`)
    }
})
```
`request`模块本身体积确实有点大，上面使用它的`post`方法，通过在第二个参数对象中写上`auth`属性提供对http基础认证所需要的用户名和密码，第二个属性`form`就是放在请求的body中的类型为`application/x-www-form-urlencoded`参数，将会被我们的express服务器通过`req.body`解析到，当然，需要`bodyParser.urlencoded()`提供支持。

接下来，先`node app.js`开启我们的服务器，之后你再去`node req.js`运行这个文件你就会看到`data:{"key":"you get the money"}`了

### axios模块

`npm install --save axios`,新建`axi.js`

```js
//axi.js
const axios = require('axios')

axios({
        url: 'http://localhost:3000/api',
        method: 'post',
        auth: {
            username: 'ray',
            password: '123'
        },
        data: {
            need: 'money'
        }
    })
    .then((response) => {
        console.log(response.data)
    })
    .catch(function (error) {
        console.log(error);
      });
```
`axios`最大的特点就是可以十分愉快的使用Promise，并且它的体积足够的小，它对基础认证的信息同样也是在配置中的`auth`属性，而他所需要随请求放在body中的参数是放在`data`字段中，而且需要注意的是他返回的数据是在返回结果的`data`字段中，同样，此时你`node axi.js`也能得到`{ key: 'you get the money' }`.

### restler模块

`npm install --save restler`,新建`rest.js`

```js
const rest = require('restler')

rest.post('http://localhost:3000/api',{
    username:'ray',
    password:'123',
    data: {
        need:'money'
    }
}).on('complete',function(data){
    console.log(data)
})
```
最后是`restler`模块,需要的认证信息直接是其第二个参数options中的两个字段`username`和`password`,携带在body中的信息依旧是放在`data`字段中，用监听事件的方式监听`complete`事件发生触发回调函数你就得到了通过验证的消息`{ key: 'you get the money' }`。

当然上述三个模块以及浏览器发送请求不带认证信息都将得到带着401的"go away",三个模块不在请求的body中带上参数`need`都会”show you the gold”。

## 后续

最后，如果有错误与不足还希望您能指出:)
[完整demo地址](https://github.com/ray1121/basic-http-authentication-express4-demo)
```
git clone https://github.com/ray1121/basic-http-authentication-express4-demo

cd basic-http-authentication-express4-demo && npm install 

//Then you can test and modify to use the another modules' methods
```
[个人博客站](https://isliulei.com)
