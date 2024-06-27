import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";

document.addEventListener("DOMContentLoaded", () => {
    const gui = new GUI();
    const guiObject = {
        timeSpeed: 0.01,
        order: 3,
        degree: 7,
        lineWidth: 0.84,
        lineCount: 34,
        lineMultiplier: 15,
        color2: "#fff",
        color1: "#000",
    };

    // create basic scene
    const scene = new THREE.Scene();
    // const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 1000);
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 3.5;
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
    });
    // renderer.setClearColor(new THREE.Color("white"));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    // controls.enabled = false;

    const loader = new THREE.TextureLoader();
    const shText = loader.load("/sh03.png");
    // add object
    const vs = document.getElementById("vertexShader").textContent;
    const fs = document.getElementById("fragmentShader").textContent;
    const material = new THREE.ShaderMaterial({
        vertexShader: vs,
        fragmentShader: fs,
        uniforms: {
            uTime: new THREE.Uniform(0),
            uResolution: new THREE.Uniform(
                new THREE.Vector2(window.innerWidth, window.innerHeight)
            ),
            uMouse: new THREE.Uniform(new THREE.Vector2(0, 0)),
            uTexture: new THREE.Uniform(shText),
            uOrder: new THREE.Uniform(guiObject.order),
            uDegree: new THREE.Uniform(guiObject.degree),
            uLineWidth: new THREE.Uniform(guiObject.lineWidth),
            uLineCount: new THREE.Uniform(guiObject.lineCount),
            uLineMultiplier: new THREE.Uniform(guiObject.lineMultiplier),
            uColor1: new THREE.Uniform(new THREE.Color(guiObject.color1)),
            uColor2: new THREE.Uniform(new THREE.Color(guiObject.color2)),
        },
        side: THREE.DoubleSide,
        // wireframe: true,
    });
    const geometry = new THREE.SphereGeometry(2, 128, 128);
    // const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
    const plane = new THREE.Mesh(geometry, material);
    //rotate to 120rad
    plane.rotation.x = Math.PI / 6;
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
                const { x, y } = intersects[0].point;
                console.log(x, y);
                plane.material.uniforms.uMouse.value = new THREE.Vector2(e.clientX, e.clientY);
            }
        },
        false
    );

    // add gui
    gui.add(guiObject, "timeSpeed", 0.001, 0.05).onChange(value => {
        plane.material.uniforms.uTime.value = value;
    });
    gui.add(guiObject, "order", 1, 10)
        .step(1)
        .onChange(value => {
            plane.material.uniforms.uOrder.value = value;
        });
    gui.add(guiObject, "lineWidth", 0.001, 1).onChange(value => {
        plane.material.uniforms.uLineWidth.value = value;
    });
    gui.add(guiObject, "degree", 1, 10)
        .step(1)
        .onChange(value => {
            plane.material.uniforms.uDegree.value = value;
        });
    gui.add(guiObject, "lineCount", 1, 100)
        .step(1)
        .onChange(value => {
            plane.material.uniforms.uLineCount.value = value;
        });
    gui.add(guiObject, "lineMultiplier", 1, 100)
        .step(1)
        .onChange(value => {
            plane.material.uniforms.uLineMultiplier.value = value;
        });
    gui.addColor(guiObject, "color1").onChange(value => {
        plane.material.uniforms.uColor1.value = new THREE.Color(value);
    });
    gui.addColor(guiObject, "color2").onChange(value => {
        plane.material.uniforms.uColor2.value = new THREE.Color(value);
    });

    const render = () => {
        requestAnimationFrame(render);
        // update controls
        controls.update();
        // update uniforms
        plane.material.uniforms.uTime.value += guiObject.timeSpeed;

        renderer.render(scene, camera);
    };

    render();
});
