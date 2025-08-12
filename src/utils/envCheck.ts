// 環境変数チェック用ユーティリティ

export function checkEnvironmentVariables() {
  console.log('=== ENVIRONMENT VARIABLES CHECK ===');
  
  // 必要な環境変数
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  // 各環境変数の確認
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`${varName}:`, {
      exists: !!value,
      length: value?.length || 0,
      firstChars: value?.substring(0, 20) || 'UNDEFINED',
      isValidUrl: varName.includes('URL') ? (value?.includes('supabase.co') || false) : 'N/A'
    });
  });
  
  // 全てのNEXT_PUBLIC環境変数
  console.log('All NEXT_PUBLIC vars:');
  Object.keys(process.env)
    .filter(key => key.startsWith('NEXT_PUBLIC'))
    .forEach(key => {
      const value = process.env[key];
      console.log(`  ${key}:`, {
        exists: !!value,
        length: value?.length || 0
      });
    });
  
  // .env.localファイルの存在チェック（推測）
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!hasSupabaseUrl || !hasSupabaseKey) {
    console.error('❌ Missing required environment variables!');
    console.error('Please check your .env.local file and ensure it contains:');
    console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  } else {
    console.log('✅ All required environment variables are present');
  }
  
  console.log('=== END ENVIRONMENT VARIABLES CHECK ===');
  
  return {
    hasSupabaseUrl,
    hasSupabaseKey,
    allPresent: hasSupabaseUrl && hasSupabaseKey
  };
}