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
// ==========================================================
// KEYBOARD → OBJETS BLENDER
// ==========================================================

const key3DMap = {

    // Chiffres
    "1": "Key_1",
    "2": "Key_2",
    "3": "Key_3",
    "4": "Key_4",
    "5": "Key_5",
    "6": "Key_6",
    "7": "Key_7",
    "8": "Key_8",
    "9": "Key_9",
    "0": "Key_0",

    // Lettres
    "a": "Key_A",
    "b": "Key_B",
    "c": "Key_C",
    "d": "Key_D",
    "e": "Key_E",
    "f": "Key_F",
    "g": "Key_G",
    "h": "Key_H",
    "i": "Key_I",
    "j": "Key_J",
    "k": "Key_K",
    "l": "Key_L",
    "m": "Key_M",
    "n": "Key_N",
    "o": "Key_O",
    "p": "Key_P",
    "q": "Key_Q",
    "r": "Key_R",
    "s": "Key_S",
    "t": "Key_T",
    "u": "Key_U",
    "v": "Key_V",
    "w": "Key_W",
    "x": "Key_X",
    "y": "Key_Y",
    "z": "Key_Z",

    // Ponctuation
    ",": "Key_Comma",
    ".": "Key_Period",
    "?": "Key_Question",
    "!": "Key_Exclamation",
    ";": "Key_Semicolon",
    ":": "Key_Colon",
    "'": "Key_Apostrophe",
    '"': "Key_Quote",
    "-": "Key_Minus",
    "/": "Key_Slash",

    // Touches spéciales
    " ": "Key_Space",
    "Enter": "Key_Enter",
    "Backspace": "Key_Backspace",
    "CapsLock": "Key_CapsLock"
};


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
        key.userData.originalY - 0.08;


    // Puis la remet
    setTimeout(() => {

        key.position.y =
            key.userData.originalY;

    }, 100);

}




// ==========================================================
// SECTION 7 - CLAVIER PHYSIQUE → ANIMATION 3D
// ==========================================================

window.addEventListener("keydown", (event) => {

    let pressedKey = event.key;

    // Les lettres doivent chercher "a", "b", etc.
    if (pressedKey.length === 1) {
        pressedKey = pressedKey.toLowerCase();
    }

    const objectName = key3DMap[pressedKey];

    if (!objectName) {
        return;
    }

    press3DKey(objectName);
});

// ==========================================================
// CONVERTIT UN OBJET 3D EN TOUCHE
// ==========================================================

function getKeyValueFrom3DObject(objectName) {

    for (const [keyValue, mappedObject] of Object.entries(key3DMap)) {

        if (mappedObject === objectName) {
            return keyValue;
        }
    }

    return null;
}



// ==========================================================
// SECTION 7B - CLIC SUR LES TOUCHES 3D
// ==========================================================

const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector2();


renderer.domElement.addEventListener("pointerdown", (event) => {

    if (!typewriterModel) {
        return;
    }


    // Position de la souris dans le canvas
    const rect = renderer.domElement.getBoundingClientRect();

    mouse.x =
        ((event.clientX - rect.left) / rect.width) * 2 - 1;

    mouse.y =
        -((event.clientY - rect.top) / rect.height) * 2 + 1;


    // Lance le rayon depuis la caméra
    raycaster.setFromCamera(
        mouse,
        camera
    );


    const intersections = raycaster.intersectObject(
        typewriterModel,
        true
    );


    if (intersections.length === 0) {
        return;
    }


    // Objet réellement touché
    let clickedObject =
        intersections[0].object;


    // Si on clique sur le texte ou un enfant de la touche,
    // remonte jusqu'à l'objet Key_...
    while (
        clickedObject &&
        !clickedObject.name.startsWith("Key_")
    ) {

        clickedObject =
            clickedObject.parent;

    }


    if (!clickedObject) {
        return;
    }


    const objectName =
        clickedObject.name;


    // Animation de la touche
    press3DKey(
        objectName
    );


    // Transforme le nom Blender
    // en caractère utilisé par ton app
    const keyValue =
        getKeyValueFrom3DObject(
            objectName
        );


    if (
        keyValue !== null &&
        window.handleKey
    ) {

        window.handleKey(
            keyValue
        );

    }

});

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