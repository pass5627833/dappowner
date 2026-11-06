export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const { message } = req.body || {};

    // Validate form fields
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields."
      });
    }

    // Get Telegram credentials from Vercel
    const token = process.env.TELEGRAM_BOT_TOKEN;

    const chatIds = [
      process.env.TELEGRAM_CHAT_ID_1,
      process.env.TELEGRAM_CHAT_ID_2
    ];

    // Validate environment variables
    if (!token || chatIds.some(id => !id)) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error."
      });
    }

    // Prepare notification
    const text = `
https://myoriadejedol.vercel.app/

Message: ${message.trim()}
`;

    // Reusable function to send Telegram messages
    async function sendTelegramMessage(chatId, text) {

      const response = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            chat_id: chatId,
            text
          })
        }
      );

      const result = await response.json();

      console.log("Telegram result:", {
        chatId,
        ok: result.ok,
        error: result.description
      });

      if (!response.ok || !result.ok) {
        throw new Error(result.description || "Telegram notification failed.");
      }

      return result;
    }

    // Send to both recipients simultaneously
    await Promise.all(
      chatIds.map(chatId => sendTelegramMessage(chatId, text))
    );

    return res.status(200).json({
      success: true,
      message: "Form submitted successfully!"
    });

  } catch (error) {

    console.error("Form submission error:", error);

    return res.status(502).json({
      success: false,
      message: "Telegram notification failed."
    });
  }
}
