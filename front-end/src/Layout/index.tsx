import { Outlet } from 'react-router-dom';
import 'preline/preline';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

function Layout() {    
    return (
        <div className="flex h-[100vh] bg-gray-100 border">
           <main className="flex-1 sm:ml-[4rem] transition-all duration-300 h-full overflow-y-auto">
                <Sidebar/>
                <Header/>
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
