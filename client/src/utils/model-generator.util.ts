import * as THREE from 'three';
import {Coords} from "../models/coords.model";
import {BufferFigure} from "../models/buffer-figure.model";
import {Figures} from "./figures.util";

export default class ModelGenerator {
    private figures: Figures = new Figures();

    /**
     * Processes modelSource by following steps:
     * 1. Goes through each position of modelSource, collects state (is it model or void) at that position;
     * 2. Retrieves required figure for that state;
     * 3. Pushes vertices & normals of following figure to provided THREE.BufferGeometry.
     * @param modelSource               data source, e.g. array of images
     * @param retrievePositionState     function to retrieve position state from model source
     * @param modelGeometry             THREE.js geometry where vertices and normals would be pushed to
     * @param modelDimensions           field describing modelSourceDimensions
     */
    // TODO implement model building via setIntervals so model building progress would be observable
    // TODO implement 'turbo-mode' option with no UI updates to make model build faster; probably can be on backend
    processModel = (
        modelSource: any[],
        retrievePositionState: (position: Coords, source: any) => 0 | 1,
        modelGeometry: THREE.BufferGeometry,
        modelDimensions: Coords = this.getModelDimensions(modelSource),
    ) => {
        let timeNow = Date.now();
        let modelVertices: number[] = [];
        let modelNormals: number[] = [];
        for (let x = 0; x < modelDimensions.x - 1; x++)
            for (let y = 0; y < modelDimensions.y - 1; y++)
                for (let z = 0; z < modelDimensions.z - 1; z++) {
                    let positionStateAsBinaryString: string = this.getPositionState({x, y, z}, modelSource, retrievePositionState);
                    let figureToUse: BufferFigure = this.figures.getFigure(positionStateAsBinaryString);
                    if (figureToUse.getVertices().length === 0) continue;
                    let figureVertices = [...figureToUse.getVertices()];
                    // TODO transform via transformation matrix4
                    for (let pointIndex = 0; pointIndex < figureVertices.length; pointIndex += 3) {
                        figureVertices[pointIndex] += x;
                        figureVertices[pointIndex + 1] += y;
                        figureVertices[pointIndex + 2] += z;
                    }
                    modelVertices.push(...figureVertices);
                    modelNormals.push(...figureToUse.getNormals());
                    this.updateGeometry(modelVertices, modelNormals, modelGeometry);
                }
        console.log(`Model generation finished (${Date.now() - timeNow}) ms`);
    };

    /**
     * Method to retrieve state of specific point on model as 8-length binary string,
     * each number represents cube's vertices in following order:
     *  4 — — — 5
     *  | \     | \
     *  |   7 — — — 6      Y (4)
     *  |   |   |   |      |
     *  0 — | — 1   |      — — —> X (1)
     *    \ |     \ |      \
     *      3 — — — 2       Z (3)
     * @param position                coordinates for retrieving info from source
     * @param source                  array of images or data
     * @param retrievePositionState   function to retrieve position state (0 or 1) from source
     * @returns {string}              8-length binary string, e.g. '00101101' means that 0, 2nd, 3th and 5th vertices
     * are inside the model.
     */
    getPositionState = (
        position: Coords,
        source: any[],
        retrievePositionState: (position: Coords, source: any) => 0 | 1,
    ): string => {
        let binaryString = '';
        binaryString += retrievePositionState({...position, z: position.z + 1, y: position.y + 1}, source);
        binaryString += retrievePositionState({z: position.z + 1, x: position.x + 1, y: position.y + 1}, source);
        binaryString += retrievePositionState({...position, y: position.y + 1, x: position.x + 1}, source);
        binaryString += retrievePositionState({...position, y: position.y + 1}, source);
        binaryString += retrievePositionState({...position, z: position.z + 1}, source);
        binaryString += retrievePositionState({...position, x: position.x + 1, z: position.z + 1}, source);
        binaryString += retrievePositionState({...position, x: position.x + 1}, source);
        binaryString += retrievePositionState(position, source);
        return binaryString;
    };

    /**
     * Extracts model dimensions as if it is 3-dimension array.
     */
    getModelDimensions = (modelSource: any[][][]): Coords => {
        let coords: Coords = {x: 0, y: 0, z: 0};
        if (Array.isArray(modelSource)) {
            coords.z = modelSource.length;
            if (Array.isArray(modelSource[0])) {
                coords.x = modelSource[0].length;
                if (Array.isArray(modelSource[0][0])) {
                    coords.y = modelSource[0][0].length
                }
            }
        }
        return coords;
    };

    /**
     * Generates random triangle within radius of 1 unit around given position and pushes vertices & normals to
     * destination data arrays. Function for debugging purposes.
     */
    processRandomTriangle = (position: { x, y, z }, destVerticesArray: number[], destNormalsArray: number[]) => {
        const {x, y, z} = position;
        let randValue = () => Math.random() * 2 - 1;
        const triangle: BufferFigure = ModelGenerator.createTriangle([
            {x: x + randValue(), y: y + randValue(), z: z + randValue()},
            {x: x + randValue(), y: y + randValue(), z: z + randValue()},
            {x: x + randValue(), y: y + randValue(), z: z + randValue()}
        ]);
        destVerticesArray.push(...triangle.getVertices());
        destNormalsArray.push(...triangle.getNormals());
    };

    /**
     * Generates triangles from a given coordinates points.
     * From 3 points provided (a, b, c), normal is calculated from multiplying vectors ab and cb
     * @param coords    array with 3 coordinates for each triangle
     * @returns         array of 18 elements -- 9 vertices and 9 normals coords
     */
    static createTriangle = (coords: Coords[]): BufferFigure => {
        // 1st vertex
        const ax = coords[0].x;
        const ay = coords[0].y;
        const az = coords[0].z;
        // 2nd vertex
        const bx = coords[1].x;
        const by = coords[1].y;
        const bz = coords[1].z;
        // 3d vertex
        const cx = coords[2].x;
        const cy = coords[2].y;
        const cz = coords[2].z;

        // point vectors
        const pA = new THREE.Vector3(ax, ay, az);
        const pB = new THREE.Vector3(bx, by, bz);
        const pC = new THREE.Vector3(cx, cy, cz);

        // sub-vectors used for retrieving normals
        const cb = new THREE.Vector3();
        const ab = new THREE.Vector3();
        ab.subVectors(pA, pB);
        cb.subVectors(pC, pB);
        cb.cross(ab);
        cb.normalize();

        // normal (same for each vertex)
        const nx = cb.x;
        const ny = cb.y;
        const nz = cb.z;

        return new BufferFigure([ax, ay, az, bx, by, bz, cx, cy, cz,
            nx, ny, nz, nx, ny, nz, nx, ny, nz]);
    }

    /**
     * Pushes array of vertices & normals from figure to destination arrayOfVertices & arrayOfNormals.
     */
    updateGeometry = (newVertices: number[], newNormals: number[], modelGeometry: THREE.BufferGeometry) => {
        modelGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newVertices, 3)
            .onUpload(function () { this.array = null }));
        modelGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(newNormals, 3)
            .onUpload(function () { this.array = null }));
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