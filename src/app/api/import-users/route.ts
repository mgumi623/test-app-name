import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST() {
  try {
    // CSVファイルのパスを指定
    const csvPath = path.join(process.cwd(), 'src', 'app', 'Login', '承認データ.csv');
    
    // CSVファイルを読み込む
    const csvData = await fs.readFile(csvPath, 'utf-8');
    
    // CSVをパース
    interface CSVRecord {
      staff_id: string;
      password: string;
    }

    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true
    }) as CSVRecord[];

    const results = [];
    
    // 各ユーザーをSupabaseに登録
    for (const record of records) {
      const email = `${record.staff_id}@example.com`;
      const password = record.password;
      
      try {
        // ユーザーを作成
        const { data, error: createError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            staff_id: record.staff_id
          }
        });

        if (createError) {
          results.push({
            staff_id: record.staff_id,
            status: 'error',
            message: createError.message
          });
        } else {
          results.push({
            staff_id: record.staff_id,
            status: 'success',
            user_id: data.user.id
          });
        }
      } catch (error) {
        results.push({
          staff_id: record.staff_id,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { success: false, error: 'Import failed' },
      { status: 500 }
    );
  }
}