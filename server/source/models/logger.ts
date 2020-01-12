import fs from 'fs';

export class Logger {
    private _console: boolean;
    private _file: boolean;
    private _logPath: string;

    /**
     * @description Creates Logger object witch uses for logging error, debug or info messages
     * @param console {boolean} true - messages will be written into console, false - messages will not be written into console
     * @param file {boolean} true - messages will be written into .log file, false - messages will not be written into .log file
     * @param path {string} path to directory will containing .log files. Default: '"logger.ts directory"/logs'
     */
    constructor(console: boolean | false, file: boolean | false, path?: string){
        this._console = console;
        this._file = file;
        this._logPath = path && path !== '' ? path : 'logs';
    }

    /**
     * @description Writes message as info
     * @param msg {string} message to be written
     */
    public info(msg: string){
        msg = ''.concat('[INFO]: ', msg);
        this.write(msg);
    }

    /**
     * @description Writes message as error
     * @param msg {string} message to be written
     */
    public error(msg: string){
        msg = ''.concat('[ERROR]: ', msg);
        this.write(msg);
    }

    /**
     * @description Writes message as debug message
     * @param msg {string} message to be written
     */
    public debug(msg: string){
        msg = ''.concat('[DEBUG]: ', msg);
        this.write(msg);
    }

    /**
     * @description Add datetime to message and writes it in dependence of specified properties _console and _file
     * @param msg {string} message to be modified and written
     */
    private write(msg: string){

        msg = ''.concat('[', this._getDateTime(), ']', msg);

        if(this._console) this.writeConsole(msg);
        if(this._file) this.writeFile(msg, this._logPath);
    };

    /**
     * @description Writes message into console
     * @param msg {string} message to be written
     */
    private writeConsole(msg: string){
        console.log(msg);
    };
    /**
     * @description Writes message into log file
     * @param msg {string} message to be written
     */
    private writeFile(msg: string, path: string){
        let logDir = path;
        // Check for logs directory and create if not exist.
        if (!fs.existsSync(logDir)){
            fs.mkdirSync(logDir);
        }

        msg += '\n';

        let logFile = ''.concat('Server_', this._getDate(), '.log');
        fs.appendFile(logDir + '\\' + logFile, msg, (error)=>{
            if(error){
                this.writeConsole('[' + this._getDateTime() + '][Error]: failed to write log message to file. Error: ' + error + '.')
            }
        });
    };
    /**
     * @description return current time in format HH:MM:SS
     * @return {string}
     */
    private _getTime(){
        return (new Date()).toLocaleTimeString();
    };
    /**
     * @description return current date in format YYYY-DD-MM
     * @return {string}
     */
    private _getDate(){
        return (new Date()).toLocaleDateString().replace(/\//g,'-');
    }
    /**
     * @description return current datetime in format YYYY-DD-MM, HH:MM:SS
     * @return {string}
     */
    private _getDateTime(){
        return ''.concat(this._getDate(), ', ', this._getTime());
    }
}