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

let currentSort = null;
let sortAsc = true;


let previewOriginalTags = [];
let previewCurrentTags = [];
let previewContactId = null;


let filteredContacts = [];
let filteredContactsMaster = [];

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
            loadTags();
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

        // ✅ lógica de los tags (máx 3 + ...)
        const visibleTags = c.tags.slice(0, 3);
        const extraCount = c.tags.length - 3;

        let tagsHTML = visibleTags.join(", ");

        if (extraCount > 0) {
            tagsHTML += ` 
                <span class="more-tags" onclick="openContactTagsPreview(${c.id})">
                    ... (+${extraCount})
                </span>
            `;
        }

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${c.id}</td>
            <td>${c.email}</td>
            <td>${tagsHTML || "-"}</td>

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
            <td>${tag.campaigns ? tag.campaigns.join(", ") : "-"}</td>

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
        tags: "ETIQUETAS",
        templates: "TEMPLATES",
        campanas: "CAMPAÑAS",
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

            // ✅ reconstruir datos
            filteredContactsMaster = data.map(c => ({
                id: c.id,
                email: c.email,
                tags: c.tags || [],
                campaigns: [],
                is_subscribed: c.is_subscribed
            }));

            filteredContacts = [...filteredContactsMaster];

            // ✅ si nunca ordenaste, NO tocar el orden
            if (!currentSort) {
                renderContacts();
                return;
            }

            // ✅ congelamos el estado del sort (IMPORTANTE)
            let asc = sortAsc;

            if (currentSort === "id") {
                filteredContacts.sort((a, b) =>
                    asc ? a.id - b.id : b.id - a.id
                );
            }

            else if (currentSort === "email") {
                filteredContacts.sort((a, b) =>
                    asc
                        ? a.email.localeCompare(b.email)
                        : b.email.localeCompare(a.email)
                );
            }

            else if (currentSort === "status") {
                filteredContacts.sort((a, b) =>
                    asc
                        ? a.is_subscribed - b.is_subscribed
                        : b.is_subscribed - a.is_subscribed
                );
            }

            else if (currentSort === "tags") {
                filteredContacts.sort((a, b) =>
                    asc
                        ? a.tags.length - b.tags.length
                        : b.tags.length - a.tags.length
                );
            }

            renderContacts();
        })
        .catch(err => {
            console.error("Error cargando contactos:", err);
        });
}


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

    
    fetch("http://localhost:8000/unsubscribe-by-id?contact_id=" + id, {
        method: "POST"
    })

    .then(res => res.json())
    
    .then(() => {

        const contact = filteredContacts.find(c => c.id === id);
        if (contact) {
            contact.is_subscribed = false;
        }

        renderContacts();
    })

    .catch(err => console.error("Error:", err));
}

function subscribe(id) {

    const contact = filteredContacts.find(c => c.id === id);
    if (!contact) return;


    fetch("http://localhost:8000/subscribe-by-id?contact_id=" + id, {
        method: "POST"
    })

    .then(res => res.json())

    .then(() => {

        const contact = filteredContacts.find(c => c.id === id);
        if (contact) {
            contact.is_subscribed = true;
        }

        renderContacts();
    })

    .catch(err => console.error("Error:", err));
}

function sortById() {

    filteredContacts.sort((a, b) =>
        sortAsc ? a.id - b.id : b.id - a.id
    );

    currentSort = "id";   // ✅ clave
    sortAsc = !sortAsc;

    renderContacts();
}


function sortByEmail() {

    filteredContacts.sort((a, b) =>
        sortAsc
            ? a.email.localeCompare(b.email)
            : b.email.localeCompare(a.email)
    );

    currentSort = "email";   // ✅ clave
    sortAsc = !sortAsc;

    renderContacts();
}

function sortByTags() {

    filteredContacts.sort((a, b) =>
        sortAsc
            ? a.tags.length - b.tags.length
            : b.tags.length - a.tags.length
    );

    currentSort = "tags";   // ✅ clave
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

    currentSort = "status"; // ✅ guardás tipo de sort
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

function searchTags(query) {

    const q = query.toLowerCase();

    const filtered = tags.filter(t =>
        t.name.toLowerCase().includes(q)
    );

    renderFilteredTags(filtered);
}

function renderFilteredTags(list) {

    const table = document.getElementById("tagsTable");
    table.innerHTML = "";

    list.forEach(tag => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${tag.id}</td>
            <td>${tag.name}</td>
            <td>${tag.campaigns.join(", ") || "-"}</td>
        `;

        table.appendChild(row);
    });
}

function createTag() {
    const name = prompt("Nombre del tag:");
    if (!name) return;

    fetch("http://localhost:8000/tag?name=" + name, {
        method: "POST"
    })
    .then(res => res.json())
    .then(() => {
        loadTags();
    });
}

function loadTags() {
    fetch("http://localhost:8000/tags")
        .then(res => res.json())
        .then(data => {
            tags = data;
            renderTags();
        });
}

function assignTag(email, tag_id) {

    fetch(`http://localhost:8000/assign-tag?email=${email}&tag_id=${tag_id}`, {
        method: "POST"
    })
    .then(() => loadContacts());
}

function importTags(event) {
    const file = event.target.files[0];
    if (!file) return;

    alert("Importar tags todavía no implementado");
}


function downloadTagTemplate() {

    const csvContent = "name\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "plantilla_tags.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function openTagsFileInput() {
    document.getElementById("tagsFileInput").click();
}

function importTags(event) {

    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    fetch("http://localhost:8000/upload-tags", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {

        alert(data.message);

        loadTags();

        event.target.value = "";

    })
    .catch(err => console.error("Error:", err));
}

function deleteTag(name) {

    if (!confirm("Eliminar tag: " + name + "?")) return;

    fetch("http://localhost:8000/tag?name=" + name, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(() => loadTags())
    .catch(err => console.error(err));
}


let currentTagId = null;

function openModal(tagName) {

    const tag = tags.find(t => t.name === tagName);
    if (!tag) return;

    currentTagId = tag.id;

    fetch("http://localhost:8000/contacts")
        .then(res => res.json())
        .then(contactsData => {

            modalData = contactsData;
            modalMode = "contacts";

            const container = document.getElementById("contactsCheckboxList");
            container.innerHTML = "";

            contactsData.forEach(contact => {

                const isChecked = contact.tags?.includes(tagName);

                const div = document.createElement("div");

                div.innerHTML = `
                    <input type="checkbox"
                        value="${contact.id}"
                        ${isChecked ? "checked" : ""}
                        onchange="handleContactToggle(this, ${contact.id})">
                    ${contact.email}
                `;

                container.appendChild(div);
            });

            document.querySelector("#assignModal h3").innerText = "Asignar contactos";

            document.getElementById("assignModal").style.display = "flex";
        });
}


function confirmAssign() {

    const checkboxes = document.querySelectorAll("#contactsCheckboxList input:checked");

    // 🔥 CASO 1: estás asignando contactos a un tag
    if (currentTagId) {
        checkboxes.forEach(cb => {

            const contactId = cb.value;

            fetch(`http://localhost:8000/assign-tag?contact_id=${contactId}&tag_id=${currentTagId}`, {
                method: "POST"
            });

        });
    }

    // 🔥 CASO 2: estás asignando tags a un contacto
    if (currentContactId) {
        checkboxes.forEach(cb => {

            const tagId = cb.value;

            fetch(`http://localhost:8000/assign-tag?contact_id=${currentContactId}&tag_id=${tagId}`, {
                method: "POST"
            });

        });
    }

    alert("✅ Asignación completada");

    currentTagId = null;
    currentContactId = null;

    closeModal();
}


function closeModal() {
    document.getElementById("assignModal").style.display = "none";

    currentTagId = null;
    currentContactId = null;
}

let currentContactId = null;

function openContactTagModal(contactId) {

    currentContactId = contactId;

    fetch("http://localhost:8000/tags")
        .then(res => res.json())
        .then(tagsData => {

            modalData = tagsData;
            modalMode = "tags";

            fetch("http://localhost:8000/contacts")
                .then(res => res.json())
                .then(contactsData => {

                    const contact = contactsData.find(c => c.id === contactId);
                    const contactTags = contact ? (contact.tags || []) : [];

                    const container = document.getElementById("contactsCheckboxList");
                    container.innerHTML = "";

                    tagsData.forEach(tag => {

                        const isChecked = contactTags.includes(tag.name);

                        const div = document.createElement("div");

                        div.innerHTML = `
                            <input type="checkbox"
                                value="${tag.id}"
                                ${isChecked ? "checked" : ""}
                                onchange="handleTagToggle(this, ${tag.id})">
                            ${tag.name}
                        `;

                        container.appendChild(div);
                    });

                    document.querySelector("#assignModal h3").innerText = "Asignar etiquetas";

                    document.getElementById("assignModal").style.display = "flex";
                });
        });
}

function filterModalList(query) {

    const q = query.trim().toLowerCase();
    const container = document.getElementById("contactsCheckboxList");
    container.innerHTML = "";

    if (!modalData || modalData.length === 0) return;

    // ✅ CASO: contacto → tags
    if (modalMode === "tags") {

        fetch("http://localhost:8000/contacts")
            .then(res => res.json())
            .then(contacts => {

                const contact = contacts.find(c => c.id === currentContactId);
                const contactTags = contact ? (contact.tags || []) : [];

                modalData.forEach(tag => {

                    if (!tag.name.toLowerCase().includes(q)) return;

                    const isChecked = contactTags.includes(tag.name);

                    const div = document.createElement("div");

                    div.innerHTML = `
                        <input type="checkbox" value="${tag.id}" ${isChecked ? "checked" : ""}>
                        ${tag.name}
                    `;

                    container.appendChild(div);
                });
            });
    }

    // ✅ CASO: tag → contactos
    if (modalMode === "contacts") {

        fetch("http://localhost:8000/contacts")
            .then(res => res.json())
            .then(contacts => {

                const tag = tags.find(t => t.id === currentTagId);
                const tagName = tag ? tag.name : null;

                modalData.forEach(contact => {

                    if (!contact.email.toLowerCase().includes(q)) return;

                    const contactFull = contacts.find(c => c.id === contact.id);

                    const isChecked = contactFull &&
                                      contactFull.tags &&
                                      contactFull.tags.includes(tagName);

                    const div = document.createElement("div");

                    div.innerHTML = `
                        <input type="checkbox" value="${contact.id}" ${isChecked ? "checked" : ""}>
                        ${contact.email}
                    `;

                    container.appendChild(div);
                });
            });
    }
}

function handleTagToggle(checkbox, tagId) {

    const contactId = currentContactId;

    if (checkbox.checked) {

        fetch(`http://localhost:8000/assign-tag?contact_id=${contactId}&tag_id=${tagId}`, {
            method: "POST"
        })
        .then(() => loadContacts()); // ✅ refresh

    } else {

        fetch(`http://localhost:8000/remove-tag?contact_id=${contactId}&tag_id=${tagId}`, {
            method: "DELETE"
        })
        .then(() => loadContacts()); // ✅ refresh
    }
}

function handleContactToggle(checkbox, contactId) {

    const tagId = currentTagId;

    if (checkbox.checked) {

        fetch(`http://localhost:8000/assign-tag?contact_id=${contactId}&tag_id=${tagId}`, {
            method: "POST"
        })
        .then(() => loadContacts());

    } else {

        fetch(`http://localhost:8000/remove-tag?contact_id=${contactId}&tag_id=${tagId}`, {
            method: "DELETE"
        })
        .then(() => loadContacts());
    }
}

function openContactTagsPreview(contactId) {

    previewContactId = contactId;

    fetch("http://localhost:8000/contacts")
        .then(res => res.json())
        .then(data => {

            const contact = data.find(c => c.id === contactId);
            if (!contact) return;

            previewOriginalTags = [...contact.tags];
            previewCurrentTags = [...contact.tags];

            const container = document.getElementById("tagsPreviewList");
            container.innerHTML = "";

            contact.tags.forEach(tagName => {

                const tag = tags.find(t => t.name === tagName);

                const div = document.createElement("div");

                div.innerHTML = `
                    <input 
                        type="checkbox" 
                        checked
                        onchange="togglePreviewTag('${tagName}')"
                    >
                    ${tagName}
                `;

                container.appendChild(div);
            });

            document.getElementById("tagsPreviewModal").style.display = "flex";
        });
}

function removeFromPreview(contactId, tagId) {

    fetch(`http://localhost:8000/remove-tag?contact_id=${contactId}&tag_id=${tagId}`, {
        method: "DELETE"
    });

}

function closeTagsPreview() {
    document.getElementById("tagsPreviewModal").style.display = "none";
}

function togglePreviewTag(tagName) {

    if (previewCurrentTags.includes(tagName)) {
        previewCurrentTags = previewCurrentTags.filter(t => t !== tagName);
    } else {
        previewCurrentTags.push(tagName);
    }
}

async function confirmPreviewChanges() {

    const toRemove = previewOriginalTags.filter(t => !previewCurrentTags.includes(t));
    const toAdd = previewCurrentTags.filter(t => !previewOriginalTags.includes(t));

    // eliminar
    await Promise.all(
        toRemove.map(tagName => {

            const tag = tags.find(t => t.name === tagName);
            if (!tag) return;

            return fetch(`http://localhost:8000/remove-tag?contact_id=${previewContactId}&tag_id=${tag.id}`, {
                method: "DELETE"
            });
        })
    );

    // agregar
    await Promise.all(
        toAdd.map(tagName => {

            const tag = tags.find(t => t.name === tagName);
            if (!tag) return;

            return fetch(`http://localhost:8000/assign-tag?contact_id=${previewContactId}&tag_id=${tag.id}`, {
                method: "POST"
            });
        })
    );

    closeTagsPreview();

    // ✅ recargar después de que TODO terminó
    loadContacts();
}