const userId = crypto.randomUUID(); // уникальный ID для пользователя

async function sendMessage() {
  const msg = document.getElementById('message').value.trim();
  if (!msg) return alert('Please enter a message.');

  const responseBox = document.getElementById('response');
  responseBox.textContent = 'Thinking...';

  try {
    const res = await fetch('http://localhost:4000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({ message: msg })
    });

    const data = await res.json();
    if (!res.ok) {
      responseBox.textContent = `Error: ${data.error}`;
      return;
    }

    responseBox.textContent = `AI: ${data.reply}\n\nCredits left: ${data.credits}`;
  } catch (err) {
    responseBox.textContent = 'Server error. Try again later.';
    console.error(err);
  }
}
