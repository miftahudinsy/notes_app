// Web Components untuk Notes App dengan API Integration
import Swal from "sweetalert2";

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
    this.isSubmitting = false;
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
            <span class="btn-text">Tambah Catatan</span>
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
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (this.titleValid && this.bodyValid && !this.isSubmitting) {
        await this.submitNote(titleInput.value, bodyInput.value);
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
    submitBtn.disabled =
      !(this.titleValid && this.bodyValid) || this.isSubmitting;
  }

  setSubmittingState(isSubmitting) {
    this.isSubmitting = isSubmitting;
    const submitBtn = this.querySelector("#submit-btn");
    const btnText = submitBtn.querySelector(".btn-text");

    if (isSubmitting) {
      submitBtn.classList.add("btn-loading");
      btnText.textContent = "Menyimpan...";
    } else {
      submitBtn.classList.remove("btn-loading");
      btnText.textContent = "Tambah Catatan";
    }

    this.updateSubmitButton();
  }

  async submitNote(title, body) {
    this.setSubmittingState(true);

    try {
      // Dispatch custom event untuk menambah note
      const addNoteEvent = new CustomEvent("addNote", {
        detail: { title: title.trim(), body: body.trim() },
        bubbles: true,
      });
      this.dispatchEvent(addNoteEvent);
    } catch (error) {
      console.error("Error in submitNote:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: "Terjadi kesalahan saat menyimpan catatan.",
        confirmButtonColor: "#667eea",
      });
    } finally {
      this.setSubmittingState(false);
    }
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
    const isArchived = this.noteData.archived;

    this.innerHTML = `
      <div class="note-content">
        <div class="note-actions">
          ${
            isArchived
              ? `<button class="action-btn unarchive-btn" title="Keluarkan dari Arsip" data-action="unarchive">
                 📤
               </button>`
              : `<button class="action-btn archive-btn" title="Arsipkan" data-action="archive">
                 📦
               </button>`
          }
          <button class="action-btn delete-btn" title="Hapus" data-action="delete">
            🗑️
          </button>
        </div>
        <h3 class="note-title">${this.escapeHtml(this.noteData.title)}</h3>
        <p class="note-body">${this.escapeHtml(this.noteData.body)}</p>
        <div class="note-date">${formattedDate}</div>
      </div>
    `;

    this.setupActionListeners();
  }

  setupActionListeners() {
    const actionButtons = this.querySelectorAll(".action-btn");
    actionButtons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        e.stopPropagation();
        const action = button.dataset.action;

        // Show loading state
        button.classList.add("btn-loading");
        button.disabled = true;

        try {
          if (action === "delete") {
            await this.handleDelete();
          } else if (action === "archive") {
            await this.handleArchive();
          } else if (action === "unarchive") {
            await this.handleUnarchive();
          }
        } catch (error) {
          console.error(`Error performing ${action}:`, error);
        } finally {
          // Remove loading state
          button.classList.remove("btn-loading");
          button.disabled = false;
        }
      });
    });
  }

  async handleDelete() {
    const result = await Swal.fire({
      title: "Hapus Catatan?",
      text: "Catatan yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      // Dispatch delete event
      const deleteEvent = new CustomEvent("deleteNote", {
        detail: { noteId: this.noteData.id },
        bubbles: true,
      });
      this.dispatchEvent(deleteEvent);
    }
  }

  async handleArchive() {
    // Dispatch archive event
    const archiveEvent = new CustomEvent("archiveNote", {
      detail: { noteId: this.noteData.id },
      bubbles: true,
    });
    this.dispatchEvent(archiveEvent);
  }

  async handleUnarchive() {
    // Dispatch unarchive event
    const unarchiveEvent = new CustomEvent("unarchiveNote", {
      detail: { noteId: this.noteData.id },
      bubbles: true,
    });
    this.dispatchEvent(unarchiveEvent);
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

// 4. Tab Navigation Component
class TabNavigation extends HTMLElement {
  constructor() {
    super();
    this.activeTab = "active";
  }

  connectedCallback() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for tab clicks
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("tab-button")) {
        const tab = e.target.dataset.tab;
        this.switchTab(tab);
      }
    });
  }

  switchTab(tab) {
    this.activeTab = tab;

    // Update tab buttons
    document.querySelectorAll(".tab-button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tab);
    });

    // Update tab content
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.toggle("hidden", content.id !== `${tab}-notes`);
    });

    // Dispatch tab change event
    const tabChangeEvent = new CustomEvent("tabChange", {
      detail: { activeTab: tab },
      bubbles: true,
    });
    this.dispatchEvent(tabChangeEvent);
  }

  getActiveTab() {
    return this.activeTab;
  }
}

// Register custom elements
customElements.define("app-header", AppHeader);
customElements.define("note-form", NoteForm);
customElements.define("note-item", NoteItem);
customElements.define("tab-navigation", TabNavigation);
