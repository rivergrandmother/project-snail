// =========================
// SNAIL - GAME
// =========================


// =========================
// PLAYER DATA
// =========================

const player = {
    courage: 0,
    calm: 0,
    curiosity: 0,
    patience: 0,
    freedom: 0,
    play: 0,
    energy: 0,
    "self-trust": 0,
    connection: 0
};


// =========================
// GAME DATA
// =========================

let questions = [];
let todaysQuestion = null;


// =========================
// PROGRESS
// =========================

let progress = {
    currentQuestion: 0,
    lastPlayedDate: null,
    history: []
};


// =========================
// LOAD SAVED PROGRESS
// =========================

function loadProgress() {

    const savedProgress =
        localStorage.getItem("snailProgress");

    const savedPlayer =
        localStorage.getItem("snailPlayer");


    if (savedProgress) {

        progress =
            JSON.parse(savedProgress);

    }


    if (savedPlayer) {

        Object.assign(
            player,
            JSON.parse(savedPlayer)
        );

    }

}


// =========================
// SAVE PROGRESS
// =========================

function saveProgress() {

    localStorage.setItem(
        "snailProgress",
        JSON.stringify(progress)
    );


    localStorage.setItem(
        "snailPlayer",
        JSON.stringify(player)
    );

}


// =========================
// LOCAL DATE
// =========================

function getToday() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


// =========================
// CHECK IF PLAYED TODAY
// =========================

function hasPlayedToday() {

    return (
        progress.lastPlayedDate ===
        getToday()
    );

}


// =========================
// SCREENS
// =========================

const screens = {

    home:
        document.getElementById(
            "home-screen"
        ),

    choice:
        document.getElementById(
            "choice-screen"
        ),

    result:
        document.getElementById(
            "result-screen"
        ),

    journey:
        document.getElementById(
            "journey-screen"
        )

};


// =========================
// ELEMENTS
// =========================

const startButton =
    document.getElementById(
        "start-button"
    );


const continueButton =
    document.getElementById(
        "continue-button"
    );


const homeMessage =
    document.getElementById(
        "home-message"
    );


const progressCounter =
    document.getElementById(
        "progress-counter"
    );


const questionElement =
    document.getElementById(
        "question"
    );


const choicesContainer =
    document.getElementById(
        "choices"
    );


const qualityElement =
    document.getElementById(
        "quality"
    );


const affirmationElement =
    document.getElementById(
        "affirmation"
    );


// =========================
// SCREEN MANAGEMENT
// =========================

function showScreen(screen) {

    Object.values(screens).forEach(
        screen => {

            screen.classList.remove(
                "active"
            );

        }
    );


    screen.classList.add(
        "active"
    );

}


// =========================
// LOAD QUESTIONS
// =========================

async function loadQuestions() {

    try {

        const response =
            await fetch(
                "questions.json"
            );


        if (!response.ok) {

            throw new Error(
                "Could not load questions.json"
            );

        }


        questions =
            await response.json();


        console.log(
            "Questions loaded:",
            questions.length
        );


        setCurrentQuestion();

        updateJourney();

        updateHomeScreen();


    } catch (error) {

        console.error(error);


        homeMessage.textContent =
            "Something went wrong loading Snail.";

    }

}


// =========================
// SET CURRENT QUESTION
// =========================

function setCurrentQuestion() {

    if (
        questions.length === 0
    ) {

        return;

    }


    // Journey finished
    if (
        progress.currentQuestion >=
        questions.length
    ) {

        todaysQuestion = null;

        return;

    }


    todaysQuestion =
        questions[
            progress.currentQuestion
        ];

}


// =========================
// LOAD QUESTION
// =========================

function loadQuestion() {

    if (!todaysQuestion) {

        return;

    }


    questionElement.textContent =
        todaysQuestion.question;


    // Update 01 / 30 counter
    progressCounter.textContent =
        `${String(
            progress.currentQuestion + 1
        ).padStart(2, "0")} / ${String(
            questions.length
        ).padStart(2, "0")}`;


    choicesContainer.innerHTML =
        "";


    todaysQuestion.choices.forEach(
        (choice, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "choice";


            button.textContent =
                choice.text;


            button.addEventListener(
                "click",
                () => {

                    chooseAnswer(index);

                }
            );


            choicesContainer.appendChild(
                button
            );

        }
    );

}


// =========================
// CHOOSE ANSWER
// =========================

function chooseAnswer(index) {

    // Don't allow two plays
    // on the same day
    if (hasPlayedToday()) {

        return;

    }


    const choice =
        todaysQuestion.choices[
            index
        ];


    const quality =
        choice.quality.toLowerCase();


    const playerKey =
        quality.replace(
            " ",
            "-"
        );


    // Add quality point
    if (
        player[playerKey] !==
        undefined
    ) {

        player[playerKey]++;

    }


    // Save history
    progress.history.push({

        day:
            progress.currentQuestion + 1,

        questionId:
            todaysQuestion.id,

        question:
            todaysQuestion.question,

        choice:
            choice.text,

        quality:
            choice.quality,

        affirmation:
            choice.affirmation,

        date:
            getToday()

    });


    // Mark today as played
    progress.lastPlayedDate =
        getToday();


    // Move to next question
    progress.currentQuestion++;


    // Save
    saveProgress();


    // Show result
    qualityElement.textContent =
        `${choice.quality.toUpperCase()} +1`;


    affirmationElement.textContent =
        choice.affirmation;


    // Update everything
    updateJourney();

    updateHomeScreen();


    // Show result
    showScreen(
        screens.result
    );

}


// =========================
// UPDATE HOME SCREEN
// =========================

function updateHomeScreen() {

    if (
        questions.length === 0
    ) {

        return;

    }


    // Finished all 30 days
    if (
        progress.currentQuestion >=
        questions.length
    ) {

        homeMessage.textContent =
            "Your first journey is complete.";


        startButton.textContent =
            "[ view journey ]";


        return;

    }


    // Already played today
    if (
        hasPlayedToday()
    ) {

        homeMessage.textContent =
            "You've already made your choice today.";


        startButton.textContent =
            "[ view journey ]";


        return;

    }


    // Ready to play
    homeMessage.textContent =
        "What do you need today?";


    startButton.textContent =
        "[ begin ]";

}


// =========================
// UPDATE JOURNEY
// =========================

function updateJourney() {

    Object.keys(player).forEach(
        quality => {

            const value =
                player[quality];


            const valueElement =
                document.getElementById(
                    `${quality}-value`
                );


            const barElement =
                document.getElementById(
                    `${quality}-bar`
                );


            // Update number
            if (
                valueElement
            ) {

                valueElement.textContent =
                    value;

            }


            // Update bar
            if (
                barElement
            ) {

                const percentage =
                    Math.min(
                        value * 10,
                        100
                    );


                barElement.style.width =
                    `${percentage}%`;

            }

        }
    );

}


// =========================
// START / HOME BUTTON
// =========================

startButton.addEventListener(
    "click",
    () => {

        // Already played today
        if (
            hasPlayedToday()
        ) {

            showScreen(
                screens.journey
            );

            return;

        }


        // Journey complete
        if (
            progress.currentQuestion >=
            questions.length
        ) {

            showScreen(
                screens.journey
            );

            return;

        }


        loadQuestion();


        showScreen(
            screens.choice
        );

    }
);


// =========================
// CONTINUE BUTTON
// =========================

continueButton.addEventListener(
    "click",
    () => {

        showScreen(
            screens.journey
        );

    }
);


// =========================
// INITIALISE
// =========================

loadProgress();

loadQuestions();