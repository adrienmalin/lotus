const periode = 500 //ms

var motATrouver
var lettresTrouvees
var nbLettres
function nouvellePartie() {
    motATrouver = motsATrouver[Math.floor(motsATrouver.length * Math.pow(Math.random(), 1.5))]
    motATrouver = motATrouver.normalize("NFD").replace(/\p{Diacritic}/gu, "")
    motATrouver = Array.from(motATrouver)
    nbLettres = motATrouver.length

    lettresTrouvees = [motATrouver[0]]

    grille.innerHTML = ""

    nouvelEssai()
}

var form
var lettresATrouver
var nbLettresBienPlacees
function nouvelEssai() {
    form = document.createElement("form")
    form.action = "#"
    form.onsubmit = onsubmit

    lettresATrouver = Array.from(motATrouver)
    nbLettresBienPlacees = 0

    motATrouver.forEach((lettre, indice) => {
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

    form.children[0].focus()    
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
            motATrouver.forEach((lettre, indice) => {
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
                input.readOnly = true
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
            }, motATrouver.length * periode)

        } else {
            for(input of form.children) input.readOnly = true
            if (volumeOn) sonLettreMalPlacee.play()
            nouvelEssai()
        }

    } else {
        this.reportValidity()
    }
}

nouvellePartie()