'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp } from 'lucide-react';

interface HeatmapCalendarProps {
  className?: string;
}

interface DayData {
  date: string;
  count: number;
  level: number; // 0-4 for intensity levels
}

export function HeatmapCalendar({ className = '' }: HeatmapCalendarProps) {
  const [visitData, setVisitData] = useState<DayData[]>([]);
  const [totalDays, setTotalDays] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    loadVisitData();
  }, []);

  const loadVisitData = () => {
    const data = localStorage.getItem('minka-visit-heatmap');
    if (data) {
      const parsed = JSON.parse(data);
      setVisitData(parsed.days || []);
      setTotalDays(parsed.totalDays || 0);
      setCurrentStreak(parsed.currentStreak || 0);
      setLongestStreak(parsed.longestStreak || 0);
    }
  };

  const recordVisit = () => {
    const today = new Date().toISOString().split('T')[0];
    const existingData = localStorage.getItem('minka-visit-heatmap');
    let data = existingData ? JSON.parse(existingData) : { days: [], totalDays: 0, currentStreak: 0, longestStreak: 0 };
    
    // Find or create today's entry
    let todayEntry = data.days.find((day: DayData) => day.date === today);
    if (todayEntry) {
      todayEntry.count += 1;
    } else {
      todayEntry = { date: today, count: 1, level: 0 };
      data.days.push(todayEntry);
    }
    
    // Calculate intensity level (0-4)
    todayEntry.level = Math.min(4, Math.floor(todayEntry.count / 2));
    
    // Calculate streaks
    const sortedDays = data.days.sort((a: DayData, b: DayData) => b.date.localeCompare(a.date));
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const todayDate = new Date(today);
    let checkDate = new Date(todayDate);
    
    // Calculate current streak
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasVisit = sortedDays.some((day: DayData) => day.date === dateStr);
      
      if (hasVisit) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    for (let i = 0; i < sortedDays.length; i++) {
      const day = sortedDays[i];
      const dayDate = new Date(day.date);
      const prevDate = new Date(dayDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevDateStr = prevDate.toISOString().split('T')[0];
      
      const hasPrevVisit = sortedDays.some((d: DayData) => d.date === prevDateStr);
      
      if (hasPrevVisit) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak + 1);
        tempStreak = 0;
      }
    }
    
    data.totalDays = data.days.length;
    data.currentStreak = currentStreak;
    data.longestStreak = longestStreak;
    
    localStorage.setItem('minka-visit-heatmap', JSON.stringify(data));
    setVisitData(data.days);
    setTotalDays(data.totalDays);
    setCurrentStreak(data.currentStreak);
    setLongestStreak(data.longestStreak);
  };

  // Record visit on component mount
  useEffect(() => {
    recordVisit();
  }, []);

  const generateCalendarDays = () => {
    const days: JSX.Element[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364); // Show last year
    
    // Create a map of visit data for quick lookup
    const visitMap = new Map<string, DayData>();
    visitData.forEach(day => {
      visitMap.set(day.date, day);
    });
    
    // Generate days for the last year
    for (let i = 0; i < 365; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      const visitDay = visitMap.get(dateStr);
      
      const level = visitDay ? visitDay.level : 0;
      const isToday = dateStr === today.toISOString().split('T')[0];
      
      // Color intensity based on level
      const colors = [
        '#ebedf0', // No activity
        '#c6e48b', // Low activity
        '#7bc96f', // Medium activity
        '#239a3b', // High activity
        '#196127'  // Very high activity
      ];
      
      days.push(
        <motion.div
          key={dateStr}
          className={`w-3 h-3 rounded-sm cursor-pointer ${
            isToday ? 'ring-1 ring-gray-400' : ''
          }`}
          style={{ backgroundColor: colors[level] }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.001 }}
          whileHover={{ scale: 1.2 }}
          title={`${dateStr}: ${visitDay ? visitDay.count : 0} visits`}
        />
      );
    }
    
    return days;
  };

  const getMonthLabels = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels: JSX.Element[] = [];
    
    for (let i = 0; i < 12; i++) {
      labels.push(
        <div key={i} className="text-xs text-gray-500 text-center">
          {months[i]}
        </div>
      );
    }
    
    return labels;
  };

  const getDayLabels = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map((day, index) => (
      <div key={index} className="text-xs text-gray-500 text-center">
        {day}
      </div>
    ));
  };

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#7B6AF5]" />
          <h3 className="text-lg font-semibold text-gray-800">Activity Heatmap</h3>
        </div>
        <div className="text-sm text-gray-500">
          Last year
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#7B6AF5]">{totalDays}</div>
          <div className="text-xs text-gray-500">Total Days</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{currentStreak}</div>
          <div className="text-xs text-gray-500">Current Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{longestStreak}</div>
          <div className="text-xs text-gray-500">Longest Streak</div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="relative">
        {/* Month labels */}
        <div className="absolute top-0 left-8 grid grid-cols-12 gap-1 w-full">
          {getMonthLabels()}
        </div>
        
        {/* Day labels */}
        <div className="absolute left-0 top-8 grid grid-rows-7 gap-1 h-full">
          {getDayLabels()}
        </div>
        
        {/* Calendar grid */}
        <div className="ml-8 mt-8 grid grid-cols-53 grid-rows-7 gap-1">
          {generateCalendarDays()}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ebedf0' }}></div>
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#c6e48b' }}></div>
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#7bc96f' }}></div>
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#239a3b' }}></div>
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#196127' }}></div>
        </div>
        <span>More</span>
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="h-4 w-4" />
          <span>Visit daily to build your learning streak!</span>
        </div>
      </div>
    </div>
  );
}
