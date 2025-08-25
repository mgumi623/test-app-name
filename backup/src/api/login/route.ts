import { supabase } from "../../../src/lib/supabase"; 
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { login_id, password } = await req.json();

  if (!login_id || !password) {
    return new Response(JSON.stringify({ error: "IDとパスワードを入力してください。" }), {
      status: 400,
    });
  }

  // ユーザーを取得
  console.log("▶ login_id:", login_id);
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("login_id", login_id)
      .single();

    console.log("▶ user:", user);
    console.log("▶ error:", error);


  if (error || !user) {
    return new Response(JSON.stringify({ error: "ユーザーが見つかりません。" }), {
      status: 401,
    });
  }

  // パスワードを照合
  const isMatch = bcrypt.compareSync(password, user.password);

  if (!isMatch) {
    return new Response(JSON.stringify({ error: "パスワードが一致しません。" }), {
      status: 401,
    });
  }

  // ログイン成功 → クライアントに必要な情報だけ返す
  return new Response(JSON.stringify({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
  }), {
    status: 200,
  });
}
