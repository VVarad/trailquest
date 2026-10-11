
const form = document.querySelector("#quest-form");
const generateButton = document.querySelector("#generate-btn");
const statusMessage = document.querySelector("#status-message");

const questSection = document.querySelector("#quest-section");
const questTitle = document.querySelector("#quest-title");
const questIntro = document.querySelector("#quest-intro");
const questDuration = document.querySelector("#quest-duration");
const challengeList = document.querySelector("#challenge-list");

const progressText = document.querySelector("#progress-text");
const finishButton = document.querySelector("#finish-btn");
const completionMessage = document.querySelector("#completion-message");

const newQuestButton = document.querySelector("#new-quest-btn");

let totalChallenges = 0;
let completedChallenges = 0;


form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const duration = Number(document.querySelector("#duration").value);
    const questType = document.querySelector(
        'input[name="quest_type"]:checked'
    ).value;

    generateButton.disabled = true;
    generateButton.textContent = "Creating your adventure...";

    statusMessage.textContent =
        "Dreaming up your adventure. Your AI runs locally, so this may take a few seconds.";

    statusMessage.classList.remove("error");
    statusMessage.classList.add("loading");

    questSection.hidden = true;
    completionMessage.hidden = true;

    try {
        const response = await fetch("/api/quest", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                duration: duration,
                quest_type: questType,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const quest = await response.json();

        if (
            !quest.title?.trim() ||
            !quest.introduction?.trim() ||
            !Array.isArray(quest.challenges) ||
            quest.challenges.length < 3 ||
            quest.challenges.length > 5 ||
            quest.challenges.some(
                challenge =>
                    typeof challenge !== "string" ||
                    !challenge.trim()
            )
        ) {
            throw new Error("Invalid quest response");
        }

        displayQuest(quest, duration);
        statusMessage.textContent = "";
        statusMessage.classList.remove("loading");


    } catch (error) {
        console.error("Failed to generate quest:", error);

        let message =
            "We couldn't create your quest. Please try again.";

        if (error instanceof TypeError) {
            message =
                "Couldn't reach the server. Check that TrailQuest is running, then try again.";
        } else if (error.message.startsWith("HTTP ")) {
            message =
                "The AI service encountered a problem. Please try again in a moment.";
        }

        statusMessage.textContent = message;
        statusMessage.classList.add("error");
        statusMessage.classList.remove("loading");

        questSection.hidden = true;
    } finally {
        generateButton.disabled = false;
        generateButton.innerHTML =
            'Generate my quest <span aria-hidden="true">↗</span>';

        statusMessage.classList.remove("loading");
    }
});


function displayQuest(quest, duration) {
    questTitle.textContent = quest.title;
    questIntro.textContent = quest.introduction;
    questDuration.textContent = `${duration} minutes`;

    challengeList.replaceChildren();

    totalChallenges = quest.challenges.length;
    completedChallenges = 0;

    quest.challenges.forEach((challenge, index) => {
        const card = document.createElement("label");
        card.className = "challenge";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.setAttribute(
            "aria-label",
            `Complete challenge ${index + 1}`
        );

        const textContainer = document.createElement("div");
        textContainer.className = "challenge-text";

        const title = document.createElement("strong");
        title.textContent = `Challenge ${index + 1}`;

        const description = document.createElement("p");
        description.textContent = challenge;

        textContainer.append(title, description);
        card.append(checkbox, textContainer);
        challengeList.append(card);

        checkbox.addEventListener("change", () => {
            card.classList.toggle("completed", checkbox.checked);

            completedChallenges += checkbox.checked ? 1 : -1;

            updateProgress();
        });
    });

    finishButton.disabled = true;
    completionMessage.hidden = true;

    updateProgress();

    questSection.hidden = false;
    questSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
    });
}


function updateProgress() {
    progressText.textContent =
        `${completedChallenges} of ${totalChallenges} challenges completed`;

    finishButton.disabled =
        totalChallenges === 0 ||
        completedChallenges !== totalChallenges;
}


finishButton.addEventListener("click", () => {
    if (
        totalChallenges === 0 ||
        completedChallenges !== totalChallenges
    ) {
        return;
    }

    completionMessage.hidden = false;
    finishButton.textContent = "Quest completed ✓";

    completionMessage.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
    });
});

newQuestButton.addEventListener("click", () => {
    questSection.hidden = true;
    completionMessage.hidden = true;

    statusMessage.textContent = "";
    statusMessage.classList.remove("error", "loading");

    form.scrollIntoView({
        behavior: "smooth",
        block: "start",
    });
});

