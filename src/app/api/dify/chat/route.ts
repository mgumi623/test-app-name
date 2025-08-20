import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let text = '';
    let imageFile: File | null = null;  // ← 統一
    let conversationId = '';
    let userId = '';

    // Parse request data
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      text = (formData.get('text') as string) || '';
      imageFile = (formData.get('image') as File) || null; // ← サーバが期待するキー名 'image'
      conversationId = (formData.get('conversationId') as string) || '';
      userId = (formData.get('userId') as string) || process.env.DIFY_DEFAULT_USER_ID || 'default-user';

      // 受信確認ログ（重要）
      for (const [k, v] of formData.entries()) {
        if (v instanceof File) {
          console.log(`[API] FD ${k}: File(name=${v.name}, size=${v.size}, type=${v.type})`);
        } else {
          console.log(`[API] FD ${k}: ${String(v).slice(0,200)}`);
        }
      }
    } else {
      const body = await request.json();
      text = body.text || body.prompt || '';
      conversationId = body.conversationId || '';
      userId = body.userId || process.env.DIFY_DEFAULT_USER_ID || 'default-user';
    }

    console.log('Request validation:', { 
      hasText: !!text, 
      textLength: text?.length,
      hasImage: !!imageFile, 
      imageName: imageFile?.name,
      imageSize: imageFile?.size,
      contentType 
    });

    if (!text && !imageFile) {
      console.error('Validation failed: no text or image provided');
      return NextResponse.json(
        { error: 'Text or image is required' },
        { status: 400 }
      );
    }

    // Dify 設定
    const difyApiBase = process.env.DIFY_API_BASE || 'https://api.dify.ai';
    const difyApiKey = process.env.DIFY_API_KEY_NORMAL; // 通常モード用APIキー（必要に応じて切替）
    // const difyAppId = process.env.DIFY_CHAT_APP_ID; // Service APIなら不要

    if (!difyApiKey) {
      console.error('Missing Dify API key');
      return NextResponse.json(
        { error: 'Server configuration error: missing Dify API key' },
        { status: 500 }
      );
    }

    const authHeaders: Record<string, string> = {
      Authorization: `Bearer ${difyApiKey}`,
    };

    // 画像あり：upload → chat の2ステップ
    if (imageFile) {
      // Step 1: /files/upload
      const uploadForm = new FormData();
      uploadForm.append('file', imageFile);
      uploadForm.append('user', userId);
      uploadForm.append('source', 'api');

      console.log('Uploading image to Dify /v1/files/upload ...');
      const uploadRes = await fetch(`${difyApiBase}/v1/files/upload`, {
        method: 'POST',
        headers: authHeaders, // Content-Typeは付けない
        body: uploadForm,
      });

      if (!uploadRes.ok) {
        const t = await uploadRes.text();
        console.error('Image upload failed:', uploadRes.status, t);
        return NextResponse.json(
          { error: `Image upload failed: ${uploadRes.status}`, details: t.slice(0,200) },
          { status: uploadRes.status }
        );
      }

      const uploaded = await uploadRes.json();
      const upload_file_id = uploaded.id as string;
      console.log('Image uploaded. upload_file_id=', upload_file_id);

      // Step 2: /chat-messages に JSON で投げる
      interface ChatPayload {
  query: string;
  response_mode: 'blocking' | 'streaming';
  user: string;
  conversation_id?: string;
  inputs: {
    images?: Array<{
      type: string;
      transfer_method: string;
      upload_file_id: string;
    }>;
  };
}

const chatPayload: ChatPayload = {
        query: text || '', // 空でもOK
        response_mode: 'blocking',
        user: userId,
        inputs: {
          images: [
            { type: 'image', transfer_method: 'local_file', upload_file_id },
          ],
        },
      };
      if (conversationId) chatPayload.conversation_id = conversationId;

      const chatRes = await fetch(`${difyApiBase}/v1/chat-messages`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(chatPayload),
      });

      if (!chatRes.ok) {
        const t = await chatRes.text();
        console.error('Dify chat error (image path):', chatRes.status, t);
        return NextResponse.json(
          { error: 'Failed to communicate with AI service', details: t.slice(0,200) },
          { status: chatRes.status }
        );
      }

      const responseText = await chatRes.text();
      console.log('Dify image-chat response (trunc):', responseText.slice(0,500));

      try {
        const data = JSON.parse(responseText);
        let answer = data.answer || data.result || data.text;
        if (!answer && data.data?.outputs) {
          answer = data.data.outputs.text || data.data.outputs.result || JSON.stringify(data.data.outputs);
        }
        return NextResponse.json({ answer: answer ?? responseText });
      } catch {
        return NextResponse.json({ answer: responseText });
      }
    }

    // 画像なし（テキストのみ）：そのまま /chat-messages に JSON
    const textPayload: ChatPayload = {
      query: text,
      response_mode: 'streaming', // 必要に応じて 'blocking' に
      user: userId,
      inputs: {}
    };
    if (conversationId) textPayload.conversation_id = conversationId;

    const textRes = await fetch(`${difyApiBase}/v1/chat-messages`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(textPayload),
    });

    if (!textRes.ok) {
      const t = await textRes.text();
      console.error('Dify chat error (text path):', textRes.status, t);
      return NextResponse.json(
        { error: 'Failed to communicate with AI service', details: t.slice(0,200) },
        { status: textRes.status }
      );
    }

    const responseText = await textRes.text();
    console.log('Dify text-chat response (trunc):', responseText.slice(0,500));
    try {
      const data = JSON.parse(responseText);
      let answer = data.answer || data.result || data.text;
      if (!answer && data.data?.outputs) {
        answer = data.data.outputs.text || data.data.outputs.result || JSON.stringify(data.data.outputs);
      }
      return NextResponse.json({ answer: answer ?? responseText });
    } catch {
      return NextResponse.json({ answer: responseText });
    }

  } catch (error) {
    console.error('=== API ERROR DETAILS ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('=== END API ERROR ===');

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
