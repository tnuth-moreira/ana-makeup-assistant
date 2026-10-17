const {
  startConversation,
  processMessage,
} = require("../services/chatbotService");

function startChat(req, res) {
  const conversation = startConversation();

  return res.status(200).json(conversation);
}

function sendMessage(req, res) {
  const { conversationId, message } = req.body;

  if (!conversationId || !message) {
    return res.status(400).json({
      error: "conversationId e message são obrigatórios.",
    });
  }

  try {
    const response = processMessage(conversationId, message);

    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      error: error.message,
    });
  }
}

module.exports = {
  startChat,
  sendMessage,
};