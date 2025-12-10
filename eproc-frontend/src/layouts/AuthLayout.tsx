import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-center text-2xl font-bold mb-6 text-gray-800">Sign In</h2>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
