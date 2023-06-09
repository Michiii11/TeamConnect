let page = "signin"

render("signin")

document.querySelector("#login-container").addEventListener("keypress", (e) => {
    if(e.key === "Enter"){
        confirm()
    }
})

function render(type){
    page = type
    if(type === "signin"){
        document.querySelector("#login-container .signin").classList.add("active")
        document.querySelector("#login-container .signup").classList.remove("active")
    }
    else if(type === "signup"){
        document.querySelector("#login-container .signup").classList.add("active")
        document.querySelector("#login-container .signin").classList.remove("active")
    }
}

function confirm(){
    if(!checkLogin())return

    let inputs = document.querySelectorAll("#login-container section.active input")

    if(page === "signin"){
        fetch(`./server/user.php/sign_in?email=${inputs[0].value}&password=${inputs[1].value}`)
            .then((response) => {
                return response.json()
            })
            .then(data=>{
                console.log(data)
                if(data.loggedIn === true){
                    window.location.replace(document.location.href.replace("/login.html", ""));
                }
                else{
                    showError(["Falsche Email oder Passwort eingegeben"])
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }
    else if(page === "signup"){
        const data = {firstname: inputs[0].value, lastname: inputs[1].value, email: inputs[2].value, password: inputs[3].value};
        console.log(data)
        fetch("./server/user.php/sign_up", {
            method: "POST", // or 'PUT'
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => {
                console.log(response.body)
                return response.json()
            })
            .then((data) => {
                console.log(data, data.emailUsed);
                if(data.emailUsed === true){
                    showError(["Es gibt bereits einen Account mit dieser Email"])
                }
                else if(data.loggedIn === true){
                    window.location.replace(document.location.href.replace("/login.html", ""));
                }

                console.log(data.message)
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }
}

function checkLogin(){
    let inputs = document.querySelectorAll("#login-container section.active input")
    let error = []

    if(page === "signin"){
        if(!/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(inputs[0].value))//first has to be valid email
            error.push("Ungültige Email Adresse")
        if(inputs[1].value === ""){
            error.push("Gib ein Passwort ein um weiter zu machen")
        }
    }
    else if(page === "signup"){
        if(!/^[a-zA-Z]+$/.test(inputs[0].value))//first has to be valid name
            error.push("Vorname ist nicht korrekt (darf nur aus Buchstaben bestehen)")
        if(!/^[a-zA-Z]+$/.test(inputs[1].value))//second has to be valid name
            error.push("Nachname ist nicht korrekt (darf nur aus Buchstaben bestehen)")
        if(!/[a-zA-Z0-9._%+-]+@[A-z0-9.-]+\.[A-z]{2,}/.test(inputs[2].value))//third has to be valid email
            error.push("Ungültige Email Adresse")

        let validPassword = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+-=\[\]{}|;':",./<>?])[A-Za-z\d!@#$%^&*()_+-=\[\]{}|;':",./<>?]{8,}/

        if(!validPassword.test(inputs[3].value))
            error.push("Passwort ist nicht stark genug (2 Spezialzeichen oder Nummern, Klein- und Großbuchstaben)")
        else if(inputs[3].value.length < 8 || inputs[3].value.length > 100)
            error.push("Passwort ist zu kurz oder zu lang (8-100 Zeichen)")
        else if(inputs[3].value !== inputs[4].value)
            error.push("Passwörter stimmen nicht überrein")
    }

    showError(error)
    return error.length <= 0;
}

function showError(message){
    let errorBox = document.querySelector("#login-container ." + page + " .error")
    console.log(message, errorBox);
    if(message.length === 0){
    }
    else{

    }
    errorBox.innerHTML = message[0] || ""
}