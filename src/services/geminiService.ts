import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || "";
  return new GoogleGenAI({ apiKey });
};

export const classifyCloudFile = async (base64: string, mimeType: string) => {
  try {
    const ai = getAI();
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: "user",
        parts: [
          { text: "Analise este documento contábil e retorne os dados de classificação." },
          {
            inlineData: {
              data: base64,
              mimeType: mimeType
            }
          }
        ]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { 
              type: Type.STRING,
              enum: ['Fiscal', 'Contabil', 'RH', 'Legal', 'Outros']
            },
            confidence: { type: Type.NUMBER }
          },
          required: ["name", "category", "confidence"]
        }
      }
    });

    return JSON.parse(result.text || "{}");
  } catch (error) {
    console.error("Gemini Cloud Error:", error);
    return { name: "Erro na Análise", category: "Erro", confidence: 0 };
  }
};

export const analyzeInvoice = async (base64: string, mimeType: string) => {
  try {
    const ai = getAI();
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: "user",
        parts: [
          { text: "Analise esta nota fiscal ou recibo e extraia os dados para pré-contabilidade." },
          {
            inlineData: {
              data: base64,
              mimeType: mimeType
            }
          }
        ]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fornecedor: { type: Type.STRING },
            cnpj: { type: Type.STRING },
            data: { type: Type.STRING, description: "Format: DD/MM/YYYY" },
            valor: { type: Type.NUMBER },
            impostos: { type: Type.NUMBER },
            tipoOperacao: { 
              type: Type.STRING, 
              enum: ["Venda", "Serviço", "Despesa"] 
            },
            contaContabil: { type: Type.STRING },
            centroCusto: { type: Type.STRING },
            resumo: { type: Type.STRING },
            itens: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  descricao: { type: Type.STRING },
                  quantidade: { type: Type.NUMBER },
                  valorUnitario: { type: Type.NUMBER },
                  valorTotal: { type: Type.NUMBER }
                }
              }
            },
            lancamentoSugestao: {
              type: Type.OBJECT,
              properties: {
                debito: { type: Type.STRING },
                credito: { type: Type.STRING },
                historico: { type: Type.STRING },
                confianca: { type: Type.STRING, enum: ["Alta", "Média", "Baixa"] }
              }
            }
          },
          required: ["fornecedor", "cnpj", "data", "valor", "tipoOperacao", "lancamentoSugestao"]
        }
      }
    });

    return JSON.parse(result.text || "{}");
  } catch (error) {
    console.error("Gemini Invoice Error:", error);
    throw error;
  }
};

export const analyzeDataHub = async (data: string) => {
  try {
    const ai = getAI();
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: "user",
        parts: [{ text: `Analise os seguintes dados consolidados da empresa (transações e documentos) e forneça insights estratégicos, alertas de risco e oportunidades de otimização contábil/fiscal: \n\n ${data}` }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Score de 0 a 100" },
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["oportunidade", "alerta", "info"] },
                  impact: { type: Type.STRING, enum: ["alto", "medio", "baixo"] }
                }
              }
            },
            proximosPassos: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(result.text || "{}");
  } catch (error) {
    console.error("Gemini Hub Error:", error);
    return { score: 0, insights: [], proximosPassos: ["Tente novamente mais tarde"] };
  }
};
