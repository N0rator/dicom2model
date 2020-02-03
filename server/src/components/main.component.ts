import express from "express";
import http from 'http';
import socketIo from 'socket.io';
import fs from 'fs';
import ServerLogger from '../shared/ServerLogger.service';
import User from "../models/User.model";
import SocketLogger from "../shared/SocketLogger.service";
import IndexGenerator from "../shared/IndexGenerator.service";
import {LogMessageTypes} from "../models/LogMessageTypes.enum";
import IndexedFile from "../models/IndexedFile.model";
import UserData from "../models/UserData.model";

const app = express();
const server = new http.Server(app);
const io = socketIo(server);
const port = process.env.PORT || 3000;

const serverLogger = new ServerLogger();
const FILES_ROOT_DIRECTORY = __dirname + '\\user_files';

serverLogger.info('app started');

let users: User[] = [];

io.on('connection', (socket: socketIo.Socket) => {
    let user: User = {
        id: IndexGenerator.getIndex(),
        connection: socket,
    };
    users.push(user);
    let socketLogger = new SocketLogger(user);
    socketLogger.log('connection established', LogMessageTypes.INFO);

    /**
     * Data object that's used for storing data from user
     */
    let data: UserData = {
        filesInfo: {},
        indexedFiles: []
    };

    /**
     * Resets data from user, sets new data.filesInfo
     */
    socket.on('sendBlob.blobInfo', (blobInfo: UserData) => {
        socketLogger.log(`sendBlob.blobInfo`, LogMessageTypes.INFO);
        socketLogger.logObject(blobInfo, LogMessageTypes.INFO);
        ({...data.filesInfo} = blobInfo);
    });

    /**
     * Saves received file to data.files
     */
    socket.on('sendBlob.file', (indexedFile: IndexedFile) => {
        data.indexedFiles.push(indexedFile);
        socketLogger.log(`sendBlob.file got indexedFile {index: ${indexedFile.index}, filename: ${indexedFile.filename}, blob}`)
        if (data.indexedFiles.length === data.filesInfo.size) {
            socketLogger.log(`got all ${data.indexedFiles.length} files, executing onFilesLoad()..`, LogMessageTypes.INFO);
            try {
                onFilesLoad(data.indexedFiles, user.id);
            } catch (e) {
                // TODO handle bad execution
            }
        }
    });

    socket.on('disconnect', () => {
        socketLogger.log('connection closed', LogMessageTypes.INFO);
    });
});

/**
 * Creates root user files directory if it doesn't exist
 */
let createLogDirectory = () => {
    let filesDirectory = FILES_ROOT_DIRECTORY;
    if (!fs.existsSync(filesDirectory)) {
        serverLogger.info(`creating root files directory {dirName: ${filesDirectory}}`);
        fs.mkdirSync(filesDirectory);
    }
}

let onFilesLoad = (indexedFiles: IndexedFile[], userId: number) => {
    let userFilesDirectory = FILES_ROOT_DIRECTORY + '/' + userId;

    createLogDirectory();

    if (!fs.existsSync(userFilesDirectory)) {
        serverLogger.info(`creating directory for user {userId: ${userId}`);
        fs.mkdirSync(userFilesDirectory);
    }

    indexedFiles.forEach(indexedFile => {
        fs.writeFile(userFilesDirectory + '\\' + `${indexedFile.index}#${indexedFile.filename}`, Buffer.from(indexedFile.blob), (error) => {
            if (error) {
                let errorMessage = `Unable to save file {index: ${indexedFile.index}, filename: ${indexedFile.filename}, userId: ${userId}`;
                serverLogger.error(errorMessage);
                throw Error(errorMessage);
            }
        });
    })
}

server.listen(port, () => serverLogger.info('listening to localhost:' + port));