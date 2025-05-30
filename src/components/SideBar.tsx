import { useAuth } from "@/contexts/AuthContext";
import { Activity, Inbox, LogOut, Mail, Send, UserCircle } from "lucide-react";
import Link from 'next/link';
import { usePathname, useRouter } from "next/navigation";

// Komponen Sidebar
const Sidebar = ({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const navItems = [
        { href: '/', label: 'Kotak Masuk', icon: Inbox },
        { href: '/sent', label: 'Surat Terkirim', icon: Send },
        { href: '/activity', label: 'Log Aktivitas', icon: Activity },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
            >
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b">
                        <Link href="/" className="flex items-center space-x-2">
                            <Mail className="w-8 h-8 text-blue-500"/>
                                {/* <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" className='text-slate-500'/>
                            </svg> */}
                            <span className="text-2xl font-bold text-blue-500">MailApp</span>
                        </Link>
                    </div>

                    <nav className="flex-grow p-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={isOpen && window.innerWidth < 1024 ? toggleSidebar : undefined}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-150 ease-in-out
                  ${pathname === item.href
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'text-slate-700 hover:bg-gray-300 hover:text-textPrimary'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t mt-auto">
                        {user && (
                            <div className="flex items-center space-x-3 mb-4">
                                <UserCircle className="w-10 h-10 text-gray-700" />
                                <div>
                                    <p className="font-semibold text-sm text-gray-700">{user.nama}</p>
                                    <p className="text-xs text-gray-600">{user.email}</p>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-red-600 bg-red-100 hover:bg-red-300 hover:text-slate-100 transition-colors duration-150 ease-in-out"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Keluar</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;