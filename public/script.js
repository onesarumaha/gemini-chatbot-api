const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const sendButton = form.querySelector('button[type="submit"]');
const conversation = [];

chatBox.addEventListener('click', function (event) {
  const promptButton = event.target.closest('button[data-prompt]');
  if (!promptButton) return;

  input.value = promptButton.dataset.prompt;
  form.requestSubmit();
});

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  conversation.push({ role: 'user', text: userMessage });
  input.value = '';

  const thinkingMessage = appendMessage('bot', 'Thinking...');
  input.disabled = true;
  sendButton.disabled = true;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation })
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (typeof data.result !== 'string' || !data.result.trim()) {
      thinkingMessage.textContent = 'Sorry, no response received.';
      return;
    }

    thinkingMessage.textContent = data.result;
    conversation.push({ role: 'model', text: data.result });
  } catch (error) {
    console.error('Failed to get response from server:', error);
    thinkingMessage.textContent = 'Failed to get response from server.';
  } finally {
    input.disabled = false;
    sendButton.disabled = false;
    input.focus();
  }
});

function appendMessage(sender, text) {
  const emptyState = chatBox.querySelector('.empty-state');
  if (emptyState) emptyState.remove();

  const message = document.createElement('div');
  message.classList.add('message', sender);
  message.textContent = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
  return message;
}
