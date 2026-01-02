'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Edit2, Trash2, Phone, Mail, Users } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useProjectStore } from '@/stores/projectStore';
import { DEPARTMENT_LABELS, type DepartmentType, type Staff } from '@/types';

type StaffFormData = {
  name: string;
  department: DepartmentType;
  position: string;
  phone: string;
  email: string;
};

const initialFormData: StaffFormData = {
  name: '',
  department: 'DIRECTING',
  position: '',
  phone: '',
  email: '',
};

export default function StaffPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const { 
    currentProject, 
    staff, 
    fetchProject, 
    fetchStaff,
    createStaff, 
    updateStaff, 
    deleteStaff,
    isLoading 
  } = useProjectStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<StaffFormData>(initialFormData);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  
  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      fetchStaff(projectId);
    }
  }, [projectId, fetchProject, fetchStaff]);
  
  const handleOpenModal = (staffMember?: Staff) => {
    console.log('Opening modal', staffMember);
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        name: staffMember.name,
        department: staffMember.department,
        position: staffMember.position,
        phone: staffMember.phone,
        email: staffMember.email || '',
      });
    } else {
      setEditingStaff(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };
  
  // 디버깅용
  useEffect(() => {
    console.log('isModalOpen changed:', isModalOpen);
  }, [isModalOpen]);
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
    setFormData(initialFormData);
  };
  
  const handleSubmit = async () => {
    console.log('handleSubmit called', formData);
    try {
      if (editingStaff) {
        console.log('Updating staff...');
        await updateStaff(editingStaff.id, {
          ...formData,
          projectId,
        });
      } else {
        console.log('Creating staff...', { ...formData, projectId });
        await createStaff({
          ...formData,
          projectId,
        });
      }
      console.log('Success!');
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save staff:', error);
      alert('스태프 저장에 실패했습니다: ' + (error as Error).message);
    }
  };
  
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStaff(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete staff:', error);
    }
  };
  
  // 부서별로 그룹화
  const staffByDepartment = staff.reduce((acc, member) => {
    if (!acc[member.department]) {
      acc[member.department] = [];
    }
    acc[member.department].push(member);
    return acc;
  }, {} as Record<DepartmentType, Staff[]>);
  
  const departmentOrder: DepartmentType[] = [
    'DIRECTING', 'CAMERA', 'LIGHTING', 'SOUND', 
    'ART', 'PRODUCTION', 'MAKEUP', 'COSTUME', 'OTHER'
  ];
  
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
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">스태프 관리</h1>
              <p className="text-muted-foreground mt-1">
                {currentProject?.title} · 총 {staff.length}명
              </p>
            </div>
            <Button onClick={() => handleOpenModal()} className="gap-2">
              <Plus className="w-4 h-4" />
              스태프 추가
            </Button>
          </div>
          
          {/* Staff List by Department */}
          {staff.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">등록된 스태프가 없습니다</p>
                  <Button onClick={() => handleOpenModal()} variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    첫 번째 스태프 추가하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {departmentOrder.map((dept) => {
                const members = staffByDepartment[dept];
                if (!members || members.length === 0) return null;
                
                return (
                  <Card key={dept}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        {DEPARTMENT_LABELS[dept]}
                        <Badge variant="secondary">{members.length}명</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{member.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {member.position}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {member.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {member.phone}
                                </span>
                              )}
                              {member.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {member.email}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleOpenModal(member)}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(member)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? '스태프 수정' : '스태프 추가'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="홍길동"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">직책 *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="촬영감독"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">부서 *</Label>
              <Select
                value={formData.department}
                onValueChange={(value: DepartmentType) => 
                  setFormData({ ...formData, department: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DEPARTMENT_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              취소
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || !formData.position}
            >
              {editingStaff ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>스태프 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name}님을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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

