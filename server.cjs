const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const users = {};

app.post('/api/chat', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'No user ID' });

    if (!users[userId]) users[userId] = { credits: 3 };

    if (users[userId].credits <= 0) {
      return res.status(402).json({ error: 'No credits left, please buy more' });
    }

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'No message' });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: message }],
    });

    users[userId].credits--;

    res.json({
      reply: completion.choices[0].message.content,
      credits: users[userId].credits,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'OpenAI API error' });
  }
});

app.post('/api/pay', (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || !amount) return res.status(400).json({ error: 'Missing parameters' });

  if (!users[userId]) users[userId] = { credits: 0 };
  users[userId].credits += amount;

  res.json({ success: true, credits: users[userId].credits });
});

const PORT = process.env.PORT || 4000;
app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
