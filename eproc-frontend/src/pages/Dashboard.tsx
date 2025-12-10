import { useEffect, useState } from 'react';
import api from '../lib/axios';

const Dashboard = () => {
  const [health, setHealth] = useState<string>('Checking...');

  useEffect(() => {
    api.get('/health')
      .then(res => setHealth(res.data.message))
      .catch(() => setHealth('Backend unreachable'));
  }, []);

  return (
    <div className="text-center mt-10">
        <h2 className="text-3xl font-bold mb-4">Welcome to eProcurement</h2>
        <div className="p-4 bg-green-50 border border-green-200 rounded text-green-800 inline-block">
            Backend Connectivity: <strong>{health}</strong>
        </div>
    </div>
  );
};

export default Dashboard;
