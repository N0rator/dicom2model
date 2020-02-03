import SocketLogger from "../shared/SocketLogger.service";

export default class User {
    public id: number;
    public connection: any;         // user connection field, expected to be socket connection

    constructor(params = {}) {
        for (let param in params) {
            if (params.hasOwnProperty(param)) {
                this[param] = params[param];
            }
        }
    }
}