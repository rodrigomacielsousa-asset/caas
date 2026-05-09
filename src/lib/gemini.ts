import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const getGeminiResponse = async (prompt: string, history: { role: string; content: string }[] = []) => {
  try {
    const ai = getAI();
    const model = (ai as any).getGenerativeModel({ 
      model: "gemini-1.5-flash"
    });

    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        maxOutputTokens: 1000,
      }
    });

    const result = await chat.sendMessage([
      { text: `Você é o Assistente Virtual da MicroCaaS (microcaas.com.br).
      Seu objetivo é ajudar contadores e empresas a entenderem o ecossistema MicroCaaS.
      
      O que é a MicroCaaS:
      - Um ecossistema de microsoluções contábeis (CaaS - Accounting as a Service).
      - Oferecemos ferramentas como Consulta CNAE Inteligente, Simuladores de Regime Tributário, Workflow de Propostas e muito mais.
      
      Como funciona o site:
      - Catálogo: O usuário pode explorar microsoluções na página 'Soluções'.
      - Compras: Algumas ferramentas são gratuitas, outras são pagas por uso ou assinatura (mensal/anual).
      - Carrinho: O usuário adiciona itens e finaliza no checkout.
      - Login: É necessário login para acessar ferramentas pagas e salvar propostas.
      
      Informações de Contato:
      - E-mail: contato@microcaas.com.br
      - WhatsApp: +55 (65) 99205-8727
      - Localização: Brasília, DF - Brasil
      
      Estilo de resposta:
      - Profissional, prestativo e direto.
      - Use emojis de forma moderada.
      - Incentive o usuário a explorar as ferramentas e entrar em contato se precisar de uma solução customizada.`},
      { text: prompt }
    ]);

    const response = await result.response;
    return response.text() || "Desculpe, não consegui gerar uma resposta.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Houve um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.";
  }
};
