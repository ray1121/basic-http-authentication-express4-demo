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