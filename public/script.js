const paperText = document.getElementById("paper-text");
const paperDate = document.getElementById("paper-date");
const paperInfo = document.getElementById("paper-info");
const doneButton = document.getElementById("done-button");
const paper = document.querySelector(".paper");

let text = "";
let capsLockActive = false;
let isFinished = false;

const startTime = new Date();
paperDate.textContent = startTime.toLocaleString();

const savedNotesButton = document.getElementById("saved-notes-button");
const savedNotesPanel = document.getElementById("saved-notes-panel");
const closeNotesButton = document.getElementById("close-notes-button");
const savedNotesList = document.getElementById("saved-notes-list");


const MAX_CHARACTERS = 200;


function handleKey(key) {

    if (isFinished) {
        return;
    }

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
    updatePaperHeight();
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

doneButton.addEventListener("click", () => {

    if (isFinished) {
        return;
    }

    const endTime = new Date();

    const durationMilliseconds = endTime - startTime;

    const durationMinutes = Math.floor(durationMilliseconds / 60000);


    //on remplace console log par noteData const
    //console.log("Started:", startTime);
    //console.log("Finished:", endTime);
    //console.log("Duration:", durationMinutes, "minutes");

    paperInfo.textContent = 'Written in ' + durationMinutes + ' minutes.';
    // noteData représente la note complète
    const noteData = {
        text: text,
        characterCount: text.length,
        date: startTime.toISOString().split("T")[0],
        startedAt: startTime.toISOString(),
        finishedAt: endTime.toISOString(),
        durationMinutes: durationMinutes
    };

    //fetch il sert a quoi? il fait la requete http depuis js vers le backend
    /*JavaScript
        ↓
    envoie noteData
        ↓
    POST /api/notes
        ↓
    Flask reçoit
        ↓
    request.get_json() */

    fetch("/api/notes", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(noteData) //envoie la note a Python

    })
        .then(response => response.json())
        .then(data => {
            console.log("Saved note:", data);
        });


    isFinished = true;
    doneButton.disabled = true;
});

function updatePaperHeight() {

    const baseHeight = 50;

    const textHeight = paperText.scrollHeight;

    const newHeight = baseHeight + textHeight;

    paper.style.height = `${newHeight}px`;
}


//partie notes sauvegarde:
savedNotesButton.addEventListener("click", () => {
    savedNotesPanel.classList.add("open");
    savedNotesButton.classList.add("hidden");
    loadSavedNotes();
});

closeNotesButton.addEventListener("click", () => {
    savedNotesPanel.classList.remove("open");
    savedNotesButton.classList.remove("hidden");
});

function loadSavedNotes() {

    fetch("/api/notes")
        .then(response => response.json())
        .then(data => {

            savedNotesList.innerHTML = "";

            data.notes.forEach((note) => {

                const noteElement = document.createElement("div");

                noteElement.classList.add("saved-note");

                noteElement.innerHTML = `
                    <p class="saved-note-date">${note.date}</p>
                    <p class="saved-note-text">${note.text}</p>
                    <p class="saved-note-info">
                        ${note.characterCount} characters · ${note.durationMinutes} min
                    </p>
                `;

                savedNotesList.appendChild(noteElement);
            });

        });
}