import AuthTest from '@/components/AuthTest';

export default function AuthTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Supabase認証テスト</h1>
        <AuthTest />
      </div>
    </div>
  );
}
