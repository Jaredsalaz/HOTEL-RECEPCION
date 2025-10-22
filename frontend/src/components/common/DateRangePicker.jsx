import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiCalendar } from 'react-icons/fi';

/**
 * DateRangePicker Component - Selector de rango de fechas
 * @param {Date} startDate - Fecha de inicio
 * @param {Date} endDate - Fecha de fin
 * @param {function} onStartDateChange - Callback para fecha de inicio
 * @param {function} onEndDateChange - Callback para fecha de fin
 * @param {string} startLabel - Label para fecha de inicio
 * @param {string} endLabel - Label para fecha de fin
 * @param {Date[]} excludedDates - Array de fechas a excluir (reservadas)
 * @param {Date[]} highlightedDates - Array de fechas a resaltar
 */
const DateRangePicker = ({ 
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startLabel = 'Check-in',
  endLabel = 'Check-out',
  minDate = new Date(),
  excludedDates = [],
  highlightedDates = [],
  className = ''
}) => {
  return (
    <div className={`flex flex-col md:flex-row gap-4 ${className}`}>
      {/* Fecha de inicio */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {startLabel}
        </label>
        <div className="relative">
          <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
          <DatePicker
            selected={startDate}
            onChange={onStartDateChange}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            minDate={minDate}
            excludeDates={excludedDates}
            highlightDates={highlightedDates}
            dateFormat="dd/MM/yyyy"
            placeholderText="Seleccionar fecha"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Fecha de fin */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {endLabel}
        </label>
        <div className="relative">
          <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
          <DatePicker
            selected={endDate}
            onChange={onEndDateChange}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate || minDate}
            excludeDates={excludedDates}
            highlightDates={highlightedDates}
            dateFormat="dd/MM/yyyy"
            placeholderText="Seleccionar fecha"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;
