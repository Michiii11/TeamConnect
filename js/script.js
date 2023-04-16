/********* variables *********/
let userName
let currentTeamName
let currentTeamID

function updateDashboard(){
    getPlayers();
    getEvents();
}

/********* check login *********/
//region
checkLogin()
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
function highlightNavitem(elem){
    hoverBox.style.opacity= 0.3;
    let rect = elem.getBoundingClientRect();
    hoverBox.style.top = rect.top-document.querySelector("nav").clientHeight+rect.height/2+"px";
}
function unhighlightNavitem(){
    hoverBox.style.opacity = 0;
}
function addNavitemEventListener(){
    document.querySelectorAll("aside .content p").forEach((item)=>{
        item.onmouseenter = () => {highlightNavitem(item)};
        item.onmouseleave = () => {unhighlightNavitem()};
    })
}
//endregion


/********* asside *********/
//region
getAsideData()
function getAsideData(){
    fetch(`./server/user.php/getAsideData`)
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
    let html = "";

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

    html += `<p onclick="addTeam()" class="addButton">Team hinzufügen</p>`

    document.querySelector("main aside section .content").innerHTML = html

    addNavitemEventListener();
    unhighlightNavitem();
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

function addTeam(){

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

    html += `<p class="newButton"><i class="fa-solid fa-plus"></i>NEUER SPIELER</p>`
    document.querySelector(".board section.player").innerHTML = html
}
//endregion


/********* calenar box *********/
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

    console.log(data)

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


/********* calenar box *********/
//region
function openSidebar(type){

}
//endregion