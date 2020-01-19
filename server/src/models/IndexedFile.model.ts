export default class IndexedFile {
    index: number;
    blob: any;
    filename: string;

    constructor(params = {}) {
        for (let param in params) {
            if (params.hasOwnProperty(param)) {
                this[param] = params[param];
            }
        }
    }
}