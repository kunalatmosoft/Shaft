'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';

export default function Deals() {
  const { user } = useAuth();
  const router = useRouter();
  const [deals, setDeals] = useState([]);
  const [newDeal, setNewDeal] = useState({ name: '', amount: '', stage: 'Prospecting' });
  const [editingDeal, setEditingDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchDeals();
    }
  }, [user, router]);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const dealsCollection = collection(db, 'deals');
      const dealsSnapshot = await getDocs(dealsCollection);
      setDeals(dealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      setError('Failed to fetch deals');
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingDeal) {
      setEditingDeal({ ...editingDeal, [name]: value });
    } else {
      setNewDeal({ ...newDeal, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const dealData = editingDeal || newDeal;
      const parsedAmount = parseFloat(dealData.amount);
      if (isNaN(parsedAmount)) {
        throw new Error('Invalid amount');
      }
      const dealToSave = {
        ...dealData,
        amount: parsedAmount,
        updatedAt: serverTimestamp()
      };
      if (editingDeal) {
        await updateDoc(doc(db, 'deals', editingDeal.id), dealToSave);
        setEditingDeal(null);
      } else {
        await addDoc(collection(db, 'deals'), {
          ...dealToSave,
          createdAt: serverTimestamp()
        });
        setNewDeal({ name: '', amount: '', stage: 'Prospecting' });
      }
      fetchDeals();
    } catch (error) {
      setError('Failed to save deal: ' + error.message);
    }
  };

  const handleEdit = (deal) => {
    setEditingDeal(deal);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        await deleteDoc(doc(db, 'deals', id));
        fetchDeals();
      } catch (error) {
        setError('Failed to delete deal');
      }
    }
  };

  const stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-indigo-600">Shaft</span>
              </div>
              <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/contacts" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
                  Contacts
                </Link>
                <Link href="/deals" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" aria-current="page">
                  Deals
                </Link>
                <Link href="/calendar" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
                  Calendar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Deals</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingDeal ? 'Edit Deal' : 'Add New Deal'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Deal Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={editingDeal ? editingDeal.name : newDeal.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={editingDeal ? editingDeal.amount : newDeal.amount}
                  onChange={handleInputChange}
                  required
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="stage" className="block text-sm font-medium text-gray-700">Stage</label>
                <select
                  name="stage"
                  id="stage"
                  value={editingDeal ? editingDeal.stage : newDeal.stage}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {editingDeal ? 'Update Deal' : 'Add Deal'}
              </button>
              {editingDeal && (
                <button
                  type="button"
                  onClick={() => setEditingDeal(null)}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Deal List</h2>
            {loading ? (
              <p>Loading deals...</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {deals.map((deal) => (
                  <li key={deal.id} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{deal.name}</p>
                      <p className="text-sm text-gray-500">${deal.amount}</p>
                      <p className="text-sm text-gray-500">{deal.stage}</p>
                    </div>
                    <div>
                      <button
                        onClick={() => handleEdit(deal)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(deal.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

