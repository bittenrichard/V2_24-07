const BASE_URL = 'https://dados.focoserv.com.br/api/database/rows/table';
const FILE_UPLOAD_URL = 'https://dados.focoserv.com.br/api/user-files/upload-file/';
const API_KEY = import.meta.env.VITE_BASEROW_API_KEY;

const uploadFileRequest = async (file: File) => {
  if (!API_KEY) {
    throw new Error("A chave da API do Baserow não foi encontrada.");
  }

  const formData = new FormData();
  formData.append('file', file);

  const headers = {
    'Authorization': `Token ${API_KEY}`,
  };

  try {
    const response = await fetch(FILE_UPLOAD_URL, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Erro ${response.status} no upload de arquivo:`, errorData);
      throw new Error(`Falha no upload do arquivo (Status: ${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error('Falha na requisição de upload para o Baserow:', error);
    throw error;
  }
};


const apiRequest = async (
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  tableId: string,
  path: string = '',
  body?: Record<string, any>
) => {
  if (!API_KEY) {
    const errorMessage = "A chave da API do Baserow (VITE_BASEROW_API_KEY) não foi encontrada.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  let finalUrl = `${BASE_URL}/${tableId}/${path}`;
  if (finalUrl.includes('?')) {
    finalUrl += '&user_field_names=true';
  } else {
    finalUrl += '?user_field_names=true';
  }

  const headers = {
    'Authorization': `Token ${API_KEY}`,
    'Content-Type': 'application/json',
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(finalUrl, options);
    
    if (!response.ok) {
      // --- MODIFICAÇÃO PARA DIAGNÓSTICO ---
      // Vamos capturar e exibir a mensagem de erro detalhada do Baserow.
      const errorData = await response.json().catch(() => ({ detail: 'Não foi possível ler o corpo do erro.' }));
      console.error(`--- ERRO DETALHADO DO BASEROW (Status: ${response.status}) ---:`, errorData);
      // ------------------------------------
      throw new Error(`Erro na comunicação com o banco de dados (Status: ${response.status})`);
    }

    if (method === 'DELETE' || response.status === 204) {
      return { success: true };
    }

    return await response.json();

  } catch (error) {
    console.error('Falha na requisição para o Baserow:', error);
    throw error;
  }
};

export const baserow = {
  get: (tableId: string, params: string = '') => 
    apiRequest('GET', tableId, params),

  post: (tableId: string, data: Record<string, any>) => 
    apiRequest('POST', tableId, '', data),

  patch: (tableId: string, rowId: number, data: Record<string, any>) => 
    apiRequest('PATCH', tableId, `${rowId}/`, data),

  delete: (tableId: string, rowId: number) => 
    apiRequest('DELETE', tableId, `${rowId}/`),
    
  uploadFile: (file: File) => uploadFileRequest(file),
};