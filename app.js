// Main App Logic untuk Notes App
class NotesApp {
  constructor() {
    this.notes = [];
    this.notesContainer = null;
    this.init();
  }

  init() {
    // Wait for DOM to be fully loaded
    document.addEventListener("DOMContentLoaded", () => {
      this.notesContainer = document.getElementById("notes-container");
      this.loadInitialNotes();
      this.setupEventListeners();
      this.renderNotes();
    });
  }

  loadInitialNotes() {
    // Load notes from notes.js (global variable)
    if (typeof notesData !== "undefined") {
      this.notes = [...notesData];
    }
  }

  setupEventListeners() {
    // Listen for addNote event from note-form component
    document.addEventListener("addNote", (event) => {
      this.addNote(event.detail.note);
    });
  }

  addNote(newNote) {
    // Add note to the beginning of the array (most recent first)
    this.notes.unshift(newNote);
    this.renderNotes();

    // Show success feedback (optional enhancement)
    this.showNotification("Catatan berhasil ditambahkan!");
  }

  renderNotes() {
    if (!this.notesContainer) return;

    // Clear container
    this.notesContainer.innerHTML = "";

    if (this.notes.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Sort notes by creation date (newest first)
    const sortedNotes = this.notes.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Create and append note items
    sortedNotes.forEach((note, index) => {
      this.createNoteElement(note, index);
    });
  }

  createNoteElement(noteData, index) {
    const noteItem = document.createElement("note-item");

    // Set note data
    noteItem.setNoteData(noteData);

    // Add animation class for new notes
    if (index === 0 && this.notes.length > (notesData ? notesData.length : 0)) {
      noteItem.classList.add("note-animate");
    }

    // Add click event for note interaction (optional enhancement)
    noteItem.addEventListener("click", () => {
      this.handleNoteClick(noteData);
    });

    this.notesContainer.appendChild(noteItem);
  }

  renderEmptyState() {
    this.notesContainer.innerHTML = `
            <div class="empty-state">
                <h3>📝 Belum ada catatan</h3>
                <p>Mulai dengan menambahkan catatan pertama Anda!</p>
            </div>
        `;
  }

  handleNoteClick(noteData) {
    // Optional: Show note detail or edit functionality
    console.log("Note clicked:", noteData);
    // You could implement a modal or edit functionality here
  }

  showNotification(message) {
    // Create and show notification
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;

    // Add notification styles
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
        `;

    // Add animation keyframes if not already added
    if (!document.querySelector("#notification-styles")) {
      const style = document.createElement("style");
      style.id = "notification-styles";
      style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-out";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Method to get all notes (for potential future use)
  getAllNotes() {
    return this.notes;
  }

  // Method to get notes count
  getNotesCount() {
    return this.notes.length;
  }

  // Method to search notes (for potential future enhancement)
  searchNotes(query) {
    return this.notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.body.toLowerCase().includes(query.toLowerCase())
    );
  }
}

// Initialize the app
const app = new NotesApp();
