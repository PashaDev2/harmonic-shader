import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackBallControls.js";
import GUI from "lil-gui";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";

document.addEventListener("DOMContentLoaded", () => {
    const gui = new GUI();
    const guiObject = {
        timeSpeed: 0.01,
        order: 3,
        degree: 7,
        lineWidth: 0.84,
        lineCount: 12,
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
    renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.setClearColor(new THREE.Color("white"));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    // const controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 1.0;
    // controls.enabled = false;

    const loader = new THREE.TextureLoader();
    const shText = loader.load("/sh03.png");
    // add object
    const vs = document.getElementById("vertexShader").textContent;
    const fs = document.getElementById("fragmentShader").textContent;

    const material = new CustomShaderMaterial({
        baseMaterial: THREE.MeshPhysicalMaterial,
        vertexShader: vs,
        fragmentShader: fs,
        silent: true, // Disables the default warning if true
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
        flatShading: false,
        side: THREE.DoubleSide,
        roughness: 0.8,
        metalness: 0,
    });
    const geometry = new THREE.SphereGeometry(2, 64, 64);
    const plane = new THREE.Mesh(geometry, material);
    plane.castShadow = false;
    scene.add(plane);

    // add light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(0, 0, 10);
    scene.add(directionalLight);

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
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
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
                plane.material.uniforms.uMouse.value = new THREE.Vector2(x, y);
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
