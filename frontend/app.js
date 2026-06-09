let historyStack = [];

/* =========================
   ✅ DATA MOCK
========================= */

let contacts = [
    { id: 1, email: "juan@gmail.com", tags: ["cliente"], campaigns: ["Promo"], is_subscribed: true },
    { id: 2, email: "ana@gmail.com", tags: ["lead"], campaigns: ["Promo"], is_subscribed: false }
];

let tags = [
    { name: "cliente", campaigns: ["Promo"], contacts: [1] },
    { name: "lead", campaigns: ["Promo"], contacts: [2] }
];

let filteredContacts = [...contacts];
let sortAsc = true;

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

    if (id === "contactos") {
        filteredContacts = [...contacts];
        renderContacts();
    }

    if (id === "tags") {
        renderTags();
    }

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
            <td>${c.tags.join(", ")}</td>

            <!-- ✅ NUEVA COLUMNA -->
            <td>
                <button class="subscribe-btn" onclick="openContactTagModal(${c.id})">
                    Asignar
                </button>
            </td>

            <td>${c.campaigns.join(", ")}</td>
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

/* ✅ SORT */

function sortById() {
    sortAsc = !sortAsc;
    filteredContacts.sort((a,b)=> sortAsc ? a.id-b.id : b.id-a.id);
    renderContacts();
}

function sortByEmail() {
    sortAsc = !sortAsc;
    filteredContacts.sort((a,b)=> 
        sortAsc
        ? a.email.localeCompare(b.email)
        : b.email.localeCompare(a.email)
    );
    renderContacts();
}

function sortByTags() {
    sortAsc = !sortAsc;
    filteredContacts.sort((a,b)=> 
        sortAsc
        ? a.tags.join(", ").localeCompare(b.tags.join(", "))
        : b.tags.join(", ").localeCompare(a.tags.join(", "))
    );
    renderContacts();
}

function sortByCampaigns() {
    sortAsc = !sortAsc;
    filteredContacts.sort((a,b)=> 
        sortAsc
        ? a.campaigns.join(", ").localeCompare(b.campaigns.join(", "))
        : b.campaigns.join(", ").localeCompare(a.campaigns.join(", "))
    );
    renderContacts();
}

function sortByStatus() {
    sortAsc = !sortAsc;
    filteredContacts.sort((a,b)=> 
        sortAsc
        ? a.is_subscribed - b.is_subscribed
        : b.is_subscribed - a.is_subscribed
    );
    renderContacts();
}

/* ✅ ACCIONES CONTACTOS */

function unsubscribe(id) {
    const c = contacts.find(x => x.id === id);
    if (!c) return;

    c.is_subscribed = false;
    filteredContacts = [...contacts];
    renderContacts();
}

function subscribe(id) {
    const c = contacts.find(x => x.id === id);
    if (!c) return;

    c.is_subscribed = true;
    filteredContacts = [...contacts];
    renderContacts();
}

function addContact() {

    const email = prompt("Email:");
    if (!email) return;

    contacts.push({
        id: contacts.length + 1,
        email,
        tags: [],
        campaigns: [],
        is_subscribed: true
    });

    filteredContacts = [...contacts];
    renderContacts();
}

function importFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    alert("Archivo: " + file.name);
}

function downloadTemplate() {

    const csv = "email\nexample@gmail.com";

    const blob = new Blob([csv], { type: "text/csv" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "plantilla_contactos.csv";

    a.click();
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
            <td>${tag.name}</td>
            <td>${tag.campaigns.join(", ")}</td>
            <td>
                
            <button class="subscribe-btn" onclick="openModal('${tag.name}')">
                Asignar
            </button>

            </td>
            <td>
                <button class="unsubscribe-btn" onclick="deleteTag('${tag.name}')">Eliminar</button>
            </td>
        `;

        table.appendChild(row);
    });
}

/* ✅ TAG ACCIONES */

function addTag() {
    const name = prompt("Nombre del tag:");
    if (!name) return;

    tags.push({
        name,
        campaigns: [],
        contacts: []
    });

    renderTags();
}

function deleteTag(name) {
    tags = tags.filter(t => t.name !== name);
    renderTags();
}

function importTags(e) {
    const file = e.target.files[0];
    if (!file) return;

    alert("Archivo de tags: " + file.name);
}

function downloadTagTemplate() {

    const csv = "tag\ncliente";

    const blob = new Blob([csv], { type: "text/csv" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "plantilla_tags.csv";

    a.click();
}

/* =========================
   ✅ MODAL TAGS
========================= */

function openModal(tagName) {

    const modal = document.getElementById("tagModal");
    const container = document.getElementById("modalContacts");

    container.innerHTML = "";

    contacts.forEach(c => {

        const isChecked = tags.find(t => t.name === tagName).contacts.includes(c.id);

        container.innerHTML += `
            <div>
                <input type="checkbox"
                    ${isChecked ? "checked" : ""}
                    onchange="toggleTag('${tagName}', ${c.id})">
                ${c.email}
            </div>
        `;
    });

    modal.style.display = "flex";
}

function closeModal() {
    document.getElementById("tagModal").style.display = "none";
}

/* ✅ RELACIÓN TAGS-CONTACTOS */

function toggleTag(tagName, contactId) {

    const tag = tags.find(t => t.name === tagName);

    if (tag.contacts.includes(contactId)) {
        tag.contacts = tag.contacts.filter(id => id !== contactId);
    } else {
        tag.contacts.push(contactId);
    }

    /* actualizar contactos también */
    contacts.forEach(c => {
        if (c.id === contactId) {
            if (tag.contacts.includes(contactId)) {
                if (!c.tags.includes(tagName)) c.tags.push(tagName);
            } else {
                c.tags = c.tags.filter(t => t !== tagName);
            }
        }
    });

    renderContacts();
}

/* =========================
   ✅ BACK
========================= */

function goBack() {
    if (historyStack.length === 0) return;

    const last = historyStack.pop();

    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.getElementById(last).classList.add("active");

    updateBackButton();
    updateTitle(last);
}

function updateBackButton() {
    const btn = document.getElementById("backBtn");
    btn.style.display = historyStack.length ? "block" : "none";
}

/* =========================
   ✅ TÍTULOS
========================= */

function updateTitle(id) {

    const titles = {
        inicio: "INICIO",
        contactos: "CONTACTOS",
        tags: "TAGS",
        campañas: "CAMPAÑAS",
        stats: "ESTADÍSTICAS"
    };

    document.getElementById("pageTitle").innerText = titles[id];
}

function openContactTagModal(contactId) {

    const modal = document.getElementById("contactTagModal");
    const container = document.getElementById("contactTagList");

    const contact = contacts.find(c => c.id === contactId);

    container.innerHTML = "";

    tags.forEach(tag => {

        const checked = contact.tags.includes(tag.name);

        container.innerHTML += `
            <div>
                <input type="checkbox"
                    ${checked ? "checked" : ""}
                    onchange="toggleContactTag(${contactId}, '${tag.name}')">
                ${tag.name}
            </div>
        `;
    });

    modal.style.display = "flex";
}

function closeContactModal() {
    document.getElementById("contactTagModal").style.display = "none";
}

function toggleContactTag(contactId, tagName) {

    const contact = contacts.find(c => c.id === contactId);
    const tag = tags.find(t => t.name === tagName);

    if (!contact || !tag) return;

    const alreadyHasTag = contact.tags.includes(tagName);

    // ✅ SI YA LO TIENE → PERMITE QUITAR SIEMPRE
    if (alreadyHasTag) {

        contact.tags = contact.tags.filter(t => t !== tagName);
        tag.contacts = tag.contacts.filter(id => id !== contactId);

    } else {

        // ❌ LÍMITE DE 5 TAGS
        if (contact.tags.length >= 5) {
            alert("Máximo 5 tags por contacto");
            return;
        }

        // ✅ AGREGA
        contact.tags.push(tagName);

        if (!tag.contacts.includes(contactId)) {
            tag.contacts.push(contactId);
        }
    }

    renderContacts();
}


let tagSortAsc = true;

function sortTagsByName() {
    tagSortAsc = !tagSortAsc;

    tags.sort((a, b) =>
        tagSortAsc
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
    );

    renderTags();
}

function sortTagsByCampaigns() {
    tagSortAsc = !tagSortAsc;

    tags.sort((a, b) => {
        const aVal = a.campaigns.join(", ");
        const bVal = b.campaigns.join(", ");

        return tagSortAsc
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
    });

    renderTags();
}