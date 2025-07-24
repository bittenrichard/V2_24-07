export interface WebhookResponse {
  success: boolean;
  message: string;
  candidates?: Array<{
    id: string;
    name: string;
    Telefone?: string; // <-- ADICIONAMOS O CAMPO TELEFONE AQUI
    score: number;
    summary: string;
  }>;
}

export const sendCurriculumsToWebhook = async (
  files: FileList,
  jobId: string
): Promise<WebhookResponse> => {
  const formData = new FormData();
  
  Array.from(files).forEach((file, index) => {
    formData.append(`curriculo_${index}`, file);
  });
  
  formData.append('job_id', jobId);
  formData.append('timestamp', new Date().toISOString());

  try {
    const response = await fetch('/api/webhook/recrutamento', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Erro de rede! Status: ${response.status}`);
    }

    let resultData = await response.json();

    if (Array.isArray(resultData) && resultData.length > 0) {
      resultData = resultData[0];
    }

    if (resultData && typeof resultData.output === 'string') {
      try {
        const finalResult = JSON.parse(resultData.output);
        return finalResult;
      } catch (parseError) {
        console.error('Erro ao fazer o parse da resposta aninhada do webhook:', parseError);
        throw new Error('A resposta da IA (webhook) está em um formato de texto inválido.');
      }
    }

    return resultData;

  } catch (error) {
    console.error('Erro ao enviar currículos para webhook:', error);
    throw new Error('Falha ao enviar currículos para análise. Verifique a conexão e a configuração do webhook.');
  }
};
