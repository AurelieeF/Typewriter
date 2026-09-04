const paperText= document.getElementById("paper-text"); 
let text="";

const MAX_CHARACTERS=200;
window.addEventListener("keydown", (event) => {
    
    const pressedKey=event.key;

    console.log(pressedKey);
    if (pressedKey.length === 1 && text.length < MAX_CHARACTERS) {
        text += pressedKey;
        paperText.textContent = text;
    }
});


    