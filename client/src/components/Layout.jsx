import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-dark-950">
      <div className="bg-mesh" />
      <Sidebar />
      <main className="ml-64 min-h-screen p-8 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
