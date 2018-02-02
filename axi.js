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