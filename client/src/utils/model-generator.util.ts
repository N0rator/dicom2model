import * as THREE from 'three';
import {Coordinates} from "../models/coords.model";

export default class ModelGenerator {
    /**
     * Processes modelSource by following steps:
     * 1. Goes through each position of modelSource, collects state (is it model or void) at that position;
     * 2. Retrieves required figure for that state;
     * 3. Pushes vertices & normals of following figure to provided THREE.BufferGeometry.
     * @param modelSource               data source, e.g. array of images
     * @param retrievePositionState     function to retrieve position state from model source
     * @param modelGeometry             THREE.js geometry where vertices and normals would be pushed to
     * @param dimensions                field describing modelSourceDimensions
     */
    // TODO implement model building via setIntervals so it would model building progress would be observable
    // TODO implement 'turbo-mode' option with no UI updates so model builds faster; probably can be on backend
    processModel = (
        modelSource: any[],
        retrievePositionState: (position: Coordinates) => 0 | 1,
        modelGeometry: THREE.BufferGeometry,
        dimensions?: Coordinates,
    ) => {
        const modelDimensions: Coordinates = dimensions || this.getModelDimensions(modelSource);
        for (let x = 0; x < modelDimensions.x - 1; x++)
            for (let y = 0; x < modelDimensions.y - 1; y++)
                for (let z = 0; x < modelDimensions.z - 1; z++) {
                    let positionStateAsBinaryString: string = this.getPositionState({x, y, z}, modelSource, retrievePositionState);
                    let figureToUse = this.figures[positionStateAsBinaryString];
                    this.pushFigure(figureToUse, modelGeometry);
                }
    };

    /**
     * Method to retrieve state of specific point on model as 8-length binary string,
     * each number represents cube's vertices in following order:
     *  4 — — — 5
     *  | \     | \
     *  |   7 — — — 6      Z
     *  |   |   |   |      |
     *  0 — | — 1   |      — — —> X
     *    \ |     \ |      \
     *      3 — — — 2       Y
     * @param position                coordinates for retrieving info from source
     * @param source                  array of images or data
     * @param retrievePositionState   function to retrieve position state (0 or 1) from source
     * @returns {string}  8-length binary string, e.g. '00101100' means that 2nd,
     * 4th and 5th vertices are inside the model.
     */
    getPositionState = (
        position: Coordinates,
        source: any[],
        retrievePositionState: (position: Coordinates) => 0 | 1,
    ): string => {
        let binaryString = '';
        binaryString += retrievePositionState(position);
        binaryString += retrievePositionState({...position, x: position.x + 1});
        binaryString += retrievePositionState({...position, x: position.x + 1, y: position.y + 1});
        binaryString += retrievePositionState({...position, y: position.y + 1});
        binaryString += retrievePositionState({...position, z: position.z + 1});
        binaryString += retrievePositionState({...position, z: position.z + 1, x: position.x + 1});
        binaryString += retrievePositionState({...position, z: position.z + 1, x: position.x + 1, y: position.y + 1});
        binaryString += retrievePositionState({...position, z: position.z + 1, y: position.y + 1});
        return binaryString;
    };

    /**
     * Extracts model dimensions as if it is 3-dimension array.
     */
    getModelDimensions = (modelSource: any[][][]): Coordinates => {
        let coords: Coordinates = {x: 0, y: 0, z: 0};
        if (Array.isArray(modelSource)) {
            coords.z = modelSource.length;
            if (Array.isArray(modelSource[0])) {
                coords.x = modelSource[0].length;
                if (Array.isArray(modelSource[0][0])) {
                    coords.z = modelSource[0][0].length
                }
            }
        }
        return coords;
    };

    /**
     * Generates random triangle within radius of 5 units around given position and pushes vertices & normals to
     * destination data arrays. Function for debugging purposes.
     */
    processTriangle = (position: { x, y, z }, destVerticesArray: any, destNormalsArray: any) => {
        const {x, y, z} = position;
        let randValue = () => Math.random() * 2 - 1;

        // 1st vertex
        const ax = x + randValue();
        const ay = y + randValue();
        const az = z + randValue();

        // 2nd vertex
        const bx = x + randValue();
        const by = y + randValue();
        const bz = z + randValue();

        // 3d vertex
        const cx = x + randValue();
        const cy = y + randValue();
        const cz = z + randValue();

        destVerticesArray.push(ax, ay, az);
        destVerticesArray.push(bx, by, bz);
        destVerticesArray.push(cx, cy, cz);

        // point vectors
        const pA = new THREE.Vector3(ax, ay, az);
        const pB = new THREE.Vector3(bx, by, bz);
        const pC = new THREE.Vector3(cx, cy, cz);

        // sub-vectors used for retrieving normals
        const cb = new THREE.Vector3();
        const ab = new THREE.Vector3();
        cb.subVectors(pC, pB);
        ab.subVectors(pA, pB);
        cb.cross(ab);
        cb.normalize();

        // normal (same for each vertex)
        const nx = cb.x;
        const ny = cb.y;
        const nz = cb.z;

        destNormalsArray.push(nx, ny, nz);
        destNormalsArray.push(nx, ny, nz);
        destNormalsArray.push(nx, ny, nz);
    };

    /**
     * Pushes array of vertices & normals from figure to destination arrayOfVertices & arrayOfNormals.
     */
    pushFigure = (figure: { vertices: number[], normals: number[] }, modelGeometry: THREE.BufferGeometry) => {
        modelGeometry.setAttribute('position', new THREE.Float32BufferAttribute(figure.vertices, 3)
            .onUpload(function () {
                this.array = null;
            }));
        modelGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(figure.normals, 3)
            .onUpload(function () {
                this.array = null;
            }));
    };

    /**
     * TODO eh that's a lot of work
     */
    private readonly figures = {
        '00000000': {},
        '00000001': {vertices: [], normals: []},
        '00000010': {vertices: [], normals: []},
    };

    /**
     * Disposes all disposable elements of an array.
     */
    disposeArray = (array: any[]) =>
        array.forEach(threeJsObject => typeof threeJsObject.dispose === 'function' && threeJsObject.dispose());

    /**
     * Returns memory size of model as string with measure units
     */
    formatBytes = (bytes, decimals = 0) => {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];

        let i = Math.floor(Math.log(bytes) / Math.log(k));
        if (i > 3) i = 3;

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}