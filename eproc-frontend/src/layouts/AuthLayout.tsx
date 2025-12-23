import { Outlet } from 'react-router-dom';
import loginBg from '../assets/login-bg.png';

const AuthLayout = () => {
  return (
    <div
      className="flex items-center justify-center min-h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] hidden md:block" />
      <div className="z-10 w-full min-h-screen md:min-h-0 flex items-center justify-center md:px-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
