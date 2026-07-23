const NB_ESSAIS_MAX = 6
const periode = 400 //ms

window.onload = function(event) {
    confirmOptionsButton.ariaBusy = false
    afficheOptions()
}

var volumeOn = true
var nbEssais = 0
function afficheOptions() {
    if (nbEssais) {
        nbLettresInput.disabled = true
        confirmOptionsButton.innerHTML = "Continuer"
    } else {
        nbLettresInput.disabled = false
        confirmOptionsButton.innerHTML = "Jouer"
    }
    confirmOptionsButton.disabled = false
    confirmOptionsButton.innerHTML = nbEssais? "Continuer" : "Jouer"
    optionsDialog.showModal() 
}

optionsButton.onclick = afficheOptions

var nbLettres = 8
var motsAutorises = []
var motsATrouver  = []
optionsForm.onsubmit = function(event) {
    event.preventDefault()

    if (optionsForm.checkValidity()) {
        volumeOn = volumeCheckbox.checked
        nbLettres = nbLettresInput.valueAsNumber

        if (!chargementTermine()) {
            confirmOptionsButton.innerHTML = "Chargement..."
            confirmOptionsButton.disabled = true
            confirmOptionsButton.ariaBusy = true

            if (!motsATrouver[nbLettres]) {
                fetch(`motsATrouver${nbLettres}.txt`)
                    .then(response => response.text())
                    .then(data => motsATrouver[nbLettres] = data.split("\n"))
                    .then(chargementTermine)
            }
            
            if (!motsAutorises[nbLettres]) {
                fetch(`motsAutorises${nbLettres}.txt`)
                    .then(response => response.text())
                    .then(data => motsAutorises[nbLettres] = data.split("\n"))
                    .then(chargementTermine)
            }
        }
    } else {
        optionsForm.reportValidity()
    }
}

function chargementTermine() {
    if (motsAutorises[nbLettres] && motsATrouver[nbLettres]) {
        optionsDialog.close()
        confirmOptionsButton.innerHTML = "Continuer"
        confirmOptionsButton.disabled = false
        confirmOptionsButton.ariaBusy = false

        if (!nbEssais) nouvellePartie()
        return true
    } else {
        return false
    }
}

var nbLettres
var motATrouver
var listeATrouver
var lettresTrouvees
var nbEssais = 0
function nouvellePartie() {
    motATrouver = motsATrouver[nbLettres][Math.floor(motsATrouver[nbLettres].length * Math.random())]
    motATrouver = motATrouver.normalize("NFD").replace(/\p{Diacritic}/gu, "")
    listeATrouver = Array.from(motATrouver)

    lettresTrouvees = [listeATrouver[0]]

    grille.innerHTML = ""

    nouvelEssai()
}

function perdu() {
    if (confirm(`Perdu ! Le mot à trouver était : ${motATrouver.toUpperCase()}.\nRéessayer ?`)) afficheOptions()
    else nbEssais = 0
}
    
sonPerdu.onended = perdu

var form
var lettresATrouver
var nbLettresBienPlacees
function nouvelEssai() {
    nbEssais++

    form = document.createElement("form")
    form.action = "#"

    lettresATrouver = Array.from(listeATrouver)
    nbLettresBienPlacees = 0

    listeATrouver.forEach((lettre, indice) => {
        var input = document.createElement("input")
        input.type = "text"
        input.required = true
        input.minLength = 1
        input.maxLength = 1
        input.size = 1
        input.pattern = "[a-z]"
        input.placeholder = "."
        input.classList.add("lettre")
        input.onfocus = onfocus
        input.onkeydown = onkeydown
        input.oninput = oninput
        input.onkeyup = onkeyup
        input.tabIndex = indice + 1
        if (lettresTrouvees[indice]) input.value = lettresTrouvees[indice]
        form.appendChild(input)
    })

    grille.appendChild(form)

    if (nbEssais <= NB_ESSAIS_MAX) {
        form.onsubmit = onsubmit
        form.children[0].disabled = true
        form.children[1].focus()
    } else {
        listeATrouver.forEach((lettre, indice) => {
            var input = form.children[indice]
            input.disabled = true
            input.value = lettre
        })
        if (volumeOn) play(sonPerdu)
        else perdu()
        nbEssais = 0
    }
}

function onfocus() {
    this.select()
}

function onkeydown(event) {
    if (event.key == "Backspace" && this.value == "") {
        this.previousSibling?.focus()
    }
}

function oninput() {
    this.value = this.value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
    if (this.checkValidity()) {
        this.nextSibling?.focus()
    } else {
        this.value = ""
    }
}

function onkeyup(event) {
    switch(event.key) {
        case "Enter": form.onsubmit(); break
        case "ArrowLeft": this.previousSibling?.focus(); break
        case "ArrowRight": this.nextSibling?.focus(); break
        case "Home": form.children[0].focus(); break
        case "End": form.children[nbLettres-1].focus(); break
        default: return
    }
    event.preventDefault()
}

function play(son) {
    son.currentTime = 0
    son.play()
}

function gagne() {
    if (confirm("Bien joué !\nUne nouvelle partie ?")) afficheOptions()
}

sonMotTrouve.onended = gagne

function onsubmit(event) {
    if (this.checkValidity()) {
        if (motsAutorises[nbLettres].includes(Array.from(form.children).map((input) => input.value).join(""))) {
            var inputsNonValides = Array.from(form.children)
            listeATrouver.forEach((lettre, indice) => {
                var input = this.children[indice]
                if (input.value == lettre) {
                    if (!lettresTrouvees[indice]) lettresTrouvees[indice] = lettre
                    delete(lettresATrouver[indice])
                    delete(inputsNonValides[indice])
                    nbLettresBienPlacees++
                    setTimeout(() => {
                        input.classList.add("bien-placee")
                        if (volumeOn) play(sonLettreBienPlacee)
                    }, periode * indice)
                }
                input.disabled = true
            })

            inputsNonValides.forEach((input, indice) => {
                var index = lettresATrouver.indexOf(input.value)
                if (index >= 0) {
                    delete(lettresATrouver[index])
                    setTimeout(() => {
                        input.classList.add("mal-placee")
                        if (volumeOn) play(sonLettreMalPlacee)
                    }, periode * indice)
                } else if (volumeOn) {
                    setTimeout(() => play(sonLettreNonTrouvee), periode * indice)
                }
            })

            setTimeout(() => {
                if (nbLettresBienPlacees == nbLettres) {
                    nbEssais = 0
                    if (volumeOn) play(sonMotTrouve)
                    else gagne()
                } else nouvelEssai()
            }, listeATrouver.length * periode)

        } else {
            for(input of form.children) input.disabled = true
            if (volumeOn) play(sonLettreNonTrouvee)
            nouvelEssai()
        }

    } else {
        this.reportValidity()
    }
}

