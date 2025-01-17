'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Modal from './Modal.js';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const eventsCollection = collection(db, 'events');
    const eventsQuery = query(eventsCollection, orderBy('start'));
    const eventsSnapshot = await getDocs(eventsQuery);
    const eventsList = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      start: doc.data().start.toDate(),
      end: doc.data().end.toDate(),
    }));
    setEvents(eventsList);
  };

  const handleDateClick = (arg) => {
    setSelectedDate(arg.date);
    setNewEvent({ title: '', start: arg.date, end: arg.date });
    setShowModal(true);
  };

  const handleEventClick = (clickInfo) => {
    if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      deleteEvent(clickInfo.event.id);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setNewEvent({ title: '', start: '', end: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newEvent.title) {
      await addEvent(newEvent);
      handleModalClose();
    }
  };

  const addEvent = async (event) => {
    try {
      const docRef = await addDoc(collection(db, 'events'), {
        title: event.title,
        start: Timestamp.fromDate(new Date(event.start)),
        end: Timestamp.fromDate(new Date(event.end)),
      });
      setEvents([...events, { ...event, id: docRef.id }]);
    } catch (error) {
      console.error('Error adding event: ', error);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
      setEvents(events.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error removing event: ', error);
    }
  };

  const handleEventDrop = async (dropInfo) => {
    try {
      const eventDoc = doc(db, 'events', dropInfo.event.id);
      await updateDoc(eventDoc, {
        start: Timestamp.fromDate(dropInfo.event.start),
        end: Timestamp.fromDate(dropInfo.event.end),
      });
      fetchEvents(); // Refresh events from the database
    } catch (error) {
      console.error('Error updating event: ', error);
    }
  };

  return (
    <div className='calendar-container'>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        initialView='dayGridMonth'
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
      />
      {showModal && (
        <Modal onClose={handleModalClose}>
          <h2 className="text-xl font-bold mb-4">Add New Event</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newEvent.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="start" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="datetime-local"
                id="start"
                name="start"
                value={newEvent.start instanceof Date ? newEvent.start.toISOString().slice(0, 16) : newEvent.start}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="end" className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="datetime-local"
                id="end"
                name="end"
                value={newEvent.end instanceof Date ? newEvent.end.toISOString().slice(0, 16) : newEvent.end}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Event
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
