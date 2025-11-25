'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface ReviewForecastProps {
  forecast: {
    today: Array<{ hour: number; count: number; cumulative: number }>;
    week: Array<{ 
      date: Date; 
      count: number; 
      cumulative: number;
      hours: Array<{ hour: number; count: number; cumulative: number }>;
    }>;
    cardsDueNow: number;
  };
}

export function ReviewForecast({ forecast }: ReviewForecastProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0])); // Today expanded by default

  const toggleDay = (index: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedDays(newExpanded);
  };

  const formatHour = (hour: number): string => {
    if (hour === 0) return '12 am';
    if (hour < 12) return `${hour} am`;
    if (hour === 12) return '12 pm';
    return `${hour - 12} pm`;
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((dateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[date.getDay()];
  };

  const getMaxCount = (items: Array<{ count: number }>): number => {
    return Math.max(...items.map(item => item.count), 1);
  };

  const todayMax = getMaxCount(forecast.today);
  const todayHasReviews = forecast.today.some(h => h.count > 0);

  return (
    <div className="space-y-3">
      {/* Today Section */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Today</h3>
          {forecast.cardsDueNow > 0 && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-[#58CC02]">{forecast.cardsDueNow}</span>
              <span className="ml-1">due now</span>
            </div>
          )}
        </div>
        
        {todayHasReviews ? (
          <div className="space-y-2">
            {forecast.today
              .filter(item => item.count > 0)
              .map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-16 text-sm text-gray-600 font-medium">
                    {formatHour(item.hour)}
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 relative h-5 bg-gray-200 rounded overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.count / todayMax) * 100}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="h-full bg-[#58CC02] rounded"
                      />
                    </div>
                    <div className="w-12 text-right text-sm font-semibold text-gray-700">
                      +{item.count}
                    </div>
                    <div className="w-16 text-right text-sm font-semibold text-gray-800">
                      {item.cumulative}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-center py-2">
            No reviews scheduled for today
          </div>
        )}
      </div>

      {/* Week Sections */}
      <div className="space-y-2">
        {forecast.week.slice(1).map((day, index) => {
          const actualIndex = index + 1; // Skip today (index 0)
          const isExpanded = expandedDays.has(actualIndex);
          const dayMax = day.hours && day.hours.length > 0 
            ? Math.max(...day.hours.map(h => h.count), 1)
            : 1;
          
          return (
            <div key={actualIndex} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleDay(actualIndex)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="font-semibold text-gray-800 text-sm">
                    {formatDate(day.date)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {day.count > 0 && (
                    <span className="text-sm font-semibold text-gray-700">
                      +{day.count}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-gray-800 w-16 text-right">
                    {day.cumulative}
                  </span>
                </div>
              </button>
              
              <AnimatePresence>
                {isExpanded && day.hours && day.hours.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-2 border-t border-gray-100 pt-3">
                      {day.hours
                        .filter(h => h.count > 0)
                        .map((hourItem, hourIndex) => (
                          <div key={hourIndex} className="flex items-center gap-3">
                            <div className="w-16 text-sm text-gray-600 font-medium">
                              {formatHour(hourItem.hour)}
                            </div>
                            <div className="flex-1 flex items-center gap-3">
                              <div className="flex-1 relative h-5 bg-gray-200 rounded overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(hourItem.count / dayMax) * 100}%` }}
                                  transition={{ duration: 0.3, delay: hourIndex * 0.02 }}
                                  className="h-full bg-[#58CC02] rounded"
                                />
                              </div>
                              <div className="w-12 text-right text-sm font-semibold text-gray-700">
                                +{hourItem.count}
                              </div>
                              <div className="w-16 text-right text-sm font-semibold text-gray-800">
                                {hourItem.cumulative}
                              </div>
                            </div>
                          </div>
                        ))}
                      {day.hours.filter(h => h.count > 0).length === 0 && (
                        <div className="text-sm text-gray-500 text-center py-2">
                          No reviews scheduled for this day
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

