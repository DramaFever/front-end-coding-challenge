// see https://github.com/cloudhead/node-static/issues/188, cannot disable cache with CLI

const st = require('node-static');
const fileServer = new st.Server("./public", {
    cache: 0,
    headers: {
        'Cache-Control': 'no-cache, must-revalidate'
    }
});

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}).listen(8080);