let historyStack = [];

/* =========================
   ✅ DATA MOCK
========================= */

let contacts = [
    { id: 1, email: "juan@gmail.com", tags: ["cliente"], campaigns: ["Promo"], is_subscribed: true },
    { id: 2, email: "ana@gmail.com", tags: ["lead"], campaigns: ["Promo"], is_subscribed: false }
];

let tags = [
    { id: 1, name: "cliente", campaigns: ["Promo"], contacts: [1] },
    { id: 2, name: "lead", campaigns: ["Promo"], contacts: [2] }
];

let templates = [
    { id: 1, name: "Promo Junio", subject: "20% OFF" }
];


let campaigns = [
    {
        id: 1,
        name: "Campaña prueba",
        template_name: "Promo Junio",
        subject: "20% OFF 🔥",
        status: "borrador"
    }
];




let filteredContacts = [];
let filteredContactsMaster = [];

let sortAsc = true;
let templateSortAsc = true;
let tagSortAsc = true;

/* =========================
   ✅ SIDEBAR
========================= */

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("collapsed");
    document.getElementById("content").classList.toggle("expanded");
}

/* =========================
   ✅ NAVEGACIÓN
========================= */

function showSection(id, el) {

    const current = document.querySelector(".section.active");

    if (current && current.id !== id) {
        historyStack.push(current.id);
    }

    document.querySelectorAll(".section").forEach(sec => {
        sec.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");

    document.querySelectorAll(".menu li").forEach(li => {
        li.classList.remove("active-menu");
    });

    if (el) el.classList.add("active-menu");

    setTimeout(() => {


        if (id === "contactos") {
            loadContacts();
        }


        if (id === "tags") {
            renderTags();
        }

        if (id === "templates") {
            loadTemplates();
        }

        
        if (id === "campanas") {
            loadCampaigns();
        }


    }, 0);

    updateBackButton();
    updateTitle(id);
}

/* =========================
   ✅ CONTACTOS
========================= */

function renderContacts() {
    const table = document.getElementById("contactsTable");
    if (!table) return;

    table.innerHTML = "";

    filteredContacts.forEach(c => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${c.id}</td>
            <td>${c.email}</td>
            <td>${c.tags.join(", ") || "-"}</td>

            <td>
                <button class="subscribe-btn" onclick="openContactTagModal(${c.id})">
                    Asignar
                </button>
            </td>

            <td>${c.campaigns.join(", ") || "-"}</td>
            <td>${c.is_subscribed ? "Activo" : "Inactivo"}</td>

            <td>
                ${
                    c.is_subscribed
                    ? `<button class="unsubscribe-btn" onclick="unsubscribe(${c.id})">Desuscribir</button>`
                    : `<button class="subscribe-btn" onclick="subscribe(${c.id})">Suscribir</button>`
                }
            </td>
        `;

        table.appendChild(row);
    });
}

/* =========================
   ✅ TAGS
========================= */

function renderTags() {

    const table = document.getElementById("tagsTable");
    if (!table) return;

    table.innerHTML = "";

    tags.forEach(tag => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${tag.id}</td>
            <td>${tag.name}</td>
            <td>${tag.campaigns.join(", ") || "-"}</td>

            <td>
                <button class="subscribe-btn" onclick="openModal('${tag.name}')">
                    Asignar
                </button>
            </td>

            <td>
                <button class="unsubscribe-btn" onclick="deleteTag('${tag.name}')">
                    Eliminar
                </button>
            </td>
        `;

        table.appendChild(row);
    });
}

/* =========================
   ✅ TEMPLATES
========================= */

function loadTemplates() {

    const table = document.getElementById("templatesTable");
    if (!table) return;

    table.innerHTML = "";

    templates.forEach(t => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${t.id}</td>
            <td>${t.name}</td>
            <td>${t.subject}</td>

            <td>
                <button class="subscribe-btn">
                    Editar
                </button>
            </td>

            <td>
                <button class="unsubscribe-btn">
                    Eliminar
                </button>
            </td>
        `;

        table.appendChild(row);
    });
}

/* =========================
   ✅ BACK + TITLE
========================= */

function goBack() {
    if (!historyStack.length) return;
    showSection(historyStack.pop());
}

function updateBackButton() {
    const btn = document.getElementById("backBtn");
    btn.style.display = historyStack.length ? "block" : "none";
}

function updateTitle(id) {
    const titles = {
        inicio: "INICIO",
        contactos: "CONTACTOS",
        tags: "TAGS",
        templates: "TEMPLATES",
        campanas: "CAMPANAS",
        stats: "ESTADISTICAS"
    };

    document.getElementById("pageTitle").innerText = titles[id];
}

function addCampaign() {

    const name = prompt("Nombre de la campaña:");
    if (!name) return;

    // elegir template
    const templateId = Number(prompt("ID del template a usar:"));
    const template = templates.find(t => t.id === templateId);

    if (!template) {
        alert("Template no encontrado");
        return;
    }

    // asunto editable
    const subject = prompt("Asunto del mail:", template.subject);

    campaigns.push({
        id: campaigns.length + 1,
        name: name,
        template_id: template.id,
        template_name: template.name,
        subject: subject,
        status: "borrador"
    });

    loadCampaigns();
}

function loadCampaigns() {

    const table = document.getElementById("campaignsTable");
    if (!table) return;

    table.innerHTML = "";

    campaigns.forEach(c => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${c.id}</td>
            <td>${c.name}</td>
            <td>${c.template_name}</td>
            <td>${c.subject}</td>
            <td>${c.status}</td>
        `;

        table.appendChild(row);
    });
}

function addContact() {

    const email = prompt("Ingrese email:");
    if (!email) return;

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email)) {
        alert("❌ Email inválido");
        return;
    }

    fetch("http://localhost:8000/contacts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
    })
    .then(async res => {

        const data = await res.json();

        console.log("RESPUESTA:", res.status, data); // 🔥 DEBUG

        if (!res.ok) {
            alert(data.detail);
            return;
        }

        alert("✅ Contacto agregado");

        loadContacts();
    })
    .catch(err => console.error(err));
}


function loadContacts() {

    fetch("http://localhost:8000/contacts")
        .then(res => res.json())
        .then(data => {

            filteredContactsMaster = data.map(c => ({
                id: c.id,
                email: c.email,
                tags: [],
                campaigns: [],
                is_subscribed: c.is_subscribed
            }));

            filteredContacts = [...filteredContactsMaster];

            renderContacts();
        })
        .catch(err => {
            console.error("Error cargando contactos:", err);
        });
}
``


function downloadTemplate() {

    const csvContent = "email\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "plantilla_contactos.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function importFile(event) {

    const file = event.target.files[0];
    if (!file) return;

    // 🔥 ACÁ VA EL LOG
    console.log("Subiendo archivo:", file.name);

    const formData = new FormData();
    formData.append("file", file);

    fetch("http://localhost:8000/upload-csv", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {

        alert(data.message);

        loadContacts();

        // 🔥 reset para poder subir el mismo archivo otra vez
        event.target.value = "";

    })
    .catch(err => console.error("Error:", err));
}


function openFileInput() {
    document.getElementById("fileInput").click();
}

function unsubscribe(id) {

    const contact = filteredContacts.find(c => c.id === id);
    if (!contact) return;

    fetch("http://localhost:8000/unsubscribe?email=" + contact.email, {
        method: "POST"
    })
    .then(res => res.json())
    .then(() => {
        loadContacts();
    })
    .catch(err => console.error("Error:", err));
}

function subscribe(id) {

    const contact = filteredContacts.find(c => c.id === id);
    if (!contact) return;

    fetch("http://localhost:8000/subscribe?email=" + contact.email, {
        method: "POST"
    })
    .then(res => res.json())
    .then(() => {
        loadContacts();
    })
    .catch(err => console.error("Error:", err));
}

function sortById() {

    filteredContacts.sort((a, b) =>
        sortAsc ? a.id - b.id : b.id - a.id
    );

    sortAsc = !sortAsc;

    renderContacts();
}

function sortByEmail() {

    filteredContacts.sort((a, b) =>
        sortAsc
            ? a.email.localeCompare(b.email)
            : b.email.localeCompare(a.email)
    );

    sortAsc = !sortAsc;

    renderContacts();
}

function sortByTags() {

    filteredContacts.sort((a, b) =>
        sortAsc
            ? a.tags.length - b.tags.length
            : b.tags.length - a.tags.length
    );

    sortAsc = !sortAsc;

    renderContacts();
}

function sortByCampaigns() {

    filteredContacts.sort((a, b) =>
        sortAsc
            ? a.campaigns.length - b.campaigns.length
            : b.campaigns.length - a.campaigns.length
    );

    sortAsc = !sortAsc;

    renderContacts();
}

function sortByStatus() {

    filteredContacts.sort((a, b) =>
        sortAsc
            ? a.is_subscribed - b.is_subscribed
            : b.is_subscribed - a.is_subscribed
    );

    sortAsc = !sortAsc;

    renderContacts();
}

function searchContacts(query) {

    const q = query.toLowerCase();

    if (!filteredContactsMaster) return;

    filteredContacts = filteredContactsMaster.filter(c =>
        c.email.toLowerCase().includes(q)
    );

    renderContacts();
}