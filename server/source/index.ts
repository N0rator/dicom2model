import express from "express";
import http from 'http';
import socketIo from 'socket.io';

const app = express();
const server = new http.Server(app);
const io = socketIo(server);
const port = process.env.PORT || 3000;

// var app = require('express')();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);
// var port = process.env.PORT || 3000;

app.get('/', (req: express.Request, res: express.Response) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket: socketIo.Socket){
    socket.on('chat message', function(msg: any){
        console.log('New Message: ' + msg);
        io.emit('chat message', msg);
    });
});

server.listen(port, function(){
    console.log('listening on *:' + port);
});