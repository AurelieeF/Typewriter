import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const container = document.getElementById("typewriter-3d");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    35,
    container.clientWidth / container.clientHeight,
    0.01,
    100
);

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

renderer.outputColorSpace = THREE.SRGBColorSpace;

container.appendChild(renderer.domElement);

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

const loader = new GLTFLoader();

let typewriterModel = null;
let paperObject = null;
let paperTextSprite = null;

const paperCanvas = document.createElement("canvas");

paperCanvas.width = 1024;
paperCanvas.height = 1024;

const paperContext =
    paperCanvas.getContext("2d");

const paperTexture =
    new THREE.CanvasTexture(paperCanvas);

paperTexture.colorSpace =
    THREE.SRGBColorSpace;

paperTexture.minFilter =
    THREE.LinearFilter;

paperTexture.magFilter =
    THREE.LinearFilter;

const key3DMap = {
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

    " ": "Key_Space",
    "Enter": "Key_Enter",
    "Backspace": "Key_Backspace",
    "CapsLock": "Key_CapsLock"
};

loader.load(
    "./models/typewriter.glb",

    (gltf) => {

        typewriterModel =
            gltf.scene;

        scene.add(
            typewriterModel
        );

        const box =
            new THREE.Box3().setFromObject(
                typewriterModel
            );

        const center =
            box.getCenter(
                new THREE.Vector3()
            );

        const size =
            box.getSize(
                new THREE.Vector3()
            );

        typewriterModel.position.x -=
            center.x;

        typewriterModel.position.y -=
            center.y;

        typewriterModel.position.z -=
            center.z;

        typewriterModel.updateMatrixWorld(
            true
        );

        const maxDimension =
            Math.max(
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

        paperObject =
            typewriterModel.getObjectByName(
                "Paper"
            );

        if (!paperObject) {

            console.warn(
                "Paper not found"
            );

        } else {

            createPaperTextSprite();

        }

        console.log(
            "Typewriter loaded!"
        );

        typewriterModel.traverse(
            (object) => {

                if (object.name) {
                    console.log(
                        object.name
                    );
                }

            }
        );

    },

    undefined,

    (error) => {

        console.error(
            "Error loading typewriter:",
            error
        );

    }
);

function createPaperTextSprite() {

    const textMaterial = new THREE.MeshBasicMaterial({
        map: paperTexture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    const textGeometry = new THREE.PlaneGeometry(
        1,
        1
    );

    paperTextSprite = new THREE.Mesh(
        textGeometry,
        textMaterial
    );

    // On attache le texte directement au Paper
    paperObject.add(
        paperTextSprite
    );

    paperTextSprite.rotation.set(
        0,
        0,
        0
    );

    paperTextSprite.position.set(
        0,
        0,
        -0.01
    );

    paperTextSprite.scale.set(
        0.85,
        0.65,
        1
    );

    paperTextSprite.scale.x *= -1;
    paperTextSprite.renderOrder = 1000;

    update3DPaperText("");

    console.log(
        "Paper text attached!"
    );
}

function press3DKey(
    objectName
) {

    if (!typewriterModel) {
        return;
    }

    const key =
        typewriterModel.getObjectByName(
            objectName
        );

    if (!key) {

        console.warn(
            objectName +
            " not found"
        );

        return;
    }

    if (
        key.userData.originalY ===
        undefined
    ) {

        key.userData.originalY =
            key.position.y;

    }

    key.position.y =
        key.userData.originalY -
        0.015;

    setTimeout(
        () => {

            key.position.y =
                key.userData.originalY;

        },
        100
    );
}

window.addEventListener(
    "keydown",
    (event) => {

        let pressedKey =
            event.key;

        if (
            pressedKey.length === 1
        ) {

            pressedKey =
                pressedKey.toLowerCase();

        }

        const objectName =
            key3DMap[
            pressedKey
            ];

        if (!objectName) {
            return;
        }

        press3DKey(
            objectName
        );

    }
);

function getKeyValueFrom3DObject(
    objectName
) {

    for (
        const [
            keyValue,
            mappedObject
        ]
        of Object.entries(
            key3DMap
        )
    ) {

        if (
            mappedObject ===
            objectName
        ) {

            return keyValue;

        }

    }

    return null;
}

const raycaster =
    new THREE.Raycaster();

const mouse =
    new THREE.Vector2();

renderer.domElement.addEventListener(
    "pointerdown",
    (event) => {

        if (!typewriterModel) {
            return;
        }

        const rect =
            renderer.domElement
                .getBoundingClientRect();

        mouse.x =
            (
                (
                    event.clientX -
                    rect.left
                )
                /
                rect.width
            )
            * 2 - 1;

        mouse.y =
            -(
                (
                    event.clientY -
                    rect.top
                )
                /
                rect.height
            )
            * 2 + 1;

        raycaster.setFromCamera(
            mouse,
            camera
        );

        const intersections =
            raycaster.intersectObject(
                typewriterModel,
                true
            );

        if (
            intersections.length === 0
        ) {
            return;
        }

        let clickedObject =
            intersections[0].object;

        while (
            clickedObject &&
            !clickedObject.name.startsWith(
                "Key_"
            )
        ) {

            clickedObject =
                clickedObject.parent;

        }

        if (!clickedObject) {
            return;
        }

        const objectName =
            clickedObject.name;

        press3DKey(
            objectName
        );

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

    }
);

function update3DPaperText(
    text
) {

    paperContext.clearRect(
        0,
        0,
        paperCanvas.width,
        paperCanvas.height
    );

    paperContext.fillStyle =
        "#241f1b";

    paperContext.font =
        "36px Courier New";

    paperContext.textBaseline =
        "top";

    const leftMargin =
        100;

    const topMargin =
        110;

    const lineHeight =
        48;

    const maxWidth =
        paperCanvas.width -
        200;

    const paragraphs =
        text.split("\n");

    let currentY =
        topMargin;

    for (
        const paragraph
        of paragraphs
    ) {

        const words =
            paragraph.split(" ");

        let line = "";

        for (
            const word
            of words
        ) {

            const testLine =
                line.length === 0
                    ? word
                    : line + " " + word;

            const width =
                paperContext
                    .measureText(
                        testLine
                    )
                    .width;

            if (
                width >
                maxWidth &&
                line !== ""
            ) {

                paperContext.fillText(
                    line,
                    leftMargin,
                    currentY
                );

                line =
                    word;

                currentY +=
                    lineHeight;

            } else {

                line =
                    testLine;

            }

        }

        paperContext.fillText(
            line,
            leftMargin,
            currentY
        );

        currentY +=
            lineHeight;

    }

    paperTexture.needsUpdate =
        true;
}

window.update3DPaperText =
    update3DPaperText;

window.clear3DPaper =
    function () {

        update3DPaperText("");

    };

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