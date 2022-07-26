const http = require("http")
const fs = require("fs")
const url = require("url")

const clientHTML = fs.readFileSync("chatClient.html");

// an array of ServerResponse objects that we're going to send events to
let clients = [];

let server = new http.Server();
server.listen(8000);

// runs when a server gets a new request
server.on("request", (request, response) => {
    let pathname = url.parse(request.url).pathname;

    // if the request was for root, send the client-side chat UI
    if (pathname == "/") {
        // load the chatClient.html file
        response.writeHead(200, {"Content-Type": "text/html"}).end(clientHTML);
    // no other path allowed
    } else if (pathname !== "/chat" || (request.method !== "GET"
                && request.method !== "POST")) {
            response.writeHead(404).end();
    // if /chat was a GET, then a client is connecting
    } else if (request.method === "GET") {
        acceptNewClient(request, response);
    // otherwise, the /chat request is a POST of a new message
    } else {
        broadcastNewMessage(request, response);
    }
});

// hand the GET request for /chat
function acceptNewClient(request, response) {
    clients.push(response);

    request.connection.on("end", ()=> {
        clients.splice(clients.indexOf(response), 1);
        response.end();
    });

    response.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Connection":   "keep-alive",
        "Cache-Control": "no-cache"
    });
    response.write("event: chat\ndata: Connected\n\n");
    // do not call `response.end()` here to keep connection open.
}


// handles POST requests to /chat, new message.
async function broadcastNewMessage(request, response) {
    // read the body of the request and get the message
    request.setEncoding("utf-8");
    let body = "";
    for await (let chunk of request) {
        body += chunk
    }

    // when body is read send an empty response and close connection
    response.writeHead(200).end();

    // format in text/event-stream
    let message = "data:" + body.replace("\n", "\ndata: ");

    // chat event prefix
    let event = `event: chat\n${message}\n\n`;

    // send the event to all the listening clients
    clients.forEach(client => client.write(event));
}