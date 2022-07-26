# node-chat

A simple anonymous chat application in Node. It implements a simple, completely anonymous chat session for multiple clients. `POST` new message to _"/chat"_, or `GET` a `text/event-stream` of messages. You can make the request to _"/"_ and the chat UI will be returned.

Run _chatServer.js_ using node.

<pre>
$> node chatServer.js
</pre>

The server listens on `localhost:8000` by default. This can be changed on line 11 of _chatServer.js_.

After starting the server, go to _localhost:8000_ in a browser. You will be prompted for a nickname.




