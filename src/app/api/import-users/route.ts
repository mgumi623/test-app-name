import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const filePath = path.resolve('./public/staff.csv');
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    const results = [];

    type StaffRow = {
    ID: string;
    name: string;
    password: string;
    job: string;
    role: string;
    permission: string;
};

for (const row of records as StaffRow[]) {
      const email = `${row.ID}@example.com`;
      const password = row.password || 'Temp1234!';

      const { error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          login_id: row.ID,
          name: row.name,
          job: row.job,
          role: row.role,
          permission: row.permission,
        },
      });

      results.push({
        ID: row.ID,
        status: error ? 'error' : 'success',
        message: error?.message,
      });
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error('CSV読み込みエラー:', err);
    return NextResponse.json({ error: 'CSV読み込みまたは登録処理でエラー' }, { status: 500 });
  }
}