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
    Math.min(window.devicePixelRatio, 3)
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

let rollerObject = null;

let paperStartY = null;
let rollerStartRotation = null;

const paperCanvas = document.createElement("canvas");

paperCanvas.width = 2084;
paperCanvas.height = 2048;

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
            maxDimension * 1.05,
            maxDimension * 1.2
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

        rollerObject =
            typewriterModel.getObjectByName(
                "Roller"
            );

        if (paperObject) {
            paperStartY =
                paperObject.position.y;
        }

        if (rollerObject) {
            rollerStartRotation =
                rollerObject.rotation.x;
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
function feedPaper() {

    if (!paperObject) {
        return;
    }

    // La feuille monte légèrement
    paperObject.position.y += 0.015;


    // Le roller tourne
    if (rollerObject) {
        rollerObject.rotation.x += 0.15;
    }
}
window.feed3DPaper =
    feedPaper;

function createPaperTextSprite() {

    // Bounding box LOCALE du vrai Paper Blender
    if (!paperObject.geometry.boundingBox) {
        paperObject.geometry.computeBoundingBox();
    }

    const box = paperObject.geometry.boundingBox;

    const size = new THREE.Vector3();
    box.getSize(size);

    const center = new THREE.Vector3();
    box.getCenter(center);


    const textMaterial = new THREE.MeshBasicMaterial({
        map: paperTexture,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        side: THREE.DoubleSide
    });


    /*
        On détecte automatiquement l'axe le plus mince
        du Paper.

        Le Paper est essentiellement un cube très mince.
        L'axe le plus mince = profondeur de la feuille.
    */

    if (
        size.z <= size.x &&
        size.z <= size.y
    ) {

        // Grande face = XY
        paperTextSprite = new THREE.Mesh(
            new THREE.PlaneGeometry(
                size.x * 0.92,
                size.y * 0.92
            ),
            textMaterial
        );

        paperTextSprite.position.set(
            center.x,
            center.y,
            box.min.z - 0.001
        );

    }

    else if (
        size.y <= size.x &&
        size.y <= size.z
    ) {

        // Grande face = XZ
        paperTextSprite = new THREE.Mesh(
            new THREE.PlaneGeometry(
                size.x * 0.92,
                size.z * 0.92
            ),
            textMaterial
        );

        paperTextSprite.rotation.x =
            Math.PI / 2;

        paperTextSprite.position.set(
            center.x,
            box.min.y - 0.001,
            center.z
        );

    }

    else {

        // Grande face = YZ
        paperTextSprite = new THREE.Mesh(
            new THREE.PlaneGeometry(
                size.y * 0.92,
                size.z * 0.92
            ),
            textMaterial
        );

        paperTextSprite.rotation.y =
            Math.PI / 2;

        paperTextSprite.position.set(
            box.min.x - 0.001,
            center.y,
            center.z
        );

    }


    paperObject.add(
        paperTextSprite
    );


    paperTextSprite.renderOrder =
        10;


    update3DPaperText("");

    console.log(
        "Text fitted to real Paper surface",
        size
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
        "72px Courier New";

    paperContext.textBaseline =
        "top";

    const leftMargin =
        70;

    const topMargin =
        70;

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