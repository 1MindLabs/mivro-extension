import { marked } from "../lib/marked.esm.js";
import { deleteMessage, copyMessage } from "./crud.js";

export async function getSavoraResponse(userMessage, uploadedFile) {
  console.log(`User message is: ${userMessage}`);
  console.log("Uploaded file:", uploadedFile);

  const apiUrl = "http://127.0.0.1:5000/api/v1/ai/savora";

  try {
    const headers = {
      "Mivro-Email": "admin@mivro.org",
      "Mivro-Password": "admin@123",
    };

    let response;
    if (uploadedFile) {
      const formData = new FormData();
      formData.append("media", uploadedFile);
      formData.append("message", userMessage);
      formData.append("type", "media");

      response = await fetch(apiUrl, {
        headers,
        method: "POST",
        body: formData,
      });
    } else {
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "text",
          message: userMessage,
        }),
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return marked.parse(data.response);
  } catch (error) {
    console.error("Error fetching Savora response:", error);
    return "Sorry, I am unable to respond at the moment.";
  }
}

export function renderMessage(content, parent, isUser = true) {
  if (!parent || !(parent instanceof HTMLElement)) {
    throw new Error("Invalid parent element");
  }

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", isUser ? "message-user" : "message-bot");
  messageDiv.innerHTML = content;

  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container", isUser ? "user" : "bot");

  if (isUser) {
    const editButton = createIconButton("edit", "./assets/oth-icons/edit.png");
    const deleteButton = createIconButton("delete", "./assets/oth-icons/delete.png", () => deleteMessage(messageContainer));
    const copyButton = createIconButton("copy", "./assets/oth-icons/copy.png", () => copyMessage(messageContainer));

    const crudIconDiv = document.createElement("div");
    crudIconDiv.classList.add("crud-icon-div", "hidden");
    crudIconDiv.append(copyButton, deleteButton, editButton);

    messageContainer.appendChild(crudIconDiv);
    messageContainer.addEventListener("mouseover", () => crudIconDiv.classList.remove("hidden"));
    messageContainer.addEventListener("mouseout", () => crudIconDiv.classList.add("hidden"));
  }

  messageContainer.appendChild(messageDiv);
  parent.appendChild(messageContainer);
  parent.scrollTop = parent.scrollHeight;

  return messageDiv;
}

function createIconButton(className, src, onClick) {
  const button = document.createElement("img");
  button.classList.add(`${className}-button`, "img-button");
  button.src = chrome.runtime.getURL(src);
  if (onClick) button.addEventListener("click", onClick);
  return button;
}

export async function sendHandler(inputElement, chatDiv, uploadedFile) {
  const message = inputElement.value.trim();
  console.log(`Message to send: ${message}`);

  if (!message) {
    console.log("No message to send");
    return false;
  }

  inputElement.value = "";
  renderMessage(uploadedFile ? `<span class="file-name">${uploadedFile.name}</span><br>${message}` : message, chatDiv);

  try {
    const response = await getSavoraResponse(message, uploadedFile);
    renderMessage(response, chatDiv, false);
    uploadedFile = null;
    return true;
  } catch (error) {
    console.error("Error getting Savora response:", error);
    return false;
  }
}
