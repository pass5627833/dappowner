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
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields."
      });
    }

    // Get Telegram credentials from Vercel
    const token = process.env.TELEGRAM_BOT_TOKEN;

    const chatIds = [
      {
        name: "Chat ID 2",
        id: process.env.TELEGRAM_CHAT_ID_2
      },
      {
        name: "Chat ID 1",
        id: process.env.TELEGRAM_CHAT_ID_1
      }
    ];

    // Validate environment variables
    if (!token || chatIds.some(chat => !chat.id)) {
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

    // Reusable Telegram sending function
    async function sendTelegramMessage(chat) {

      try {

        const response = await fetch(
          `https://api.telegram.org/bot${token}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              chat_id: chat.id,
              text
            })
          }
        );

        const result = await response.json();

        const success = response.ok && result.ok === true;

        console.log("Telegram delivery report:", {
          recipient: chat.name,
          success,
          httpStatus: response.status,
          error: result.description || null
        });

        return {
          recipient: chat.name,
          success,
          error: success ? null : result.description || "Telegram request failed."
        };

      } catch (error) {

        console.error(`${chat.name} sending error:`, error.message);

        return {
          recipient: chat.name,
          success: false,
          error: error.message
        };
      }
    }

    // Send to both recipients simultaneously
    const results = await Promise.all(
      chatIds.map(chat => sendTelegramMessage(chat))
    );

    // Check delivery results
    const failed = results.filter(result => !result.success);

    if (failed.length > 0) {

      console.error("Failed Telegram recipients:", failed);

      return res.status(502).json({
        success: false,
        message: "Some Telegram notifications failed.",
        failedRecipients: failed.map(item => ({
          recipient: item.recipient,
          error: item.error
        }))
      });
    }

    // Both recipients received the message
    return res.status(200).json({
      success: true,
      message: "Form submitted successfully!"
    });

  } catch (error) {

    console.error("Form submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong."
    });
  }
}
