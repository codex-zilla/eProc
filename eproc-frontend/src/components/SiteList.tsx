import React, { useEffect, useState } from 'react';
import { Site } from '../types/models';
import { projectService } from '../services/projectService';

export const SiteList: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectService.getAllSites()
      .then(setSites)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading Sites...</div>;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md mt-4">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Your Sites</h3>
      </div>
      <ul className="divide-y divide-gray-200">
        {sites.map((site) => (
          <li key={site.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-indigo-600 truncate">{site.name}</p>
              <div className="ml-2 flex-shrink-0 flex">
                <p className="text-sm text-gray-500">{site.location}</p>
              </div>
            </div>
          </li>
        ))}
        {sites.length === 0 && (
          <li className="px-4 py-4 text-center text-gray-500">No sites found.</li>
        )}
      </ul>
    </div>
  );
};
