import React, { useState, useEffect } from "react";
import { api } from "../../common/api";
import { useDispatch } from "react-redux";
import { setFlashMessage } from "../../common/flashSlice";
import { NewTaskModal } from "./NewTaskModal";

// A helper component for the trash icon SVG (unchanged)
const TrashIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.033c-1.12 0-2.033.954-2.033 2.134v.916m7.5 0a48.667 48.667 0 00-7.5 0"
    />
  </svg>
);

// TaskItem component (unchanged)
const TaskItem = ({ task, onToggleComplete, onDelete }) => {
  return (
    <div className="group flex items-center justify-between p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <button
        onClick={() => onDelete(task.id)}
        className="text-gray-400 hover:text-red-500 transition-colors invisible group-hover:visible"
        aria-label="Delete task"
      >
        <TrashIcon />
      </button>

      <span
        className={`flex-grow px-4 ${task.completed ? "line-through text-gray-400" : "text-gray-800"}`}
      >
        {task.text}
      </span>

      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggleComplete(task.id)}
        className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
      />
    </div>
  );
};

export const TasksList = () => {
  // State Management
  const [tasks, setTasks] = useState([]); // Use an array, not an object
  const [view, setView] = useState("today"); // 'today', 'all', 'done', 'archived'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  const dispatch = useDispatch();

  // --- Data Fetching ---
  useEffect(() => {
    // This function fetches the FIRST page when the view changes.
    const fetchInitialTasks = async () => {
      setLoading(true);
      setError(null);
      setTasks([]); // Clear previous view's tasks
      setNextPageUrl(null); // Reset pagination

      try {
        const response = await api.get(`/dashboard/tasks/?view=${view}`);
        // The API now returns an object with a 'results' array.
        setTasks(response.data.results);
        // Store the URL for the next page.
        setNextPageUrl(response.data.next);
      } catch (err) {
        console.error("error in fetchTasks", err);
        setError("خطا در دریافت لیست کارها");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialTasks();
  }, [view]); // Re-run whenever the 'view' filter changes

  // --- API Handlers ---
  //  Function to load the next page of results
  const handleLoadMore = async () => {
    if (!nextPageUrl || loadingMore) {
      return; // Do nothing if there's no next page or if we are already loading
    }
    setLoadingMore(true);
    try {
      const response = await api.get(nextPageUrl);

      // Append the new tasks to the existing list
      setTasks((prevTasks) => [...prevTasks, ...response.data.results]);
      setNextPageUrl(response.data.next);
    } catch (err) {
      console.error("Error loading more tasks", err);
      setError("خطا در بارگذاری ادامه لیست");
    } finally {
      setLoadingMore(false);
    }
  };
  const handleToggleComplete = async (id) => {
    try {
      const response = await api.post(
        `/dashboard/tasks/${id}/toggle-complete/`,
      );
      // Update the specific task in the list with the response from the server
      setTasks(tasks.map((task) => (task.id === id ? response.data : task)));

      dispatch(
        setFlashMessage({
          type: "SUCCESS",
          message: `انجام شد`,
        }),
      );
    } catch (error) {
      console.error("there was an error in handleToggleComplete", error);
      dispatch(
        setFlashMessage({
          type: "ERROR",
          message: `خطا در عملیات: ${error}`,
        }),
      );
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.delete(`/dashboard/tasks/${id}/`);
      // Remove the task from the local state for immediate UI feedback
      setTasks(tasks.filter((task) => task.id !== id));

      dispatch(
        setFlashMessage({
          type: "SUCCESS",
          message: `انجام شد`,
        }),
      );
    } catch (error) {
      console.error("error in handleDeleteTask", error);

      dispatch(
        setFlashMessage({
          type: "ERROR",
          message: `خطا در حذف: ${error}`,
        }),
      );
    }
  };

  const handleAddTask = () => {
    setIsNewTaskModalOpen(true);
  };

  const handleCloseTask = () => {
    setIsNewTaskModalOpen(false);
  };

  const handleNewCreatedTask = (newTask) => {
    setTasks((prevTasks) => [newTask, ...prevTasks]);
  };

  // --- UI Components ---
  const FilterButton = ({ filterType, text }) => {
    const isActive = view === filterType;
    return (
      <button
        onClick={() => setView(filterType)} // This now triggers the useEffect
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        {text}
      </button>
    );
  };

  // --- Render Logic ---
  const renderContent = () => {
    if (loading) {
      return (
        <p className="text-center text-gray-500 p-8">در حال بارگذاری...</p>
      );
    }
    if (error) {
      return <p className="text-center text-red-500 p-8">{error}</p>;
    }
    if (tasks.length > 0) {
      return tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteTask}
        />
      ));
    }
    return (
      <p className="text-center text-gray-500 p-8">
        هیچ کاری برای نمایش وجود ندارد.
      </p>
    );
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 text-right">
          لیست کارها
        </h2>
        <div className="flex justify-end space-x-2 space-x-reverse mt-4">
          <FilterButton filterType="today" text="امروز" />
          <FilterButton filterType="all" text="همه کار ها" />
          <FilterButton filterType="done" text="انجام شده" />
          <FilterButton filterType="archived" text="بایگانی شده" />
        </div>
      </div>

      <div className="task-list">
        {renderContent()}

        {/*  Load More Button */}
        {nextPageUrl && (
          <div className="p-4 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loadingMore ? "در حال بارگذاری..." : "بارگذاری بیشتر"}
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <button
          onClick={handleAddTask}
          className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          + افزودن کار جدید
        </button>
      </div>
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={handleCloseTask}
        onTaskCreated={handleNewCreatedTask}
      />
    </div>
  );
};

export default TasksList;
