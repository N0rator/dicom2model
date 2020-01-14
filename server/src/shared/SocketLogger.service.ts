import {LogMessageTypes} from "../models/LogMessageTypes.enum";

export default class SocketLogger {
    private userSocket;
    private socketLog: string[] = []; // array of user messages

    constructor(userSocket) {
        this.userSocket = userSocket;
    }

    log = (text: string, messageType?: LogMessageTypes) => {
        let t = new Date();
        let message = `${t.getUTCHours()}:${t.getUTCMinutes()}:${t.getUTCSeconds()} ${messageType || LogMessageTypes.DEBUG} ${this.userSocket.id} | ${text}`;
        console.log(message);
        this.socketLog.push(message);
    }

    logObject = (object: any, messageType?: LogMessageTypes) => this.log(JSON.stringify(object), messageType)

    getSocketLog = () => this.socketLog;
}
