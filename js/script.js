/********* variables *********/
let personalData

let currentTeamName
let currentTeamID

function updateDashboard(){
    getPlayers();
    getEvents();
    getTeamRequests();
}

/********* check login *********/
//region
checkLogin()

/**
 * checks if the current user is logged in
 * if not it sends you to the login page
 */
function checkLogin(){
    fetch(`./server/user.php/`)
        .then((response) => {
            return response.json()
        })
        .then(answer=>{
            if(answer.loggedIn !== true){
                window.location.replace(document.location.href + "/login.html");
            }
            else{
                personalData = answer.personalData;

                document.querySelector(".userName").innerHTML = personalData.firstname + " " + personalData.lastname;
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}
//endregion


/********* navigation hover effect *********/
//region
let hoverBox = document.querySelector(".hoverBox");

/**
 * highlights the elem with a lightgreen box
 * @param elem highlighted elem
 * @param isHighlighted boolean: true = highlight, false = unhighlight
 */
function highlightNavitem(elem, isHighlighted){
    if(isHighlighted){
        hoverBox.style.opacity= 0.3;
        let rect = elem.getBoundingClientRect();
        hoverBox.style.top = rect.top-document.querySelector("nav").clientHeight+rect.height/2+"px";
    } else{
        hoverBox.style.opacity = 0;
    }
}
function addNavitemEventListener(){
    document.querySelectorAll("aside .content p").forEach((item)=>{
        item.onmouseenter = () => {highlightNavitem(item, true)};
        item.onmouseleave = () => {highlightNavitem(null, false)};
    })
}
//endregion


/********* asside *********/
//region
getMyTeams()

/**
 * gets the teams where the user is in
 */
function getMyTeams(){
    fetch(`./server/team.php/getTeams`)
        .then((response) => {
            return response.json()
        })
        .then(answer=>{
            renderAside(answer.data)
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}
function renderAside(data){
    let html = "<div>";

    //todo activated team can get selected
    let i = 0;
    Object.values(data).forEach(item => {
        if(i++ === 0){
            html += `<p class="active" onclick="selectTeam(this, ${item.id})">${item.name}`;
            currentTeamID = item.id
        } else{
            html += `<p onclick="selectTeam(this, ${item.id})">${item.name}`;
        }

        if (item.captain === item.playerID) {
            html += `<i class="fa-solid fa-crown"></i>`;
        }

        html += `</p>`;
    });

    html += `</div>`
    html += `<div onclick="togglePopUp()" class="addButton"><span>Team Hinzufügen</span><i class="fa-solid fa-plus"></div>`

    document.querySelector("main aside section .content").innerHTML = html

    addNavitemEventListener()
    highlightNavitem(null, false)
    updateDashboard()
}

function selectTeam(elem, id){
    if(document.querySelector(".active")){
        document.querySelector(".active").classList.remove("active");
    }
    elem.classList.add("active");

    currentTeamID = id;
    currentTeamName = elem.textContent;
    updateDashboard()
    document.querySelector("nav .teamName").innerHTML = currentTeamName;
}
//endregion


/********* popup add team *********/
//region
function togglePopUp(){
    document.querySelector(".popUp.addTeam").classList.toggle("active");
    if(!document.querySelector(".popUp.addTeam.active")){
        document.querySelector(".error.create").innerHTML = ""
        loadTeamList()
    }
    document.querySelector(".popUp.addTeam .active input").focus();
}
function toggleTeamCreate(){
    let activeDiv = document.querySelector(".popUp .add.active") ? "create" : "add"

    document.querySelector(".popUp .active").classList.remove("active");
    document.querySelector(`.popUp .${activeDiv}`).classList.add("active")
    document.querySelector(".popUp .active input").focus();
}

let teams = {}
function loadTeamList(){
    fetch(`./server/team.php/getAllTeams`)
        .then((response) => {
            return response.json()
        })
        .then(answer=>{
            teams = answer;

            let html = "";
            Object.values(answer.data).forEach(item => {
                html += `<p onclick="addTeamToFilter('${item.name}')">${item.name}</p>`
            })
            document.querySelector(".teamList div").innerHTML = html;

        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

/**
 * sets the teamname into the search input field
 * @param teamname
 */
function addTeamToFilter(teamname){
    document.querySelector("#findTeamInput").value = teamname;
    document.querySelector(".popUp .add .buttons button:last-child").disabled = false

    document.querySelector("#findTeamInput").addEventListener("keydown", function(event) {
        if (event.keyCode === 13) {
            requestTeam();
        }
    });
}

/**
 * filters the search input field with all teams where the user is not in
 */
function filterTeam(){
    let input = document.querySelector("#findTeamInput");

    if(document.querySelector(".popUp .add .buttons button:last-child").disabled == false){
        document.querySelector(".popUp .add .buttons button:last-child").disabled = true
    }

    let html = "";

    let value = 0;
    Object.values(teams.data).forEach(item => {
        if(item.name.includes(input.value)){

            if(item.name === input.value){
                addTeamToFilter(input.value);
            }

            value ++;
            html += `<p onclick="addTeamToFilter('${item.name}')">${item.name}</p>`
        }
    })

    if(value === 1){
        addTeamToFilter(input.value);
    }

    document.querySelector(".teamList div").innerHTML = html;
}

/**
 * sends a request to the team
 */
function requestTeam() {
    let input = document.querySelector("#findTeamInput").value;
    const data = {teamName: input};
    fetch("./server/team.php/requestTeam", {
        method: "POST", // or 'PUT'
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            console.log(data)

            loadTeamList();
        })
        .catch((error) => {
            console.error(`Error:`, error);
        });
}

/**
 * sends a requested to the team
 */
function getTeamRequests() {
    fetch(`./server/user.php/getTeamRequests`)
        .then((response) => {
           return response.json()
        })
        .then(answer=>{
            console.log(answer)
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function enterCreateTeam(){
    document.querySelector("#createTeamInput").addEventListener("keydown", function(event) {
        if (event.keyCode === 13) {
            createTeam();
        }
    });
}
function createTeam() {
    let name = document.querySelector("#createTeamInput").value;

    if (name.length >= 3) {
        const data = {teamName: name};
        fetch("./server/team.php/createTeam", {
            method: "POST", // or 'PUT'
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                console.log(data)

                getMyTeams()
                togglePopUp();
            })
            .catch((error) => {
                document.querySelector(".error.create").innerHTML = `Team Name ist bereits benutzt`
                console.error(`Error:`, error);
            });
    } else {
        document.querySelector(".error.create").innerHTML = `Der Name muss mindestens aus 3 Zeichen bestehen`
    }
}
//endregion


/********* player box *********/
//region
function getPlayers(){
    fetch(`./server/user.php/getPlayer?teamID=${currentTeamID}`)
        .then((response) => {
            return response.json()
        })
        .then(answer=>{
            renderPlayers(answer.data)
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function renderPlayers(data){
    let html = "";

    Object.values(data).forEach(item => {
        html += `
            <div class="playerBox">
                <i class="fa-solid fa-circle-user"></i>
                <div class="playerStats">
                    <h2>${item.firstname} ${item.lastname}</h2>
                    <p>RM - GESUND - STAMMSPIELER</p>
                </div>
                <i onclick="editPlayer(${item.id})" class="fa-sharp fa-solid fa-pen"></i>
            </div>`
    });

    document.querySelector(".board section.player").innerHTML = html
}

function editPlayer(item){
    console.log(item)
}
//endregion


/********* calendar box *********/
//region
function getEvents(){
    fetch(`./server/team.php/getEvents?teamID=${currentTeamID}`)
        .then((response) => {
            return response.json();
        })
        .then(answer=>{
            renderEventList(answer.data)
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function renderEventList(data){
    let html = "";

    Object.values(data).forEach(item => {
        html += `
            <div class="eventBox">
                ${getEventIcon(item.type)}
                <div>
                    <h4>${item.description ? item.description : item.type}</h4>
                    <p>${getDayByDate(item.date)}, ${item.date} - ${item.time} Uhr</p>
                </div>
            </div>
        `
    });

    document.querySelector(".board section.calendar .eventList").innerHTML = html
}

function getEventIcon(eventType){
    switch (eventType){
        case "Spiel": return `<i class="fa-solid fa-trophy"></i>`; break;
        case "Fußballtraining": return `<i class="fa-solid fa-futbol"></i>`; break;
        case "Konditionstraining": return `<i class="fa-solid fa-dumbbell"></i>`; break;
    }
}

function toggleNewEventField(){
    console.log("test")
    if(!document.querySelector(".newEventList")){
        document.querySelector(".eventList").innerHTML += `
        <div class="eventBox newEventList">
            <div class="newEventIcon">
                <i class="fa-solid fa-futbol"></i>
            </div>
            <div>
                <h4>
                    <select name="typeSelector" id="typeSelector" onchange="updateIconOnNewEventField()">
                        <option value="Fußballtraining">Fußballtraining</option>
                        <option value="Konditionstraining">Konditionstraining</option>
                        <option value="Spiel">Spiel</option>
                    </select>
                    <input type="text" id="descriptionInput" placeholder="Beschreibung">
                </h4>
                <p><input type="date" id="dateInput"><input type="time" id="timeInput"><input type="number" id="durationInput" placeholder="Dauer in h"></p>
            </div>
            <div class="controls">
                <i onclick="toggleNewEventField()" class="fa-solid fa-xmark"></i>
                <i onclick="addEvent()" class="fa-solid fa-check"></i>
            </div>
        </div>`

        document.querySelector(".eventList").scrollTo(0, 100)
    } else{
        document.querySelector(".newEventList").remove();
    }
}
function updateIconOnNewEventField(){
    document.querySelector(".newEventIcon").innerHTML = getEventIcon(document.querySelector("#typeSelector").value)
}
function addEvent(){
    let type = document.querySelector("#typeSelector").value;
    let description = document.querySelector("#descriptionInput").value;
    let date = document.querySelector("#dateInput").value;
    let time = document.querySelector("#timeInput").value;
    let duration = document.querySelector("#durationInput").value;

    if(type !== "" && date !== "" && time !== "" && duration !== ""){
        const data = {teamID: currentTeamID, type: type, description: description, date: date, time: time, duration: duration};
        fetch("./server/team.php/addEvent", {
            method: "POST", // or 'PUT'
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                toggleNewEventField();
                getEvents()
            })
            .catch((error) => {
                console.error(`Error:`, error);
            });
    }else{
        console.log("Error")
    }
}

function getDayByDate(dateStr){
    dateStr = '15.04.2023';
    let parts = dateStr.split('.');
    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10) - 1;
    let year = parseInt(parts[2], 10);

    let date = new Date(year, month, day);

    let daysOfWeek = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    let dayOfWeek = daysOfWeek[date.getDay()];
    return dayOfWeek;
}
//endregion


/********* settings *********/
//region
function toggleUserSettings(){
    document.querySelector(".userSettings").classList.toggle("active")
    document.querySelector(".board .sections").classList.toggle("active")
    updatePersonalDataInputs();

    fetch(`./server/team.php/getTeams`)
        .then((response) => {
            return response.json()
        })
        .then(answer=>{
            let html = "";
            Object.values(answer.data).forEach(item => {
                html += `
                    <div>
                        <img src="img/userIcon.png" alt="userIcon">
                        <p>${item.name}</p>
                        <i class="fa-solid fa-pen"></i>
                        <i class="fa-solid fa-trash"></i>
                    </div>`
            })
            document.querySelector(".userSettings .teams .section").innerHTML = html;
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function updatePersonalDataInputs(){
    for (const argumentsKey in personalData) {
        if(document.querySelector(`#${argumentsKey}`)){
            document.querySelector(`#${argumentsKey}`).value = personalData[argumentsKey]
        }
    }
}

function updatePersonalData(){
    for (const argumentsKey in personalData) {
        if(document.querySelector(`#${argumentsKey}`)){
            personalData[argumentsKey] = document.querySelector(`#${argumentsKey}`).value
        }
    }

    fetch("./server/user.php/updatePersonalData", {
        method: "POST", // or 'PUT'
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(personalData),
    })
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            document.querySelector(".success.personal").innerHTML = "Persönliche Daten wurden erfolgreich geändert"
            clearSuccessErrorAfterPeriod(3);
        })
        .catch((error) => {
            document.querySelector(".error.personal").innerHTML = "Es gab einen Fehler beim Speichern der Daten"
            console.error(`Error:`, error);
        });
}

async function checkPassword(password){
    let isCorrectPassword;
    const data = {password: password};

    try {
        const response = await fetch("./server/user.php/checkPassword", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();

        isCorrectPassword = responseData.data;
        return isCorrectPassword;
    } catch (error) {
        console.error("Error:", error);
    }
}

function updatePassword(){
    let currPassword = document.querySelector("#currPassword").value;
    let newPassword = document.querySelector("#newPassword").value;
    let repeatNewPassword = document.querySelector("#repeatNewPassword").value;
    let validPassword = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+-=\[\]{}|;':",./<>?])[A-Za-z\d!@#$%^&*()_+-=\[\]{}|;':",./<>?]{8,}/
    let errorField = document.querySelector(".error.security")

    if(checkPassword(currPassword) === false){
        errorField.innerHTML = "Das alte Passwort ist nicht korrekt"
    } else if(newPassword !== repeatNewPassword){
        errorField.innerHTML = "Die Passwörter stimmen nicht überein"
    } else if(!validPassword.test(newPassword)){
        errorField.innerHTML = "Das Passwort ist nicht sicher genug. (2 special chars or numbers, lower and uppercase letters)"
    } else if(newPassword.length < 8 || newPassword.length > 100){
        errorField.innerHTML = "Das Password darf min 8 und max 100 Zeichen haben."
    } else{
        const data = {password: newPassword};
        fetch("./server/user.php/updatePassword", {
            method: "POST", // or 'PUT'
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                document.querySelector("#currPassword").value = "";
                document.querySelector("#newPassword").value = "";
                document.querySelector("#repeatNewPassword").value = "";
                document.querySelector(".success.security").innerHTML = "Passwort wurde erfolgreich geändert"
                clearSuccessErrorAfterPeriod(3);
            })
            .catch((error) => {
                document.querySelector(".error.personal").innerHTML = "Es gab einen Fehler beim Akutalisieren des Passwortes"
                console.error(`Error:`, error);
            });
    }
}

function toggleLogoutInfo(){
    document.querySelector(".popUp.logoutInfo").classList.toggle("active");
}

function logout(){
    personalData = ""
    currentTeamName = ""
    currentTeamID = ""

    window.location.replace(document.location.href + "/login.html");
}

function clearSuccessErrorAfterPeriod(time){
    let timeToDisappear = (time ? time : 5) * 1000; // standard value 5 if there is no time given

    setTimeout(() => {
        document.querySelectorAll(".success").forEach(value => {
            value.innerHTML = "";
        })

        document.querySelectorAll(".error").forEach(value => {
            value.innerHTML = "";
        })
    }, timeToDisappear)
}