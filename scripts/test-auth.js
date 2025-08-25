const { createClient } = require('@supabase/supabase-js');

// 環境変数から設定を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('環境変数が設定されていません:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '設定済み' : '未設定');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '設定済み' : '未設定');
  process.exit(1);
}

// Supabaseクライアントを作成
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('=== Supabase認証テスト開始 ===\n');

  try {
    // 1. サインアップ
    console.log('1. サインアップ実行中...');
    const signUpResult = await supabase.auth.signUp({
      email: 'user1@example.com',
      password: 'StrongPassw0rd!'
    });

    if (signUpResult.error) {
      console.error('サインアップエラー:', signUpResult.error.message);
    } else {
      console.log('サインアップ成功:', {
        user: signUpResult.data.user?.email,
        userId: signUpResult.data.user?.id,
        session: signUpResult.data.session ? 'セッション作成済み' : 'セッションなし'
      });
    }

    console.log('');

    // 2. ログイン
    console.log('2. ログイン実行中...');
    const signInResult = await supabase.auth.signInWithPassword({
      email: 'user1@example.com',
      password: 'StrongPassw0rd!'
    });

    if (signInResult.error) {
      console.error('ログインエラー:', signInResult.error.message);
    } else {
      console.log('ログイン成功:', {
        user: signInResult.data.user?.email,
        userId: signInResult.data.user?.id,
        session: signInResult.data.session ? 'セッション作成済み' : 'セッションなし'
      });
    }

    console.log('');

    // 3. 現在のセッション確認
    console.log('3. 現在のセッション確認中...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('セッション取得エラー:', sessionError.message);
    } else if (session) {
      console.log('セッション確認成功:', {
        user: session.user?.email,
        userId: session.user?.id,
        expiresAt: session.expires_at
      });
    } else {
      console.log('セッションなし');
    }

    console.log('');

    // 4. ログアウト
    console.log('4. ログアウト実行中...');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.error('ログアウトエラー:', signOutError.message);
    } else {
      console.log('ログアウト成功');
    }

    console.log('\n=== テスト完了 ===');

  } catch (error) {
    console.error('テスト実行中にエラーが発生しました:', error);
  }
}

// テスト実行
testAuth();
