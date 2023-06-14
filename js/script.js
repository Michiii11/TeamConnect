/********* variables *********/
let personalData

let currentTeamName
let currentTeamID
let isCurrentTeamMyTeam
let amountOfTeams
let teamIconPath

let currentEventID

PopupEngine.init()

function updateDashboard(){
    if(amountOfTeams !== 0){
        if(document.querySelector(".newCustomerPage").classList.contains("active")){
            document.querySelector(".newCustomerPage").classList.remove("active")
            document.querySelector(".board .sections").classList.add("active")
        }

        getPlayers();
        getEvents();
        loadCalendarGrid();

        if(!isCurrentTeamMyTeam){
            document.querySelector(".calendar button.newButton").classList.add("off")
        } else{
            document.querySelector(".calendar button.newButton").classList.remove("off")
        }

        document.querySelector("aside.sidebar .buttons img").src = personalData.imagePath ? personalData.imagePath.substring(3) : 'img/userIcon.png';
        document.querySelector("#chatInputField").value = ""
        loadMessages()
    } else{
        toggleNewCustomerPage()
    }
}

function toggleNewCustomerPage(){
    document.querySelector(".newCustomerPage h2").innerHTML = `Hallo ${personalData.firstname}`
    document.querySelector(".newCustomerPage").classList.add("active")
    document.querySelector(".board .sections.active").classList.remove("active")
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
                if(sessionStorage["teamConnectIsSettingsOpen"] === "true"){
                    sessionStorage["teamConnectIsSettingsOpen"] = "false"
                    toggleUserSettings();
                }
            }
        })
        .catch((error) => {
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
    const mediaQuery = window.matchMedia('(min-width: 1050px)')

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
        });
}
function renderAside(data){
    let html = "<div>";

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

/********* team chat *********/
//region
setInterval(loadMessages, 2000);
document.querySelector("#chatInputField").addEventListener("keydown", function(event) {
    if (event.keyCode === 13) {
        sendMessage()
    }
});
function loadMessages(){
    if(currentTeamID){
        const data = {teamID: currentTeamID};
        fetch("./server/chat.php/getMessages", {
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
                let chatBox = document.querySelector(".chatBox")
                chatBox.innerHTML = ""

                let messages = []
                for (const dataKey in data.data) {
                    curr = data.data[dataKey]
                    messages.push(`<div class="messageBox ${personalData.id === curr.userID ? 'isMyMessage' : ''}">
                        <img src="${curr.imagePath ? curr.imagePath.substring(3) : 'img/userIcon.png'}" alt="userIcon">
                        
                        <div>
                            <h3>${curr.firstname} ${curr.lastname}</h3>
                            <p>${curr.message}</p>
                        </div>
                    </div>`)
                }

                for (let i = messages.length; i >= 0; i--) {
                    if(messages[i]){
                        chatBox.innerHTML += messages[i]
                    }
                }
            })
            .catch((error) => {
                console.error(`Error:`, error);
            });
    }
}

function sendMessage(){
    let message = document.querySelector("#chatInputField").value
    document.querySelector("#chatInputField").value = ""
    if(message !== ""){
        const data = {teamID: currentTeamID, message: message};
        fetch("./server/chat.php/sendMessage", {
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
                loadMessages()
            })
            .catch((error) => {
                console.error(`Error:`, error);
            });
    }
}
//endregion

/********* popup add team *********/
//region
function togglePopUp(type){
    if(type){
        if(type !== 'create' || !document.querySelector(`.popUp.addTeam .${type}`).classList.contains("active")){
            toggleTeamCreate()
        }
    }


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
            sentTeamRequest();
        })
        .catch((error) => {
            console.error(`Error:`, error);
        });
}

function sentTeamRequest(){
    document.querySelector("#findTeamInput").value = ""
}

function enterCreateTeam() {
    const createTeamInput = document.querySelector("#createTeamInput");

    const handleKeyDown = function (event) {
        if (event.keyCode === 13) {
            event.preventDefault(); // Prevent form submission
            createTeam();
            createTeamInput.removeEventListener("keydown", handleKeyDown);
        }
    };

    createTeamInput.addEventListener("keydown", handleKeyDown);
}
async function createTeam() {
    let name = document.querySelector("#createTeamInput").value;

    await uploadTeamIcon(false, name.replaceAll(' ', ""))

    if (name.length >= 3) {
        const data = {teamName: name, imagePath: teamIconPath ? teamIconPath : ""};
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
                <img src="${item.imagePath ? item.imagePath.substring(3) : 'img/userIcon.png'}" alt="userIcon">
                <div class="playerStats">
                    <h2>${item.firstname} ${item.lastname}</h2>
                    <p>${item.position} - ${item.health.toUpperCase()}</p>
                </div>
                <i class="fa-solid fa-eye"></i>
            </div>`
    });

    document.querySelector(".board section.player").innerHTML = html
}

function toggleDetail(elem, playerID){
    elem.classList.toggle("detail")

    let data = {playerID: playerID}
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
            if(elem.classList.contains("detail")){
                let goalPerGame = (person.goals / person.games).toFixed(2);
                let assistPerGame = (person.assists / person.games).toFixed(2);
                let scorerPerGame = (person.scorer / person.games).toFixed(2);

                elem.innerHTML = `<div class="userIconName"><img src="${person.imagePath ? person.imagePath.substring(3) : 'img/userIcon.png'}" alt="userIcon"><h1>${person.firstname} ${person.lastname}</h1></div>
                <div class="stats">
                    <div><p>Größe: ${person.height}</p><p>Gewicht: ${person.weight}</p></div>
                    <div><p>Position: ${person.position}</p><p>Status: ${person.health}</p></div>
                    <div><p>Tore: ${person.goals}</p><p>Vorlage: ${person.assists}</p><p>Scorer: ${person.scorer}</p></div>
                    <div><p>Tor/Spiel: ${goalPerGame}</p><p>Vorlage/Spiel: ${assistPerGame}</p><p>Scorer/Spiel: ${scorerPerGame}</p></div>
                    <div><p>Gelbe Karten: ${person.yellow}</p><p>Rote Karten: ${person.red}</p></div>
                    <div><p>Spiele: ${person.games}</p><p>Trainings: ${person.trainings}</p></div>
                </div>`
            } else{
                elem.innerHTML = `<img src="${person.imagePath ? person.imagePath.substring(3) : 'img/userIcon.png'}" alt="userIcon">
                        <div class="playerStats">
                            <h2>${person.firstname} ${person.lastname}</h2>
                            <p>${person.position} - ${person.health.toUpperCase()}</p>
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
function refreshEventSection(isStart){
    getEvents();
    loadCalendarGrid();

    if(!isStart){
        renderPlayersForEvent()
    }
}
function loadCalendarGrid(){
    let year = new Date().getFullYear();
    let month = new Date().getMonth();
    let today = new Date().getDate();

    let monthNames = ["Jänner", "Februar", "März", "April", "Mai", "Juni",
        "Juli", "August", "September", "Oktober", "November", "Dezember"
    ];
    let monthDays = [31, 28 + isLeapYear(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    let firstDay = new Date(year, month, 1);
    let startingDay = firstDay.getDay();
    if (startingDay == 0) {
        startingDay = 7;
    }

    let monthLength = monthDays[month];
    if (month == 1) { // February
        monthLength = isLeapYear(year) ? 29 : 28;
    }

    let monthHtml = "<table><tr><th colspan='7'>" + monthNames[month] + " " + year + "</th></tr>";
    monthHtml += "<tr><th>Mo</th><th>Di</th><th>Mi</th><th>Do</th><th>Fr</th><th>Sa</th><th>So</th></tr><tr>";

    let day = 1;

    getEventsThisMonth().then(eventsThisMonth => {
        // fill in the days
        for (let i = 1; i <= 42; i++) {
            if (i < startingDay || i > startingDay + monthLength) {
                monthHtml += "<td>&nbsp;</td>";
            } else {
                let date = year + "-" + padNumber(month + 1) + "-" + padNumber(day);
                monthHtml += `<td class="${isToday(new Date(date)) ? "active " : ""}"><button class="${eventsThisMonth.includes(date.substring(date.length-2)) ? 'proven' : ""}" onclick='selectDate("${date}", this.parentNode)'>${day}</button></td>`;
                day++;
            }

            if (i % 7 == 0 && day <= monthLength) {
                monthHtml += "</tr><tr>";
            }
        }

        monthHtml += "</tr></table>";

        document.querySelector(".calendar .eventCalendar").innerHTML = monthHtml;
    });
}
function isLeapYear(year) {
    return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
}
function padNumber(number) {
    return ("0" + number).slice(-2);
}

function getEventsThisMonth() {
    return new Promise((resolve, reject) => {
        let eventsThisMonth = [];

        if (currentTeamID) {
            const data = { teamID: currentTeamID, month: new Date().getMonth() + 1 };
            fetch("./server/team.php/getEventsThisMonth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
                .then((response) => response.json())
                .then((data) => {
                    for (const dataKey in data.data) {
                        eventsThisMonth.push(data.data[dataKey].date.substring(data.data[dataKey].date.length - 2));
                    }
                    resolve(eventsThisMonth);
                })
                .catch((error) => {
                    console.error(`Error:`, error);
                    reject(error);
                });
        } else {
            resolve(eventsThisMonth);
        }
    });
}

function selectDate(date, elem){
    if(document.querySelector("table .active")){
        document.querySelector("table .active").classList.remove("active")
    }
    filterEventList(document.querySelectorAll(".eventListNav p")[1], date)
    elem.classList.add("active")
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

function filterEventList(elem, spezificDate){
    if(document.querySelector(".eventListNav .active")){
        document.querySelector(".eventListNav .active").classList.remove("active");
    }
    elem.classList.add("active");
    if(spezificDate) {
        elem.innerHTML = spezificDate
    } else{
        document.querySelectorAll(".eventListNav p")[1].innerHTML = "Heute"
        document.querySelector(".eventCalendar .active").classList.remove("active")
        document.querySelectorAll(".eventCalendar button").forEach((elem) => {
            if(elem.innerHTML == new Date().getDate()){
                elem.parentElement.classList.add("active")
            }
        })
    }

    localStorage.setItem("teamConnectEventFilter", elem.innerHTML)
    getEvents();
}

async function renderEventList(data){
    if(!localStorage.getItem("teamConnectEventFilter")){
        localStorage.setItem("teamConnectEventFilter", document.querySelector(".eventListNav .active").innerHTML)
    } else {
        if(document.querySelector(".eventListNav .active")){
            document.querySelector(".eventListNav .active").classList.remove("active");
        }
        document.querySelectorAll(".eventListNav p").forEach((elem) => {
            if(elem.innerHTML === localStorage.getItem("teamConnectEventFilter")){
                elem.classList.add("active")
            }
        })
    }
    let filterType = localStorage.getItem("teamConnectEventFilter")

    let html = ""
    for (const item of Object.values(data)) {
        let isCurrentItemIsTrue = false;
        let date = new Date(item.date);

        if(filterType === "Anstehend" && date.getTime() >= Date.now()){
            isCurrentItemIsTrue = true;
        }else if(filterType === "Heute" && isToday(date)){
            isCurrentItemIsTrue = true;
        } else if(document.querySelector(".eventListNav .active") && date.getDate() === (new Date(document.querySelector(".eventListNav .active").innerHTML)).getDate()) {
            isCurrentItemIsTrue = true;
        } else if(filterType === "Alle"){
            isCurrentItemIsTrue = true;
        }

        if(isCurrentItemIsTrue){
            await checkIfPlayerIsInEvent(item.id)
                .then(isValidEvent => {
                    if (isValidEvent || isCurrentTeamMyTeam) {
                        html += renderEvent(item);
                    }
                })
                .catch(error => {
                    console.error(error);
                    // Handle any errors that occurred during the fetch request
                });
        }
    }

    document.querySelector(".board section.calendar .eventList").innerHTML = html
}

function renderEvent(item){
    return `<div class="eventBox" onclick="toggleEvent('${item.id}', '${item.date}', '${item.time}', '${item.type}', '${item.description}', '${item.duration}', '${item.result}', '${item.notions}')">
                ${getEventIcon(item.type)}
                <div>
                    <h4>${item.description ? item.description : item.type}</h4>
                    <p>${getDayByDate(item.date)}, ${item.date} - ${item.time} Uhr</p>
                </div>
            </div>`
}

async function checkIfPlayerIsInEvent(eventID) {
    const data = { eventID: eventID };

    try {
        const response = await fetch("./server/team.php/checkIfPlayerIsInEvent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();
        return responseData.data;
    } catch (error) {
        console.error("Error:", error);
        throw error; // Propagate the error to the caller
    }
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
                <div class="selects">
                    <select name="typeSelector" id="typeSelector" onchange="updateIconOnNewEventField()">
                        <option value="Fußballtraining">Fußballtraining</option>
                        <option value="Konditionstraining">Konditionstraining</option>
                        <option value="Spiel">Spiel</option>
                    </select>
                    <input type="text" id="descriptionInput" placeholder="Beschreibung">
                </div>
                <div class="inputs"><input type="date" id="dateInput"><input type="time" id="timeInput"><input type="number" id="durationInput" placeholder="Dauer in h"></div>
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
    if(isCurrentTeamMyTeam){
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
                    refreshEventSection()
                })
                .catch((error) => {
                    console.error(`Error:`, error);
                });
        }else{
            console.log("Error")
        }
    }
}

function updateEvent(type){
    let time = document.querySelector("#timePicker").value;
    let date = document.querySelector("#datePicker").value;
    let duration = document.querySelector("#duration").value;
    let description = document.querySelector("#descriptionField").value
    let result = ""; let notions = "";
    if(type === "Spiel"){
        let home = document.querySelector(".home").value
        let guest = document.querySelector(".guest").value
        result = `${home === "" ? 0 : home}:${guest === "" ? 0 : guest}`
    } else{
        notions = document.querySelector("#notizField").value;
    }

    // base section
    let data = {eventID: currentEventID, date: date, time: time, duration: duration, description: description, result: result, notions: notions};
    fetch("./server/team.php/updateEvent", {
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

        })
        .catch((error) => {
            console.error(`Error:`, error);
        });

    // players section
    let playerIDs = []
    document.querySelectorAll(".checkbox").forEach((elem) => {
        if(!elem.classList.contains("all") && elem.checked){
            playerIDs.push(elem.classList[1].substring(1))
        }
    })

    data = {playerList: playerIDs, eventID: currentEventID}
    fetch("./server/team.php/setPlayersToEvent", {
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

        })
        .catch((error) => {
            console.error(`Error:`, error);
        });

    // stats section
    let sections = ["goals", "assists", "yellow", "red"]
    data = {list: []}
    for (const sectionsKey in sections) {
        document.querySelectorAll(`.${sections[sectionsKey]} .selected-member`).forEach((elem) => {
            data.list.push({id: elem.classList[1].substring(1), count: elem.querySelector(".count").value, type: sections[sectionsKey]})
        })
    }

    console.log(data)
    fetch(`./server/team.php/updateStatsToEvent?eventID=${currentEventID}`, {
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
        })
        .catch((error) => {
            console.error(`Error:`, error);
        });

    toggleEvent();
    refreshEventSection(true);
}

function deleteEvent(){
    const data = {eventID: currentEventID};
    fetch("./server/team.php/deleteEvent", {
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
            toggleEvent();
            refreshEventSection();
        })
        .catch((error) => {
            console.error(`Error:`, error);
        });
}

function deleteEventInfo(){
    PopupEngine.createModal({
        heading:"Event wirklich löschen?",
        text: "_",
        buttons: [
            {
                text: "Ja",
                action: () => {deleteEvent()},
                closePopup: true
            },
            {
                text: "Nein",
                closePopup: true
            }
        ]
    })
}

function toggleEvent(id, date, time, type, description, duration, result, notions){
    document.querySelector(".eventListNav").classList.toggle("off")
    document.querySelector(".eventCalendar").classList.toggle("off")
    document.querySelector(".eventList").classList.toggle("off")
    if(isCurrentTeamMyTeam){
        document.querySelector(".newButton").classList.toggle("off")
    }
    let eventFullHTML = document.querySelector(".eventFull")
    currentEventID = id

    if(eventFullHTML.innerHTML === ""){
        let homeGoals;
        let guestGoals;

        if(type === "Spiel"){
            let goals = result.split(":");
            homeGoals = goals[0]
            guestGoals = goals[1]
        }

        eventFullHTML.innerHTML = `<div class="header">
            <i onclick="toggleEvent()" class="fa-solid fa-arrow-left"></i>
            <div>
                <h2>${type}</h2>
                <input type="date" id="datePicker" value="${date}">
            </div>
        </div>

        <div class="description">
            <label for="timePicker">Zeit:<input type="time" id="timePicker" value="${time}">Dauer (in h):<input type="number" id="duration" value="${duration}"></label>
            <label for="descriptionField">Beschreibung:<input type="text" id="descriptionField" value="${description}"></label>
            ${type === "Spiel" ? `<label>Ergebnis:<input type="number" class="erg home" value="${homeGoals}"/>:<input type="number" class="erg guest" value="${guestGoals}"/></label>` : `<label>Notizen:<textarea rows="1" id="notizField">${notions}</textarea></label>`}
        </div>

        <div class="playerSelect">
            <label class="container" id="selectPlayer">Spieler auswählen
                <input onclick="playerSelector(this)" type="checkbox" class="checkbox all">
                <span class="checkmark"></span>
            </label>
            <div class="playerList">
                ${renderPlayersForEvent()}
            </div>
        </div>

        ${type === "Spiel" ? renderGameStats() : ""}
        
        ${isCurrentTeamMyTeam ? `
            <div class="buttons">
                <button onclick="deleteEventInfo()" class="outlined">Delete</button>
                <button onclick="updateEvent('${type}')" class="filled">Save</button>
            </div>
            ` : ""}`

        if(type === "Spiel"){
            loadStats();
        }
    } else{
        eventFullHTML.innerHTML = ""
    }
}

function renderGameStats(){
    return `<div class="gameStats">
        <label>Torschützen:</label>
        <div class="players goals">
            <div class="selected">
                <div class="selected-members"></div>
                <input class="dropdown-input" type="text" placeholder="Spieler suchen" onclick="editPropertyDropdown('goal', this, true)">
            </div>
            <div class="dropdown-list"></div>
        </div>
        
        <label>Assists:</label>
        <div class="players assists">
            <div class="selected">
                <div class="selected-members"></div>
                <input class="dropdown-input" type="text" placeholder="Spieler suchen" onclick="editPropertyDropdown('assist', this, true)">
            </div>
            <div class="dropdown-list"></div>
        </div>
   
        <label>Gelbe Karten:</label>
        <div class="players yellow">
            <div class="selected">
                <div class="selected-members"></div>
                <input class="dropdown-input" type="text" placeholder="Spieler suchen" onclick="editPropertyDropdown('yellow', this, true)">
            </div>
            <div class="dropdown-list"></div>
        </div>
        
        <label>Rote Karten:</label>
        <div class="players red">
            <div class="selected">
                <div class="selected-members"></div>
                <input class="dropdown-input" type="text" placeholder="Spieler suchen" onclick="editPropertyDropdown('red', this, true)">
            </div>
            <div class="dropdown-list"></div>
        </div>
    </div>`
}

function loadStats(){
    fetch(`./server/team.php/getStatsToEvent?eventID=${currentEventID}`)
        .then((response) => {
            return response.json()
        })
        .then(answer=>{
            let types = ["goals", "assists", "yellow", "red"]
            for (let i = 0; i < types.length; i++) {
                document.querySelector(`.${types[i]} .selected .selected-members`).innerHTML = ""
            }

            for (const dataKey in answer.data) {
                let curr = answer.data[dataKey]
                let name = `${curr.firstname} ${curr.lastname}`
                for (let i = 0; i < types.length; i++) {
                    if(curr[types[i]] != 0){
                        document.querySelector(`.${types[i]} .selected .selected-members`).innerHTML += `<div class="selected-member i${curr.id}"><span>${curr.firstname.charAt(0)}. ${curr.lastname}</span> <input type="number" class="count" id="count${name.replaceAll(" ", "")}" value="${curr[types[i]]}" onchange="checkIfNotNull(this)"></div>`
                    }
                }
                document.querySelector("input.dropdown-input").focus()
                document.querySelector("input.dropdown-input").blur()
            }
        })
        .then(answer=> {
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

let playersForCurrentEvent = []
let clickedElem;
let editPopup;
let currentProp;
function editPropertyDropdown(prop, elem, isFirst){
    clickedElem = elem
    currentProp = prop
    document.body.addEventListener('click', closePropertyDropdown);

    playersForCurrentEvent = []
    let players = []
    document.querySelectorAll(".playerList label").forEach((elem) => {
        if(elem.querySelector("input").checked && !elem.querySelector("input").classList.contains("all")){
            playersForCurrentEvent.push({name: elem.innerHTML.split('\n')[0], id: elem.querySelector("input").classList[1].substring(1)})
            players.push(elem.innerHTML.split('\n')[0])
        }
    })

    let doubleParent = elem.closest(".players")
    let list = doubleParent.querySelector(".dropdown-list")
    let inputs = document.querySelectorAll("input.dropdown-input")

    if(isFirst){
        elem.addEventListener('input', () => {
            const enteredText = elem.value.trim();
            let filteredMembers = players.filter(player => player.toLowerCase().includes(enteredText.toLowerCase()));

            list.innerHTML = '';

            filteredMembers.forEach(member => {
                const listItem = document.createElement('p');
                listItem.textContent = member;
                listItem.classList.add(`dropdown-list-item`);

                for(let i = 0; i < playersForCurrentEvent.length; i++){
                    if(listItem.innerHTML === playersForCurrentEvent[i].name){
                        listItem.classList.add(`i${playersForCurrentEvent[i].id}`);
                    }
                }
                list.appendChild(listItem);
            });
        });

        elem.addEventListener("keydown", function(event) {
            if (event.keyCode === 13) {
                confirmPropertyDropdown(elem, prop)
            }
        });
    }


    //position popup
    editPopup = elem.closest(".players").querySelector(".dropdown-list")
    let rect = elem.getBoundingClientRect()
    editPopup.style.top = rect.top - document.querySelector("nav").clientHeight + rect.height + "px"
    editPopup.style.left = rect.left - document.querySelector("aside").clientWidth + "px"

    let html = "";
    Object.entries(playersForCurrentEvent).forEach(item => {
        html += `<p class="dropdown-list-item i${item[1].id}" onclick="confirmPropertyDropdown(this, '${prop}', '${item[1].name}')">${item[1].name}</p>`
    })

    doubleParent.querySelector(".dropdown-list").innerHTML = html;
    doubleParent.querySelector(".dropdown-list").style.display = "block";
}

function toggleAside(){
    document.querySelector("main aside").classList.toggle("active")
}

function closePropertyDropdown(event){
    if(!editPopup.contains(event.target) && !clickedElem.contains(event.target)) {
        editPopup.style.display = "none"
    }
}
function checkIfNotNull(elem){
    if(elem.value === "0"){
        elem.closest(".selected-member").remove()
        editPropertyDropdown(null, elem)
    }
}
function confirmPropertyDropdown(elem, prop, name){
    document.body.removeEventListener('click', closePropertyDropdown);

    let id;
    if(!name){
        name = elem.closest(".players").querySelector(".dropdown-list p").innerHTML
        id = elem.closest(".players").querySelector(".dropdown-list p").classList[1]
    } else{
        id = elem.classList[1]
    }

    let isAlreadyUsed = false

    elem.closest(".players").querySelectorAll(".selected-members div").forEach((elem) => {
        let splitName = name.split(" ");
        if (elem.querySelector("span").innerHTML === `${splitName[0].charAt(0)}. ${splitName[1]}`) {
            isAlreadyUsed = true;
            document.querySelector(`#count${name.replaceAll(" ", "")}`).value ++;
        }
    })

    if(!isAlreadyUsed){
        let splitName = name.split(" ");
        elem.closest(".players").querySelector(".selected-members").innerHTML += `<div class="selected-member ${id}"><span>${splitName[0].charAt(0)}. ${splitName[1]}</span> <input type="number" class="count" id="count${name.replaceAll(" ", "")}" value="1" onchange="checkIfNotNull(this)"></div>`
    }
    if(elem.closest(".players").querySelector("input.dropdown-input")){
        elem.closest(".players").querySelector("input.dropdown-input").value = ""
    }

    editPopup.style.display = "none"
}

function renderPlayersForEvent(){
    fetch(`./server/user.php/getPlayer?teamID=${currentTeamID}`)
        .then((response) => {
            return response.json()
        })
        .then(answer=>{
            html = ""

            for (const item in answer.data) {
                html +=
                    `<label class="container">${answer.data[item].firstname} ${answer.data[item].lastname}
                        <input onclick="playerSelector(this)" type="checkbox" class="checkbox c${answer.data[item].id}">
                        <span class="checkmark"></span>
                    </label>`
            }
            document.querySelector(".playerSelect .playerList").innerHTML = html

            return answer
        })
        .then(answer=> {
            checkPlayerAlreadyChecked()
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function checkPlayerAlreadyChecked(){
    let data = {eventID: currentEventID}
    fetch("./server/team.php/getPlayersForEvent", {
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
            let answer = data.data
            for (const answerKey in answer) {
                document.querySelector(`.checkbox.c${answer[answerKey].id}`).checked = true
                playerSelector(document.querySelector(`.checkbox.c${answer[answerKey].id}`))
            }
        })
        .catch((error) => {
            console.error(`Error:`, error);
        });
}

function playerSelector(elem){
    let isChecked = elem.checked
    let checkedBoxesCount = 0
    let checkBoxCount = document.querySelectorAll(".checkbox").length - 1
    document.querySelectorAll(".checkbox").forEach((item) => {
        if(item.checked){
            checkedBoxesCount++;
        }
    })

    if(elem.classList.contains("all") || checkBoxCount === checkedBoxesCount){
        if(!elem.classList.contains("all") && elem.checked === false){
            document.querySelector(".checkbox.all").checked = false
        } else{
            document.querySelectorAll(".checkbox").forEach((item) => {
                item.checked = elem.classList.contains("all") ? isChecked : true;
            })
        }
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
    let notificationField = document.querySelector("aside.notification")
    notificationField.innerHTML = "<h1>Nachrichten</h1>"

    fetch("./server/team.php/getTeamRequests")
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            for (const dataKey in data.data) {
                let curr = data.data[dataKey]

                notificationField.innerHTML +=
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
    sessionStorage["teamConnectIsSettingsOpen"] = sessionStorage["teamConnectIsSettingsOpen"] === "false";
}

function updatePersonalDataInputs(){
    for (const argumentsKey in personalData) {
        if(document.querySelector(`#${argumentsKey}`)){
            document.querySelector(`#${argumentsKey}`).value = personalData[argumentsKey]
        }
    }

    if(document.querySelector("#image-preview-user img")){
        document.querySelector("#image-preview-user img").src = personalData.imagePath ? personalData.imagePath.substring(3) : 'img/userIcon.png';
        document.querySelector("aside.sidebar .buttons img").src = personalData.imagePath ? personalData.imagePath.substring(3) : 'img/userIcon.jpg';
    }
}

async function updatePersonalData() {
    for (const argumentsKey in personalData) {
        if (document.querySelector(`#${argumentsKey}`)) {
            personalData[argumentsKey] = document.querySelector(`#${argumentsKey}`).value
        }
    }

    await uploadUserIcon();

    let errorField = document.querySelector(".error.personal")
    errorField.innerHTML = "";
    if (personalData.firstname === "" || personalData.lastname === "" || personalData.email === "") {
        errorField.innerHTML = "Vorname, Nachname und Email müssen ausgefüllt sein"
    } else if (!/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(personalData.email)) {
        errorField.innerHTML = "Ungültige Email-Adresse"
    } else {
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
                document.querySelector(".userName").innerHTML = personalData.firstname + " " + personalData.lastname
            })
            .then(() => {
                setTimeout(() => {
                    location.reload()
                }, 500)
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
    PopupEngine.createModal({
        text:"Willst du dich wirklich ausloggen?",
        heading:"Abmelden",
        buttons: [
            {
                text: "Ja",
                action: () => {logout()},
                closePopup: true
            },
            {
                text: "Nein",
                closePopup: true
            }
        ]
    })
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
                        <label for="file-upload-${item.name.replaceAll(' ', "")}" id="image-preview-${item.name.replaceAll(' ', "")}">
                            <img src="${item.imagePath ? item.imagePath.substring(3) : 'img/groupIcon.jpg'}" alt="userIcon">
                        </label>
                        <input class="file-upload-team" disabled type="file" id="file-upload-${item.name.replaceAll(' ', "")}" onchange="updateImage(this, '${item.name.replaceAll(' ', "")}'); uploadTeamIcon(true, '${item.name.replaceAll(' ', "")}')" accept="image/jpeg">
                        
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

async function changeTeamViewToEdit(teamName){
    let teamBox = document.querySelector(`.teams .T${teamName.replaceAll(' ', "")} p`)
    let icon = document.querySelectorAll(`.teams .T${teamName.replaceAll(' ', "")} i.fa-solid`)[0]
    let img = document.querySelector(`.teams .T${teamName.replaceAll(' ', "")} img`)
    icon.classList.toggle("fa-pen")
    icon.classList.toggle("fa-floppy-disk")

    if(teamBox.querySelector("input")){
        img.style.cursor = `cursor`
        document.querySelector(`#file-upload-${teamName.replaceAll(' ', "")}`).disabled = true
        await uploadTeamIcon(true, teamName.replaceAll(' ', ""));
        changeTeamName(teamName, teamBox.querySelector("input").value);
    } else{
        img.style.cursor = `pointer`
        document.querySelector(`#file-upload-${teamName.replaceAll(' ', "")}`).disabled = false
        teamBox.innerHTML = `<input type="text" value="${teamName}"/>`
    }
}
function changeTeamName(oldTeamName, newTeamName){
    let teamBox = document.querySelector(`.teams .T${oldTeamName.replaceAll(' ', "")} p`)

    const data = {oldTeamName: oldTeamName, newTeamName: newTeamName, imagePath: teamIconPath ? teamIconPath : ""};
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
        teamBox.innerHTML = `<p>${teamName} verlassen?</p>
            <button style="margin-left: auto; margin-right: 1rem;" class="filled" onclick="quitOrDeleteTeamInfo('${teamName}')">Nein</button>
            <button class="outlined" onclick="deleteTeam('${teamName}')">Ja</button>`
    } else{
        teamBox.innerHTML = savedHTML
        savedHTML = ""
    }
}
function deleteTeam(teamName){
    savedHTML = ""
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
            updateTeamList()
        })
        .catch((error) => {
            console.error(`Error:`, error);
        });
}

function updateImage(elem, value){
    let file = elem.files[0];
    let reader = new FileReader();

    reader.onload = function(e) {
        document.getElementById(`image-preview-${value}`).getElementsByTagName("img")[0].src = e.target.result;
    };

    reader.readAsDataURL(file);
}

function uploadUserIcon(){
    return new Promise((resolve, reject) => {
        let fileInput = document.getElementById(`file-upload-user`);
        let file = fileInput.files[0];

        if (file) {
            let formData = new FormData();
            formData.append("image", file);

            fetch("./server/user.php/uploadUserIcon", {
                method: "POST",
                body: formData
            })
                .then((response) => response.json())
                .then((data) => {
                    personalData.imagePath = data.data;
                    resolve(); // Resolve the promise after the upload is finished successfully
                })
                .catch((error) => {
                    console.error("Image upload failed. Error: " + error);
                    reject(error); // Reject the promise if there's an error during the upload
                });
        } else {
            resolve(); // Resolve the promise if there's no file to upload
        }
    });
}

function uploadTeamIcon(isTeam, teamName) {
    return new Promise((resolve, reject) => {
        let fileInput = document.getElementById(`file-upload-${isTeam ? teamName.replaceAll(' ', "") : 'group'}`);
        let file = fileInput.files[0];

        if (file) {
            let formData = new FormData();
            formData.append("image", file);

            fetch(`./server/team.php/uploadTeamIcon?teamName=${teamName}`, {
                method: "POST",
                body: formData
            })
                .then((response) => response.json())
                .then((data) => {
                    teamIconPath = data.data;
                    resolve(); // Resolve the promise after the upload is finished successfully
                })
                .catch((error) => {
                    console.error("Image upload failed. Error: " + error);
                    reject(error); // Reject the promise if there's an error during the upload
                });
        } else {
            resolve(); // Resolve the promise if there's no file to upload
        }
    });
}

refreshEventSection(true)