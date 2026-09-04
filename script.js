const paperText = document.getElementById("paper-text");
let text = "";

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
    if (key === 1) {
        return key.toLowerCase();
    }
    if (key === "CapsLock" || key === "Shift" || key === "Control" || key === "Alt" || key === "Meta") {
        return "Shift";
    }

    return key;


    }
    window.addEventListener("keydown", (event) => {

        const pressedKey = event.key;

        const keyElement = document.querySelector(`.key[data-key="${getDataKey(pressedKey)}"]`);

        if (keyElement) {
            keyElement.classList.add("pressed");
        }

        handleKey(pressedKey);



    });

    window.addEventListener("keyup", (event) => {

        const releasedKey = event.key;

        const keyElement = document.querySelector(`.key[data-key="${getDataKey(releasedKey)}"]`);

        if (keyElement) {
            keyElement.classList.remove("pressed");
        }

    });


    const keys = document.querySelectorAll(".key");

    keys.forEach((key) => {
        key.addEventListener("mousedown", () => {
            key.classList.add("pressed");
            handleKey(key.dataset.key);
        });
        key.addEventListener("mouseup", () => {
            key.classList.remove("pressed");
        });
    });

