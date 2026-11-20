let currentUser = null;
const authSection = document.getElementById("authSection");
const userSection = document.getElementById("userSection");
const userCharacters = document.getElementById("userCharacters");
const publicCharacters = document.getElementById("publicCharacters");
const message = document.getElementById("message");
const genders = { F: "Nő", M: "Férfi", G: "Nemtelen" };

function createCharacterCard(character, editable = false) {
    const column = document.createElement("div");
    column.className = "col-12 col-sm-6 col-lg-4 col-xl-3";

    const card = document.createElement("div");
    card.className = "character";

    if (character.image) {
        const img = document.createElement("img");
        img.src = character.image;
        img.onerror = () => img.style.display = "none";
        card.appendChild(img);
    }

    const title = document.createElement("h3");
    title.textContent = character.name;
    card.appendChild(title);

    const fields = [
        ["Karakter neve", "name"],
        ["Igazi neve", "real_name"],
        ["Születésnap", "birthday"],
        ["Faj", "species"],
        ["Nem", "gender"],
        ["Fajta", "breed"],
        ["Kép URL-je", "image"]
    ];

    // Normál kártyán a kép URL-je nem jelenik meg.
    fields.slice(1, 6).forEach(([label, key]) => {
        let value = character[key];

        if (key == "gender") {
            value = genders[value] || value;
        }

        if (value && value != "0") {
            const p = document.createElement("p");
            p.textContent = label + ": " + value;
            card.appendChild(p);
        }
    });

    if (editable) {
        const buttons = document.createElement("div");
        buttons.className = "character-buttons";

        const edit = document.createElement("button");
        edit.textContent = "✏️";
        edit.title = "Szerkesztés";

        edit.onclick = () => {
            card.innerHTML = "";

            const inputs = {};

            fields.forEach(([label, key]) => {
                if (key == "real_name") {
                    const p = document.createElement("p");
                    p.textContent = "Igazi neve: " + character.real_name;
                    card.appendChild(p);
                    return;
                }

                const input = document.createElement("input");
                input.className = "form-control mb-2";
                input.placeholder = label;
                input.value = character[key] || "";

                if (key == "gender") {
                    input.placeholder = "Nem (F/M/G)";
                }

                inputs[key] = input;
                card.appendChild(input);
            });

            const publicSelect = document.createElement("select");
            publicSelect.className = "form-select mb-2";
            publicSelect.innerHTML = `
                <option value="1">Publikus</option>
                <option value="0">Privát</option>
            `;
            publicSelect.value = character.isPublic;
            card.appendChild(publicSelect);

            const controls = document.createElement("div");
            controls.className = "character-buttons";

            const save = document.createElement("button");
            save.textContent = "💾";
            save.title = "Mentés";

            save.onclick = () => {
                fetch(`/api/users/characters/${currentUser.id}/${encodeURIComponent(character.real_name)}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: inputs.name.value,
                        birthday: inputs.birthday.value,
                        species: inputs.species.value,
                        gender: inputs.gender.value,
                        breed: inputs.breed.value,
                        image: inputs.image.value,
                        isPublic: Number(publicSelect.value)
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.message == "Character updated") {
                        loadUserCharacters();
                        loadPublicCharacters();
                    } else {
                        alert("Nem sikerült a módosítás!");
                    }
                });
            };

            const cancel = document.createElement("button");
            cancel.textContent = "❌";
            cancel.title = "Mégse";
            cancel.onclick = loadUserCharacters;

            controls.append(save, cancel);
            card.appendChild(controls);
        };

        const del = document.createElement("button");
        del.textContent = "🗑️";
        del.title = "Törlés";

        del.onclick = () => {
            if (confirm("Biztosan törlöd ezt a karaktert?")) {
                fetch(`/api/users/characters/${currentUser.id}/${encodeURIComponent(character.real_name)}`, {
                    method: "DELETE"
                })
                .then(() => {
                    loadUserCharacters();
                    loadPublicCharacters();
                });
            }
        };

        buttons.append(edit, del);
        card.appendChild(buttons);
    }

    column.appendChild(card);
    return column;
}

// Publikus karakterek betöltése
function loadPublicCharacters() {
    fetch("/api/characters")
        .then(res => res.json())
        .then(data => {
            publicCharacters.innerHTML = "";

            data.forEach(character => {
                publicCharacters.appendChild(createCharacterCard(character));
            });
        });
}

// Saját karakterek betöltése
function loadUserCharacters() {
    fetch(`/api/users/characters/${currentUser.id}`)
        .then(res => res.json())
        .then(data => {
            userCharacters.innerHTML = "";

            data.forEach(character => {
                userCharacters.appendChild(createCharacterCard(character, true));
            });
        });
}

// Regisztráció
document.getElementById("registerForm").onsubmit = (e) => {
    e.preventDefault();

    fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: document.getElementById("regUsername").value,
            email: document.getElementById("regEmail").value,
            password: document.getElementById("regPassword").value
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.id) {
            message.textContent = "Sikeres regisztráció! Most már bejelentkezhetsz.";
            message.style.color = "green";
            e.target.reset();
        } else {
            message.textContent = data.message || "Sikertelen regisztráció!";
            message.style.color = "red";
        }
    })
    .catch(() => {
        message.textContent = "Hiba történt a regisztráció során!";
        message.style.color = "red";
    });
};

// Bejelentkezés
document.getElementById("loginForm").onsubmit = (e) => {
    e.preventDefault();

    fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: document.getElementById("loginEmail").value,
            password: document.getElementById("loginPassword").value
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.id) {
            currentUser = data;
            authSection.hidden = true;
            userSection.hidden = false;

            document.getElementById("welcome").textContent = "Szia, " + data.username + "!";

            e.target.reset();
            message.textContent = "";

            loadUserCharacters();
        } else {
            message.textContent = "Hibás e-mail cím vagy jelszó!";
            message.style.color = "red";
        }
    });
};

// Új karakter hozzáadása
document.getElementById("characterForm").onsubmit = (e) => {
    e.preventDefault();

    fetch("/api/users/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: document.getElementById("characterName").value,
            real_name: document.getElementById("realName").value,
            birthday: document.getElementById("birthday").value,
            species: document.getElementById("species").value,
            gender: document.getElementById("gender").value,
            breed: document.getElementById("breed").value,
            image: document.getElementById("image").value,
            isPublic: Number(document.getElementById("isPublic").value),
            userId: currentUser.id
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message == "Character saved") {
            e.target.reset();
            message.textContent = "Sikeresen hozzáadtad a karaktert!";
            message.style.color = "green";

            loadUserCharacters();
            loadPublicCharacters();
        } else {
            message.textContent = "Nem sikerült a mentés!";
            message.style.color = "red";
        }
    });
};

// Kijelentkezés
document.getElementById("logoutButton").onclick = () => {
    currentUser = null;

    clearForms();

    userCharacters.innerHTML = "";
    message.textContent = "";

    userSection.hidden = true;
    authSection.hidden = false;

    loadPublicCharacters();
};

// Inputok kiürítése
function clearForms() {
    document.querySelectorAll("form").forEach(form => form.reset());
}

clearForms();
loadPublicCharacters();