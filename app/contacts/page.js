'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, where } from 'firebase/firestore';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Contacts() {
  const { user } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' });
  const [editingContact, setEditingContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchContacts();
    }
  }, [user, router]);

  const fetchContacts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const contactsCollection = collection(db, 'contacts');
      const contactsQuery = query(contactsCollection, where("userId", "==", user.uid));
      const contactsSnapshot = await getDocs(contactsQuery);
      setContacts(contactsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      setError('Failed to fetch contacts');
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingContact) {
      setEditingContact({ ...editingContact, [name]: value });
    } else {
      setNewContact({ ...newContact, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    try {
      if (editingContact) {
        await updateDoc(doc(db, 'contacts', editingContact.id), {
          ...editingContact,
          updatedAt: serverTimestamp()
        });
        setEditingContact(null);
      } else {
        await addDoc(collection(db, 'contacts'), {
          ...newContact,
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setNewContact({ name: '', email: '', phone: '' });
      }
      fetchContacts();
    } catch (error) {
      setError('Failed to save contact');
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
  };

  const handleDelete = async (id) => {
    if (!user) return;
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteDoc(doc(db, 'contacts', id));
        fetchContacts();
      } catch (error) {
        setError('Failed to delete contact');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
<Navbar/>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Contacts</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingContact ? 'Edit Contact' : 'Add New Contact'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={editingContact ? editingContact.name : newContact.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={editingContact ? editingContact.email : newContact.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={editingContact ? editingContact.phone : newContact.phone}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {editingContact ? 'Update Contact' : 'Add Contact'}
              </button>
              {editingContact && (
                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
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
            <h2 className="text-lg font-medium text-gray-900 mb-4">Contact List</h2>
            {loading ? (
              <p>Loading contacts...</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <li key={contact.id} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.email}</p>
                      <p className="text-sm text-gray-500">{contact.phone}</p>
                    </div>
                    <div>
                      <button
                        onClick={() => handleEdit(contact)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
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



/* 'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';

export default function Contacts() {
  const { user } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' });
  const [editingContact, setEditingContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchContacts();
    }
  }, [user, router]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const contactsCollection = collection(db, 'contacts');
      const contactsSnapshot = await getDocs(contactsCollection);
      setContacts(contactsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      setError('Failed to fetch contacts');
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingContact) {
      setEditingContact({ ...editingContact, [name]: value });
    } else {
      setNewContact({ ...newContact, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingContact) {
        await updateDoc(doc(db, 'contacts', editingContact.id), {
          ...editingContact,
          updatedAt: serverTimestamp()
        });
        setEditingContact(null);
      } else {
        await addDoc(collection(db, 'contacts'), {
          ...newContact,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setNewContact({ name: '', email: '', phone: '' });
      }
      fetchContacts();
    } catch (error) {
      setError('Failed to save contact');
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteDoc(doc(db, 'contacts', id));
        fetchContacts();
      } catch (error) {
        setError('Failed to delete contact');
      }
    }
  };

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
                <Link href="/contacts" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" aria-current="page">
                  Contacts
                </Link>
                <Link href="/deals" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Contacts</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingContact ? 'Edit Contact' : 'Add New Contact'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={editingContact ? editingContact.name : newContact.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={editingContact ? editingContact.email : newContact.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={editingContact ? editingContact.phone : newContact.phone}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {editingContact ? 'Update Contact' : 'Add Contact'}
              </button>
              {editingContact && (
                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
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
            <h2 className="text-lg font-medium text-gray-900 mb-4">Contact List</h2>
            {loading ? (
              <p>Loading contacts...</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <li key={contact.id} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.email}</p>
                      <p className="text-sm text-gray-500">{contact.phone}</p>
                    </div>
                    <div>
                      <button
                        onClick={() => handleEdit(contact)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
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
 */