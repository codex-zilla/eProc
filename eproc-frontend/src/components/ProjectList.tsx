import React, { useEffect, useState } from 'react';
import { Project } from '../types/models';
import { projectService } from '../services/projectService';

export const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectService.getAllProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading Projects...</div>;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Active Projects</h3>
      </div>
      <ul className="divide-y divide-gray-200">
        {projects.map((project) => (
          <li key={project.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-indigo-600 truncate">{project.name}</p>
              <div className="ml-2 flex-shrink-0 flex">
                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {project.currency} {project.budgetTotal?.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-2 sm:flex sm:justify-between">
              <div className="sm:flex">
                <p className="flex items-center text-sm text-gray-500">
                  Owner: {project.owner}
                </p>
              </div>
            </div>
          </li>
        ))}
        {projects.length === 0 && (
          <li className="px-4 py-4 text-center text-gray-500">No projects found.</li>
        )}
      </ul>
    </div>
  );
};
