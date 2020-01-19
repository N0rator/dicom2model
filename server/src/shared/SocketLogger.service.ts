import {LogMessageTypes} from "../models/LogMessageTypes.enum";

// TODO implement saving logs to file
// TODO implement re-instantiating Logger from .log file (if user reconnects)
export default class SocketLogger {
    private userSocket;
    private socketLog: string[] = []; // array of user messages

    constructor(userSocket) {
        this.userSocket = userSocket;
    }

    /**
     * Prints log message of provided type to console without DMY, stores message with DMY to socketLog.
     * Message format: 'D.M.Y H:m:S messageType this.userSocket.id | messageText'
     */
    log = (messageText: string, messageType: LogMessageTypes = LogMessageTypes.DEBUG) => {
        let t = new Date();
        messageText = `${t.getUTCHours()}:${t.getUTCMinutes()}:${t.getUTCSeconds()} ${messageType} ${this.userSocket.id} | ${messageText}`;
        console.log(messageText);
        messageText = `${t.getUTCDay()}.${t.getUTCMonth()}.${t.getUTCFullYear()} ${messageText}`;
        this.socketLog.push(messageText);
    }

    // TODO with use of capturing groups, transform objects in something readable
    logObject = (object: any, messageType?: LogMessageTypes) => this.log(JSON.stringify(object), messageType)

    getSocketLog = () => this.socketLog;
}
