import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

document.addEventListener("DOMContentLoaded", () => {
    // create basic scene
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 1000);
    camera.position.z = 1;
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    // add object
    const vs = document.getElementById("vertexShader").textContent;
    const fs = document.getElementById("fragmentShader").textContent;
    // const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
    const material = new THREE.ShaderMaterial({
        vertexShader: vs,
        fragmentShader: fs,
        uniforms: {
            uTime: new THREE.Uniform(0),
            uResolution: new THREE.Uniform(
                new THREE.Vector2(window.innerWidth, window.innerHeight)
            ),
            uMouse: new THREE.Uniform(new THREE.Vector2(0, 0)),
            uPositionFrequency: new THREE.Uniform(0.1),
            uTimeFrequency: new THREE.Uniform(0.1),
            uStrength: new THREE.Uniform(0.1),
            uWarpPositionFrequency: new THREE.Uniform(0.1),
            uWarpTimeFrequency: new THREE.Uniform(0.1),
            uWarpStrength: new THREE.Uniform(0.1),
        },
        side: THREE.FrontSide,
    });
    const geometry = new THREE.SphereGeometry(2.5, 32, 32);
    const plane = new THREE.Mesh(geometry, material);
    // const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // resize handling
    window.addEventListener(
        "resize",
        () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            // update uniforms
            plane.material.uniforms.uResolution.value = new THREE.Vector2(
                window.innerWidth,
                window.innerHeight
            );
        },
        false
    );

    const render = () => {
        requestAnimationFrame(render);
        // update controls
        controls.update();
        // update uniforms
        plane.material.uniforms.uTime.value += 0.1;

        renderer.render(scene, camera);
    };

    render();
});
