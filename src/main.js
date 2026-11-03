import "./style.css"

/* ================= 1. STATO ================= */
const CHIAVE = "todo-tasks"
const STATI = ["da iniziare", "in corso", "concluso"]

function caricaStato() {
  const testo = localStorage.getItem(CHIAVE)
  if (testo === null) return []

  try {
    const dati = JSON.parse(testo)
    return Array.isArray(dati) ? dati : []
  } catch (errore) {
    console.error("Dati salvati non validi, riparto da zero:", errore.message)
    return []
  }
}

let tasks = caricaStato()
tasks = tasks.map(t => ({ ...t, stato: t.stato || (t.completed ? "concluso" : "da iniziare") }))

/* ================= 2. RIFERIMENTI ================= */
const lista = document.querySelector("#lista")
const info  = document.querySelector("#info")
const form  = document.querySelector("#form-task")
const campo = document.querySelector("#campo-task")

/* ================= 3. PERSISTENZA ================= */
function salvaStato() {
  localStorage.setItem(CHIAVE, JSON.stringify(tasks))
}

/* ================= 4. VIEW ================= */
const CHIAVE_NOME = "todo-nome"
const box = document.querySelector("#benvenuto")

function renderBenvenuto() {
  const nome = localStorage.getItem(CHIAVE_NOME)

  if (nome) {
    box.innerHTML = `<p>Bentornato, ${nome}</p>`
    return
  }

  box.innerHTML = `
    <input type="text" id="campo-nome" placeholder="Inserisci nome: ">
    <button id="salva-nome">Salva</button>
  `

  document.querySelector("#salva-nome").addEventListener("click", () => {
    const valore = document.querySelector("#campo-nome").value.trim()
    if (valore === "") return
    localStorage.setItem(CHIAVE_NOME, valore)
    renderBenvenuto()
  })
}
function render() {
  lista.innerHTML = tasks
    .map(t => `
      <li class="${t.completed ? "fatto" : ""}" data-id="${t.id}">
        <span class="titolo">${t.title}</span>
        <span class="stato stato-${t.stato.replace(" ", "-")}">${t.stato}</span>
        <button class="elimina" data-id="${t.id}">×</button>
      </li>
    `)
    .join("")

  const completati = tasks.filter(t => t.completed).length
  azioni.innerHTML = completati > 0
  ? `<button id="pulisci">Elimina task completati (${completati})</button>`
  : ""

const pulisci = document.querySelector("#pulisci")
if (pulisci) {
  pulisci.addEventListener("click", deleteCompletati)
}
  info.textContent = `Totali: ${tasks.length} · Completati: ${completati}`

  const messaggio = document.querySelector("#messaggio")

const totali = tasks.length
const restanti = totali - completati

let frase
if (totali === 0) {
  frase = "Non hai task da completare."
} else if (restanti === 0) {
  frase = "Hai completato tutti i task!"
} else {
  frase = `Ti rimangono ${restanti} task su ${totali} da completare.`
}

messaggio.textContent = frase
}

/* ================= 5. AZIONI ================= */
function deleteCompletati() {
  if (!confirm("Vuoi eliminare tutti i task completati? Non puoi tornare indietro dopo questa azione.")) return
  tasks = tasks.filter(t => !t.completed)
  salvaStato()
  render()
}

function aggiornaStato(nuoviTasks) {
  tasks = nuoviTasks
  salvaStato()
  render()
}

function addTask(title) {
  const pulito = title.trim()
  if (pulito === "") return
  aggiornaStato([...tasks, { id: Date.now(), title: pulito, completed: false, stato: STATI[0] }])
}

function avanzaStato(id) {
  aggiornaStato(
    tasks.map(t => {
      if (t.id !== id) return t
      const prossimo = STATI[(STATI.indexOf(t.stato) + 1) % STATI.length]
      return { ...t, stato: prossimo, completed: prossimo === "concluso" }
    })
  )
}

function deleteTask(id) {
  aggiornaStato(tasks.filter(t => t.id !== id))
}



/* ================= 6. EVENTI ================= */
form.addEventListener("submit", (evento) => {
  evento.preventDefault()
  addTask(campo.value)
  campo.value = ""
  campo.focus()
})

lista.addEventListener("click", (evento) => {
  const elemento = evento.target

  if (elemento.classList.contains("elimina")) {
    deleteTask(Number(elemento.dataset.id))
    return
  }

  const riga = elemento.closest("li")
  if (riga) {
    avanzaStato(Number(riga.dataset.id))
  }
})

/* ================= 7. AVVIO ================= */
renderBenvenuto()
render()