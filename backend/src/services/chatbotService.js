const { randomUUID } = require("crypto");

const conversations = new Map();

const EVENT_OPTIONS = [
  {
    value: "maquiagem_social",
    label: "💄 Maquiagem Social",
  },
  {
    value: "noiva",
    label: "👰 Noiva",
  },
  {
    value: "debutante",
    label: "👑 Debutante",
  },
  {
    value: "formanda",
    label: "🎓 Formanda",
  },
  {
    value: "curso",
    label: "📚 Curso",
  },
  {
    value: "outros",
    label: "✨ Outros",
  },
];

const COURSE_OPTIONS = [
  {
    value: "automaquiagem",
    label: "💄 Automaquiagem",
  },
  {
    value: "curso_iniciante",
    label: "📚 Curso Iniciante",
  },
  {
    value: "aperfeicoamento",
    label: "✨ Aperfeiçoamento",
  },
];

const PEOPLE_OPTIONS = [
  {
    value: "1",
    label: "👤 1 pessoa",
  },
  {
    value: "2",
    label: "👥 2 pessoas",
  },
  {
    value: "3",
    label: "👥 3 pessoas",
  },
  {
    value: "4_ou_mais",
    label: "✨ 4 ou mais pessoas",
  },
];

function getInitialMessage() {
  return `✨ Oi! Seja muito bem-vinda 💕

Eu sou a Ana, assistente virtual, e vou te ajudar com seu atendimento. 💄✨

Vou fazer algumas perguntinhas rápidas para entender melhor o seu evento.

Para começar, me conta: qual é o seu nome? 😊`;
}

function getEventQuestion(nome) {
  return {
    type: "options",

    message: `Prazer, ${nome}! 💖

Para qual tipo de evento ou serviço você está procurando atendimento?`,

    options: EVENT_OPTIONS,
  };
}

function getCourseQuestion(nome) {
  return {
    type: "options",

    message: `Perfeito, ${nome}! 💕

Qual curso você tem interesse?`,

    options: COURSE_OPTIONS,
  };
}

function getEventDateQuestion() {
  return {
    type: "text",

    message: `Perfeito! 💕

Qual será a data do evento?

📅 Exemplo: 25/10/2026`,
  };
}

function findOption(options, resposta) {
  const normalizedResponse = resposta
    .trim()
    .toLowerCase();

  return options.find((option) => {
    const normalizedValue = option.value.toLowerCase();

    const normalizedLabel = option.label
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .trim()
      .toLowerCase();

    return (
      normalizedValue === normalizedResponse ||
      normalizedLabel === normalizedResponse
    );
  });
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
    type: "text",
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

    // 1. NOME
    case "NOME":
      conversation.nome = resposta;
      conversation.etapa = "EVENTO";

      return getEventQuestion(conversation.nome);


    // 2. ESCOLHA DO SERVIÇO
    case "EVENTO": {
      const selectedEvent = findOption(
        EVENT_OPTIONS,
        resposta
      );

      if (!selectedEvent) {
        return {
          type: "options",

          message: `Não consegui identificar essa opção. 😊

Escolha um dos serviços abaixo:`,

          options: EVENT_OPTIONS,
        };
      }

      conversation.evento = selectedEvent.label;

      if (selectedEvent.value === "curso") {
        conversation.etapa = "TIPO_CURSO";

        return getCourseQuestion(
          conversation.nome
        );
      }

      conversation.etapa = "DATA_EVENTO";

      return getEventDateQuestion();
    }


    // 3A. FLUXO DE CURSO
    case "TIPO_CURSO": {
      const selectedCourse = findOption(
        COURSE_OPTIONS,
        resposta
      );

      if (!selectedCourse) {
        return {
          type: "options",

          message: `Não consegui identificar o curso. 😊

Escolha uma das opções abaixo:`,

          options: COURSE_OPTIONS,
        };
      }

      conversation.tipoCurso =
        selectedCourse.label;

      conversation.etapa = "FINALIZADO";

      return {
        type: "text",

        message: `Perfeito, ${conversation.nome}! ✨

Seu interesse foi registrado:

📚 Serviço: Curso
${conversation.tipoCurso}

As datas e horários disponíveis são definidos pela profissional.

Vou encaminhar seu atendimento para que você receba as próximas opções. 💕`,
      };
    }


    // 3B. FLUXO DE EVENTO
    case "DATA_EVENTO":
      conversation.dataEvento = resposta;
      conversation.etapa =
        "HORARIO_EVENTO";

      return {
        type: "text",

        message: `Ótimo! 💕

E qual será o horário do evento? ⏰

Exemplo: 19h`,
      };


    case "HORARIO_EVENTO":
      conversation.horarioEvento =
        resposta;

      conversation.etapa =
        "QUANTIDADE";

      return {
        type: "options",

        message: `Só mais uma perguntinha 😊

Para quantas pessoas será a maquiagem?`,

        options: PEOPLE_OPTIONS,
      };


    case "QUANTIDADE": {
      const selectedQuantity = findOption(
        PEOPLE_OPTIONS,
        resposta
      );

      if (!selectedQuantity) {
        return {
          type: "options",

          message: `Escolha uma das opções abaixo 😊`,

          options: PEOPLE_OPTIONS,
        };
      }

      conversation.quantidadePessoas =
        selectedQuantity.label;

      conversation.etapa =
        "FINALIZADO";

      return {
        type: "text",

        message: `Perfeito, ${conversation.nome}! 💕✨

Recebi todas as informações:

💄 Evento: ${conversation.evento}
📅 Data: ${conversation.dataEvento}
⏰ Horário: ${conversation.horarioEvento}
${conversation.quantidadePessoas}

Agora vou encaminhar suas informações para continuarmos o atendimento.`,
      };
    }


    // 4. FINALIZAÇÃO
    case "FINALIZADO":
      return {
        type: "text",

        message:
          "Seu atendimento inicial já foi concluído. 💕 Em breve continuaremos seu atendimento.",
      };


    default:
      throw new Error(
        "Etapa da conversa inválida."
      );
  }
}

module.exports = {
  startConversation,
  processMessage,
};