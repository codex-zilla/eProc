import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectList } from '@/components/domain/projects/ProjectList';
import { PageHeader } from '@/components/common/PageHeader';
import { Plus, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from '@/hooks/queries/useProjects';

/**
 * Assigned Project page - displays all projects the engineer is assigned to.
 */
const AssignedProject = () => {
  const navigate = useNavigate();
  const { data: projects = [] } = useProjects();
  const activeProjects = projects.filter(p => p.status === 'ACTIVE');

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateRequest = () => {
    if (selectedProjectId) {
      setIsModalOpen(false);
      navigate(`/engineer/create-batch?projectId=${selectedProjectId}`);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#2a3455]" />
            Assigned Projects
          </div>
        }
        description="View all projects you are currently assigned to."
        actions={
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#2a3455] text-white hover:bg-[#1e253e] whitespace-nowrap">
                <Plus className="w-4 h-4 mr-2" />
                Create New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Request</DialogTitle>
                <DialogDescription>
                  Select an active project below to begin creating a new request.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeProjects.length === 0 ? (
                        <SelectItem value="none" disabled>No active projects available</SelectItem>
                      ) : (
                        activeProjects.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateRequest}
                  disabled={!selectedProjectId || selectedProjectId === 'none'}
                  className="bg-[#2a3455] hover:bg-[#1e253e] text-white"
                >
                  Continue
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <ProjectList onRowClick={(project) => navigate(`/engineer/projects/${project.id}`)} />
    </div>
  );
};

export default AssignedProject;

