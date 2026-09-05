// ==========================================================
// SECTION 1 - ÉLÉMENTS HTML
// ==========================================================

// Papier / typewriter
const paperText = document.getElementById("paper-text");
const paperDate = document.getElementById("paper-date");
const paperInfo = document.getElementById("paper-info");
const doneButton = document.getElementById("done-button");
const newNoteButton = document.getElementById("new-note-button");
const deleteNoteButton = document.getElementById("delete-note-button");
const paper = document.querySelector(".paper");
// Saved Notes
const savedNotesButton = document.getElementById("saved-notes-button");
const savedNotesPanel = document.getElementById("saved-notes-panel");
const closeNotesButton = document.getElementById("close-notes-button");
const savedNotesList = document.getElementById("saved-notes-list");
const notesDateFilter = document.getElementById("notes-date-filter");
const notesCount = document.getElementById("notes-count");

// Note Reader
const noteReader = document.getElementById("note-reader");
const backToListButton = document.getElementById("back-to-list-button");
const noteReaderDate = document.getElementById("note-reader-date");
const noteReaderText = document.getElementById("note-reader-text");
const noteReaderCounter = document.getElementById("note-reader-counter");
const previousNoteButton = document.getElementById("previous-note-button");
const nextNoteButton = document.getElementById("next-note-button");

// Toutes les touches du clavier virtuel
const keys = document.querySelectorAll(".key");



// ==========================================================
// SECTION 2 - ÉTAT DE L'APPLICATION
// ==========================================================

let text = "";
let capsLockActive = false;
let isFinished = false;

// Notes sauvegardées / lecteur
let allSavedNotes = [];
let currentDayNotes = [];
let currentNoteIndex = 0;

// Limite de caractères
const MAX_CHARACTERS = 200;

// Heure de début de la note
let startTime = new Date();

// Affiche la date/heure sur le papier
paperDate.textContent = startTime.toLocaleString();



// ==========================================================
// SECTION 3 - LOGIQUE D'ÉCRITURE
// ==========================================================

function handleKey(key) {

    // Une note terminée ne peut plus être modifiée
    if (isFinished) {
        return;
    }

    // Lettre, chiffre, espace ou symbole
    if (key.length === 1 && text.length < MAX_CHARACTERS) {
        text += key;
    }

    // Supprime le dernier caractère
    else if (key === "Backspace") {
        text = text.slice(0, -1);
    }

    // Nouvelle ligne
    else if (key === "Enter" && text.length < MAX_CHARACTERS) {
        text += "\n";
    }

    // Met à jour le texte affiché
    paperText.textContent = text;
    //update pour la connexion a three.js
    if (window.update3DPaperText) {
        window.update3DPaperText(text);
    }

    // Ajuste la hauteur de la feuille
    updatePaperHeight();
}

window.handleKey = handleKey;



// ==========================================================
// SECTION 4 - UTILITAIRES CLAVIER
// ==========================================================

// Transforme seulement les caractères simples en minuscules
// pour retrouver le bon data-key dans le HTML.
// Ex: "A" -> "a"
function getDataKey(key) {

    if (key.length === 1) {
        return key.toLowerCase();
    }

    return key;
}



// ==========================================================
// SECTION 5 - CLAVIER PHYSIQUE
// ==========================================================

// Quand une touche physique est pressée
window.addEventListener("keydown", (event) => {

    const pressedKey = event.key;

    // Cherche la touche correspondante dans le clavier HTML
    const keyElement = document.querySelector(
        `.key[data-key="${getDataKey(pressedKey)}"]`
    );

    // Animation visuelle
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

    // Écrit la touche
    handleKey(pressedKey);
});


// Quand une touche physique est relâchée
window.addEventListener("keyup", (event) => {

    const releasedKey = event.key;

    const keyElement = document.querySelector(
        `.key[data-key="${getDataKey(releasedKey)}"]`
    );

    if (keyElement) {
        keyElement.classList.remove("pressed");
    }
});



// ==========================================================
// SECTION 6 - CLAVIER À LA SOURIS
// ==========================================================

keys.forEach((key) => {

    // Quand la souris appuie sur une touche
    key.addEventListener("mousedown", () => {

        key.classList.add("pressed");

        const clickedKey = key.dataset.key;

        // Caps Lock virtuel
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

        // Si Caps Lock est actif, transforme la lettre en majuscule
        if (capsLockActive && clickedKey.length === 1) {
            handleKey(clickedKey.toUpperCase());
        }
        else {
            handleKey(clickedKey);
        }
    });


    // Quand la souris relâche une touche
    key.addEventListener("mouseup", () => {
        key.classList.remove("pressed");
    });
});



// ==========================================================
// SECTION 7 - FEUILLE / HAUTEUR DU PAPIER
// ==========================================================

function updatePaperHeight() {

    const baseHeight = 50;

    // Hauteur réelle occupée par le texte
    const textHeight = paperText.scrollHeight;

    const newHeight = baseHeight + textHeight;

    paper.style.height = `${newHeight}px`;
}



// ==========================================================
// SECTION 8 - TERMINER ET SAUVEGARDER UNE NOTE
// ==========================================================

doneButton.addEventListener("click", () => {

    // Évite de sauvegarder plusieurs fois la même note
    if (isFinished) {
        return;
    }

    const endTime = new Date();

    // Durée totale
    const durationMilliseconds = endTime - startTime;
    const durationMinutes = Math.floor(durationMilliseconds / 60000);

    // Affichage sur la feuille
    paperInfo.textContent =
        "Written in " + durationMinutes + " minutes.";

    // Objet représentant la note complète
    const noteData = {
        text: text,
        characterCount: text.length,
        date: startTime.toISOString().split("T")[0],
        startedAt: startTime.toISOString(),
        finishedAt: endTime.toISOString(),
        durationMinutes: durationMinutes
    };

    /*
        JavaScript
            ↓
        noteData
            ↓
        POST /api/notes
            ↓
        Flask
            ↓
        Neon PostgreSQL
    */

    fetch("/api/notes", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(noteData)

    })
        .then(response => response.json())
        .then(data => {

            console.log("Saved note:", data);

            isFinished = true;
            doneButton.disabled = true;

            // Recharge immédiatement les notes depuis Neon
            // Donc si le drawer est ouvert, la nouvelle note apparaît tout de suite
            loadSavedNotes();

            animatePaperToNotes();
        });


});

function animatePaperToNotes() {

    paper.classList.add("saving");
}

// ==========================================================
// SECTION 9 - OUVRIR / FERMER SAVED NOTES
// ==========================================================

savedNotesButton.addEventListener("click", () => {

    savedNotesPanel.classList.add("open");
    savedNotesButton.classList.add("hidden");

    loadSavedNotes();
});


closeNotesButton.addEventListener("click", () => {

    savedNotesPanel.classList.remove("open");
    savedNotesButton.classList.remove("hidden");
});



// ==========================================================
// SECTION 10 - CHARGER LES NOTES DEPUIS NEON
// ==========================================================

function loadSavedNotes() {

    fetch("/api/notes")
        .then(response => response.json())
        .then(data => {

            allSavedNotes = data.notes;
            notesCount.textContent = allSavedNotes.length;

            displayNotes(allSavedNotes);
        });
}



// ==========================================================
// SECTION 11 - AFFICHER LES NOTES DANS LA LISTE
// ==========================================================

function displayNotes(notes) {

    // Vide la liste avant de la reconstruire
    savedNotesList.innerHTML = "";

    if (notes.length === 0) {
        savedNotesList.innerHTML = `
        <p class="no-notes-message">
            No notes for this date.
        </p>
    `;
        return;
    }

    notes.forEach((note) => {

        const noteElement = document.createElement("div");

        noteElement.classList.add("saved-note");

        noteElement.innerHTML = `
            <p class="saved-note-date">${note.date}</p>

            <p class="saved-note-text">
                ${note.text}
            </p>

            <p class="saved-note-info">
                ${note.characterCount} characters ·
                ${note.durationMinutes} min
            </p>
        `;

        // Ouvre le lecteur quand on clique sur une note
        noteElement.addEventListener("click", () => {
            openNoteReader(note, allSavedNotes);
        });

        savedNotesList.appendChild(noteElement);
    });
}



// ==========================================================
// SECTION 12 - LECTEUR DE NOTE
// ==========================================================

function openNoteReader(selectedNote, allNotes) {

    // Garde uniquement les notes de la même journée
    currentDayNotes = allNotes.filter(note => {
        return note.date === selectedNote.date;
    });

    // Trouve l'index de la note sélectionnée
    currentNoteIndex = currentDayNotes.findIndex(note => {
        return note.id === selectedNote.id;
    });

    // Cache la liste
    savedNotesList.classList.add("hidden");

    // Affiche le lecteur
    noteReader.classList.remove("hidden");

    showCurrentNote();
}


function showCurrentNote() {

    const note = currentDayNotes[currentNoteIndex];

    noteReaderDate.textContent = note.date;
    noteReaderText.textContent = note.text;

    noteReaderCounter.textContent =
        `Note ${currentNoteIndex + 1} of ${currentDayNotes.length}`;

    previousNoteButton.disabled = currentNoteIndex === 0;

    nextNoteButton.disabled =
        currentNoteIndex === currentDayNotes.length - 1;
}



// ==========================================================
// SECTION 13 - NAVIGATION ENTRE LES NOTES DU MÊME JOUR
// ==========================================================

nextNoteButton.addEventListener("click", () => {

    if (currentNoteIndex < currentDayNotes.length - 1) {
        currentNoteIndex++;
        showCurrentNote();
    }
});


previousNoteButton.addEventListener("click", () => {

    if (currentNoteIndex > 0) {
        currentNoteIndex--;
        showCurrentNote();
    }
});


backToListButton.addEventListener("click", () => {

    noteReader.classList.add("hidden");
    savedNotesList.classList.remove("hidden");
});



// ==========================================================
// SECTION 14 - FILTRER LES NOTES PAR DATE
// ==========================================================

notesDateFilter.addEventListener("change", () => {

    const selectedDate = notesDateFilter.value;

    // Si aucune date n'est sélectionnée, affiche tout
    if (selectedDate === "") {
        displayNotes(allSavedNotes);
        return;
    }

    // Garde seulement les notes de la date choisie
    const filteredNotes = allSavedNotes.filter((note) => {
        return note.date === selectedDate;
    });

    displayNotes(filteredNotes);
});

// ==========================================================
// SECTION 15 - CRÉER UNE NOUVELLE NOTE
// ==========================================================

function resetNote() {

    // Réinitialise le texte
    text = "";

    // Réactive l'écriture
    isFinished = false;

    // Nouvelle heure de début
    startTime = new Date();

    // Réinitialise le papier
    paperText.textContent = "";
    paperInfo.textContent = "";
    paperDate.textContent = startTime.toLocaleString();


    if (window.clear3DPaper) {
        window.clear3DPaper();
    }

    // Remet la hauteur du papier à zéro
    paper.style.height = "";

    // Retire l'animation de sauvegarde
    paper.classList.remove("saving");

    // Réactive Done
    doneButton.disabled = false;
}

// Quand on clique sur New Note
newNoteButton.addEventListener("click", () => {
    resetNote();
});


// ==========================================================
// SECTION 16 - SUPPRIMER UNE NOTE
// ==========================================================

deleteNoteButton.addEventListener("click", () => {

    if (!confirm("Delete this note?")) {
        return;
    }

    const note = currentDayNotes[currentNoteIndex];

    fetch(`/api/notes/${note.id}`, {
        method: "DELETE"
    })
        .then(response => response.json())
        .then(data => {

            console.log("Deleted:", data);

            loadSavedNotes();

            noteReader.classList.add("hidden");
            savedNotesList.classList.remove("hidden");
        });
});