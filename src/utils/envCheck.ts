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

// 環境変数の設定状況を確認するユーティリティ

export const checkDifyApiKeys = () => {
  const keys = {
    normal: process.env.DIFY_API_KEY_NORMAL,
    cerebrovascular: process.env.DIFY_API_KEY_CEREBROVASCULAR,
    infection: process.env.DIFY_API_KEY_INFECTION,
    minutes: process.env.DIFY_API_KEY_MINUTES,
    literature: process.env.DIFY_API_KEY_LITERATURE
  };

  const status = {
    configured: Object.values(keys).filter(key => !!key).length,
    total: Object.keys(keys).length,
    missing: Object.entries(keys).filter(([, key]) => !key).map(([name]) => name),
    available: Object.entries(keys).filter(([, key]) => !!key).map(([name]) => name)
  };

  return {
    keys,
    status,
    isConfigured: status.configured > 0,
    isFullyConfigured: status.configured === status.total
  };
};

export const getMissingApiKeys = () => {
  const check = checkDifyApiKeys();
  return check.status.missing;
};

export const logApiKeyStatus = () => {
  const check = checkDifyApiKeys();
  console.log('Dify API Keys Status:', {
    configured: check.status.configured,
    total: check.status.total,
    missing: check.status.missing,
    available: check.status.available,
    isConfigured: check.isConfigured,
    isFullyConfigured: check.isFullyConfigured
  });
  
  if (!check.isConfigured) {
    console.error('❌ No Dify API keys configured!');
    console.error('Please set the following environment variables:');
    check.status.missing.forEach(key => {
      console.error(`  - DIFY_API_KEY_${key.toUpperCase()}`);
    });
  } else if (!check.isFullyConfigured) {
    console.warn('⚠️ Some Dify API keys are missing:');
    check.status.missing.forEach(key => {
      console.warn(`  - DIFY_API_KEY_${key.toUpperCase()}`);
    });
  } else {
    console.log('✅ All Dify API keys are configured');
  }
};