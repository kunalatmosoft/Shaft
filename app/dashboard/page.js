'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import Link from 'next/link';
import { Loader, LogOut, Users, Calendar, DollarSign, Menu, X, Tag } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [recentContacts, setRecentContacts] = useState([]);
  const [recentDeals, setRecentDeals] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchData();
    }
  }, [user, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const contactsQuery = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'), limit(5));
      const dealsQuery = query(collection(db, 'deals'), orderBy('createdAt', 'desc'), limit(5));
      const eventsQuery = query(collection(db, 'events'), orderBy('start'), limit(5));

      const [contactsSnapshot, dealsSnapshot, eventsSnapshot] = await Promise.all([
        getDocs(contactsQuery),
        getDocs(dealsQuery),
        getDocs(eventsQuery),
      ]);

      setRecentContacts(contactsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setRecentDeals(dealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setEvents(
        eventsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            start: data.start instanceof Timestamp ? data.start.toDate() : new Date(data.start),
          };
        })
      );
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const stageColor = stage => {
    switch (stage) {
      case 'Closed Won':
        return 'bg-green-100 text-green-800';
      case 'Qualification':
        return 'bg-gray-100 text-green-800';
      case 'Proposal':
        return 'bg-teal-100 text-green-800';
      case 'Closed Lost':
        return 'bg-red-100 text-red-800';
      case 'Negotiation':
        return 'bg-yellow-100 text-yellow-800';
      case 'Prospecting':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">Shaft</span>
            </div>
            <div className="hidden sm:flex space-x-6">
              <NavItem href="/dashboard" label="Dashboard" icon />
              <NavItem href="/contacts" label="Contacts" icon={<Users />} />
              <NavItem href="/deals" label="Deals" icon={<DollarSign />} />
              <NavItem href="/calendar" label="Calendar" icon={<Calendar />} />
            </div>
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
            <div className="sm:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500 hover:text-indigo-600">
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <MobileNav>
              <NavItem href="/dashboard" label="Dashboard" icon />
              <NavItem href="/contacts" label="Contacts" icon={<Users />} />
              <NavItem href="/deals" label="Deals" icon={<DollarSign />} />
              <NavItem href="/calendar" label="Calendar" icon={<Calendar />} />
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </MobileNav>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        {loading ? (
          <Skeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="Recent Contacts" href="/contacts">
              <List items={recentContacts} icon={<Users className="text-gray-300 w-6 h-6" />} />
            </Card>
            <Card title="Recent Deals" href="/deals">
              <List items={recentDeals} deal stageColor={stageColor} />
            </Card>
            <Card title="Upcoming Events" href="/calendar">
              <List items={events} />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

const NavItem = ({ href, label, icon }) => (
  <Link href={href} className="text-gray-600 hover:text-indigo-600 flex items-center space-x-1">
    {icon}
    <span>{label}</span>
  </Link>
);

const MobileNav = ({ children }) => <div className="px-2 pt-2 pb-3 space-y-1">{children}</div>;

const Card = ({ title, children, href }) => (
  <div className="bg-white shadow rounded-lg overflow-hidden">
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        <Link href={href} className="text-indigo-600 text-sm hover:text-indigo-800">
          View all
        </Link>
      </div>
      {children}
    </div>
  </div>
);

const List = ({ items, deal = false, stageColor }) => (
  <ul className="divide-y divide-gray-200">
    {items.map(item => (
      <li key={item.id} className="py-4 flex items-center space-x-4">
        {deal && (
          <div className={`px-2 py-1 text-xs rounded-full ${stageColor(item.stage)}`}>
            {item.stage}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{item.name || item.title}</p>
          <p className="text-sm text-gray-500 truncate">
            {deal ? `$${item.amount}` : item.start?.toLocaleString()}
          </p>
        </div>
      </li>
    ))}
  </ul>
);

const Skeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="bg-gray-200 animate-pulse h-40 rounded-lg"></div>
    ))}
  </div>
);
