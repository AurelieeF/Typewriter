const paperText = document.getElementById("paper-text");
let text = "";
let shiftActive = false;


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
    if (key === "CapsLock") {
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

    if(pressedKey === "CapsLock") {
        shiftActive = event.getModifierState("CapsLock");

        if(shiftActive) {
            keyElement.classList.add("active");
        } else {
            keyElement.classList.remove("active");
        }
        return;
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

        const clickedKey = key.dataset.key;

        if (clickedKey === "Shift") {
            shiftActive = !shiftActive;

            if(shiftActive) {
                key.classList.add("active");

            } else {
                key.classList.remove("active");
            }
            
            return;
        }

        if (shiftActive && clickedKey.length === 1) {
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

