import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
  // 환경변수를 클라이언트에서 사용 가능하게 설정
  env: {
    NEXT_PUBLIC_POCKETBASE_URL: process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090",
  },
};

export default nextConfig;
