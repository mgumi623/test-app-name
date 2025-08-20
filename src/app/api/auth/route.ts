import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { staff_id, password } = body;

    // CSVファイルのパスを指定
    const csvPath = path.join(process.cwd(), 'src', 'app', 'Login', '承認データ.csv');
    
    // CSVファイルを読み込む
    const csvData = await fs.readFile(csvPath, 'utf-8');
    
    // CSVをパース
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true
    });

    // ユーザー認証
    interface UserRecord {
  staff_id: string;
  password: string;
}

const user = records.find((record: UserRecord) => 
      record.staff_id === staff_id && record.password === password
    );

    if (user) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}