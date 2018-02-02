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
                key: 'you get the money'
            });
        }else{
            res.json({
                key: 'you get the gold'
            })  
        }            
    }
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

