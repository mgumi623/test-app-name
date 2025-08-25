// app/api/reset-password/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { loginId, newPassword } = await req.json();

  if (!loginId || !newPassword) {
    return NextResponse.json({ error: 'IDとパスワードは必須です。' }, { status: 400 });
  }

  const { data: userRecord, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('login_id', loginId)
    .single();

  if (userError || !userRecord) {
    return NextResponse.json({ error: 'そのIDのユーザーは存在しません。' }, { status: 404 });
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userRecord.id, {
    password: newPassword,
  });

  if (updateError) {
    return NextResponse.json({ error: 'パスワードの更新に失敗しました。' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
