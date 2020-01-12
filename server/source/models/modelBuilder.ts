import Jimp from 'jimp';
import { renderByMC } from './marchingCubes'
import fs from "fs";

class ModelBuilder {
    private imagesDir: string;
    constructor(path: string){
        this.imagesDir = path;
    }
    public build(){

    }
    public readFiles(){
        let fileNames = fs.readdirSync(this.imagesDir);
        let files = [];
        fileNames.forEach((fileName)=>{
            Jimp.read(this.imagesDir + '/' + fileName, (error, image) => {
                //TODO add functionality to get pixels from image
                files.push()
            });
        });

    }
}