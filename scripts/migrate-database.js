const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 環境変数から設定を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('環境変数が設定されていません:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '設定済み' : '未設定');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '設定済み' : '未設定');
  process.exit(1);
}

// Supabaseクライアントを作成（service role keyを使用）
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQLファイルの実行順序
const sqlFiles = [
  'database-setup.sql',
  'staff-table-setup.sql',
  'chat-tables-setup.sql',
  'analytics-setup.sql',
  'admin-settings-table-setup.sql',
  'advanced-settings-table-setup.sql',
  'password-settings-table-setup.sql',
  'fix-rls-policies.sql',
  'fix-user-permissions.sql'
];

async function executeSqlFile(filePath) {
  try {
    console.log(`📄 実行中: ${filePath}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // SQLを分割して実行（セミコロンで区切る）
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`  → SQL実行: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`  ❌ エラー: ${error.message}`);
          // 一部のエラーは無視（テーブルが既に存在する場合など）
          if (!error.message.includes('already exists') && 
              !error.message.includes('does not exist')) {
            throw error;
          } else {
            console.log(`  ⚠️ 警告: ${error.message}`);
          }
        } else {
          console.log(`  ✅ 成功`);
        }
      }
    }
  } catch (error) {
    console.error(`❌ ファイル実行エラー (${filePath}):`, error.message);
    throw error;
  }
}

async function migrateDatabase() {
  console.log('=== Supabaseデータベース移行開始 ===\n');
  console.log(`対象URL: ${supabaseUrl}\n`);

  try {
    // 1. 接続テスト
    console.log('1. 接続テスト中...');
    const { data, error } = await supabase.from('pg_tables').select('tablename').limit(1);
    
    if (error) {
      console.error('❌ 接続エラー:', error.message);
      process.exit(1);
    }
    console.log('✅ 接続成功\n');

    // 2. SQLファイルを順次実行
    console.log('2. データベーススキーマ移行中...\n');
    
    for (const fileName of sqlFiles) {
      const filePath = path.join(__dirname, '..', fileName);
      
      if (fs.existsSync(filePath)) {
        await executeSqlFile(filePath);
        console.log('');
      } else {
        console.log(`⚠️ ファイルが見つかりません: ${fileName}`);
      }
    }

    // 3. 移行後の確認
    console.log('3. 移行結果確認中...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('❌ テーブル確認エラー:', tablesError.message);
    } else {
      console.log('✅ 作成されたテーブル:');
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }

    console.log('\n=== データベース移行完了 ===');

  } catch (error) {
    console.error('\n❌ 移行中にエラーが発生しました:', error.message);
    process.exit(1);
  }
}

// 移行実行
migrateDatabase();
