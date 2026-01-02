'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clapperboard } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // 메인 페이지에서 프로젝트 페이지로 리다이렉트
    router.push('/projects');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary animate-pulse">
          <Clapperboard className="w-8 h-8 text-primary-foreground" />
        </div>
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    </div>
  );
}
