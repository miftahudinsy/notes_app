// Loading Service untuk menampilkan indikator loading
class LoadingService {
  constructor() {
    this.loadingOverlay = null;
    this.createLoadingOverlay();
  }

  createLoadingOverlay() {
    // Create loading overlay element
    this.loadingOverlay = document.createElement("div");
    this.loadingOverlay.className = "loading-overlay";
    this.loadingOverlay.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Memuat...</p>
      </div>
    `;

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(2px);
      }

      .loading-overlay.show {
        display: flex;
      }

      .loading-spinner {
        background: white;
        padding: 30px;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }

      .loading-spinner p {
        margin: 15px 0 0 0;
        color: #333;
        font-weight: 600;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #4CAF50;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .btn-loading {
        position: relative;
        pointer-events: none;
        opacity: 0.7;
      }

      .btn-loading::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        margin: auto;
        border: 2px solid #ffffff;
        border-top: 2px solid transparent;
        border-radius: 50%;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        animation: spin 0.8s linear infinite;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(this.loadingOverlay);
  }

  show(message = "Memuat...") {
    const messageElement = this.loadingOverlay.querySelector("p");
    messageElement.textContent = message;
    this.loadingOverlay.classList.add("show");
  }

  hide() {
    this.loadingOverlay.classList.remove("show");
  }

  showButtonLoading(button) {
    button.classList.add("btn-loading");
    button.disabled = true;
  }

  hideButtonLoading(button) {
    button.classList.remove("btn-loading");
    button.disabled = false;
  }
}

export default LoadingService;
