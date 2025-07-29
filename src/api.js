// API Service untuk Notes App
class NotesAPI {
  constructor() {
    this.baseURL = "https://notes-api.dicoding.dev/v2";
  }

  async fetchWithErrorHandling(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Terjadi kesalahan pada server");
      }

      return data;
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
        );
      }
      throw error;
    }
  }

  // Get all non-archived notes
  async getNotes() {
    return await this.fetchWithErrorHandling(`${this.baseURL}/notes`);
  }

  // Get all archived notes
  async getArchivedNotes() {
    return await this.fetchWithErrorHandling(`${this.baseURL}/notes/archived`);
  }

  // Get single note by ID
  async getNote(id) {
    return await this.fetchWithErrorHandling(`${this.baseURL}/notes/${id}`);
  }

  // Create new note
  async createNote(title, body) {
    return await this.fetchWithErrorHandling(`${this.baseURL}/notes`, {
      method: "POST",
      body: JSON.stringify({
        title: title.trim(),
        body: body.trim(),
      }),
    });
  }

  // Archive note
  async archiveNote(id) {
    return await this.fetchWithErrorHandling(
      `${this.baseURL}/notes/${id}/archive`,
      {
        method: "POST",
      }
    );
  }

  // Unarchive note
  async unarchiveNote(id) {
    return await this.fetchWithErrorHandling(
      `${this.baseURL}/notes/${id}/unarchive`,
      {
        method: "POST",
      }
    );
  }

  // Delete note
  async deleteNote(id) {
    return await this.fetchWithErrorHandling(`${this.baseURL}/notes/${id}`, {
      method: "DELETE",
    });
  }
}

export default NotesAPI;
