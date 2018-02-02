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