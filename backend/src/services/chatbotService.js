
const { randomUUID } = require("crypto");
const { createAppointment } = require("./appointmentService");

const conversations = new Map();

const EVENT_OPTIONS = [
  { value: "maquiagem_social", label: "💄 Maquiagem Social" },
  { value: "noiva", label: "👰 Noiva" },
  { value: "debutante", label: "👑 Debutante" },
  { value: "formanda", label: "🎓 Formanda" },
  { value: "curso", label: "📚 Curso" },
  { value: "outros", label: "✨ Outros" },
];

const COURSE_OPTIONS = [
  { value: "automaquiagem", label: "💄 Automaquiagem" },
  { value: "curso_iniciante", label: "📚 Curso Iniciante" },
  { value: "aperfeicoamento", label: "✨ Aperfeiçoamento" },
];

const PEOPLE_OPTIONS = [
  { value: "1", label: "👤 1 pessoa" },
  { value: "2", label: "👥 2 pessoas" },
  { value: "3", label: "👥 3 pessoas" },
  { value: "4_ou_mais", label: "✨ 4 ou mais pessoas" },
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
  const normalizedResponse = resposta.trim().toLowerCase();

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

function parseEventDate(value) {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;

  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day))
  );

  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  // Evita agendamentos com datas anteriores ao dia atual.
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  );

  if (date < today) {
    return null;
  }

  return `${year}-${month}-${day}`;
}

function parseEventTime(value) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/\s/g, "");

  const match = normalized.match(
    /^(\d{1,2})(?:(?::|h)(\d{1,2})?)?$/
  );

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2] || 0);

  if (hours > 23 || minutes > 59) {
    return null;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
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

async function processMessage(conversationId, message) {
  const conversation = conversations.get(conversationId);

  if (!conversation) {
    throw new Error("Conversa não encontrada.");
  }

  if (typeof message !== "string" || !message.trim()) {
    return {
      type: "text",
      message: "Envie uma resposta válida, por favor. 😊",
    };
  }

  const resposta = message.trim();

  switch (conversation.etapa) {
    // 1. NOME
    case "NOME": {
      if (resposta.length < 2 || resposta.length > 100) {
        return {
          type: "text",
          message: "Me diga seu nome, por favor, para continuarmos. 😊",
        };
      }

      conversation.nome = resposta;
      conversation.etapa = "EVENTO";

      return getEventQuestion(conversation.nome);
    }

    // 2. ESCOLHA DO SERVIÇO
    case "EVENTO": {
      const selectedEvent = findOption(EVENT_OPTIONS, resposta);

      if (!selectedEvent) {
        return {
          type: "options",
          message: `Não consegui identificar essa opção. 😊

Escolha um dos serviços abaixo:`,
          options: EVENT_OPTIONS,
        };
      }

      conversation.evento = selectedEvent.value;

      if (selectedEvent.value === "curso") {
        conversation.etapa = "TIPO_CURSO";
        return getCourseQuestion(conversation.nome);
      }

      conversation.etapa = "DATA_EVENTO";

      return getEventDateQuestion();
    }

    // 3A. FLUXO DE CURSO
    case "TIPO_CURSO": {
      const selectedCourse = findOption(COURSE_OPTIONS, resposta);

      if (!selectedCourse) {
        return {
          type: "options",
          message: `Não consegui identificar o curso. 😊

Escolha uma das opções abaixo:`,
          options: COURSE_OPTIONS,
        };
      }

      try {
        await createAppointment({
          nome: conversation.nome,
          evento: "curso",
          tipoCurso: selectedCourse.value,
        });
      } catch (error) {
        console.error("Erro ao salvar atendimento no banco:", error);

        return {
          type: "text",
          message: "Não consegui registrar seu atendimento agora. Por favor, tente novamente em instantes. 💕",
        };
      }

      conversation.tipoCurso = selectedCourse.value;
      conversation.etapa = "FINALIZADO";

      return {
        type: "text",
        message: `Perfeito, ${conversation.nome}! ✨

Seu interesse foi registrado:

📚 Serviço: Curso
${selectedCourse.label}

As datas e os horários disponíveis são definidos pela profissional.

Vou encaminhar seu atendimento para que você receba as próximas opções. 💕`,
      };
    }

    // 3B. DATA DO EVENTO
    case "DATA_EVENTO": {
      const dataConvertida = parseEventDate(resposta);

      if (!dataConvertida) {
        return {
          type: "text",
          message: `Não consegui identificar essa data ou ela já passou. 😊

Digite uma data válida no formato DD/MM/AAAA.

Exemplo: 25/10/2026`,
        };
      }

      conversation.dataEvento = dataConvertida;
      conversation.etapa = "HORARIO_EVENTO";

      return {
        type: "text",
        message: `Ótimo! 💕

E qual será o horário do evento? ⏰

Exemplo: 19h ou 19:30`,
      };
    }

    // 3C. HORÁRIO DO EVENTO
    case "HORARIO_EVENTO": {
      const horarioConvertido = parseEventTime(resposta);

      if (!horarioConvertido) {
        return {
          type: "text",
          message: `Não consegui identificar esse horário. 😊

Digite um horário válido, por exemplo: 19h ou 19:30.`,
        };
      }

      conversation.horarioEvento = horarioConvertido;
      conversation.etapa = "QUANTIDADE";

      return {
        type: "options",
        message: `Só mais uma perguntinha 😊

Para quantas pessoas será a maquiagem?`,
        options: PEOPLE_OPTIONS,
      };
    }

    // 3D. QUANTIDADE E SALVAMENTO DO EVENTO
    case "QUANTIDADE": {
      const selectedQuantity = findOption(PEOPLE_OPTIONS, resposta);

      if (!selectedQuantity) {
        return {
          type: "options",
          message: "Escolha uma das opções abaixo 😊",
          options: PEOPLE_OPTIONS,
        };
      }

      // Para "4 ou mais", armazenamos 4 como quantidade mínima.
      const quantidade =
        selectedQuantity.value === "4_ou_mais"
          ? 4
          : Number(selectedQuantity.value);

      try {
        await createAppointment({
          nome: conversation.nome,
          evento: conversation.evento,
          dataEvento: conversation.dataEvento,
          horarioEvento: conversation.horarioEvento,
          quantidadePessoas: quantidade,
        });
      } catch (error) {
        console.error("Erro ao salvar atendimento no banco:", error);

        return {
          type: "text",
          message: "Não consegui registrar seu atendimento agora. Por favor, tente novamente em instantes. 💕",
        };
      }

      conversation.quantidadePessoas = selectedQuantity.value;
      conversation.etapa = "FINALIZADO";

      const eventoSelecionado = EVENT_OPTIONS.find(
        (option) => option.value === conversation.evento
      );

      const dataFormatada = conversation.dataEvento
        .split("-")
        .reverse()
        .join("/");

      const horarioFormatado = conversation.horarioEvento;

      return {
        type: "text",
        message: `Perfeito, ${conversation.nome}! 💕✨

Recebi todas as informações:

💄 Serviço: ${eventoSelecionado.label}
📅 Data: ${dataFormatada}
⏰ Horário: ${horarioFormatado}
👥 Quantidade: ${selectedQuantity.label}

Seu atendimento foi registrado e vamos encaminhar suas informações para continuarmos o atendimento.`,
      };
    }

    // 4. FINALIZAÇÃO
    case "FINALIZADO":
      return {
        type: "text",
        message: "Seu atendimento inicial já foi concluído. 💕 Em breve continuaremos seu atendimento.",
      };

    default:
      throw new Error("Etapa da conversa inválida.");
  }
}

module.exports = {
  startConversation,
  processMessage,
};
