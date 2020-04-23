const http = require("http");
let strMsg = "";
let responseMsg = "";
var body1 = "";
var body2 = "";
let message = [];

http.createServer(function (request, response){
  request.on("data", (chunk) =>{
    strMsg = "";
    strMsg += chunk;
    message = strMsg.split(", ");
    body1 = "";
    body2 = "";
    body1 = message[0];
    body2 = message[1];
    responseMsg = "";
}).on("end", () => {
    responseMsg += "Hello " + body1 + " " + body2 + "\n";
    console.log(responseMsg);
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end(responseMsg);
  });
}).listen(8081);

console.log("server is running!");
