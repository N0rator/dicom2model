import IndexedFile from "./IndexedFile.model";

export default class UserData {
    filesInfo?: any;
    indexedFiles: IndexedFile[];

    constructor(params = {}) {
        for (let param in params) {
            if (params.hasOwnProperty(param)) {
                this[param] = params[param];
            }
        }
    }
}