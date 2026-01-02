'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Edit2, Trash2, Phone, User, Clapperboard } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProjectStore } from '@/stores/projectStore';
import type { Cast } from '@/types';

type CastFormData = {
  role: string;
  actorName: string;
  phone: string;
};

const initialFormData: CastFormData = {
  role: '',
  actorName: '',
  phone: '',
};

export default function CastPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const { 
    currentProject, 
    casts, 
    fetchProject, 
    fetchCasts,
    createCast, 
    updateCast, 
    deleteCast,
    isLoading 
  } = useProjectStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCast, setEditingCast] = useState<Cast | null>(null);
  const [formData, setFormData] = useState<CastFormData>(initialFormData);
  const [deleteTarget, setDeleteTarget] = useState<Cast | null>(null);
  
  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      fetchCasts(projectId);
    }
  }, [projectId, fetchProject, fetchCasts]);
  
  const handleOpenModal = (cast?: Cast) => {
    if (cast) {
      setEditingCast(cast);
      setFormData({
        role: cast.role,
        actorName: cast.actorName,
        phone: cast.phone,
      });
    } else {
      setEditingCast(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCast(null);
    setFormData(initialFormData);
  };
  
  const handleSubmit = async () => {
    try {
      if (editingCast) {
        await updateCast(editingCast.id, {
          ...formData,
          projectId,
        });
      } else {
        await createCast({
          ...formData,
          projectId,
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save cast:', error);
    }
  };
  
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCast(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete cast:', error);
    }
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-muted-foreground">로딩 중...</div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">캐스트 관리</h1>
              <p className="text-muted-foreground mt-1">
                {currentProject?.title} · 총 {casts.length}명
              </p>
            </div>
            <Button onClick={() => handleOpenModal()} className="gap-2">
              <Plus className="w-4 h-4" />
              캐스트 추가
            </Button>
          </div>
          
          {/* Cast List */}
          {casts.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Clapperboard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">등록된 캐스트가 없습니다</p>
                  <Button onClick={() => handleOpenModal()} variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    첫 번째 캐스트 추가하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">캐스트 목록</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>배역</TableHead>
                      <TableHead>배우</TableHead>
                      <TableHead>연락처</TableHead>
                      <TableHead className="w-[100px] text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {casts.map((cast, index) => (
                      <TableRow key={cast.id} className="group">
                        <TableCell className="font-medium text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{cast.role}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{cast.actorName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {cast.phone && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="w-3.5 h-3.5" />
                              <span className="text-sm">{cast.phone}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenModal(cast)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(cast)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCast ? '캐스트 수정' : '캐스트 추가'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">배역명 *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="예: 다무라"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actorName">배우 이름 *</Label>
                <Input
                  id="actorName"
                  value={formData.actorName}
                  onChange={(e) => setFormData({ ...formData, actorName: e.target.value })}
                  placeholder="예: 김배우"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">연락처</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="010-1234-5678"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              취소
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.role || !formData.actorName}
            >
              {editingCast ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>캐스트 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.role} 역 {deleteTarget?.actorName}님을 삭제하시겠습니까? 
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}





