/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Vercelビルド時にESLintエラーを警告にダウングレード
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScriptエラーをビルド時に無視（危険なので本来は推奨されない）
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
