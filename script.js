const NB_ESSAIS_MAX = 6
const periode = 400 //ms

window.onload = function(event) {
    confirmOptionsButton.innerHTML = "Jouer"
    confirmOptionsButton.disabled = false
}

optionsButton.onclick = function(event) {
    optionsDialog.showModal();
}

var volumeOn = true
var nbLettres = 8
optionsForm.onsubmit = function(event) {
    if (optionsForm.checkValidity()) {
        volumeOn = volumeCheckbox.checked
        nbLettres = nbLettresInput.valueAsNumber
        optionsDialog.close()
        if (!nbEssais) nouvellePartie()
    } else {
        optionsForm.reportValidity()
    }
}

var motATrouver
var listeATrouver
var lettresTrouvees
var nbEssais = 0
function nouvellePartie() {
    nbEssais = 0
    motATrouver = motsATrouver[nbLettres][Math.floor(motsATrouver[nbLettres].length * Math.random())]
    motATrouver = motATrouver.normalize("NFD").replace(/\p{Diacritic}/gu, "")
    listeATrouver = Array.from(motATrouver)

    lettresTrouvees = [listeATrouver[0]]

    grille.innerHTML = ""

    nouvelEssai()
}

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
        sonPerdu.onended = function() {
            if (confirm(`Perdu ! Le mot à trouver était : ${motATrouver.toUpperCase()}.\nRéessayer ?`)) nouvellePartie()
            else nbEssais = 0
        }
        if (volumeOn) play(sonPerdu)
        else sonPerdu.onended()
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
    }
}

function play(son) {
    son.currentTime = 0
    son.play()
}

sonMotTrouve.onended = function(event) {
    if (confirm("Bien joué !\nUne nouvelle partie ?")) nouvellePartie()
}

function onsubmit(event) {
    if (this.checkValidity()) {
        if (motsAutorises.includes(Array.from(form.children).map((input) => input.value).join(""))) {
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
                } else {
                    setTimeout(() => {if (volumeOn) play(sonLettreNonTrouvee)}, periode * indice)
                }
            })

            setTimeout(() => {
                if (nbLettresBienPlacees == nbLettres) {
                    if (volumeOn) play(sonMotTrouve)
                    else sonMotTrouve.onended()
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

