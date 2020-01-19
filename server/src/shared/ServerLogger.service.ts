import fs from 'fs';
import {LogMessageTypes} from "../models/LogMessageTypes.enum";

/**
 * Server status Logger, logs code errors messages, server load messages.
 * Logs messages to file and/or console.
 */
export default class ServerLogger {
    private isPrintToConsole: boolean;          // if true, messages will be written to console
    private isPrintToFile: boolean;             // if true, messages will be written to .log file
    private creationDate: Date;                 // time of instantiating ServerLogger
    private logsPath: string;                   // path to directory containing .log files
    private logFileName: string;                // log filename, format: 'Server Log D.M.Y'

    constructor(params: any = {
        isPrintToConsole: true,
        isPrintToFile: true,
        logsPath: '/serverLogs',
    }) {
        for (let param in params) {
            if (params.hasOwnProperty(param)) {
                this[param] = params[param];
            }
        }
        this.creationDate = new Date();
        this.logFileName = `Server Log ${this.creationDate.getUTCDay()}.${this.creationDate.getUTCMonth()}.${this.creationDate.getUTCFullYear()}.log`;
    }

    /** Writes info message */
    public info = (messageText: string) => this.log(messageText, LogMessageTypes.INFO)

    /** Writes error message */
    public error = (messageText: string) => this.log(messageText, LogMessageTypes.ERROR)

    /** Writes debug message */
    public debug = (messageText: string) => this.log(messageText)

    /**
     * Prints log message of provided type to console without DMY, stores message with DMY to file.
     * Message formats: D.M.Y
     *      console: 'H:m:S messageType Server | messageText'
     *      file: 'D.M.Y H:m:S messageType Server | messageText'
     * @param messageText       log's message text
     * @param messageType       log's message type
     * @param isWriteToFile     optional override if message needs to be written to file
     */
    private log = (
        messageText: string,
        messageType: LogMessageTypes = LogMessageTypes.DEBUG,
        isWriteToFile: boolean = true,
    ) => {
        let t = new Date();
        messageText = `${t.getUTCHours()}:${t.getUTCMinutes()}:${t.getUTCSeconds()} ${messageType} Server | ${messageText}`;
        this.isPrintToConsole && console.log(messageText);
        messageText = `${t.getUTCDay()}.${t.getUTCMonth()}.${t.getUTCFullYear()} ${messageText}`;
        this.isPrintToFile && isWriteToFile && this.printToFile(messageText);
    }

    /** Writes messageText into log file */
    private printToFile(messageText: string) {
        // create logs directory if not exists
        if (!fs.existsSync(this.logsPath)) {
            fs.mkdirSync(this.logsPath);
            this.log(`created log directory {${this.logsPath}}.`, LogMessageTypes.INFO, false);
        }
        fs.appendFile(
            `${this.logsPath}\\${this.logFileName}`,
            messageText + '\n',
            error => error && this.log(`unable to write messageText to file {${this.logFileName}}, got error: ${error}`, LogMessageTypes.ERROR, false)
        );
    }
}