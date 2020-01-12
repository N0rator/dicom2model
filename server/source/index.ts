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
logger.info('App started.');

app.get('/', (req: express.Request, res: express.Response) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket: socketIo.Socket){
    logger.info('user ' + socket.id + ' connected');

    socket.on('start uploading', uploadingHandler);

    socket.on('send coefficients', sendCoefficientsHandler)

    function uploadingHandler(filesInfo: Array<{name: string, size: number}>) {
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
    }

    function sendCoefficientsHandler(coefficients: {min: number, max: number}){
        logger.info('Received a coefficients from user ' + socket.id);

        // Checking for user's files existence
        let userFiles = getUserFiles(socket.id);
        if(!userFiles.length) {
            logger.error('Didn\'t found files of "' + socket.id + '" user.');
            socket.emit('result coefficients', {status: 'error', error: 'Didn\'t found files of "' + socket.id + '" user'});
        } else {
            logger.info('Found ' + userFiles.length + ' files of "' + socket.id + '" user.');
        }

        //TODO add functionality to start building model.

        function getUserFiles(user: string) : Array<string> {
            let userFilesDir = __dirname + '/files/' + user;

            if (!fs.existsSync(userFilesDir) ||
                (fs.existsSync(userFilesDir) && fs.readdirSync(userFilesDir).length)){
                return [];
            }
            else{
                return fs.readdirSync(userFilesDir);
            }
        }
    }
});



server.listen(port, function(){
    logger.info('Listening on *:' + port);
});