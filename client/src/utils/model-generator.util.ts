import * as THREE from 'three';

export default class ModelGenerator {
    /**
     * Processes modelSource by following steps:
     * 1. Going through each position of modelSource, checking what figure needs to be on that position;
     * 2. Retrieves figure required figure for that position;
     * 3. Pushes vertices & normals of following figure to array of vertices and normals.
     * Note: It's expected that array of vertices and normals are being displayed as THREE.BufferGeometry, so that model
     * building process can be observed as model builds.
     * @param modelSource               data source, e.g. array of images
     * @param retrievePositionState     function to retrieve position state from model source
     * @param destArrayOfVertices       currently displayed as THREE.BufferGeometry array of vertices
     * @param destArrayOfNormals        currently displayed as THREE.BufferGeometry array of normals
     */
    processModel = (
        modelSource: any[],
        retrievePositionState: (position: { x: number, y: number, z: number }) => number | string,
        destArrayOfVertices: any[],
        destArrayOfNormals: any[],
    ) => {
        let modelDimensions = this.getModelDimensions(modelSource);
        for (let x = 0; x < modelDimensions.x - 1; x++)
            for (let y = 0; x < modelDimensions.y - 1; y++)
                for (let z = 0; x < modelDimensions.z - 1; z++) {
                    let positionStateAsBinaryString: string = this.getPositionState({x, y, z}, modelSource, retrievePositionState);
                    let figureToUse = this.figures[positionStateAsBinaryString];
                    this.pushFigure(figureToUse, destArrayOfVertices, destArrayOfNormals);
                }
    }

    /**
     * Method to retrieve state of specific point on model as 8-length binary string,
     * each number represents cube's vertices in following order:
     *  4 — — — 5
     *  | \     | \
     *  |   7 — — — 6
     *  |   |   |   |
     *  0 — | — 1   |
     *    \ |     \ |
     *      3 — — — 2
     * @param position                coordinates for retrieving info from source
     * @param source                  array of images or data
     * @param retrievePositionState   function to retrieve position state (0 or 1) from source
     * @returns {string}  8-length binary string, e.g. '00101100' means that 2nd,
     * 4th and 5th vertices are inside the model.
     */
    getPositionState = (
        position: { x: number, y: number, z: number },
        source: any[],
        retrievePositionState: (position: { x: number, y: number, z: number }) => number | string,
    ): string => {
        let binaryString = [];

        return binaryString.join('');
    };

    generateTriangle = (position: {x, y, z}) => {

    }

    pushFigure = (figure: any, arrayOfVertices: any[], arrayOfNormals: any[]) => {

    }

    getModelDimensions = (modelSource: any): {x: number, y: number, z: number} => {

        return
    }

    figures = [];
}