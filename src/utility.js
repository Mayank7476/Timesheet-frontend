export const autoAlert = (message, type = "success") => {
  let container = document.getElementById("auto-alert-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "auto-alert-container";
    container.style.position = "fixed";
    container.style.top = "20px";
    container.style.right = "20px";
    container.style.zIndex = "9999999";
    document.body.appendChild(container);
  }

  // ❗ Remove any existing alerts so only latest remains
  container.innerHTML = "";

  const alertDiv = document.createElement("div");
  alertDiv.innerText = message;

  alertDiv.style.padding = "10px 20px";
  alertDiv.style.color = "white";
  alertDiv.style.borderRadius = "6px";
  alertDiv.style.fontSize = "14px";
  alertDiv.style.minWidth = "200px";
  alertDiv.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
  alertDiv.style.opacity = "0";
  alertDiv.style.transform = "translateX(20px)";
  alertDiv.style.transition = "all 0.4s ease";

  alertDiv.style.backgroundColor =
    type === "error" ? "#f44336" : "#4CAF50";

  container.appendChild(alertDiv);

  // Animate in
  setTimeout(() => {
    alertDiv.style.opacity = "1";
    alertDiv.style.transform = "translateX(0)";
  }, 10);

  // Auto remove
  setTimeout(() => {
    alertDiv.style.opacity = "0";
    alertDiv.style.transform = "translateX(20px)";

    setTimeout(() => {
      if (container.contains(alertDiv)) {
        container.removeChild(alertDiv);
      }

      if (container.children.length === 0) {
        document.body.removeChild(container);
      }
    }, 400);
  }, 3000);
};