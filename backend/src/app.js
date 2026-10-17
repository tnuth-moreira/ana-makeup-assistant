const express = require("express");
const cors = require("cors");
const chatRoutes = require("./routes/chatRoutes");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/chat", chatRoutes);

app.get("/", (req, res) => {
  return res.json({
    message: "Ana Makeup Assistant API 💄",
    status: "online",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

