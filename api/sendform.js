export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  // Split the comma-separated chat IDs into an array
  const chatIds = process.env.TELEGRAM_CHAT_IDS
    ? process.env.TELEGRAM_CHAT_IDS.split(',')
    : [];

  if (!botToken || chatIds.length === 0) {
    return res.status(500).json({ error: 'Missing Telegram configuration' });
  }

  try {
    // Send the message to each Chat ID
    const results = await Promise.all(
      chatIds.map(async (chatId) => {
        const response = await fetch(
          `https://telegram.org{botToken}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId.trim(),
              text: message,
              parse_mode: 'HTML',
            }),
          }
        );
        return response.json();
      })
    );

    return res.status(200).json({ ok: true, results });
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
