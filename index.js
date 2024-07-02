import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "lil-gui";

document.addEventListener("DOMContentLoaded", () => {
    const debugObject = {
        x: 0,
        y: 35,
    };

    const gui = new GUI();

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
    controls.enabled = false;

    // add object
    const vs = document.getElementById("vertexShader").textContent;
    const fs = document.getElementById("fragmentShader").textContent;
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
    const material = new THREE.ShaderMaterial({
        vertexShader: vs,
        fragmentShader: fs,
        uniforms: {
            uTime: new THREE.Uniform(0),
            uResolution: new THREE.Uniform(
                new THREE.Vector2(window.innerWidth, window.innerHeight)
            ),
            uMouse: new THREE.Uniform(new THREE.Vector4(0, 0, 0, 0)),
            uX: new THREE.Uniform(debugObject.x),
            uY: new THREE.Uniform(debugObject.y),
        },
        side: THREE.DoubleSide,
    });
    // const geometry = new THREE.SphereGeometry(2.5, 32, 32);
    const plane = new THREE.Mesh(geometry, material);
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

    // raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // mouse move handling
    window.addEventListener(
        "mousemove",
        e => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children);
            if (intersects.length > 0) {
                const { x, y, z } = intersects[0].point;
                plane.material.uniforms.uMouse.value = new THREE.Vector4(x, y, z, 0);
            }
        },
        false
    );

    // debug
    gui.add(debugObject, "x")
        .min(0)
        .max(100)
        .step(1)
        .name("uX")
        .onChange(() => {
            plane.material.uniforms.uX.value = debugObject.x;
        });
    gui.add(debugObject, "y")
        .min(0)
        .max(100)
        .step(1)
        .name("uY")
        .onChange(() => {
            plane.material.uniforms.uY.value = debugObject.y;
        });

    const render = () => {
        requestAnimationFrame(render);
        // update controls
        controls.update();
        // update uniforms
        plane.material.uniforms.uTime.value += 0.01;

        renderer.render(scene, camera);
    };

    render();
});
