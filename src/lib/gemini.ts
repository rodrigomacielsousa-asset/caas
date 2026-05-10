import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const getGeminiResponse = async (prompt: string, history: { role: 'user' | 'assistant'; content: string }[] = []) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return "O Assistente IA está em modo de demonstração (Chave API não configurada no servidor). Por favor, entre em contato com o suporte para ativar.";
  }

  try {
    const ai = getAI();
    
    const systemInstruction = `Você é o André, o Assistente Virtual da MicroCaaS (microcaas.com.br).
      Seu objetivo é ajudar contadores e empresas a entenderem o ecossistema MicroCaaS.
      
      O que é a MicroCaaS:
      - Um ecossistema de microsoluções contábeis (CaaS - Accounting as a Service).
      - Oferecemos ferramentas como Consulta CNAE Inteligente, Nexus DF (Gestão de Demonstrações), Reforma Tributária Simulator, Workflow de Propostas e muito mais.
      
      Como funciona o site:
      - Catálogo: O usuário pode explorar microsoluções na página 'Soluções'.
      - Nexus DF: É nossa joia da coroa para contabilidade consultiva, gerando BP, DRE e Notas Explicativas.
      - Compras: Algumas ferramentas são gratuitas, outras são pagas. Atualmente, para testes, habilitamos acesso grátis via botão 'Testar Grátis'.
      
      Informações de Contato:
      - E-mail: contato@microcaas.com.br
      - WhatsApp: +55 (65) 99205-8727
      - Localização: Brasília, DF - Brasil
      
      Estilo de resposta:
      - Profissional, prestativo e empático com contadores.
      - Use emojis de forma moderada.
      - Incentive o uso do Nexus DF e do Simulador da Reforma Tributária.`;

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction,
      },
      history: history.map(msg => ({
        // Map assistant role to "model" for Gemini
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage({ message: prompt });
    
    return result.text || "Desculpe, não consegui processar a resposta agora.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Tivemos um problema na comunicação com o cérebro da IA. Por favor, tente novamente em alguns instantes.";
  }
};
