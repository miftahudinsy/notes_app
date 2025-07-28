// Web Components untuk Notes App

// 1. App Header Component
class AppHeader extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
            <div class="header-content">
                <h1>📝 Notes App</h1>
                <p>Kelola catatan Anda dengan mudah dan efisien</p>
            </div>
        `;
  }
}

// 2. Note Form Component
class NoteForm extends HTMLElement {
  constructor() {
    super();
    this.titleValid = false;
    this.bodyValid = false;
  }

  connectedCallback() {
    this.innerHTML = `
            <div class="form-container">
                <h3>✍️ Tambah Catatan Baru</h3>
                <form id="note-form">
                    <div class="form-group">
                        <label for="note-title">Judul Catatan:</label>
                        <input type="text" id="note-title" name="title" placeholder="Masukkan judul catatan..." maxlength="50">
                        <div class="error-message" id="title-error">Judul harus diisi (minimal 3 karakter)</div>
                    </div>
                    
                    <div class="form-group">
                        <label for="note-body">Isi Catatan:</label>
                        <textarea id="note-body" name="body" placeholder="Tuliskan isi catatan Anda di sini..." maxlength="500"></textarea>
                        <div class="error-message" id="body-error">Isi catatan harus diisi (minimal 10 karakter)</div>
                    </div>
                    
                    <button type="submit" class="submit-btn" id="submit-btn" disabled>
                        Tambah Catatan
                    </button>
                </form>
            </div>
        `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    const form = this.querySelector("#note-form");
    const titleInput = this.querySelector("#note-title");
    const bodyInput = this.querySelector("#note-body");
    const submitBtn = this.querySelector("#submit-btn");

    // Real-time validation untuk title
    titleInput.addEventListener("input", (e) => {
      this.validateTitle(e.target.value);
      this.updateSubmitButton();
    });

    // Real-time validation untuk body
    bodyInput.addEventListener("input", (e) => {
      this.validateBody(e.target.value);
      this.updateSubmitButton();
    });

    // Handle form submission
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (this.titleValid && this.bodyValid) {
        this.submitNote(titleInput.value, bodyInput.value);
        this.resetForm();
      }
    });
  }

  validateTitle(value) {
    const titleGroup = this.querySelector("#note-title").closest(".form-group");
    const errorMsg = this.querySelector("#title-error");

    if (value.trim().length >= 3) {
      this.titleValid = true;
      titleGroup.classList.remove("error");
      errorMsg.classList.remove("show");
    } else {
      this.titleValid = false;
      titleGroup.classList.add("error");
      errorMsg.classList.add("show");
    }
  }

  validateBody(value) {
    const bodyGroup = this.querySelector("#note-body").closest(".form-group");
    const errorMsg = this.querySelector("#body-error");

    if (value.trim().length >= 10) {
      this.bodyValid = true;
      bodyGroup.classList.remove("error");
      errorMsg.classList.remove("show");
    } else {
      this.bodyValid = false;
      bodyGroup.classList.add("error");
      errorMsg.classList.add("show");
    }
  }

  updateSubmitButton() {
    const submitBtn = this.querySelector("#submit-btn");
    submitBtn.disabled = !(this.titleValid && this.bodyValid);
  }

  submitNote(title, body) {
    const newNote = {
      id: `notes-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
      archived: false,
    };

    // Dispatch custom event untuk menambah note
    const addNoteEvent = new CustomEvent("addNote", {
      detail: { note: newNote },
      bubbles: true,
    });
    this.dispatchEvent(addNoteEvent);
  }

  resetForm() {
    const form = this.querySelector("#note-form");
    form.reset();
    this.titleValid = false;
    this.bodyValid = false;
    this.updateSubmitButton();

    // Reset error states
    this.querySelectorAll(".form-group").forEach((group) => {
      group.classList.remove("error");
    });
    this.querySelectorAll(".error-message").forEach((error) => {
      error.classList.remove("show");
    });
  }
}

// 3. Note Item Component
class NoteItem extends HTMLElement {
  constructor() {
    super();
    this.noteData = null;
  }

  static get observedAttributes() {
    return ["data-note"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "data-note" && newValue) {
      this.noteData = JSON.parse(newValue);
      this.render();
    }
  }

  connectedCallback() {
    if (this.noteData) {
      this.render();
    }
  }

  render() {
    if (!this.noteData) return;

    const formattedDate = this.formatDate(this.noteData.createdAt);

    this.innerHTML = `
            <div class="note-content">
                <h3 class="note-title">${this.escapeHtml(
                  this.noteData.title
                )}</h3>
                <p class="note-body">${this.escapeHtml(this.noteData.body)}</p>
                <div class="note-date">${formattedDate}</div>
            </div>
        `;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("id-ID", options);
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  setNoteData(noteData) {
    this.noteData = noteData;
    this.render();
  }
}

// Register custom elements
customElements.define("app-header", AppHeader);
customElements.define("note-form", NoteForm);
customElements.define("note-item", NoteItem);
