import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { useProjectUserManagement } from '@/hooks/useProjectUserManagement';
import { ProjectUserModals } from '@/components/domain/project-users/ProjectUserModals';
import { CreateProjectUserForm } from '@/components/domain/project-users/CreateProjectUserForm';
import { ProjectUserList } from '@/components/domain/project-users/ProjectUserList';

const ManageProjectUsers = () => {
  const [activeTab, setActiveTab] = useState('users');
  const managementProps = useProjectUserManagement();

  const {
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filteredUsers
  } = managementProps;

  return (
    <div className="space-y-2 sm:space-y-3">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#2a3455]" />
            Team Members
          </div>
        }
        description="Manage your team members and their project assignments."
        actions={
          <Button
            onClick={() => setActiveTab('create')}
            className="bg-[#2a3455] text-white hover:bg-[#1e253e] whitespace-nowrap h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <UserPlus className="hidden sm:inline w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Create New User</span>
              <span className="sm:hidden">New User</span>
            </div>
          </Button>
        }
      />

      {error && (
        <ErrorDisplay
          error={null}
          message={error}
          variant="inline"
          title="Failed to load team data"
          className="mb-2"
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full p-0">
        <TabsList className="grid w-full max-w-full sm:max-w-md grid-cols-2 h-9 sm:h-10 p-0 bg-transparent">
          <TabsTrigger
            value="users"
            className="text-xs sm:text-sm rounded-none data-[state=active]:border-b-[2px] data-[state=active]:border-[#2a3455] data-[state=active]:shadow-xs data-[state=active]:bg-white data-[state=active]:text-[#2a3455]"
          >All Users</TabsTrigger>
          <TabsTrigger
            value="create"
            className="text-xs sm:text-sm rounded-none data-[state=active]:border-b-[2px] data-[state=active]:border-[#2a3455] data-[state=active]:shadow-xs data-[state=active]:bg-white data-[state=active]:text-[#2a3455]"
          >Create New User</TabsTrigger>
        </TabsList>

        {/* Tab 1: All Users */}
        <TabsContent value="users" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
          <div className="flex items-center justify-between gap-3 sm:gap-4 mb-4">
            <div className="relative flex-1 max-w-full sm:max-w-sm">
              <Search className="absolute left-2 sm:left-2.5 top-2 sm:top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-9 h-9 sm:h-10 text-xs sm:text-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-8 sm:py-12">
              <LoadingSpinner size="md" text="Loading users..." />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-6">
              <EmptyState
                icon={Users}
                title={searchTerm ? "No users found" : "No team members"}
                description={searchTerm ? "Try adjusting your search terms." : "No users have been created yet. Head over to the 'Create New User' tab to add your first team member."}
              />
            </div>
          ) : (
            <ProjectUserList {...managementProps} />
          )}
        </TabsContent>

        {/* Tab 2: Create New User */}
        <TabsContent value="create" className="mt-3 sm:mt-4">
          <CreateProjectUserForm {...managementProps} />
        </TabsContent>
      </Tabs>

      <ProjectUserModals {...managementProps} />
    </div>
  );
};

export default ManageProjectUsers;
