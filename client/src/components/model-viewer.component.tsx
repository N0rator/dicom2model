import React, {useEffect} from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';

// TODO re-write the whole thingy with https://github.com/react-spring/react-three-fiber or use React states to properly display stuff
export default function ModelViewer(props?: {
    className?: string,
}) {
    useEffect(() => {
        const canvas = document.getElementById('model-viewer-canvas') as HTMLCanvasElement;
        const renderer = new THREE.WebGLRenderer({canvas});
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
        camera.updateProjectionMatrix();
        camera.position.z = 5;

        const scene = new THREE.Scene();
        {
            // lights
            const nearWhiteLight = new THREE.DirectionalLight(0xbbdefb, 1);
            nearWhiteLight.position.set(-1, 2, 4);
            scene.add(nearWhiteLight);
            const farBlueLight = new THREE.DirectionalLight(0x0288d1, 1);
            farBlueLight.position.set(1, -2, -4);
            scene.add(farBlueLight);

            // helpers
            let axesHelper = new THREE.AxesHelper( 5 );
            scene.add( axesHelper );
        }

        scene.background = new THREE.Color(0xFFFFFF);
        // const geometry = new THREE.BoxGeometry(1, 1, 1);
        // const material = new THREE.MeshPhongMaterial({color: 0x44aa88});  // greenish blue
        // const cube = new THREE.Mesh(geometry, material);
        // scene.add(cube);

        const geometry = new THREE.BufferGeometry();
        let vertices = new Float32Array( [
            -1.0, -1.0,  2.0,
            1.0, -1.0,  2.0,
            1.0,  1.0,  2.0,

            1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0, -1.0,  1.0
        ] );

        // itemSize = 3 because there are 3 values (components) per vertex
        geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        var mesh = new THREE.Mesh( geometry, material );

        scene.add(mesh);

        const orbitControls = new OrbitControls(camera, renderer.domElement);
        const dragControls = new DragControls([mesh], camera, renderer.domElement);

        dragControls.addEventListener( 'dragstart', function ( event ) {
            orbitControls.enabled = false;
        } );
        dragControls.addEventListener( 'dragend', function ( event ) {
            orbitControls.enabled = true;
        } );

        requestAnimationFrame(render);

        function render() {
            orbitControls.update();
            renderer.render(scene, camera);
            requestAnimationFrame(render);
        }
    });
    return (<canvas id={"model-viewer-canvas"}></canvas>);
}