/**
 * Dify 通信ユーティリティ（画像対応版・安定）
 */
export type ModeType = '通常' | '脳血管' | '感染マニュアル' | '議事録作成' | '文献検索';

type SendArgs = {
  prompt: string;
  mode: ModeType;
  audioFile?: File;
  imageFile?: File;
  isMobile: boolean;
};

const API_ENDPOINT = '/api/dify-proxy';

const logFormData = (fd: FormData) => {
  try {
    const entries: [string, string][] = [];
    for (const [k, v] of fd.entries()) {
      if (v instanceof File) entries.push([k, `File(name=${v.name}, size=${v.size}, type=${v.type})`]);
      else entries.push([k, String(v).slice(0, 200)]);
    }
    console.log('[sendMessageToDify] FormData entries:', entries);
  } catch {}
};

const buildOptions = (args: SendArgs): RequestInit => {
  const { prompt, mode, audioFile, imageFile, isMobile } = args;

  const isMultipart = !!audioFile || !!imageFile;
  if (isMultipart) {
    const fd = new FormData();

    // Dify推奨フィールド
    fd.append('query', prompt ?? '');
    fd.append('response_mode', 'blocking');
    fd.append('user', isMobile ? 'mobile-user' : 'desktop-user');
    fd.append('mode', mode); // 既存互換（プロキシで参照するなら）
    
    // inputsフィールド（Difyの仕様に合わせる）
    const inputs = {
      mode: mode,
      // 必要に応じて他の入力フィールドを追加
    };
    fd.append('inputs', JSON.stringify(inputs));

    // ★ 画像ファイルは `files` に直接追加（プロキシで処理）
    if (imageFile) {
      fd.append('files', imageFile);                       // プロキシで処理
      if (imageFile.size === 0) throw new Error('画像ファイルが空です');
    }
    if (audioFile) {
      fd.append('audioFile', audioFile);                   // 互換
      fd.append('files', audioFile, audioFile.name);       // 将来音声を files で扱う場合に備える
    }

    console.log('[dify.ts] using multipart', { hasAudio: !!audioFile, hasImage: !!imageFile });
    console.log('[dify.ts] Image file details:', imageFile ? {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type,
      lastModified: imageFile.lastModified
    } : 'No image file');
    logFormData(fd);

    return {
      method: 'POST',
      headers: { ...(isMobile && { 'x-mobile-request': 'true' }) }, // Content-Type は付けない
      body: fd,
      cache: 'no-cache',
    };
  }

  // テキストのみ
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(isMobile && { 'x-mobile-request': 'true' }),
    },
    body: JSON.stringify({ prompt, mode }),
    cache: 'no-cache',
  };
};

const fetchWithRetry = async (url: string, optionsFactory: () => RequestInit, maxRetries = 3) => {
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Fetch attempt ${attempt}/${maxRetries}`);
      const res = await fetch(url, optionsFactory());
      if (!res.ok && attempt < maxRetries) {
        console.warn(`Attempt ${attempt} failed: ${res.status} ${res.statusText}`);
        await new Promise((r) => setTimeout(r, 1000 * attempt));
        continue;
      }
      return res;
    } catch (e) {
      lastError = e;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
        continue;
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('All fetch attempts failed');
};

export const sendMessageToDify = async (
  prompt: string,
  mode: ModeType = '通常',
  audioFile?: File,
  imageFile?: File
) => {
  const isMobile =
    typeof window !== 'undefined' &&
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const timeoutMs = mode === '文献検索' ? 300_000 : imageFile ? 120_000 : isMobile ? 90_000 : 30_000;
  console.log('[sendMessageToDify] start', { mode, hasAudio: !!audioFile, hasImage: !!imageFile, timeoutMs, isMobile });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const optionsFactory = () => ({ ...buildOptions({ prompt, mode, audioFile, imageFile, isMobile }), signal: controller.signal });

  try {
    const res = await fetchWithRetry(API_ENDPOINT, optionsFactory, 3);
    const ct = res.headers.get('content-type') || '';
    const raw = await res.text();
    console.log('[sendMessageToDify] response', res.status, ct, raw.slice(0, 300));
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText} - ${raw.slice(0, 200)}`);
    return ct.includes('application/json') ? JSON.parse(raw) : { raw };
  } finally {
    clearTimeout(timeoutId);
  }
};
