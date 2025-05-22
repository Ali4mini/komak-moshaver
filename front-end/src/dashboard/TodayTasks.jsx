import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from "../common/api";

import CustomDatePicker from "../common/datePicker";


// --- Reusable UI Components (can be moved to separate files if used elsewhere) ---
const WidgetCard = ({ title, children, className = "" }) => (
  <div className={`bg-white shadow-lg rounded-xl p-6 md:p-8 flex flex-col ${className}`}>
    <h2 className="text-xl lg:text-2xl font-semibold text-gray-700 mb-5 md:mb-6">{title}</h2>
    {children}
  </div>
);

const TaskItem = ({ task, onToggleComplete, onArchive }) => (
  <li className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0 group">
    <div className="flex items-center">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggleComplete(task.id)}
        className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-4"
        style={{ accentColor: '#2563eb' }}
      />
      <span className={`text-base ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
        {task.text}
      </span>
    </div>
    <div className="flex items-center space-x-reverse space-x-2">
        {task.completed && <span className="text-xs text-green-500">انجام شد!</span>}
        <button
            onClick={() => onArchive(task.id)}
            title="بایگانی کردن وظیفه"
            className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm p-1"
        >
            X {/* Archive icon */}
        </button>
    </div>
  </li>
);

// --- TodayTasks Component ---
const TodayTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const initialDate = new Date().toISOString().split("T")[0];
  const [newTaskDueDate, setNewTaskDueDate] = useState(initialDate); // For YYYY-MM-DD format
  const newTaskInputRef = useRef(null);

  const selectClasses = "block w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center";
  // --- API Calls ---
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // The default GET /api/tasks/ from the backend already filters for today's non-archived tasks
      const response = await api.get(`dashboard/tasks/`);
      setTasks(response.data.results || response.data); // Handle pagination if present
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err.response?.data?.detail || err.message || "خطا در بارگیری وظایف");
       if (err.response && err.response.status === 401) {
         setError("نشست شما منقضی شده یا معتبر نیست. لطفاً دوباره وارد شوید.");
         // Optionally, redirect to login: window.location.href = '/login';
       }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggleComplete = async (taskId) => {
    const originalTasks = [...tasks];
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Optimistic update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));

    try {
      // Using the custom action is cleaner if `toggle-complete` only updates 'completed'
      await api.post(`dashboard/tasks/${taskId}/toggle-complete/`);
      // No need to re-fetch, backend confirms the toggle. If backend returns updated task:
      // const response = await api.post(`${API_BASE_URL}/tasks/${taskId}/toggle-complete/`);
      // setTasks(tasks.map(t => t.id === taskId ? response.data : t));
    } catch (err) {
      console.error("Error toggling task:", err);
      setError("خطا در بروزرسانی وظیفه");
      setTasks(originalTasks); // Revert on error
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (newTaskText.trim() === '') return;

    const taskData = {
      text: newTaskText.trim(),
      due_date: newTaskDueDate || null, // Send null if empty
    };

    try {
      const response = await api.post(`dashboard/tasks/`, taskData);
      setTasks([response.data, ...tasks]); // Add new task to the beginning
      handleCloseModal();
    } catch (err) {
      console.error("Error adding task:", err);
      setError(err.response?.data?.text?.[0] || err.response?.data?.detail || "خطا در افزودن وظیفه");
    }
  };

  const handleArchiveTask = async (taskId) => {
    const originalTasks = [...tasks];
    // Optimistic update: remove from current view
    setTasks(tasks.filter(t => t.id !== taskId));
    try {
      await api.post(`dashboard/tasks/${taskId}/archive/`);
      // Optionally, show a success message
    } catch (err) {
      console.error("Error archiving task:", err);
      setError("خطا در بایگانی وظیفه");
      setTasks(originalTasks); // Revert
    }
  };

  // --- Modal Logic ---
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (isModalOpen && newTaskInputRef.current) {
      newTaskInputRef.current.focus();
    }
  }, [isModalOpen]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewTaskText('');
    setNewTaskDueDate('');
  };

  // --- Rendering Logic ---
  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  if (isLoading) {
    return (
      <WidgetCard title="وظایف امروز" className="h-full">
        <div className="flex-grow flex items-center justify-center text-gray-500">
          در حال بارگیری وظایف...
        </div>
      </WidgetCard>
    );
  }


  return (
    <>
      <WidgetCard title="وظایف امروز" className="h-full min-h-[400px]"> {/* Added min-h for better layout when empty */}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
        <div className="flex-grow overflow-hidden">
          {tasks.length > 0 ? (
            <ul className="space-y-1 mb-6 overflow-y-auto max-h-[280px] md:max-h-[320px] pr-1">
              {pendingTasks.length > 0 && pendingTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onArchive={handleArchiveTask}
                />
              ))}
              {pendingTasks.length === 0 && tasks.length > 0 && (
                 <p className="text-gray-500 text-center py-6">هیچ وظیفه فعالی ندارید. عالی!</p>
              )}
              {completedTasks.length > 0 && pendingTasks.length > 0 && (
                <li className="pt-4 mt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">انجام شده‌ها</h3>
                </li>
              )}
              {completedTasks.map((task) => (
                 <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onArchive={handleArchiveTask}
                />
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 py-4 text-center flex-grow flex items-center justify-center">
              هیچ وظیفه‌ای برای امروز ثبت نشده است.
            </p>
          )}
        </div>
        <button
          onClick={handleOpenModal}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-150 mt-auto"
        >
          + افزودن وظیفه جدید
        </button>
      </WidgetCard>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
          onClick={handleCloseModal} // Close on overlay click
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all"
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside modal
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">ثبت وظیفه جدید</h3>
            <form onSubmit={handleAddTask}>
              <div className="mb-4">
                <label htmlFor="taskText" className="block text-sm font-medium text-gray-700 mb-1">عنوان وظیفه</label>
                <input
                  id="taskText"
                  ref={newTaskInputRef}
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="مثال: تماس با مشتری"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="taskDueDate" className="block text-sm font-medium text-gray-700 mb-1">تاریخ سررسید (اختیاری)</label>
                <CustomDatePicker date={newTaskDueDate} setter={setNewTaskDueDate} inputClassName={selectClasses} />
                 <p className="text-xs text-gray-500 mt-1">اگر خالی بگذارید، به عنوان وظیفه عمومی امروز در نظر گرفته می‌شود.</p>
              </div>
              <div className="flex justify-end space-x-reverse space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TodayTasks;
