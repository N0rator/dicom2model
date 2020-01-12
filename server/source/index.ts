import express from "express";
import http from 'http';
import socketIo from 'socket.io';
import fs from 'fs';
import { Logger } from './models/logger';

const app = express();
const server = new http.Server(app);
const io = socketIo(server);
const port = process.env.PORT || 3000;

const logsDir = __dirname + '\\logs';
const logger = new Logger(true, true, logsDir);

// var app = require('express')();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);
// var port = process.env.PORT || 3000;

logger.info('App started.');

app.get('/', (req: express.Request, res: express.Response) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket: socketIo.Socket){
    logger.info('user ' + socket.id + ' connected');

    socket.on('chat message', function(msg: any){
        console.log('New Message: ' + msg);
        io.emit('chat message', msg);
    });

    socket.on('start uploading', (filesInfo: Array<any>)=>{
        logger.info('user ' + socket.id + ' start upload ' + filesInfo.length + ' files.');

        let filesDirectory = __dirname + '/files';

        if (!fs.existsSync(filesDirectory)){
            logger.info('creating directory for files');
            fs.mkdirSync(filesDirectory);
        }

        let userFilesDir = filesDirectory + '/' + socket.id;

        if (!fs.existsSync(userFilesDir)){
            logger.info('creating directory for user ' + socket.id);
            fs.mkdirSync(userFilesDir);
        }

        let info = filesInfo || [];

        let savedFiles: Array<string> = [];

        socket.on('upload file', (file: any)=>{
            let fileName = file.name || null;
            let data = file.data || null;

            fs.writeFile(userFilesDir + '/' + fileName, Buffer.from(data), (error) => {
                if(error) {
                    logger.error('failed to save file "' + fileName + '"');
                }

                savedFiles.push(fileName);

                checkSaved(info, savedFiles);

            });


        });

        function checkSaved(info: Array<{name: string, size: number}>, saved: Array<string>){
            if(info.length === saved.length){
                logger.info(socket.id + ' user\'s files saved.');
                socket.emit('end uploading', {result: 'success'});
            }
        }
    });
});



server.listen(port, function(){
    logger.info('listening on *:' + port);
});