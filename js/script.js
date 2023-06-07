/********* variables *********/
let personalData

let currentTeamName
let currentTeamID
let isCurrentTeamMyTeam
let amountOfTeams

function updateDashboard(){
    if(amountOfTeams !== 0){
        getPlayers();
        getEvents();
        getTeamRequests();
        loadCalendarGrid();
    } else{
        //todo area for new customers to set up a team
    }
}

function updateTeams(){
    getMyTeams();
    updateTeamList();
    loadTeamList();
    document.querySelector(".teamName").innerHTML = currentTeamName
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
                updateDashboard()
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


/********* aside *********/
//region
updateTeams();

/**
 * gets the teams where the user is in
 */
function getMyTeams(){
    fetch(`./server/team.php/getTeams`)
        .then((response) => {
            return response.json()
        })
        .then(answer=>{
            amountOfTeams = answer.data.length;
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
            currentTeamName = item.name
            document.querySelector(".teamName").innerHTML = currentTeamName

            isCurrentTeamMyTeam = item.captain === item.playerID
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
    isCurrentTeamMyTeam = !!elem.querySelector("i")

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
        updateTeams()
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
    fetch(`./server/team.php/getAllTeamsNotEnteredYet`)
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
            updateTeams();
            sendedTeamRequest();
        })
        .catch((error) => {
            console.error(`Error:`, error);
        });
}

function sendedTeamRequest(){
    document.querySelector("#findTeamInput").value = ""
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
                updateTeams();
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
    if(currentTeamID){
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
}

function renderPlayers(data){
    let html = "";

    Object.values(data).forEach(item => {
        html += `
            <div onclick="toggleDetail(this, '${item.id}')" class="playerBox">
                <img src="img/userIcon.png" alt="userIcon">
                <div class="playerStats">
                    <h2>${item.firstname} ${item.lastname}</h2>
                    <p>${item.position} - ${item.health.toUpperCase()} - STAMMSPIELER</p>
                </div>
                <i class="fa-solid fa-eye"></i>
            </div>`
    });

    document.querySelector(".board section.player").innerHTML = html
}

function toggleDetail(elem, playerID){
    elem.classList.toggle("detail")

    let data = {playerID: playerID, teamID: currentTeamID}
    fetch("./server/user.php/getPlayerDetails", {
        method: "POST", // or 'PUT'
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => {
            return response.json()
        })
        .then((answer) => {
            let person = answer.data
            console.log(person)

            if(elem.classList.contains("detail")){
                let goalPerGame = person.goals / person.games;
                let assistPerGame = person.assists / person.games;
                let scorerPerGame = person.scorer / person.games;

                elem.innerHTML = `<div class="userIconName"><img src="img/userIcon.png" alt="userIcon"><h1>${person.firstname} ${person.lastname}</h1></div>
                <div class="stats">
                    <div><p>Größe: ${person.height}</p><p>Gewicht: ${person.weight}</p></div>
                    <div><p>Position: ${person.position}</p><p>Status: ${person.health}</p></div>
                    <div><p>Tore: ${person.goals}</p><p>Vorlage: ${person.assists}</p><p>Scorer: ${person.scorer}</p></div>
                    <div><p>Tor/Spiel: ${goalPerGame}</p><p>Vorlage/Spiel: ${assistPerGame}</p><p>Scorer/Spiel: ${scorerPerGame}</p></div>
                    <div><p>Gelbe Karten: ${person.yellow}</p><p>Rote Karten: ${person.red}</p></div>
                    <div><p>Spiele: ${person.games}</p><p>Trainings: ${person.trainings}</p></div>
                </div>`
            } else{
                elem.innerHTML = `<img src="img/userIcon.png" alt="userIcon">
                        <div class="playerStats">
                            <h2>${person.firstname} ${person.lastname}</h2>
                            <p>${person.position} - ${person.health.toUpperCase()} - STAMMSPIELER</p>
                        </div>
                        <i class="fa-solid fa-eye"></i>`
            }
        })
        .catch((error) => {
            document.querySelector(".error.create").innerHTML = `Team Name ist bereits benutzt`
            console.error(`Error:`, error);
        });
}
//endregion


/********* calendar box *********/
//region
function loadCalendarGrid(){
    let year = new Date().getFullYear();
    let month = new Date().getMonth();
    let today = new Date().getDate();

    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    var monthDays = [31, 28 + isLeapYear(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    var firstDay = new Date(year, month, 1);
    var startingDay = firstDay.getDay();
    if (startingDay == 0) {
        startingDay = 7;
    }

    var monthLength = monthDays[month];
    if (month == 1) { // February
        monthLength = isLeapYear(year) ? 29 : 28;
    }

    var monthHtml = "<table><tr><th colspan='7'>" + monthNames[month] + " " + year + "</th></tr>";
    monthHtml += "<tr><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sun</th></tr><tr>";

    var day = 1;
    // fill in the days
    for (var i = 1; i <= 42; i++) {
        if (i < startingDay || i > startingDay + monthLength) {
            monthHtml += "<td>&nbsp;</td>";
        } else {
            var date = year + "-" + padNumber(month + 1) + "-" + padNumber(day);
            monthHtml += "<td><button onclick='selectDate(\"" + date + "\")'>" + day + "</button></td>";
            day++;
        }

        if (i % 7 == 0 && day <= monthLength) {
            monthHtml += "</tr><tr>";
        }
    }

    monthHtml += "</tr></table>";

    document.querySelector(".calendar .eventCalendar").innerHTML = monthHtml
}
function isLeapYear(year) {
    return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
}
function padNumber(number) {
    return ("0" + number).slice(-2);
}

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

function filterEventList(elem){
    document.querySelector(".eventListNav .active").classList.remove("active");
    elem.classList.add("active");
    getEvents();
}

function renderEventList(data){
    let html = "";
    let filterType = document.querySelector(".eventListNav .active").innerHTML
    let dataArray = []

    for (const curr in data) {
        dataArray.push(data[curr]);
    }
    dataArray.sort(function(a,b){
        return new Date(a.date) - new Date(b.date);
    });


    Object.values(dataArray).forEach(item => {
        let isCurrentItemIsTrue = false;
        let date = new Date(item.date);

        if(filterType === "Upcoming" && date.getTime() >= Date.now()){
            isCurrentItemIsTrue = true;
        }else if(filterType === "Today" && isToday(date)){
            isCurrentItemIsTrue = true;
        } else if(filterType === "All"){
            isCurrentItemIsTrue = true;
        }

        if(isCurrentItemIsTrue){
            html += renderEvent(item);
        }
    });
    document.querySelector(".board section.calendar .eventList").innerHTML = html
}

function renderEvent(item){
    return `<div class="eventBox" onclick="toggleEvent(${item.id})">
                ${getEventIcon(item.type)}
                <div>
                    <h4>${item.description ? item.description : item.type}</h4>
                    <p>${getDayByDate(item.date)}, ${item.date} - ${item.time} Uhr</p>
                </div>
            </div>`
}

function getEventIcon(eventType){
    switch (eventType){
        case "Spiel": return `<i class="fa-solid fa-trophy"></i>`; break;
        case "Fußballtraining": return `<i class="fa-solid fa-futbol"></i>`; break;
        case "Konditionstraining": return `<i class="fa-solid fa-dumbbell"></i>`; break;
    }
}

function toggleNewEventField(){
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
    const zeroPad = (num, places) => String(num).padStart(places, '0')

    if(type !== ""){
        date = date ? date : `${new Date().getFullYear()}-${zeroPad(new Date().getMonth()+1, 2)}-${zeroPad(new Date().getDate(), 2)}`;
        time = time ? time : `${zeroPad(new Date().getHours(), 2)}:${zeroPad(new Date().getMinutes(), 2)}`

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

function toggleEvent(id){

}

function editEvent(){

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

function isToday (date) {
    const now = new Date()

    return date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
}
//endregion


/********* notification *********/
//region
function toggleNotification(){
    document.querySelector("main aside.notification").classList.toggle("active");
    updateNotifications()
}

function updateNotifications(){
    document.querySelector("aside.notification").innerHTML = "<h1>Nachrichten</h1>"
    fetch("./server/team.php/getTeamRequests")
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            for (const dataKey in data.data) {
                let curr = data.data[dataKey]
                document.querySelector("aside.notification").innerHTML +=
                    `<div class="newNotification request r${curr.id}">
                    <img src="img/userIcon.png" alt="userIcon">
                    <p>${curr.firstname} ${curr.lastname} will deinem Team "${curr.teamName}" beitreten.</p>
                    <div><i onclick="agreeRequest('${curr.id}', '${curr.playerID}', '${curr.teamID}')" class="fa-solid fa-check"></i><i onclick="denyRequest('${curr.id}')" class="fa-solid fa-x"></i></div>
                </div>`
            }
        })
        .catch((error) => {
            console.error(`Error:`, error);
        });
}

function agreeRequest(requestID, playerID, teamID){
    let data = {requestID: requestID, playerID: playerID, teamID: teamID}

    fetch("./server/team.php/agreeRequest", {
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
            updateNotifications();
            updateTeams();
        })
        .catch((error) => {
            console.error(`Error:`, error);
        });
}
function denyRequest(requestID){
    let data = {requestID: requestID}

    fetch("./server/team.php/denyRequest", {
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
            updateNotifications()
        })
        .catch((error) => {
            console.error(`Error:`, error);
        });
}

//endregion


/********* settings *********/
//region
startEventListener()
function startEventListener(){
    document.querySelectorAll(".userSettings .personal input").forEach((item) => {
        item.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                updatePersonalData();
            }
        });
    })

    document.querySelectorAll(".userSettings .security input").forEach((item) => {
        item.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                updatePassword();
            }
        });
    })
}

function toggleUserSettings(){
    document.querySelector(".userSettings").classList.toggle("active")
    document.querySelector(".board .sections").classList.toggle("active")
    updatePersonalDataInputs();
    updateTeams();
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

    let errorField = document.querySelector(".error.personal")
    errorField.innerHTML = "";
    if(personalData.firstname === "" || personalData.lastname === "" || personalData.email === ""){
        errorField.innerHTML = "Firstname, Lastname and Email has to be filled"
    } else if(!/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(personalData.email)){
        errorField.innerHTML = "Invalid email address"
    } else{
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
                document.querySelector(".userName").innerHTML = personalData.firstname + " " + personalData.lastname;
            })
            .catch((error) => {
                document.querySelector(".error.personal").innerHTML = "Es gab einen Fehler beim Speichern der Daten"
                console.error(`Error:`, error);
            });
    }
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
    isCurrentTeamMyTeam = false

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

function updateTeamList(){
    fetch(`./server/team.php/getTeams`)
        .then((response) => {
            return response.json()
        })
        .then(answer=>{
            let html = "";
            Object.values(answer.data).forEach(item => {
                html += `
                    <div class='.teams T${item.name.replaceAll(' ', "")}'>
                        <img src="img/userIcon.png" alt="userIcon">
                        <p>${item.name}</p>
                        <div class="edit">
                            <i class="fa-solid fa-pen" onclick="changeTeamViewToEdit('${item.name}')"></i>
                            <i class="fa-solid fa-trash" onclick="quitOrDeleteTeamInfo('${item.name}')"></i>
                        </div>
                    </div>`
            })
            document.querySelector(".userSettings .teams .section").innerHTML = html;
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function changeTeamViewToEdit(teamName){
    let teamBox = document.querySelector(`.teams .T${teamName.replaceAll(' ', "")} p`)
    let icon = document.querySelectorAll(`.teams .T${teamName.replaceAll(' ', "")} i.fa-solid`)[0]
    icon.classList.toggle("fa-pen")
    icon.classList.toggle("fa-floppy-disk")

    if(teamBox.querySelector("input")){
        changeTeamName(teamName, teamBox.querySelector("input").value);
    } else{
        teamBox.innerHTML = `<input type="text" value="${teamName}"/>`
    }
}
function changeTeamName(oldTeamName, newTeamName){
    let teamBox = document.querySelector(`.teams .T${oldTeamName.replaceAll(' ', "")} p`)

    const data = {oldTeamName: oldTeamName, newTeamName: newTeamName};
    fetch("./server/team.php/changeTeamName", {
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
            teamBox.innerHTML = newTeamName
            teamBox.classList.remove(`T${oldTeamName.replaceAll(' ', "")}`)
            teamBox.classList.add(`T${newTeamName.replaceAll(' ', "")}`)
        })
        .catch((error) => {
            console.error(`Error:`, error);
        });
}

let savedHTML = ""
function quitOrDeleteTeamInfo(teamName){
    let teamBox = document.querySelector(`.teams .T${teamName.replaceAll(' ', "")}`)
    if(savedHTML === ""){
        savedHTML = teamBox.innerHTML
        teamBox.innerHTML = `<p>Möchtest du ${teamName} wirklich verlassen</p>
            <button class="filled" onclick="quitOrDeleteTeamInfo('${teamName}')">Nein</button>
            <button class="outlined" onclick="deleteTeam('${teamName}')">Ja</button>`
    } else{
        teamBox.innerHTML = savedHTML
        savedHTML = ""
    }
}
function deleteTeam(teamName){
    const data = {teamName: teamName};
    fetch("./server/team.php/quitTeam", {
        method: "POST", // or 'PUT'
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => {
            updateTeams();
        })
        .catch((error) => {
            console.error(`Error:`, error);
        });
}