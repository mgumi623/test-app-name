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

/**
 * テキストのみの問い合わせをストリーミングで送信し、トークン単位でコールバックします。
 * 画像/音声は従来どおり blocking を利用してください。
 */
export async function sendMessageToDifyStream({ prompt, mode = '通常', onToken }: Pick<SendMessageOptions, 'prompt' | 'mode'> & { onToken?: (delta: string) => void }) {
  const url = `${API_ENDPOINT}?stream=1`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-stream': 'true'
    },
    body: JSON.stringify({ prompt, mode, response_mode: 'streaming' })
  });

  if (!res.ok || !res.body) {
    throw new Error(`API stream error: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let fullText = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE: イベントは \n\n 区切り
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';

    for (const chunk of parts) {
      // 1行ずつ処理。data: ... が中心。
      const lines = chunk.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') {
          // ストリーム終了
          try { await reader.cancel(); } catch {}
          return fullText;
        }
        try {
          const json = JSON.parse(payload);
          const delta =
            json?.delta ??
            json?.answer ??
            json?.text ??
            json?.result ??
            json?.data?.answer ?? '';
          if (delta) {
            fullText += String(delta);
            if (typeof onToken === 'function') {
              onToken(String(delta));
            }
          }
        } catch {
          // JSONでない場合はそのままテキストとして扱う
          if (payload) {
            fullText += payload;
            if (typeof onToken === 'function') {
              onToken(payload);
            }
          }
        }
      }
    }
  }

  // 残りバッファに data: があれば拾う
  const m = buffer.match(/data:\s*(.*)/);
  if (m && m[1]) {
    const payload = m[1];
    try {
      const json = JSON.parse(payload);
      const delta = json?.answer || json?.text || json?.delta || '';
      if (delta) fullText += String(delta);
    } catch {
      fullText += payload;
    }
  }
  return fullText;
}