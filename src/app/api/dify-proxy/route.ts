// /app/api/dify-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logApiKeyStatus } from '../../../utils/envCheck';

export const runtime = 'nodejs';

type ModeType = '通常' | '脳血管' | '感染マニュアル' | '議事録作成' | '文献検索';

const ALLOWED_IMAGE_MIME = new Set(['image/png','image/jpeg','image/jpg','image/webp','image/gif']);
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

function inferImageMime(name: string): string | '' {
  const n = name.toLowerCase();
  if (n.endsWith('.png')) return 'image/png';
  if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg';
  if (n.endsWith('.webp')) return 'image/webp';
  if (n.endsWith('.gif')) return 'image/gif';
  return '';
}

function getApiKey(mode: ModeType): string {
  switch (mode) {
    case '通常': return process.env.DIFY_API_KEY_NORMAL || '';
    case '脳血管': return process.env.DIFY_API_KEY_CEREBROVASCULAR || '';
    case '感染マニュアル': return process.env.DIFY_API_KEY_INFECTION || '';
    case '議事録作成': return process.env.DIFY_API_KEY_MINUTES || '';
    case '文献検索': return process.env.DIFY_API_KEY_LITERATURE || '';
    default: return process.env.DIFY_API_KEY_NORMAL || '';
  }
}

export async function POST(req: NextRequest) {
  console.log('=== DIFY PROXY API CALL ===');
  logApiKeyStatus();

  let mode: ModeType = '通常';
  let prompt = '';
  let timeoutId: NodeJS.Timeout | null = null;

  const imageFiles: File[] = [];
  let audioFile: File | null = null;

  try {
    const userAgent = req.headers.get('user-agent') || '';
    const user =
      req.headers.get('x-mobile-request') === 'true' ||
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
        ? 'mobile-user'
        : 'desktop-user';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      for (const [k, v] of formData.entries()) {
        if (v instanceof File) {
          console.log(`[FormData] ${k}: File(name=${v.name}, size=${v.size}, type=${v.type})`);
        } else {
          console.log(`[FormData] ${k}: ${String(v)}`);
        }
      }

      prompt =
        (formData.get('query') as string) ||
        (formData.get('text') as string) ||
        (formData.get('prompt') as string) || '';

      mode = ((formData.get('mode') as string) || '通常') as ModeType;

      const collect = (key: string) =>
        formData.getAll(key).filter((v): v is File => v instanceof File) as File[];

      const incoming = [
        ...collect('files'),      // 主要な方法
        ...collect('image'),      // 互換性
        ...collect('imageFile'),  // 互換性
      ];
      
            console.log('[DIFY-PROXY] Collected files:', incoming.map(f => ({ name: f.name, size: f.size, type: f.type })));
      console.log('[DIFY-PROXY] FormData entries:', Array.from(formData.entries()).map(([k, v]) => 
        v instanceof File ? [k, `File(${v.name}, ${v.size} bytes, ${v.type})`] : [k, String(v)]
      ));
      
      const explicitAudio = formData.get('audioFile');
      if (explicitAudio instanceof File) audioFile = explicitAudio;

      for (const f of incoming) {
        const mime = f.type || inferImageMime(f.name);
        console.log('[DIFY-PROXY] Processing file:', { name: f.name, size: f.size, type: f.type, inferredMime: mime });
        
        if (mime.startsWith('image/') || ALLOWED_IMAGE_MIME.has(mime)) {
          imageFiles.push(f);
          console.log('[DIFY-PROXY] Added as image file:', f.name);
        } else if (mime.startsWith('audio/')) {
          if (!audioFile) {
            audioFile = f;
            console.log('[DIFY-PROXY] Added as audio file:', f.name);
          }
        } else {
          console.log('[DIFY-PROXY] Skipped file (unsupported type):', f.name, mime);
        }
      }
    } else {
      const raw = await req.text();
      let json: Record<string, unknown> = {};
      if (raw?.trim()) {
        try { json = JSON.parse(raw); } catch { json = { prompt: raw }; }
      }
      prompt = json?.prompt || '';
      mode = (json?.mode as ModeType) || '通常';
    }

    console.log('Request data:', {
      promptLength: prompt?.length ?? 0,
      mode,
      images: imageFiles.map(f => ({ name: f.name, size: f.size, type: f.type })),
      hasAudio: !!audioFile,
      imageFilesCount: imageFiles.length,
    });

    const apiKey = getApiKey(mode);
    if (!apiKey) {
      return NextResponse.json({ error: `API Key not configured for mode: ${mode}` }, { status: 500 });
    }

    const timeoutMs = mode === '文献検索' ? 300000 : 120000;
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let res: Response;

    // ====== 画像があるときは upload → chat(JSON) 方式（確実な方法） ======
    if (imageFiles.length > 0) {
      console.log('[DIFY-PROXY] Processing image files:', {
        count: imageFiles.length,
        files: imageFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
      });

      // 画像ファイルの検証
      for (const f of imageFiles) {
        const mime = f.type || inferImageMime(f.name);
        if (!ALLOWED_IMAGE_MIME.has(mime)) throw new Error(`Unsupported image mime type: ${mime || '(empty)'}`);
        if (f.size > MAX_IMAGE_BYTES) throw new Error(`Image too large: ${f.size} bytes`);
      }

      // 各画像ファイルをアップロード
      const uploadFileIds = [];
      for (const imageFile of imageFiles) {
        const uploadForm = new FormData();
        uploadForm.append('file', imageFile);
        uploadForm.append('user', user);
        uploadForm.append('source', 'api');

        console.log('[DIFY-PROXY] Uploading image:', imageFile.name);
        const uploadRes = await fetch('https://api.dify.ai/v1/files/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}` },
          body: uploadForm,
          signal: controller.signal,
        });

        if (!uploadRes.ok) {
          const t = await uploadRes.text();
          console.error('[DIFY-PROXY] Upload failed:', { status: uploadRes.status, response: t });
          throw new Error(`Image upload failed: ${uploadRes.status} - ${t}`);
        }

        const uploadData = await uploadRes.json();
        console.log('[DIFY-PROXY] Upload response:', uploadData);
        
        // 既存の動作する実装を参考
        const upload_file_id = uploadData?.id ?? uploadData?.data?.id;
        if (!upload_file_id) {
          console.error('[DIFY-PROXY] Upload response structure:', uploadData);
          throw new Error('upload_file_id not found in upload response');
        }

        uploadFileIds.push(upload_file_id);
        console.log('[DIFY-PROXY] Image uploaded successfully:', upload_file_id);
      }

      // JSONでchat-messagesを送信（既存の動作する実装を参考）
      const difyBody: {
        query: string;
        inputs: {
          images: Array<{
            type: string;
            transfer_method: string;
            upload_file_id: string;
          }>;
        };
        response_mode: string;
        user: string;
      } = {
        query: prompt,
        inputs: {
          images: uploadFileIds.map(upload_file_id => ({
            type: 'image',
            transfer_method: 'local_file',
            upload_file_id
          }))
        },
        response_mode: 'blocking',
        user
      };

      console.log('[DIFY-PROXY] Sending chat request with files:', uploadFileIds);
      console.log('[DIFY-PROXY] Request body:', JSON.stringify(difyBody, null, 2));
      
      res = await fetch('https://api.dify.ai/v1/chat-messages', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(difyBody),
        signal: controller.signal,
      });

    // ====== 議事録（音声） ======
    } else if (mode === '議事録作成' && audioFile) {
      const fd = new FormData();
      fd.append('audio', audioFile, audioFile.name);
      fd.append('response_mode', 'blocking');
      fd.append('user', user);

      res = await fetch('https://api.dify.ai/v1/workflows/run', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: fd,
        signal: controller.signal,
      });

    // ====== 音声（議事録以外） ======
    } else if (audioFile) {
      // 必要なら upload → chat(JSON) にする。ここでは従来どおり。
      const up = new FormData();
      up.append('file', audioFile, audioFile.name);
      up.append('user', user);
      up.append('source', 'api');

      const upRes = await fetch('https://api.dify.ai/v1/files/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: up,
        signal: controller.signal,
      });
      if (!upRes.ok) {
        const t = await upRes.text();
        throw new Error(`File upload failed: ${upRes.status} - ${t}`);
      }
      const { id: upload_file_id } = await upRes.json();

      res = await fetch('https://api.dify.ai/v1/chat-messages', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: prompt,
          inputs: { voice: upload_file_id },
          response_mode: 'blocking',
          user,
        }),
        signal: controller.signal,
      });

    // ====== テキストのみ ======
    } else {
      if (mode === '議事録作成') throw new Error('議事録作成モードでは音声ファイルが必要です。');

      res = await fetch('https://api.dify.ai/v1/chat-messages', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: prompt,
          inputs: {},
          response_mode: 'blocking',
          user,
        }),
        signal: controller.signal,
      });
    }

    if (timeoutId) clearTimeout(timeoutId);

    const raw = await res.text();
    const ct = res.headers.get('content-type') ?? '';
    if (!res.ok) {
      console.error('[DIFY-PROXY] Dify API error response:', {
        status: res.status,
        statusText: res.statusText,
        contentType: ct,
        responseText: raw,
        requestType: imageFiles.length > 0 ? 'image-upload' : audioFile ? 'audio' : 'text-only'
      });
      throw new Error(`Dify responded with ${res.status}: ${raw.slice(0, 200)}`);
    }
    
    if (!ct.includes('application/json')) {
      console.error('[DIFY-PROXY] Non-JSON response:', { contentType: ct, responseText: raw });
      throw new Error(`Dify responded with non-JSON content: ${ct}`);
    }

    const data = JSON.parse(raw);
    
    // デバッグ用：Dify APIのレスポンスを詳細にログ出力
    console.log('[DIFY-PROXY] Dify API response:', {
      status: res.status,
      hasAnswer: !!data?.answer,
      hasData: !!data?.data,
      sysFiles: data?.sys?.files,
      inputs: data?.inputs,
      files: data?.files,
      messageId: data?.id,
      conversationId: data?.conversation_id,
      fullResponse: JSON.stringify(data, null, 2).substring(0, 1000)
    });
    
    // 既存の動作する実装を参考にしたレスポンス処理
    let answer = data?.answer || data?.result || data?.text;
    if (!answer && data?.data?.outputs) {
      answer = data.data.outputs.text || data.data.outputs.result || JSON.stringify(data.data.outputs);
    }
    
    // 議事録作成モードの特別処理
    if (mode === '議事録作成' && audioFile && !answer) {
      answer = data?.data?.outputs?.text || data?.data?.outputs?.minutes || data?.data?.outputs?.result || '(処理に失敗しました)';
    }
    
    if (!answer) {
      answer = '(回答が空でした)';
    }

    return NextResponse.json({ answer });
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    console.error('=== DIFY PROXY ERROR ===', error);
    return NextResponse.json(
      {
        error: 'サーバーエラーが発生しました',
        technical_error: String(error),
        debug: { timestamp: new Date().toISOString() },
      },
      { status: 500 }
    );
  }
}
