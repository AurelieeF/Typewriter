const paperText = document.getElementById("paper-text");
const paperDate = document.getElementById("paper-date");

let text = "";
let capsLockActive = false;

const startTime = new Date();
paperDate.textContent = startTime.toLocaleString();



const MAX_CHARACTERS = 200;


function handleKey(key) {

    if (key.length === 1 && text.length < MAX_CHARACTERS) {
        text += key;
    }

    else if (key === "Backspace") {
        text = text.slice(0, -1);
    }

    else if (key === "Enter" && text.length < MAX_CHARACTERS) {
        text += "\n";
    }

    paperText.textContent = text;
}


function getDataKey(key) {

    if (key.length === 1) {
        return key.toLowerCase();
    }

    return key;
}


// CLAVIER PHYSIQUE
window.addEventListener("keydown", (event) => {

    const pressedKey = event.key;

    const keyElement = document.querySelector(
        `.key[data-key="${getDataKey(pressedKey)}"]`
    );


    if (keyElement) {
        keyElement.classList.add("pressed");
    }


    // Caps Lock physique
    if (pressedKey === "CapsLock") {

        capsLockActive = event.getModifierState("CapsLock");

        if (keyElement) {

            if (capsLockActive) {
                keyElement.classList.add("active");
            }
            else {
                keyElement.classList.remove("active");
            }

        }

        return;
    }


    handleKey(pressedKey);
});


// QUAND ON RELÂCHE UNE TOUCHE PHYSIQUE
window.addEventListener("keyup", (event) => {

    const releasedKey = event.key;

    const keyElement = document.querySelector(
        `.key[data-key="${getDataKey(releasedKey)}"]`
    );

    if (keyElement) {
        keyElement.classList.remove("pressed");
    }

});


// CLAVIER À LA SOURIS
const keys = document.querySelectorAll(".key");

keys.forEach((key) => {

    key.addEventListener("mousedown", () => {

        key.classList.add("pressed");

        const clickedKey = key.dataset.key;


        // Clic sur Caps Lock
        if (clickedKey === "CapsLock") {

            capsLockActive = !capsLockActive;

            if (capsLockActive) {
                key.classList.add("active");
            }
            else {
                key.classList.remove("active");
            }

            return;
        }


        // Lettre avec Caps Lock activé
        if (capsLockActive && clickedKey.length === 1) {

            handleKey(clickedKey.toUpperCase());

        }
        else {

            handleKey(clickedKey);

        }

    });


    key.addEventListener("mouseup", () => {

        key.classList.remove("pressed");

    });

});

