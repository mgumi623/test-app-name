/**
 * Dify APIとの通信を管理するユーティリティ
 */
export type ModeType = '通常' | '脳血管' | '感染マニュアル' | '議事録作成' | '文献検索';

const API_ENDPOINT = '/api/dify-proxy';

export interface SendMessageOptions {
  prompt: string;
  mode?: ModeType;
  audioFile?: File;
  imageFile?: File;
}

export async function sendMessageToDify({
  prompt,
  mode = '通常',
  audioFile,
  imageFile
}: SendMessageOptions) {
  const formData = new FormData();
  formData.append('query', prompt);
  formData.append('mode', mode);
  formData.append('response_mode', 'blocking');

  if (audioFile) {
    formData.append('files', audioFile);
  }
  if (imageFile) {
    formData.append('files', imageFile);
  }

  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const data = await res.json();
  return data;
}