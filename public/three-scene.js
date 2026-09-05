import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";


// ==========================================================
// SECTION 1 - SCENE
// ==========================================================

const container = document.getElementById("typewriter-3d");

const scene = new THREE.Scene();


// ==========================================================
// SECTION 2 - CAMERA
// ==========================================================

const camera = new THREE.PerspectiveCamera(
    35,
    container.clientWidth / container.clientHeight,
    0.01,
    100
);


// ==========================================================
// SECTION 3 - RENDERER
// ==========================================================

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
    container.clientWidth,
    container.clientHeight
);

container.appendChild(renderer.domElement);


// ==========================================================
// SECTION 4 - LIGHTS
// ==========================================================

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    2
);

scene.add(ambientLight);


const mainLight = new THREE.DirectionalLight(
    0xffffff,
    3
);

mainLight.position.set(
    3,
    5,
    4
);

scene.add(mainLight);


// ==========================================================
// SECTION 5 - LOAD TYPEWRITER
// ==========================================================

const loader = new GLTFLoader();

let typewriterModel = null;


loader.load(

    "./models/typewriter.glb",

    (gltf) => {

        typewriterModel = gltf.scene;

        scene.add(typewriterModel);


        // --------------------------------------------------
        // CENTRE AUTOMATIQUEMENT LE MODELE
        // --------------------------------------------------

        const box = new THREE.Box3().setFromObject(
            typewriterModel
        );

        const center = box.getCenter(
            new THREE.Vector3()
        );

        const size = box.getSize(
            new THREE.Vector3()
        );


        typewriterModel.position.x -= center.x;
        typewriterModel.position.y -= center.y;
        typewriterModel.position.z -= center.z;


        // --------------------------------------------------
        // PLACE LA CAMERA
        // --------------------------------------------------

        const maxDimension = Math.max(
            size.x,
            size.y,
            size.z
        );

        camera.position.set(
            0,
            maxDimension * 1.4,
            maxDimension * -1.8
        );

        camera.lookAt(
            0,
            0,
            0
        );


        console.log(
            "Typewriter loaded!"
        );


        // Affiche tous les noms Blender dans la console
        typewriterModel.traverse((object) => {

            if (object.name) {
                console.log(object.name);
            }

        });

    },

    undefined,

    (error) => {

        console.error(
            "Error loading typewriter:",
            error
        );

    }

);


// ==========================================================
// SECTION 6 - TEST ANIMATION KEY_A
// ==========================================================

function press3DKey(objectName) {

    if (!typewriterModel) {
        return;
    }


    const key = typewriterModel.getObjectByName(
        objectName
    );


    if (!key) {

        console.warn(
            objectName + " not found"
        );

        return;
    }


    // Sauvegarde position originale une seule fois
    if (key.userData.originalY === undefined) {

        key.userData.originalY =
            key.position.y;

    }


    // Descend la touche
    key.position.y =
        key.userData.originalY - 0.01;


    // Puis la remet
    setTimeout(() => {

        key.position.y =
            key.userData.originalY;

    }, 100);

}


// ==========================================================
// SECTION 7 - TEST CLAVIER PHYSIQUE
// ==========================================================

window.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key.toLowerCase() === "a"
        ) {

            press3DKey(
                "Key_A"
            );

        }

    }
);


// ==========================================================
// SECTION 8 - RESIZE
// ==========================================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            container.clientWidth /
            container.clientHeight;

        camera.updateProjectionMatrix();


        renderer.setSize(
            container.clientWidth,
            container.clientHeight
        );

    }
);


// ==========================================================
// SECTION 9 - RENDER LOOP
// ==========================================================

function animate() {

    requestAnimationFrame(
        animate
    );

    renderer.render(
        scene,
        camera
    );

}

animate();