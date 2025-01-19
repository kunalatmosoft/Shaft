'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, Timestamp, where, addDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TaskList from '@/components/TaskList';
import Analytics from '@/components/Analytics';
import { Users, DollarSign, Calendar, PlusCircle, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [recentContacts, setRecentContacts] = useState([]);
  const [recentDeals, setRecentDeals] = useState([]);
  const [events, setEvents] = useState([]);
  const [totalDealsValue, setTotalDealsValue] = useState(0);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchRecentData();
      fetchEvents();
      fetchDealStats();
    }
  }, [user, router]);

  const fetchRecentData = async () => {
    if (!user) return;
    const contactsQuery = query(
      collection(db, 'contacts'),
      where("userId", "==", user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const dealsQuery = query(
      collection(db, 'deals'),
      where("userId", "==", user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const [contactsSnapshot, dealsSnapshot] = await Promise.all([
      getDocs(contactsQuery),
      getDocs(dealsQuery),
    ]);

    setRecentContacts(contactsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setRecentDeals(dealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchEvents = async () => {
    if (!user) return;
    const eventsQuery = query(
      collection(db, 'events'),
      where("userId", "==", user.uid),
      orderBy('start'),
      limit(5)
    );
    const eventsSnapshot = await getDocs(eventsQuery);
    setEvents(eventsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        start: data.start instanceof Timestamp ? data.start.toDate() : new Date(data.start),
        end: data.end instanceof Timestamp ? data.end.toDate() : new Date(data.end),
      };
    }));
  };

  const fetchDealStats = async () => {
    if (!user) return;
    const dealsQuery = query(
      collection(db, 'deals'),
      where("userId", "==", user.uid)
    );
    const dealsSnapshot = await getDocs(dealsQuery);
    let total = 0;
    dealsSnapshot.docs.forEach(doc => {
      const deal = doc.data();
      total += parseFloat(deal.amount) || 0;
    });
    setTotalDealsValue(total);
  };

  const getStageColor = (stage) => {
    const colors = {
      'Prospecting': 'bg-blue-100 text-blue-800',
      'Qualification': 'bg-yellow-100 text-yellow-800',
      'Proposal': 'bg-orange-100 text-orange-800',
      'Negotiation': 'bg-purple-100 text-purple-800',
      'Closed Won': 'bg-green-100 text-green-800',
      'Closed Lost': 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Contacts</dt>
                      <dd className="text-3xl font-semibold text-gray-900">{recentContacts.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Deals Value</dt>
                      <dd className="text-3xl font-semibold text-gray-900">${totalDealsValue.toLocaleString()}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Events</dt>
                      <dd className="text-3xl font-semibold text-gray-900">{events.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Contacts</h2>
                <ul className="divide-y divide-gray-200">
                  {recentContacts.map((contact) => (
                    <li key={contact.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="inline-block h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                          <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </span>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                          <div className="text-sm text-gray-500">{contact.email}</div>
                        </div>
                      </div>
                      <Link href={`/contacts/${contact.id}`} className="text-indigo-600 hover:text-indigo-900">
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Deals</h2>
                <ul className="divide-y divide-gray-200">
                  {recentDeals.map((deal) => (
                    <li key={deal.id} className="py-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{deal.name}</div>
                        <div className="text-sm text-gray-500">${(deal.amount || 0).toLocaleString()}</div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStageColor(deal.stage)}`}>
                          {deal.stage}
                        </span>
                      </div>
                      <Link href={`/deals/${deal.id}`} className="text-indigo-600 hover:text-indigo-900">
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <Analytics />
        </div>
      </main>
    </div>
  );
}







/* 'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, Timestamp, where, addDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { Users, DollarSign, Calendar, PlusCircle, ArrowRight, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [recentContacts, setRecentContacts] = useState([]);
  const [recentDeals, setRecentDeals] = useState([]);
  const [events, setEvents] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', email: '' });
  const [newDeal, setNewDeal] = useState({ name: '', amount: '', stage: 'Prospecting' });
  const [showContactForm, setShowContactForm] = useState(false);
  const [showDealForm, setShowDealForm] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchRecentData();
      fetchEvents();
    }
  }, [user, router]);

  const fetchRecentData = async () => {
    if (!user) return;
    const contactsQuery = query(
      collection(db, 'contacts'),
      where("userId", "==", user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const dealsQuery = query(
      collection(db, 'deals'),
      where("userId", "==", user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const [contactsSnapshot, dealsSnapshot] = await Promise.all([
      getDocs(contactsQuery),
      getDocs(dealsQuery),
    ]);

    setRecentContacts(contactsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setRecentDeals(dealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchEvents = async () => {
    if (!user) return;
    const eventsQuery = query(
      collection(db, 'events'),
      where("userId", "==", user.uid),
      orderBy('start'),
      limit(5)
    );
    const eventsSnapshot = await getDocs(eventsQuery);
    setEvents(eventsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        start: data.start instanceof Timestamp ? data.start.toDate() : new Date(data.start),
        end: data.end instanceof Timestamp ? data.end.toDate() : new Date(data.end),
      };
    }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleNewContactSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'contacts'), {
        ...newContact,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewContact({ name: '', email: '' });
      setShowContactForm(false);
      fetchRecentData();
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const handleNewDealSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'deals'), {
        ...newDeal,
        userId: user.uid,
        amount: parseFloat(newDeal.amount),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewDeal({ name: '', amount: '', stage: 'Prospecting' });
      setShowDealForm(false);
      fetchRecentData();
    } catch (error) {
      console.error('Error adding deal:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <LogOut className="mr-2" size={18} />
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Contacts</dt>
                        <dd className="text-3xl font-semibold text-gray-900">{recentContacts.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link href="/contacts" className="font-medium text-indigo-600 hover:text-indigo-500">View all<span className="sr-only"> contacts</span></Link>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Deals</dt>
                        <dd className="text-3xl font-semibold text-gray-900">{recentDeals.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link href="/deals" className="font-medium text-indigo-600 hover:text-indigo-500">View all<span className="sr-only"> deals</span></Link>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Events</dt>
                        <dd className="text-3xl font-semibold text-gray-900">{events.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link href="/calendar" className="font-medium text-indigo-600 hover:text-indigo-500">View calendar</Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Recent Contacts</h2>
                    <button
                      onClick={() => setShowContactForm(!showContactForm)}
                      className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      <PlusCircle className="mr-1" size={16} />
                      Add Contact
                    </button>
                  </div>
                  {showContactForm && (
                    <form onSubmit={handleNewContactSubmit} className="mb-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Name"
                          value={newContact.name}
                          onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={newContact.email}
                          onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="mt-3 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Add Contact
                      </button>
                    </form>
                  )}
                  <ul className="divide-y divide-gray-200">
                    {recentContacts.map((contact) => (
                      <li key={contact.id} className="py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <span className="inline-block h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                              <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                            <div className="text-sm text-gray-500">{contact.email}</div>
                          </div>
                        </div>
                        <Link href={`/contacts/${contact.id}`} className="text-indigo-600 hover:text-indigo-900">
                          View
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Recent Deals</h2>
                    <button
                      onClick={() => setShowDealForm(!showDealForm)}
                      className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      <PlusCircle className="mr-1" size={16} />
                      Add Deal
                    </button>
                  </div>
                  {showDealForm && (
                    <form onSubmit={handleNewDealSubmit} className="mb-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Deal Name"
                          value={newDeal.name}
                          onChange={(e) => setNewDeal({...newDeal, name: e.target.value})}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                        <input
                          type="number"
                          placeholder="Amount"
                          value={newDeal.amount}
                          onChange={(e) => setNewDeal({...newDeal, amount: e.target.value})}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                        <select
                          value={newDeal.stage}
                          onChange={(e) => setNewDeal({...newDeal, stage: e.target.value})}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        >
                          <option value="Prospecting">Prospecting</option>
                          <option value="Qualification">Qualification</option>
                          <option value="Proposal">Proposal</option>
                          <option value="Negotiation">Negotiation</option>
                          <option value="Closed Won">Closed Won</option>
                          <option value="Closed Lost">Closed Lost</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="mt-3 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Add Deal
                      </button>
                    </form>
                  )}
                  <ul className="divide-y divide-gray-200">
                    {recentDeals.map((deal) => (
                      <li key={deal.id} className="py-4 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{deal.name}</div>
                          <div className="text-sm text-gray-500">${deal.amount} - {deal.stage}</div>
                        </div>
                        <Link href={`/deals/${deal.id}`} className="text-indigo-600 hover:text-indigo-900">
                          View
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Events</h2>
                <ul className="divide-y divide-gray-200">
                  {events.map((event) => (
                    <li key={event.id} className="py-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        <div className="text-sm text-gray-500">{event.start.toLocaleString()}</div>
                      </div>
                      <Link href="/calendar" className="text-indigo-600 hover:text-indigo-900">
                        <Calendar className="h-5 w-5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
 */

/* 'use client';

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
      {/* Navbar 
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

      {/* Main Content 
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
 */