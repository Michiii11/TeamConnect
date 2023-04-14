let shelterName = "will be aquired from the login"
let animalColumns //number of columns currently displayed
let asideData

checkLogin()

PopupEngine.init({backgroundColor: "hsl(0, 0%, 12%)", textColor: "hsl(0, 0%, 100%)", elemBackground: "hsl(0, 0%, 8%)"})

function checkLogin(){
    fetch(`./backend/user.php/`)
        .then((response) => {
            return response.json()
        })
        .then(answer=>{
            if(answer.loggedIn !== true){
                window.location.replace(document.location.href + "/login");
            }
            else{
                document.querySelector("nav h1").innerText = answer.name
                shelterName = answer.name
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

getAsideData()
function getAsideData(){
    fetch(`./backend/user.php/getAsideData`)
        .then((response) => {
            return response.json()
        })
        .then(answer=>{
            console.log(answer.data)
            lookups = answer.data

            renderAside(answer.data)
            getAnimals()
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function getAnimals(){
    fetch(`./backend/animal.php/getAllAnimals`)
        .then((response) => {
            return response.json()
        })
        .then(answer=>{
            console.log(answer.data)

            document.querySelectorAll(".animals .content .column").forEach((elem) => {
                elem.innerHTML = ""
            })

            answer.data.forEach((animal)=>{
                renderAnimal(animal);
            })
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function editAnimal(){
    PopupEngine.createModal({
        text: "Michael",
        buttons: [{text: "close"}]
    })
}

changeColumnSize(3)
function changeColumnSize(to){
    if(animalColumns === to) return

    document.querySelector(".animals .content").innerHTML = ""
    animalColumns = to
    for (let i = 0; i < to; i++) {
        let col = document.createElement("div")
        col.classList.add("column")
        document.querySelector(".animals .content").appendChild(col)
    }
}

window.addEventListener("resize", (event) => {
    if(window.innerWidth < 600){
        changeColumnSize(1)
    }
    else if(window.innerWidth < 1150){
        changeColumnSize(2)
    }
    else{
        changeColumnSize(3)
    }
});

function addAnimal(){
    const data = {name: "animal", typeID: 1, gender: 0, roomID: 1};
    console.log(data)
    fetch("./backend/animal.php/addAnimal", {
        method: "POST", // or 'PUT'
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => {
            return response.text()
        })
        .then((data) => {
            console.log(data)

            getAnimals()
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

/**
 * Adds a animal into the html
 * @param data optional json object that contains all the date of the animal you want to add
 */
function renderAnimal(data){
    console.log(data)

    let birthdateObject = new Date(data.birthdate)

    let processedData = {
        gender: data.gender === 0 ? "male" : "female",
        age: data.birthdate ? Math.abs(new Date(Date.now() - birthdateObject.getTime()).getUTCFullYear() - 1970) : "unkown",
        note: data.note || "",
        owner: data.owner_name || shelterName
    }

    let feedTimeString = ""
    /*data.feedTimes.forEach((item)=>{
        feedTimeString += item
        if(item !== data.feedTimes.at(-1)){
            feedTimeString += " • "
        }
    })*/

    let animal =
        `<section class="animal">
            <div class="top">
                <div class="left">
                    <h2>${data.name}</h2>
                    <p class="subtext"><span class="link">${data.type_name}</span> • ${data.breed_name || "unknown"} • ${processedData.gender}</p>
                    <hr class="accent">
                </div>
                <div class="imgbox" style="background-image: ${data.image}"></div>
            </div>
            <div class="bottom">
                <p class="birthdate">
                <span class="label">birthdate</span>${data.birthdate}
                <span class="label"> • age</span>${processedData.age}</p>
                <p class="room"><span class="label">ROOM</span><span class="link">${data.room_name}</span></p>
                <br>
                <p class="food">
                    <span class="label">menu</span>${data.menu}
                    <br><span class="label">feedtimes</span>${feedTimeString}
                </p>
                <br>
                <p class="owner">
                    <span class="label">OWNER</span><span class="link">${data.owner_name}</span>
                    <span class="label"> • Since</span>${data.acquiryDate}
                </p>
                <hr>
                <p class="note" contenteditable="true" spellcheck="false">${processedData.note}</p>
            </div>
        </section>`


    let column = document.querySelector(".animals .content .column")
    document.querySelectorAll(".animals .content .column").forEach((elem) => {
        if (elem.clientHeight < column.clientHeight)
            column = elem
    })
    column.innerHTML += animal
}

function renderAside(data){
    let html = generateSimpelAside("owners", data.owners)
    html += generateSimpelAside("rooms", data.rooms)

    let typeHtml = document.createElement("ul")
    typeHtml.classList.add("types")
    let lastType = -1
    let listItem
    let listObject
    data.animalTypes.forEach(item => {
        if(item.type_id !== lastType){
            if(listItem)typeHtml.appendChild(listItem)

            lastType = item.type_id
            listItem = document.createElement("li")
            listItem.onclick = ()=>{loadAnimals("types", item.type_id)}
            listItem.innerHTML = `<span>${item.type_name}</span>`
            listObject = document.createElement("ul")
            listItem.appendChild(listObject)
        }
        listObject.innerHTML += `<li>${item.breed_name}</li>`
    })
    typeHtml.appendChild(listItem)

    document.querySelector("main aside .content").innerHTML = html
    document.querySelector("main aside .content").appendChild(typeHtml)
}

function generateSimpelAside(name, data){
    let items = ""
    data.forEach(item => {
        items += `<li onClick="loadAnimals(${name}, ${item.ID})">${item.name}</li>`
    })

    return `<ul class="${name}">${items}</ul>`
}

function loadAnimals(sort, ID, breed){

}