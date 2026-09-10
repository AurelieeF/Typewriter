import * as THREE from "three";

import {
    GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";


const container =
    document.getElementById(
        "typewriter-3d"
    );


const scene =
    new THREE.Scene();


const camera =
    new THREE.PerspectiveCamera(
        35,
        container.clientWidth /
        container.clientHeight,
        0.01,
        100
    );


const renderer =
    new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        3
    )
);


renderer.setSize(
    container.clientWidth,
    container.clientHeight
);


renderer.outputColorSpace =
    THREE.SRGBColorSpace;


container.appendChild(
    renderer.domElement
);


const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        2
    );


scene.add(
    ambientLight
);


const mainLight =
    new THREE.DirectionalLight(
        0xffffff,
        3
    );


mainLight.position.set(
    3,
    5,
    4
);


scene.add(
    mainLight
);


const loader =
    new GLTFLoader();


let typewriterModel = null;

let paperObject = null;

let paperTextSprite = null;

let rollerObject = null;

let paperStartY = null;

let rollerStartRotation = null;

let currentVisualLineCount = 1;


const paperCanvas =
    document.createElement(
        "canvas"
    );


paperCanvas.width =
    2048;

paperCanvas.height =
    2048;


const paperContext =
    paperCanvas.getContext(
        "2d"
    );


const paperTexture =
    new THREE.CanvasTexture(
        paperCanvas
    );


paperTexture.colorSpace =
    THREE.SRGBColorSpace;


paperTexture.minFilter =
    THREE.LinearFilter;


paperTexture.magFilter =
    THREE.LinearFilter;


const FONT_SIZE = 100;

const LINE_HEIGHT = 110;

const LEFT_MARGIN = 140;

const RIGHT_MARGIN = 140;

const TOP_MARGIN = 140;

const BOTTOM_MARGIN = 140;


const MAX_TEXT_WIDTH =
    paperCanvas.width -
    LEFT_MARGIN -
    RIGHT_MARGIN;


const MAX_LINES =
    Math.floor(
        (
            paperCanvas.height -
            TOP_MARGIN -
            BOTTOM_MARGIN
        )
        /
        LINE_HEIGHT
    );


paperContext.font =
    `${FONT_SIZE}px Courier New`;


paperContext.textBaseline =
    "top";


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

    gltf => {

        typewriterModel =
            gltf.scene;


        scene.add(
            typewriterModel
        );


        const box =
            new THREE.Box3()
                .setFromObject(
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


        if (paperObject) {

            const paperWorldBox =
                new THREE.Box3()
                    .setFromObject(
                        paperObject
                    );


            const paperWorldSize =
                paperWorldBox.getSize(
                    new THREE.Vector3()
                );


            typewriterModel.position.y -=
                paperWorldSize.y *
                0.9;


            typewriterModel.updateMatrixWorld(
                true
            );


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

    },

    undefined,

    error => {

        console.error(
            "Error loading typewriter:",
            error
        );

    }

);


function feedPaper(
    lineDifference = 1
) {

    if (
        !paperObject ||
        paperStartY === null
    ) {

        return;

    }


    const lineMovement =
        0.015;


    const rollerMovement =
        0.15;


    const oldPaperY =
        paperObject.position.y;


    const targetPaperY =
        Math.max(
            paperStartY,
            oldPaperY +
            lineMovement *
            lineDifference
        );


    const appliedMovement =
        targetPaperY -
        oldPaperY;


    const appliedLines =
        appliedMovement /
        lineMovement;


    paperObject.position.y =
        targetPaperY;


    if (
        rollerObject &&
        rollerStartRotation !== null
    ) {

        rollerObject.rotation.x +=
            rollerMovement *
            appliedLines;


        if (
            paperObject.position.y <=
            paperStartY
        ) {

            paperObject.position.y =
                paperStartY;

            rollerObject.rotation.x =
                rollerStartRotation;
        }
    }
}


window.feed3DPaper =  feedPaper;


function createPaperTextSprite() {

    if (
        !paperObject.geometry.boundingBox
    ) {

        paperObject.geometry.computeBoundingBox();
    }

    const box =
        paperObject.geometry.boundingBox;


    const size =
        new THREE.Vector3();


    box.getSize(
        size
    );


    const center =
        new THREE.Vector3();


    box.getCenter(
        center
    );


    const textMaterial =
        new THREE.MeshBasicMaterial({

            map:
                paperTexture,

            transparent:
                true,

            depthTest:
                true,

            depthWrite:
                false,

            side:
                THREE.DoubleSide

        });


    if (
        size.z <= size.x &&
        size.z <= size.y
    ) {

        paperTextSprite =
            new THREE.Mesh(

                new THREE.PlaneGeometry(
                    size.x * 0.92,
                    size.y * 0.92
                ),

                textMaterial

            );

        paperTextSprite.position.set(
            center.x,
            center.y,
            box.min.z + 0.001
        );

    }

    else if (
        size.y <= size.x &&
        size.y <= size.z
    ) {

        paperTextSprite =
            new THREE.Mesh(

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

        paperTextSprite =
            new THREE.Mesh(

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


    paperTextSprite.scale.x *=
        -1;


    paperTextSprite.renderOrder =
        10;


    update3DPaperText(
        ""
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
    event => {

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
)


function getKeyValueFrom3DObject(
    objectName
) {

    for (
        const [
            keyValue,
            mappedObject
        ]
        of
        Object.entries(
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
    event => {

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
            * 2 -
            1;


        mouse.y =
            -(
                (
                    event.clientY -
                    rect.top
                )
                /
                rect.height
            )
            * 2 +
            1;


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
            intersections.length ===
            0
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


function getWrappedLines(
    currentText
) {

    paperContext.font =
        `${FONT_SIZE}px Courier New`;


    const paragraphs =
        currentText.split(
            "\n"
        );


    const lines = [];


    for (
        const paragraph
        of paragraphs
    ) {

        if (
            paragraph.length === 0
        ) {

            lines.push(
                ""
            );

            continue;

        }


        let currentLine =
            "";


        for (
            const character
            of paragraph
        ) {

            const candidateLine =
                currentLine +
                character;


            const width =
                paperContext
                    .measureText(
                        candidateLine
                    )
                    .width;

            if (
                width <=
                MAX_TEXT_WIDTH
            ) {

                currentLine =
                    candidateLine;

            }

            else {

                if (
                    currentLine.length >
                    0
                ) {

                    lines.push(
                        currentLine
                    );

                }


                currentLine =
                    character;

            }

        }


        lines.push(
            currentLine
        );

    }


    if (
        lines.length === 0
    ) {

        lines.push(
            ""
        );

    }


    return lines;
}


function canFit3DText(
    candidateText
) {

    const lines =
        getWrappedLines(
            candidateText
        );


    return (
        lines.length <=
        MAX_LINES
    );

}


window.canFit3DText =
    canFit3DText;


function syncPaperToLineCount(
    newLineCount
) {

    const lineDifference =
        newLineCount -
        currentVisualLineCount;


    if (
        lineDifference !== 0
    ) {

        feedPaper(
            lineDifference
        );

    }


    currentVisualLineCount =
        newLineCount;
}


function update3DPaperText(
    currentText
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
        `${FONT_SIZE}px Courier New`;


    paperContext.textBaseline =
        "top";


    const lines =
        getWrappedLines(
            currentText
        );


    const visibleLines =
        lines.slice(
            0,
            MAX_LINES
        );


    visibleLines.forEach(
        (
            line,
            index
        ) => {

            paperContext.fillText(
                line,
                LEFT_MARGIN,
                TOP_MARGIN +
                index *
                LINE_HEIGHT
            );

        }
    );


    syncPaperToLineCount(
        lines.length
    );


    paperTexture.needsUpdate =
        true;
}
window.update3DPaperText =
    update3DPaperText;

window.clear3DPaper =
    function () {

        update3DPaperText(
            ""
        );

    };


window.reset3DPaper =
    function () {

        if (
            paperObject &&
            paperStartY !== null
        ) {

            paperObject.position.y =
                paperStartY;

        }


        if (
            rollerObject &&
            rollerStartRotation !== null
        ) {

            rollerObject.rotation.x =
                rollerStartRotation;

        }


        currentVisualLineCount =
            1;


        paperContext.clearRect(
            0,
            0,
            paperCanvas.width,
            paperCanvas.height
        );

        paperTexture.needsUpdate =
            true;

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