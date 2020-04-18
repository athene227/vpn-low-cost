const http = require("http");
http.createServer(function (request, response){
  console.log(request.data);
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Hello to you too\n');
}).listen(8081);

console.log("server is running!");
