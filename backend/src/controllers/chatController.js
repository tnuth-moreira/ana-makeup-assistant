const { getInitialMessage } = require("../services/chatbotService");

function startChat(req, res) {
    return res.status(200).json({
        message: getInitialMessage(),
    });
}

module.exports = {
    startChat,
};      