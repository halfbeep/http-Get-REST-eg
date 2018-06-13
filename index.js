const http = require('http')
const https = require('https')

let visits = 0

const server = http.createServer(function (req, resObjClient) {

    console.log('New Connection')

    visits++

    resObjClient.writeHead(200, {'Content-Type': 'text/plain'})
    resObjClient.write('Hi\n')
    resObjClient.write('We have had ' + visits + ' visits')
    resObjClient.end()

    let reqParam = req.url.replace('/', '')
    reqParam = reqParam.replace(':favicon.ico', '')

    const options = {
        hostname: 'api.github.com',
        port: 443,
        path: '/search/repositories?q=tetris+language:' + reqParam + '&sort=stars&order=desc',
        method: 'GET'
    }

    const callback = function (resObjServer) {

        const { statusCode } = resObjServer;

        const contentType = resObjServer.headers['content-type']

        let error

        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                `Status Code: ${statusCode}`)

        } else if (!/^application\/json/.test(contentType)) {
            error = new Error('Invalid content-type.\n' +
                `Expected application/json but received ${contentType}`)

        }
        if (error) {

            console.error(error.message);

            // consume response data to free up memory
            resObjServer.resume();

            return;

        }

        resObjServer.setEncoding('utf8');

        let rawData = '';

        resObjServer.on('data', (chunk) => { rawData += chunk; });

        resObjServer.on('end', () => {

            try {

                const parsedData = JSON.parse(rawData);

                for(let i = 0; i < parsedData['items'].length; i++)
                {

                    console.log(parsedData['items'][i].id)

                }


            } catch (e) {
            console.error(e.message)
            }
        })
    }

    var reqObjServer = https.request(options, callback)
    reqObjServer.setHeader('user-agent', 'git foo blah')
    reqObjServer.setHeader('accept','application/json')
    // console.log(reqObjServer)
    reqObjServer.end()

})

server.listen(8080)

console.log('Server Started ')