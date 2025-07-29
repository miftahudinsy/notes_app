// Main App Logic untuk Notes App dengan API Integration
import NotesAPI from "./api.js";
import LoadingService from "./loading.js";
import Swal from "sweetalert2";

class NotesApp {
  constructor() {
    this.api = new NotesAPI();
    this.loading = new LoadingService();
    this.notes = [];
    this.archivedNotes = [];
    this.notesContainer = null;
    this.archivedContainer = null;
    this.tabNavigation = null;
    this.init();
  }

  init() {
    // Wait for DOM to be fully loaded
    document.addEventListener("DOMContentLoaded", () => {
      this.notesContainer = document.getElementById("notes-container");
      this.archivedContainer = document.getElementById("archived-container");
      this.tabNavigation =
        document.querySelector("tab-navigation") ||
        new (customElements.get("tab-navigation"))();

      this.setupEventListeners();
      this.loadInitialData();
    });
  }

  setupEventListeners() {
    // Listen for addNote event from note-form component
    document.addEventListener("addNote", async (event) => {
      const { title, body } = event.detail;
      await this.addNote(title, body);
    });

    // Listen for deleteNote event from note-item component
    document.addEventListener("deleteNote", async (event) => {
      const { noteId } = event.detail;
      await this.deleteNote(noteId);
    });

    // Listen for archiveNote event from note-item component
    document.addEventListener("archiveNote", async (event) => {
      const { noteId } = event.detail;
      await this.archiveNote(noteId);
    });

    // Listen for unarchiveNote event from note-item component
    document.addEventListener("unarchiveNote", async (event) => {
      const { noteId } = event.detail;
      await this.unarchiveNote(noteId);
    });

    // Listen for tab change events
    document.addEventListener("tabChange", (event) => {
      // Tab change handled by CSS classes, no additional logic needed
    });
  }

  async loadInitialData() {
    this.loading.show("Memuat catatan...");

    try {
      // Load both active and archived notes
      await Promise.all([this.loadNotes(), this.loadArchivedNotes()]);
    } catch (error) {
      console.error("Error loading initial data:", error);
      this.showErrorAlert("Gagal memuat data", error.message);
    } finally {
      this.loading.hide();
    }
  }

  async loadNotes() {
    try {
      const response = await this.api.getNotes();
      this.notes = response.data || [];
      this.renderNotes();
    } catch (error) {
      console.error("Error loading notes:", error);
      throw error;
    }
  }

  async loadArchivedNotes() {
    try {
      const response = await this.api.getArchivedNotes();
      this.archivedNotes = response.data || [];
      this.renderArchivedNotes();
    } catch (error) {
      console.error("Error loading archived notes:", error);
      throw error;
    }
  }

  async addNote(title, body) {
    const formComponent = document.querySelector("note-form");

    try {
      const response = await this.api.createNote(title, body);

      if (response.status === "success") {
        // Add new note to the beginning of the array
        this.notes.unshift(response.data);
        this.renderNotes();

        // Reset form
        if (formComponent) {
          formComponent.resetForm();
        }

        // Show success message
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Catatan berhasil ditambahkan.",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    } catch (error) {
      console.error("Error adding note:", error);
      this.showErrorAlert("Gagal menambahkan catatan", error.message);
    }
  }

  async deleteNote(noteId) {
    try {
      const response = await this.api.deleteNote(noteId);

      if (response.status === "success") {
        // Remove from both arrays
        this.notes = this.notes.filter((note) => note.id !== noteId);
        this.archivedNotes = this.archivedNotes.filter(
          (note) => note.id !== noteId
        );

        // Re-render both containers
        this.renderNotes();
        this.renderArchivedNotes();

        // Show success message
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Catatan telah dihapus.",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      this.showErrorAlert("Gagal menghapus catatan", error.message);
    }
  }

  async archiveNote(noteId) {
    try {
      const response = await this.api.archiveNote(noteId);

      if (response.status === "success") {
        // Move note from active to archived
        const noteIndex = this.notes.findIndex((note) => note.id === noteId);
        if (noteIndex > -1) {
          const archivedNote = { ...this.notes[noteIndex], archived: true };
          this.notes.splice(noteIndex, 1);
          this.archivedNotes.unshift(archivedNote);

          // Re-render both containers
          this.renderNotes();
          this.renderArchivedNotes();

          // Show success message
          Swal.fire({
            icon: "success",
            title: "Diarsipkan!",
            text: "Catatan telah diarsipkan.",
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
          });
        }
      }
    } catch (error) {
      console.error("Error archiving note:", error);
      this.showErrorAlert("Gagal mengarsipkan catatan", error.message);
    }
  }

  async unarchiveNote(noteId) {
    try {
      const response = await this.api.unarchiveNote(noteId);

      if (response.status === "success") {
        // Move note from archived to active
        const noteIndex = this.archivedNotes.findIndex(
          (note) => note.id === noteId
        );
        if (noteIndex > -1) {
          const activeNote = {
            ...this.archivedNotes[noteIndex],
            archived: false,
          };
          this.archivedNotes.splice(noteIndex, 1);
          this.notes.unshift(activeNote);

          // Re-render both containers
          this.renderNotes();
          this.renderArchivedNotes();

          // Show success message
          Swal.fire({
            icon: "success",
            title: "Dipulihkan!",
            text: "Catatan telah dipulihkan dari arsip.",
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
          });
        }
      }
    } catch (error) {
      console.error("Error unarchiving note:", error);
      this.showErrorAlert("Gagal memulihkan catatan", error.message);
    }
  }

  renderNotes() {
    if (!this.notesContainer) return;

    // Clear container
    this.notesContainer.innerHTML = "";

    if (this.notes.length === 0) {
      this.renderEmptyState(
        this.notesContainer,
        "📝 Belum ada catatan aktif",
        "Mulai dengan menambahkan catatan pertama Anda!"
      );
      return;
    }

    // Sort notes by creation date (newest first)
    const sortedNotes = [...this.notes].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Create and append note items
    sortedNotes.forEach((note) => {
      this.createNoteElement(note, this.notesContainer);
    });
  }

  renderArchivedNotes() {
    if (!this.archivedContainer) return;

    // Clear container
    this.archivedContainer.innerHTML = "";

    if (this.archivedNotes.length === 0) {
      this.renderEmptyState(
        this.archivedContainer,
        "📦 Belum ada catatan diarsipkan",
        "Catatan yang diarsipkan akan muncul di sini."
      );
      return;
    }

    // Sort archived notes by creation date (newest first)
    const sortedNotes = [...this.archivedNotes].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Create and append note items
    sortedNotes.forEach((note) => {
      this.createNoteElement(note, this.archivedContainer);
    });
  }

  createNoteElement(noteData, container) {
    const noteItem = document.createElement("note-item");

    // Set note data
    noteItem.setNoteData(noteData);

    // Add animation class for new notes
    noteItem.classList.add("note-animate");

    container.appendChild(noteItem);
  }

  renderEmptyState(container, title, description) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
    `;
  }

  showErrorAlert(title, message) {
    Swal.fire({
      icon: "error",
      title: title,
      text: message,
      confirmButtonColor: "#667eea",
      confirmButtonText: "Tutup",
    });
  }

  // Utility methods for potential future use
  getAllNotes() {
    return this.notes;
  }

  getAllArchivedNotes() {
    return this.archivedNotes;
  }

  getNotesCount() {
    return {
      active: this.notes.length,
      archived: this.archivedNotes.length,
      total: this.notes.length + this.archivedNotes.length,
    };
  }

  searchNotes(query) {
    const searchInNotes = (notes) =>
      notes.filter(
        (note) =>
          note.title.toLowerCase().includes(query.toLowerCase()) ||
          note.body.toLowerCase().includes(query.toLowerCase())
      );

    return {
      active: searchInNotes(this.notes),
      archived: searchInNotes(this.archivedNotes),
    };
  }
}

export default NotesApp;
