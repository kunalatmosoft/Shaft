'use client';

import { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Analytics = () => {
  const [dealData, setDealData] = useState({});
  const [taskData, setTaskData] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDealData();
      fetchTaskData();
    }
  }, [user]);

  const fetchDealData = async () => {
    if (!user) return;
    const q = query(collection(db, 'deals'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const deals = querySnapshot.docs.map(doc => doc.data());

    const stageData = deals.reduce((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1;
      return acc;
    }, {});

    const monthlyData = deals.reduce((acc, deal) => {
      const date = deal.createdAt.toDate();
      const monthYear = format(date, 'MMM yyyy');
      acc[monthYear] = (acc[monthYear] || 0) + parseFloat(deal.amount);
      return acc;
    }, {});

    setDealData({ stageData, monthlyData });
  };

  const fetchTaskData = async () => {
    if (!user) return;
    const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const tasks = querySnapshot.docs.map(doc => doc.data());

    const completedTasks = tasks.filter(task => task.completed).length;
    const incompleteTasks = tasks.length - completedTasks;

    setTaskData({ completed: completedTasks, incomplete: incompleteTasks });
  };

  const dealStageChartData = {
    labels: Object.keys(dealData.stageData || {}),
    datasets: [
      {
        data: Object.values(dealData.stageData || {}),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
      },
    ],
  };

  const dealMonthlyChartData = {
    labels: Object.keys(dealData.monthlyData || {}),
    datasets: [
      {
        label: 'Monthly Deal Value',
        data: Object.values(dealData.monthlyData || {}),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const taskCompletionChartData = {
    labels: ['Completed', 'Incomplete'],
    datasets: [
      {
        data: [taskData.completed, taskData.incomplete],
        backgroundColor: ['#4BC0C0', '#FF6384'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Deal Stages</h3>
          <div className="h-64">
            <Pie data={dealStageChartData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Monthly Deal Value</h3>
          <div className="h-64">
            <Bar
              data={dealMonthlyChartData}
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Deal Value ($)',
                    },
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
          <h3 className="text-xl font-semibold mb-2">Task Completion</h3>
          <div className="h-64">
            <Pie data={taskCompletionChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

