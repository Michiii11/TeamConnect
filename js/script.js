/********* variables *********/
let userName
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
                userName = answer.name;
                document.querySelector(".userName").innerHTML = userName;
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


/********* popup *********/
//region
function togglePopUp(){
    if(document.querySelector(".popUp.active")){
        document.querySelector(".popUp.active").classList.remove("active");
    } else{
        document.querySelector(".popUp").classList.add("active");
        loadTeamList()
    }
    document.querySelector(".popUp .active input").focus();
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
    //todo fehlermeldung bei duplikaten
    let name = document.querySelector("#createTeamInput").value;
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
                <i class="fa-sharp fa-solid fa-pen"></i>
            </div>
        `
    });

    document.querySelector(".board section.player").innerHTML = html
}
//endregion


/********* calendar box *********/
//region
function getEvents(){
    fetch(`./server/user.php/getEvents`)
        .then((response) => {
            return response.json()
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
                <i class="fa-solid fa-trophy"></i>
                <div>
                    <h4>${item.type}</h4>
                    <p>${getDayByDate(item.date)}, ${item.date} - ${item.time} Uhr</p>
                </div>
            </div>
        `
    });

    document.querySelector(".board section.calendar .eventList").innerHTML = html
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