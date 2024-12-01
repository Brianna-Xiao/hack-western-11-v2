// Select chatbox elements
const chatbox = document.getElementById("chatbox");
const promptInput = document.getElementById("prompt");
const sendButton = document.getElementById("send");

// Add event listener for the send button
sendButton.addEventListener("click", async () => {
    const userMessage = promptInput.value.trim(); // Get and trim input value

    if (!userMessage) return; // Do nothing if the input is empty

    // Display user message in the chatbox
    displayMessage(userMessage, "user");

    // Clear the input field
    promptInput.value = ""; // Clear the input bar

    // Fetch chatbot response from the backend
    const botResponse = await fetchChatGPTResponse(userMessage);

    // Display bot response in the chatbox
    displayMessage(botResponse, "bot");
});

// Function to display messages in the chatbox
function displayMessage(message, sender) {
    const messageElement = document.createElement("div");
    messageElement.className = sender === "user" ? "text-blue-600 mb-2" : "text-green-600 mb-2";
    messageElement.textContent = `${sender === "user" ? "You" : "Bot"}: ${message}`;
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight; // Auto-scroll to the latest message
}

// Function to fetch chatbot response from the backend
async function fetchChatGPTResponse(prompt) {
    try {
        const response = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.reply;
    } catch (error) {
        console.error("Error fetching response:", error);
        return "Sorry, something went wrong.";
    }
}
