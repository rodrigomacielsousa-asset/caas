import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || "";
  return new GoogleGenAI({ apiKey });
};

export const classifyCloudFile = async (base64: string, mimeType: string) => {
  try {
    const ai = getAI();
    const prompt = "Analise este documento contábil e retorne um JSON com: { name: string, category: 'Fiscal' | 'Contabil' | 'RH' | 'Legal', confidence: number (0-100) }";
    
    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: base64,
              mimeType: mimeType
            }
          }
        ]
      }]
    });

    const text = result.text || "";
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { name: "Documento Desconhecido", category: "Outros", confidence: 50 };
  } catch (error) {
    console.error("Gemini Cloud Error:", error);
    return { name: "Erro na Análise", category: "Erro", confidence: 0 };
  }
};

export const analyzeInvoice = async (base64: string, mimeType: string) => {
  try {
    const ai = getAI();
    const prompt = `Analise esta nota fiscal ou recibo e extraia os dados para pré-contabilidade. 
    Retorne APENAS um JSON no formato:
    {
      "fornecedor": string,
      "cnpj": string,
      "data": "DD/MM/YYYY",
      "valor": number,
      "impostos": number,
      "tipoOperacao": "Venda" | "Serviço" | "Despesa",
      "contaContabil": string (código e nome sugestivo),
      "centroCusto": string,
      "resumo": string (curto)
    }`;

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: base64,
              mimeType: mimeType
            }
          }
        ]
      }]
    });

    const text = result.text || "";
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Não foi possível extrair os dados");
  } catch (error) {
    console.error("Gemini Invoice Error:", error);
    throw error;
  }
};

export const iCloudFile = async () => {
    // This seems to be a placeholder or another type of call
    return null;
}
