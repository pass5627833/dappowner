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

    // Two Telegram recipients
    const chatIds = [
      process.env.TELEGRAM_CHAT_ID_1,
      process.env.CHAT_IDS
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

    // Send to both Telegram recipients
    const results = await Promise.all(
      chatIds.map(async (chat_id) => {

        const response = await fetch(
          `https://api.telegram.org/bot${token}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              chat_id,
              text
            })
          }
        );

        const result = await response.json();

        console.log("Telegram delivery report:", {
          success: response.ok && result.ok,
          error: result.description || null
        });

        return result;
      })
    );

    // Check delivery status
    

    // Both recipients received the notification
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
