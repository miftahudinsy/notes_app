// Entry point untuk Notes App
import "./style.css";
import "./components.js";
import NotesApp from "./app.js";

// Initialize the app
const app = new NotesApp();

// Initialize tab navigation component
const tabNav = document.createElement("tab-navigation");
document.body.appendChild(tabNav);

// Export for potential module usage
export default app;
