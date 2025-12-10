"use client";

import React, { useState, useEffect } from 'react';

interface CalendarEntry {
  date: string;
  habits: Array<{
    id: number;
    title: string;
    completed: boolean;
    date: string;
  }>;
  nutrition: Array<{
    id: number;
    name: string;
    calories: number;
    quantity: number;
    serving_size?: string;
    date: string;
  }>;
}

interface CalendarData {
  [date: string]: CalendarEntry;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<CalendarEntry | null>(null);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

      const response = await fetch(`/api/calendar?year=${year}&month=${month}`);

      if (!response.ok) {
        throw new Error('Failed to fetch calendar data');
      }

      const data = await response.json();
      setCalendarData(data.calendarData || {});
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setError('Failed to load calendar data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getDayData = (day: number) => {
    const dateKey = formatDateKey(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    return calendarData[dateKey] || { date: dateKey, habits: [], nutrition: [] };
  };

  const handleDaySelect = (day: number) => {
    const data = getDayData(day);
    setSelectedDay(data);
  };

  const formatDisplayDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="calendar-page">
        <div className="loading-spinner">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <h1 className="page-t">Activity Calendar</h1>
        <div className="calendar-navigation">
          <button
            className="btn btn-secondary"
            onClick={() => navigateMonth('prev')}
          >
            ← Previous
          </button>
          <h2 className="calendar-month">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            className="btn btn-secondary"
            onClick={() => navigateMonth('next')}
          >
            Next →
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="calendar-container">
        {/* Day headers */}
        <div className="calendar-grid">
          {dayNames.map(day => (
            <div key={day} className="calendar-header-cell">
              {day}
            </div>
          ))}

          {/* Empty cells for days before the first day of the month */}
          {Array.from({ length: startingDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} className="calendar-cell empty"></div>
          ))}

          {/* Calendar days */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayData = getDayData(day);
            const hasActivity = dayData.habits.length > 0 || dayData.nutrition.length > 0;
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            return (
              <div
                key={day}
                className={`calendar-cell ${hasActivity ? 'has-activity' : ''} ${isToday ? 'today' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => handleDaySelect(day)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleDaySelect(day);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="calendar-day-number">{day}</div>
                <div className="calendar-day-content">
                  {dayData.habits.length > 0 && (
                    <div className="activity-indicator habits">
                      <span className="activity-count">{dayData.habits.length}</span>
                      <span className="activity-label">habits</span>
                    </div>
                  )}
                  {dayData.nutrition.length > 0 && (
                    <div className="activity-indicator nutrition">
                      <span className="activity-count">{dayData.nutrition.length}</span>
                      <span className="activity-label">meals</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="activity-indicator habits legend-sample"></div>
          <span>Habit Completions</span>
        </div>
        <div className="legend-item">
          <div className="activity-indicator nutrition legend-sample"></div>
          <span>Nutrition Logged</span>
        </div>
        <div className="legend-item">
          <div className="today-indicator"></div>
          <span>Today</span>
        </div>
      </div>

      {selectedDay && (
        <div className="glass-card" style={{ marginTop: '1rem' }}>
          <div className="preview-h" style={{ alignItems: 'center' }}>
            <h3 className="pantry-title" style={{ marginBottom: 0 }}>{formatDisplayDate(selectedDay.date)}</h3>
            <button className="btng" onClick={() => setSelectedDay(null)} style={{ fontSize: '0.9rem' }}>
              Close
            </button>
          </div>

          <div className="activity-details" style={{ maxHeight: '260px', overflowY: 'auto' }}>
            {selectedDay.habits.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <h4 className="activity-title" style={{ marginBottom: '0.4rem' }}>Habits</h4>
                <ul className="activity-list">
                  {selectedDay.habits.map((habit) => (
                    <li key={habit.id} className="activity-day">
                      <div className="activity-count">{habit.title}</div>
                      <span className="activity-badge habits">{habit.completed ? 'Completed' : 'Pending'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedDay.nutrition.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <h4 className="activity-title" style={{ marginBottom: '0.4rem' }}>Nutrition</h4>
                <ul className="activity-list">
                  {selectedDay.nutrition.map((entry) => (
                    <li key={entry.id} className="activity-day">
                      <div className="activity-count">{entry.name}</div>
                      <span className="activity-badge nutrition">{entry.calories} kcal</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedDay.habits.length === 0 && selectedDay.nutrition.length === 0 && (
              <p className="error-text" style={{ marginTop: '0.5rem' }}>No activity logged for this date.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}