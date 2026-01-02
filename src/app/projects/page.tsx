'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  FolderKanban, 
  Calendar, 
  MoreVertical,
  Film,
  Trash2,
  Edit2
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProjectStore } from '@/stores/projectStore';
import type { Project, ProjectStatus, ProjectFormData } from '@/types';
import { PROJECT_STATUS_LABELS } from '@/types';

const STATUS_COLORS: Record<ProjectStatus, string> = {
  PREP: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  SHOOTING: 'bg-primary/10 text-primary hover:bg-primary/10',
  POST: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
  COMPLETED: 'bg-green-100 text-green-700 hover:bg-green-100',
};

export default function ProjectsPage() {
  const { projects, isLoading, fetchProjects, createProject, deleteProject } = useProjectStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    director: '',
    producer: '',
    assistantDirector: '',
    description: '',
    status: 'PREP',
  });
  
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  const handleCreate = async () => {
    if (!formData.title) return;
    
    try {
      await createProject(formData);
      setIsCreateOpen(false);
      setFormData({
        title: '',
        director: '',
        producer: '',
        assistantDirector: '',
        description: '',
        status: 'PREP',
      });
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (confirm('정말 이 프로젝트를 삭제하시겠습니까?')) {
      try {
        await deleteProject(id);
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };
  
  return (
    <MainLayout title="프로젝트">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">내 프로젝트</h1>
            <p className="text-muted-foreground mt-1">
              영화 프로젝트를 관리하고 일촬표를 작성하세요
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                새 프로젝트
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>새 프로젝트 만들기</DialogTitle>
                <DialogDescription>
                  새로운 영화 프로젝트의 기본 정보를 입력하세요.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">작품명 *</Label>
                  <Input
                    id="title"
                    placeholder="예: Theme of Tamura"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="director">감독</Label>
                    <Input
                      id="director"
                      placeholder="감독 이름"
                      value={formData.director}
                      onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="producer">PD</Label>
                    <Input
                      id="producer"
                      placeholder="PD 이름"
                      value={formData.producer}
                      onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assistantDirector">조연출</Label>
                  <Input
                    id="assistantDirector"
                    placeholder="조연출 이름"
                    value={formData.assistantDirector}
                    onChange={(e) => setFormData({ ...formData, assistantDirector: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    placeholder="프로젝트에 대한 간단한 설명"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleCreate} disabled={!formData.title}>
                  만들기
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-5 w-2/3 bg-muted rounded" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <FolderKanban className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">프로젝트가 없습니다</h3>
              <p className="text-muted-foreground text-center mb-6">
                첫 번째 프로젝트를 만들어 일촬표 작성을 시작하세요
              </p>
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                새 프로젝트 만들기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

function ProjectCard({ project, onDelete }: { project: Project; onDelete: (id: string) => void }) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              <Link 
                href={`/projects/${project.id}`}
                className="hover:text-primary transition-colors"
              >
                {project.title}
              </Link>
            </CardTitle>
            <CardDescription>
              {project.director && `감독: ${project.director}`}
              {project.director && project.producer && ' · '}
              {project.producer && `PD: ${project.producer}`}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/projects/${project.id}`}>
                  <Film className="w-4 h-4 mr-2" />
                  프로젝트 열기
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/projects/${project.id}/schedules`}>
                  <Calendar className="w-4 h-4 mr-2" />
                  일촬표 목록
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/projects/${project.id}/edit`}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  수정
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(project.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge className={STATUS_COLORS[project.status]} variant="secondary">
            {PROJECT_STATUS_LABELS[project.status]}
          </Badge>
          {project.assistantDirector && (
            <span className="text-sm text-muted-foreground">
              조연출: {project.assistantDirector}
            </span>
          )}
        </div>
        {project.description && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
            {project.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}





