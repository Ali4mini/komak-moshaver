import React, { useState, useEffect, useRef, useCallback } from 'react';
// Import Link from react-router-dom is still necessary
import { Link } from 'react-router-dom';
import { api } from "../common/api";
import CustomDatePicker from "../common/datePicker";

// The TaskTextRenderer component is no longer needed and has been removed.

// --- Reusable UI Components ---
const WidgetCard = ({ title, children, className = "" }) => (
  <div className={`bg-white shadow-lg rounded-xl p-6 md:p-8 flex flex-col ${className}`}>
    <h2 className="text-xl lg:text-2xl font-semibold text-gray-700 mb-5 md:mb-6">{title}</h2>
    {children}
  </div>
);

// --- UPDATED TaskItem Component ---
const TaskItem = ({ task, onToggleComplete, onArchive }) => (
  <li className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0 group">
    {/* The main task info */}
    <div className="flex items-center">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggleComplete(task.id)}
        className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-4"
        style={{ accentColor: '#2563eb' }}
      />
      {/* The text is now rendered simply, without the link inside it */}
      <span className={`text-base ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
        {task.text}
      </span>
    </div>

    {/* Action buttons on the right side */}
    <div className="flex items-center space-x-reverse space-x-3">
      {task.completed && !task.is_archived && <span className="text-xs text-green-500">انجام شد!</span>}
      
      {/* --- NEW: Icon Link for Related Object --- */}
      {/* This block conditionally renders the icon link */}
      {task.related_object && task.related_object.url && (
        <Link
          to={task.related_object.url}
          title="مشاهده فایل مرتبط"
          className="text-gray-400 hover:text-blue-600 transition-colors"
          // Prevent the checkbox from toggling when clicking the icon
          onClick={(e) => e.stopPropagation()}
        >
          {/* A simple, self-contained SVG icon for "external link" */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
        </Link>
      )}

      {!task.is_archived && (
          <button
              onClick={() => onArchive(task.id)}
              title="بایگانی کردن وظیفه"
              className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm p-1"
          >
              X
          </button>
      )}
    </div>
  </li>
);


// --- Main TasksWidget Component (no changes needed) ---
const TasksWidget = () => {
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState('today');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const newTaskInputRef = useRef(null);
  
  const selectClasses = "block w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center";

  const sortTasks = (tasksArray) => {
    return [...tasksArray].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.due_date && !b.due_date) return -1;
      if (!a.due_date && b.due_date) return 1;
      if (a.due_date && b.due_date) {
        const dateA = new Date(a.due_date);
        const dateB = new Date(b.due_date);
        if (dateA !== dateB) return dateA - dateB;
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });
  };

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`dashboard/tasks/?view=${view}`);
      setTasks(response.data.results || response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "خطا در بارگیری وظایف");
    } finally {
      setIsLoading(false);
    }
  }, [view]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggleComplete = async (taskId) => {
    const originalTasks = [...tasks];
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(sortTasks(updatedTasks));
    try {
      await api.post(`dashboard/tasks/${taskId}/toggle-complete/`);
    } catch (err) {
      setError("خطا در بروزرسانی وظیفه");
      setTasks(originalTasks);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const taskData = { text: newTaskText.trim(), due_date: newTaskDueDate || null };
    try {
      await api.post(`dashboard/tasks/`, taskData);
      fetchTasks();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.text?.[0] || "خطا در افزودن وظیفه");
    }
  };

  const handleArchiveTask = async (taskId) => {
    const originalTasks = [...tasks];
    setTasks(tasks.filter(t => t.id !== taskId));
    try {
      await api.post(`dashboard/tasks/${taskId}/archive/`);
    } catch (err) {
      setError("خطا در بایگانی وظیفه");
      setTasks(originalTasks);
    }
  };

  const handleOpenModal = () => setIsModalOpen(true);
  useEffect(() => {
    if (isModalOpen) newTaskInputRef.current?.focus();
  }, [isModalOpen]);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewTaskText('');
    setNewTaskDueDate('');
  };

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const viewTitles = { today: 'وظایف امروز', upcoming: 'وظایف پیش رو', all: 'تمام وظایف', archived: 'بایگانی شده' };

  return (
    <>
      <WidgetCard title={viewTitles[view]} className="h-full min-h-[450px]">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
        
        <div className="flex border-b border-gray-200 mb-4">
          {Object.entries(viewTitles).map(([key, title]) => (
            <button key={key} onClick={() => setView(key)} className={`px-3 sm:px-4 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none ${view === key ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {title}
            </button>
          ))}
        </div>

        <div className="flex-grow overflow-hidden">
          {isLoading ? (
             <div className="flex-grow flex items-center justify-center text-gray-500">در حال بارگیری...</div>
          ) : tasks.length > 0 ? (
            <ul className="space-y-1 mb-6 overflow-y-auto max-h-[280px] md:max-h-[320px] pr-1">
              {pendingTasks.map((task) => <TaskItem key={task.id} task={task} onToggleComplete={handleToggleComplete} onArchive={handleArchiveTask}/>)}
              {completedTasks.length > 0 && pendingTasks.length > 0 && (
                 <li className="pt-4 mt-4 border-t border-gray-200"><h3 className="text-sm font-semibold text-gray-500 mb-2">انجام شده‌ها</h3></li>
              )}
              {completedTasks.map((task) => <TaskItem key={task.id} task={task} onToggleComplete={handleToggleComplete} onArchive={handleArchiveTask}/>)}
            </ul>
          ) : (
            <p className="text-gray-500 py-4 text-center flex-grow flex items-center justify-center">هیچ وظیفه‌ای در این دسته‌بندی وجود ندارد.</p>
          )}
        </div>
        
        <button onClick={handleOpenModal} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-150 mt-auto">
          + افزودن وظیفه جدید
        </button>
      </WidgetCard>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">ثبت وظیفه جدید</h3>
            <form onSubmit={handleAddTask}>
              <div className="mb-4">
                <label htmlFor="taskText" className="block text-sm font-medium text-gray-700 mb-1">عنوان وظیفه</label>
                <input id="taskText" ref={newTaskInputRef} type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="مثال: تماس با مشتری" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div className="mb-6">
                <label htmlFor="taskDueDate" className="block text-sm font-medium text-gray-700 mb-1">تاریخ سررسید (اختیاری)</label>
                <CustomDatePicker date={newTaskDueDate} setter={setNewTaskDueDate} inputClassName={selectClasses} />
                 <p className="text-xs text-gray-500 mt-1">اگر خالی بگذارید، به عنوان وظیفه عمومی امروز در نظر گرفته می‌شود.</p>
              </div>
              <div className="flex justify-end space-x-reverse space-x-3">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">انصراف</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">ذخیره</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TasksWidget;
