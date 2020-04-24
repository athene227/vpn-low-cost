const http = require("http");
let strMsg = "";
let responseMsg = "";
var body1 = "";
var body2 = "";
let message = [];

http.createServer(function (request, response){
  request.on("data", (chunk) =>{
    strMsg = "";
    responseMsg += chunk;
}).on("end", () => {
    console.log(responseMsg);
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end(responseMsg);
  });
}).listen(8081);

console.log("server is running!");
