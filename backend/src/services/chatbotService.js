const { randomUUID } = require("crypto");

const conversations = new Map();

function getInitialMessage() {
  return `✨ Oi! Seja muito bem-vinda 💕

Eu sou a Ana, assistente virtual, e vou te ajudar com seu atendimento. 💄✨

Vou fazer algumas perguntinhas rápidas para entender melhor o seu evento.

Para começar, me conta: qual é o seu nome? 😊`;
}

function startConversation() {
  const conversationId = randomUUID();

  conversations.set(conversationId, {
    nome: null,
    evento: null,
    tipoCurso: null,
    dataEvento: null,
    horarioEvento: null,
    quantidadePessoas: null,
    etapa: "NOME",
  });

  return {
    conversationId,
    message: getInitialMessage(),
  };
}

function processMessage(conversationId, message) {
  const conversation = conversations.get(conversationId);

  if (!conversation) {
    throw new Error("Conversa não encontrada.");
  }

  const resposta = message.trim();

  switch (conversation.etapa) {
    case "NOME":
      conversation.nome = resposta;
      conversation.etapa = "EVENTO";

      return {
        message: `Prazer, ${conversation.nome}! 💖

Para qual tipo de evento ou serviço você está procurando atendimento?

💄 Maquiagem Social
👰 Noiva
👑 Debutante
🎓 Formanda
📚 Curso
✨ Outros`,
      };

    case "EVENTO":
      conversation.evento = resposta;

      if (resposta.toLowerCase() === "curso") {
        conversation.etapa = "TIPO_CURSO";

        return {
          message: `Perfeito, ${conversation.nome}! 💕

Qual curso você tem interesse?

💄 Automaquiagem
📚 Curso Iniciante
✨ Aperfeiçoamento`,
        };
      }

      conversation.etapa = "DATA_EVENTO";

      return {
        message: `Perfeito! 💕

Qual será a data do evento?

📅 Exemplo: 25/10/2026`,
      };

    case "TIPO_CURSO":
      conversation.tipoCurso = resposta;
      conversation.etapa = "FINALIZADO";

      return {
        message: `Perfeito, ${conversation.nome}! ✨

Seu interesse foi registrado:

📚 Serviço: Curso
💄 Curso: ${conversation.tipoCurso}

As datas e horários disponíveis são definidos pela profissional.

Vou encaminhar seu atendimento para que você receba as próximas opções. 💕`,
      };

    case "DATA_EVENTO":
      conversation.dataEvento = resposta;
      conversation.etapa = "HORARIO_EVENTO";

      return {
        message: `Ótimo! 💕

E qual será o horário do evento? ⏰

Exemplo: 19h`,
      };

    case "HORARIO_EVENTO":
      conversation.horarioEvento = resposta;
      conversation.etapa = "QUANTIDADE";

      return {
        message: `Só mais uma perguntinha 😊

Para quantas pessoas será a maquiagem?

👤 1 pessoa
👥 2 pessoas
👥 3 pessoas
✨ 4 ou mais pessoas`,
      };

    case "QUANTIDADE":
      conversation.quantidadePessoas = resposta;
      conversation.etapa = "FINALIZADO";

      return {
        message: `Perfeito, ${conversation.nome}! 💕✨

Recebi todas as informações:

💄 Evento: ${conversation.evento}
📅 Data: ${conversation.dataEvento}
⏰ Horário: ${conversation.horarioEvento}
👥 Pessoas: ${conversation.quantidadePessoas}

Agora vou encaminhar suas informações para continuarmos o atendimento.`,
      };

    case "FINALIZADO":
      return {
        message:
          "Seu atendimento inicial já foi concluído. 💕 Em breve continuaremos seu atendimento.",
      };

    default:
      throw new Error("Etapa da conversa inválida.");
  }
}

module.exports = {
  startConversation,
  processMessage,
};