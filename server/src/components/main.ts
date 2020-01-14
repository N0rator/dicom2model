import express from "express";
import http from 'http';
import socketIo from 'socket.io';
import fs from 'fs';
import Logger from '../shared/Logger';
import User from "../models/User.model";
import SocketLogger from "../shared/SocketLogger.service";
import IndexGenerator from "../shared/IndexGenerator.service";
import {LogMessageTypes} from "../models/LogMessageTypes.enum";

const app = express();
const server = new http.Server(app);
const io = socketIo(server);
const port = process.env.PORT || 3000;

const logsDir = __dirname + '\logs';
const logger = new Logger(true, true, logsDir);
logger.info('App started');

let users: User[] = [];

io.on('connection', (socket: socketIo.Socket) => {
    let socketLogger = new SocketLogger(socket);
    let user = {connection: socket, logger: socketLogger, id: IndexGenerator.getIndex()};
    users.push(user);
    socketLogger.log('connection established', LogMessageTypes.INFO);

    /**
     * Data object that's used for storing data from user.
     */
    let data: {
        filesInfo?: any,
        files: File[],
    } = {files: []};

    /**
     * Resets data from user, sets new data.filesInfo
     */
    socket.on('sendBlob.blobInfo', blobInfo => {
        socketLogger.log(`sendBlob.blobInfo:`, LogMessageTypes.INFO);
        socketLogger.logObject(blobInfo, LogMessageTypes.INFO);
        data = {filesInfo: blobInfo, files: []};
    });

    /**
     * Saves received file to data.files
     */
    socket.on('sendBlob.file', (fileBlob: File) => {
        data.files.push(fileBlob);
        socketLogger.log(`sendBlob.file got fileBlob #${data.files.length}`)
        if (data.files.length === data.filesInfo.size) {
            onFilesLoad(data.files, user.id);
        }
    });

    socket.on('disconnect', () => {
       socketLogger.log('connection closed', LogMessageTypes.INFO);
    });
});

let onFilesLoad = (files: any[], userId: number) => {
    let filesDirectory = __dirname + '/files';
    let userFilesDir = filesDirectory + '/' + userId;
    if (!fs.existsSync(filesDirectory)){
        logger.info('creating directory for files');
        fs.mkdirSync(filesDirectory);
    }
    if (!fs.existsSync(userFilesDir)){
        logger.info('creating directory for user ' + userId);
        fs.mkdirSync(userFilesDir);
    }

    let fileIndex = 0;
    files.forEach(file => {
        fs.writeFile(userFilesDir + '/' + fileIndex++, Buffer.from(file), (error) => {
            if (error) {
                logger.error('failed to save file "' + fileIndex + '"');
            }
        });
    })
}

server.listen(port, () => logger.info('Listening on *:' + port));