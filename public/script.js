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
// Switch 2D / 3D
const viewModeToggle =
    document.getElementById("view-mode-toggle");

// Partie son
const normalKeySounds = [
    new Audio("./Sounds/Key1.mp3"),
    new Audio("./Sounds/Key2.mp3"),
    new Audio("./Sounds/Key3.mp3")
];

const spaceSound = new Audio("./Sounds/Space.mp3");
const enterSound = new Audio("./Sounds/Enter.mp3");
const backspaceSound = new Audio("./Sounds/Backspace.mp3");


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

    playKeySound(key);

    // Lettre, chiffre, espace ou symbole avec version 3d
    if (key.length === 1) {

        const nextText =
            text + key;

        if (
            window.canFitOnPaper &&
            !window.canFitOnPaper(nextText)
        ) {
            return;
        }

        text =
            nextText;
    }

    // Supprime le dernier caractère
    else if (key === "Backspace") {
        text = text.slice(0, -1);
    }

    // Nouvelle ligne avec version 3d ajoutee
    else if (key === "Enter") {

        const nextText =
            text + "\n";

        if (
            window.canFitOnPaper &&
            !window.canFitOnPaper(nextText)
        ) {
            return;
        }

        text =
            nextText;
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

function getDataKey(key) {

    if (key.length === 1) {
        return key.toLowerCase();
    }

    return key;
}



// ==========================================================
// SECTION 5 - CLAVIER PHYSIQUE
// ==========================================================

window.addEventListener("keydown", (event) => {

    const pressedKey = event.key;

    const keyElement = document.querySelector(
        `.key[data-key="${getDataKey(pressedKey)}"]`
    );

    if (keyElement) {
        keyElement.classList.add("pressed");
    }

    if (pressedKey === "CapsLock") {

        playKeySound(pressedKey);

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

    key.addEventListener("mousedown", () => {

        key.classList.add("pressed");

        const clickedKey = key.dataset.key;

        if (clickedKey === "CapsLock") {
            playKeySound(clickedKey);

            capsLockActive = !capsLockActive;

            if (capsLockActive) {
                key.classList.add("active");
            }
            else {
                key.classList.remove("active");
            }

            return;
        }

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



// ==========================================================
// SECTION 7 - FEUILLE / HAUTEUR DU PAPIER
// ==========================================================

function updatePaperHeight() {

    const baseHeight = 80;

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

    const durationMilliseconds = endTime - startTime;
    const durationMinutes = Math.floor(durationMilliseconds / 60000);

    paperInfo.textContent =
        "Written in " + durationMinutes + " minutes.";

    const noteData = {
        text: text,
        characterCount: text.length,
        date: startTime.toISOString().split("T")[0],
        startedAt: startTime.toISOString(),
        finishedAt: endTime.toISOString(),
        durationMinutes: durationMinutes
    };

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
            loadSavedNotes();

            // Animation du papier (2D + 3D)
            animatePaperToNotes();

            if (window.animate3DPaperOut) {
                window.animate3DPaperOut();
            }
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

    currentDayNotes = allNotes.filter(note => {
        return note.date === selectedNote.date;
    });

    currentNoteIndex = currentDayNotes.findIndex(note => {
        return note.id === selectedNote.id;
    });

    savedNotesList.classList.add("hidden");

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

    if (selectedDate === "") {
        displayNotes(allSavedNotes);
        return;
    }

    const filteredNotes = allSavedNotes.filter((note) => {
        return note.date === selectedDate;
    });

    displayNotes(filteredNotes);
});

// ==========================================================
// SECTION 15 - CRÉER UNE NOUVELLE NOTE
// ==========================================================

function resetNote() {

    text = "";

    isFinished = false;

    startTime = new Date();

    paperText.textContent = "";
    paperInfo.textContent = "";
    paperDate.textContent = startTime.toLocaleString();


    if (window.clear3DPaper) {
        window.clear3DPaper();
    }

    if (window.reset3DPaper) {
        window.reset3DPaper();
    }


    paper.style.height = "";

    paper.classList.remove("saving");

    doneButton.disabled = false;
}

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

// ==========================================================
// SECTION 17 - MODE 2D / 3D
// ==========================================================

// ==========================================================
// SECTION 17 - MODE 2D / 3D
// ==========================================================

viewModeToggle.addEventListener("change", () => {

    if (viewModeToggle.checked) {

        document.body.classList.remove("mode-2d");
        requestAnimationFrame(() => {

            window.dispatchEvent(
                new Event("resize")
            );

        });

    }

    else {

        document.body.classList.add("mode-2d");

    }

});

function playKeySound(key) {

    let sound;

    if (key === " " || key === "CapsLock") {
        sound = spaceSound;
    }
    else if (key === "Enter") {
        sound = enterSound;
    }
    else if (key === "Backspace") {
        sound = backspaceSound;
    }
    else {
        const randomIndex =
            Math.floor(Math.random() * normalKeySounds.length);

        sound = normalKeySounds[randomIndex];
    }

    sound.currentTime = 0;
    sound.play();
}

// ==========================================================
// MINI PLAYER D'AMBIANCE
// ==========================================================
//
// MOI : j'ajoute ici seulement la logique de mes 3 musiques.
// Je ne touche pas à la logique de mes touches, de mes notes,
// de Three.js ou de ma base de données.
//
// J'utilise UN seul objet Audio et je change simplement son fichier
// quand je fais précédent / suivant.
// ==========================================================

const ambienceTracks = [
    {
        name: "Ambiance 1",
        src: "./Sounds/Ambiance1.mp3"
    },
    {
        name: "Ambiance 2",
        src: "./Sounds/Ambiance2.mp3"
    },
    {
        name: "Ambiance 3",
        src: "./Sounds/Ambiance3.mp3"
    }
];


const ambiencePreviousButton =
    document.getElementById("ambience-previous");

const ambiencePlayButton =
    document.getElementById("ambience-play");

const ambienceNextButton =
    document.getElementById("ambience-next");

const ambienceTrackName =
    document.getElementById("ambience-track-name");

const ambienceVolumeSlider =
    document.getElementById("ambience-volume-slider");

const ambienceVolumeValue =
    document.getElementById("ambience-volume-value");


let currentAmbienceIndex = 0;


// MOI : je crée mon lecteur audio.
// Au début il charge automatiquement Ambiance 1,
// mais il ne la joue pas encore.
const ambienceAudio =
    new Audio(ambienceTracks[currentAmbienceIndex].src);

// ==========================================================
// VOLUME INITIAL
// ==========================================================
//
// MOI : en JavaScript le volume ne va PAS de 0 à 100.
// Il va de 0 à 1.
//
// 0   = 0%
// 0.5 = 50%
// 1   = 100%
//
// Donc je commence à 0.5.
// ==========================================================

ambienceAudio.volume = 0.5;


// ==========================================================
// CHARGER UNE MUSIQUE
// ==========================================================
//
// MOI : cette fonction sert quand je change de chanson.
//
// Elle va :
// 1. récupérer la chanson actuelle dans mon tableau
// 2. changer le fichier audio
// 3. changer le nom affiché dans mon mini-player
//
// shouldPlay = false veut dire :
// "je change la chanson mais je ne la lance pas forcément".
//
// shouldPlay = true veut dire :
// "je change la chanson ET je la joue directement".
// ==========================================================

function loadAmbienceTrack(shouldPlay = false) {

    const selectedTrack =
        ambienceTracks[currentAmbienceIndex];


    ambienceAudio.src =
        selectedTrack.src;


    ambienceTrackName.textContent =
        selectedTrack.name;


    if (shouldPlay) {

        ambienceAudio
            .play()

            .then(() => {

                // MOI : maintenant que la musique joue,
                // mon bouton devient le symbole Pause.
                ambiencePlayButton.textContent =
                    "❚❚";


                ambiencePlayButton.setAttribute(
                    "aria-label",
                    "Pause ambience"
                );
            })

            .catch((error) => {

                console.log(
                    "Ambience playback blocked:",
                    error
                );
            });
    }
}


// ==========================================================
// PLAY / PAUSE
// ==========================================================
//
// MOI : quand je clique sur le bouton du milieu,
// je regarde d'abord si ma musique est présentement arrêtée.
//
// Si elle est arrêtée -> play
// Si elle joue déjà -> pause
// ==========================================================

ambiencePlayButton.addEventListener("click", () => {

    if (ambienceAudio.paused) {

        ambienceAudio
            .play()

            .then(() => {

                ambiencePlayButton.textContent =
                    "❚❚";


                ambiencePlayButton.setAttribute(
                    "aria-label",
                    "Pause ambience"
                );
            });
    }

    else {

        ambienceAudio.pause();


        ambiencePlayButton.textContent =
            "▶";


        ambiencePlayButton.setAttribute(
            "aria-label",
            "Play ambience"
        );
    }
});


// ==========================================================
// MUSIQUE PRÉCÉDENTE
// ==========================================================
//
// MOI : ici je diminue mon index.
//
// Exemple :
// Ambiance 2 = index 1
// je clique previous
// index devient 0
// donc Ambiance 1.
//
// Le petit calcul avec % permet aussi de faire :
// Ambiance 1 -> previous -> Ambiance 3
// au lieu d'avoir un index -1 qui ferait exploser mon tableau.
// ==========================================================

ambiencePreviousButton.addEventListener("click", () => {

    const wasPlaying =
        !ambienceAudio.paused;


    currentAmbienceIndex =
        (
            currentAmbienceIndex
            - 1
            + ambienceTracks.length
        )
        % ambienceTracks.length;


    loadAmbienceTrack(wasPlaying);
});


// ==========================================================
// MUSIQUE SUIVANTE
// ==========================================================
//
// MOI : même principe, mais cette fois j'ajoute 1.
//
// Ambiance 1 -> Ambiance 2
// Ambiance 2 -> Ambiance 3
// Ambiance 3 -> Ambiance 1
// ==========================================================

ambienceNextButton.addEventListener("click", () => {

    const wasPlaying =
        !ambienceAudio.paused;


    currentAmbienceIndex =
        (
            currentAmbienceIndex + 1
        )
        % ambienceTracks.length;


    loadAmbienceTrack(wasPlaying);
});


// ==========================================================
// QUAND UNE MUSIQUE SE TERMINE
// ==========================================================
//
// MOI : si je laisse une chanson jouer jusqu'à la fin,
// je passe automatiquement à la suivante.
//
// Et ici je mets true dans loadAmbienceTrack(true)
// parce que je veux que la prochaine musique démarre toute seule.
// ==========================================================

ambienceAudio.addEventListener("ended", () => {

    currentAmbienceIndex =
        (
            currentAmbienceIndex + 1
        )
        % ambienceTracks.length;


    loadAmbienceTrack(true);
});

// ==========================================================
// CHANGER LE VOLUME
// ==========================================================
//
// MOI : "input" se déclenche pendant que je DRAG le slider.
// Donc le volume change immédiatement pendant que je le bouge.
//
// Mon slider donne une valeur entre 0 et 100.
// Mais Audio.volume veut une valeur entre 0 et 1.
//
// Donc je divise simplement par 100.
//
// Exemple :
// slider = 50
// 50 / 100 = 0.5
// donc volume = 50%
// ==========================================================

ambienceVolumeSlider.addEventListener("input", () => {

    const volumePercent =
        Number(ambienceVolumeSlider.value);


    ambienceAudio.volume =
        volumePercent / 100;


    ambienceVolumeValue.textContent =
        `${volumePercent}%`;
});


// ==========================================================
// ARRÊTER DE FAIRE EN SORTE QUE SPACE SELECTION TOUT
//  ========================================================
// 
document.addEventListener("pointerup", (event) => {

    const clickedElement = event.target.closest(
        "button, input[type='range']"
    );

    if (clickedElement) {
        clickedElement.blur();
    }

});