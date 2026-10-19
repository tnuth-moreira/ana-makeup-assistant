const {
  startConversation,
  processMessage,
} = require("../services/chatbotService");

function startChat(req, res) {
  const conversation = startConversation();

  return res.status(200).json(conversation);
}


async function sendMessage(req, res) {
  const { conversationId, message } = req.body;

  if (
    !conversationId ||
    typeof message !== "string" ||
    !message.trim()
  ) {
    return res.status(400).json({
      error: "conversationId e message são obrigatórios.",
    });
  }

  try {
    const response = await processMessage(
      conversationId,
      message
    );

    return res.status(200).json(response);
  } catch (error) {
    if (error.message === "Conversa não encontrada.") {
      return res.status(404).json({
        error: error.message,
      });
    }

    console.error("Erro no atendimento:", error);

    return res.status(500).json({
      error: "Não foi possível processar o atendimento.",
    });
  }
}


module.exports = {
  startChat,
  sendMessage,
};