const periode = 500 //ms

var motATrouver
var listeATrouver
var lettresTrouvees
var nbLettres
function nouvellePartie() {
    motATrouver = motsATrouver[Math.floor(motsATrouver.length * Math.pow(Math.random(), 1.5))]
    motATrouver = motATrouver.normalize("NFD").replace(/\p{Diacritic}/gu, "")
    listeATrouver = Array.from(motATrouver)
    nbLettres = listeATrouver.length

    lettresTrouvees = [listeATrouver[0]]

    grille.innerHTML = ""

    nouvelEssai()
}

var form
var lettresATrouver
var nbLettresBienPlacees
var nbEssais = 0
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
        input.onfocus = onfocus
        input.onkeydown = onkeydown
        input.oninput = oninput
        input.onkeyup = onkeyup
        input.tabIndex = indice + 1
        if (lettresTrouvees[indice]) input.value = lettresTrouvees[indice]
        form.appendChild(input)
    })

    grille.appendChild(form)

    if (nbEssais <= 6) {
        form.onsubmit = onsubmit
        form.children[0].focus()
    } else {
        listeATrouver.forEach((lettre, indice) => {
            var input = form.children[indice]
            input.disabled = true
            input.value = lettre
        })
        if (confirm(`Perdu ! Le mot a trouver était : ${motATrouver.toUpperCase()}.\nRéessayer ?`)) nouvellePartie()

    }
}

function onfocus() {
    this.select()
}

function oninput() {
    this.value = this.value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
    if (this.checkValidity()) {
        this.nextSibling?.focus()
    } else {
        this.value = ""
    }
}

function onkeydown(event) {
    if (event.key == "Backspace" && this.value == "") {
        this.previousSibling?.focus()
    }
}

function onkeyup(event) {
    switch(event.key) {
        case "Enter": form.onsubmit(); break
        case "ArrowLeft": this.previousSibling?.focus(); break
        case "ArrowRight": this.nextSibling?.focus(); break
    }
}

function onsubmit(event) {
    if (this.checkValidity()) {
        volumeOn = volumeCheckbox.checked
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
                        input.className = "lettre-bien-placee"
                        if (volumeOn) sonLettreBienPlacee.play()
                    }, periode * indice)
                }
                input.disabled = true
            })

            inputsNonValides.forEach((input, indice) => {
                var index = lettresATrouver.indexOf(input.value)
                if (index >= 0) {
                    delete(lettresATrouver[index])
                    setTimeout(() => {
                        input.className = "lettre-mal-placee"
                        if (volumeOn) sonLettreMalPlacee.play()
                    }, periode * indice)
                } else {
                    setTimeout(() => {if (volumeOn) sonLettreNonTrouvee.play()}, periode * indice)
                }
            })

            setTimeout(() => {
                if (nbLettresBienPlacees == nbLettres) {
                    if (confirm("Bien joué gros !\nUne nouvelle partie ?")) nouvellePartie()
                } else nouvelEssai()
            }, listeATrouver.length * periode)

        } else {
            for(input of form.children) input.disabled = true
            if (volumeOn) sonLettreMalPlacee.play()
            nouvelEssai()
        }

    } else {
        this.reportValidity()
    }
}

nouvellePartie()