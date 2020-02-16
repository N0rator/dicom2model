import React, {useEffect} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import ModelGenerator from "../utils/model-generator.util";
import {Coords} from "../models/coords.model";

// TODO re-write the whole thingy with https://github.com/react-spring/react-three-fiber or use React states to properly display stuff
export default function ModelViewer(props?: {
    className?: string,
}) {
    let modelGenerator: ModelGenerator = new ModelGenerator();

    // used to dispose BufferAttribute array passed to GPU
    function disposeArray() {
        this.array = null;
    }

    useEffect(() => {
        const canvas = document.getElementById('model-viewer-canvas') as HTMLCanvasElement;
        const renderer = new THREE.WebGLRenderer({canvas});
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
        camera.updateProjectionMatrix();
        camera.position.x = 12;
        camera.position.y = 8;
        camera.position.z = 12;

        const scene = new THREE.Scene();
        {
            // lights
            scene.add(new THREE.AmbientLight(0x444444));
            let light1 = new THREE.DirectionalLight(0xffffff, 0.5);
            light1.position.set(1, 1, 1);
            scene.add(light1);

            let light2 = new THREE.DirectionalLight(0xffffff, 1.5);
            light2.position.set(0, -1, 0);
            scene.add(light2);

            // helpers
            scene.add(new THREE.AxesHelper(12));
            scene.add(new THREE.GridHelper(4, 4));
            let xyGrid = new THREE.GridHelper(4, 4);
            xyGrid.geometry.lookAt(new THREE.Vector3(0,1,0));
            scene.add(xyGrid);

            scene.background = new THREE.Color(0xFFFFFF);
        }

        const geometry = new THREE.BufferGeometry();
        let geometryVertices: number[] = [];
        let geometryNormals: number[] = [];
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(geometryVertices, 3).onUpload(disposeArray));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(geometryNormals, 3).onUpload(disposeArray));
        geometry.computeBoundingSphere();

        let material = new THREE.MeshPhongMaterial({
            color: 0xffaaaa,
            side: THREE.DoubleSide
        });

        let mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        let noiseData: number[][][] = [];
        let dimensions: Coords = { x: 10, y: 10, z: 10 };
        for (let x = 0; x < dimensions.x; x++) {
            noiseData.push([]);
            for (let y = 0; y < dimensions.y; y++) {
                noiseData[x].push([]);
                for (let z = 0; z < dimensions.z; z++) {
                    noiseData[x][y].push(Math.round(Math.random() * 0.55));
                }
            }
        }
        modelGenerator.processModel(
            noiseData,
            (position, source) => source[position.y][position.x][position.z],
            geometry,
            dimensions
        );

        // let generateTriangleWithInterval = setInterval(() => {
        //     for (let i = 0; i < 100; i++) {
        //         modelGenerator.processRandomTriangle({
        //             x: Math.random() * 20 - 10,
        //             y: Math.random() * 20 - 10,
        //             z: Math.random() * 20 - 10,
        //         }, geometryVertices, geometryNormals);
        //     }
        //     geometry.setAttribute('position', new THREE.Float32BufferAttribute(geometryVertices, 3).onUpload(disposeArray));
        //     geometry.setAttribute('normal', new THREE.Float32BufferAttribute(geometryNormals, 3).onUpload(disposeArray));
        // }, 0);
        // setTimeout(() => clearInterval(generateTriangleWithInterval), 1000);



        const orbitControls = new OrbitControls(camera, renderer.domElement);
        orbitControls.autoRotate = false;
        // let dragControls = new DragControls([mesh], camera, renderer.domElement);
        // dragControls.addEventListener( 'dragstart', () => orbitControls.enabled = false);
        // dragControls.addEventListener( 'dragend', () => orbitControls.enabled = true);

        let render = () => {
            orbitControls.update();
            renderer.render(scene, camera);
            requestAnimationFrame(render);
        };
        render();
    });
    return (<canvas id={"model-viewer-canvas"}></canvas>);
}