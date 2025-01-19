'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const fetchedTasks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setTasks(fetchedTasks);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;
    
    const taskData = {
      title: newTask,
      completed: false,
      userId: user.uid,
      createdAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'tasks'), taskData);
    setTasks([{ id: docRef.id, ...taskData }, ...tasks]);
    setNewTask('');
  };

  const toggleTask = async (id) => {
    const taskToToggle = tasks.find(task => task.id === id);
    await updateDoc(doc(db, 'tasks', id), {
      completed: !taskToToggle.completed
    });
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = async (id) => {
    await deleteDoc(doc(db, 'tasks', id));
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Tasks</h2>
      <form onSubmit={addTask} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task"
            className="flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Task
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-3 bg-white shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </span>
            </div>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;

