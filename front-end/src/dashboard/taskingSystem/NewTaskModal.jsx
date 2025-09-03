import React, { useState, useEffect } from "react";
import { api } from "../../common/api";
import CustomDatePicker from "../../common/datePicker";

// A helper X-icon for the close button
const XIcon = ({ className = "w-6 h-6" }) => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export const NewTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState(null); // Use null for the initial date state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setText("");
      setDueDate(null);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!text.trim()) {
      setError("عنوان کار نمی‌تواند خالی باشد.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload = {
      text: text,
      due_date: dueDate, // Send dueDate (it will be null or a date string)
    };

    try {
      const response = await api.post("/dashboard/tasks/", payload);
      onTaskCreated(response.data);
      onClose();
    } catch (err) {
      console.error("Failed to create task", err);
      setError("خطا در ثبت کار جدید. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Backdrop
    <div
      // 2. Add blur effect and click handler to the backdrop
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center backdrop-blur-sm"
      onClick={onClose} // <-- 3. This closes the modal when the backdrop is clicked
      aria-modal="true"
      role="dialog"
    >
      {/* Modal Panel */}
      <div
        // 3. Stop click propagation so clicks inside the modal don't close it
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 z-50"
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              ثبت کار جدید
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close modal"
            >
              <XIcon />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div>
              <label
                htmlFor="task-text"
                className="block text-sm font-medium text-gray-700 text-right mb-1"
              >
                عنوان کار
              </label>
              <input
                type="text"
                id="task-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-right"
                placeholder="مثال: تماس با مشتری"
                required
              />
            </div>
            {/* 1. Date Picker Integration */}
            <div className="flex justify-between items-center">
              <label
                htmlFor="due-date"
                className="block text-sm font-medium text-gray-700 text-right"
              >
                تاریخ انجام
              </label>
              <CustomDatePicker setter={setDueDate} />
            </div>
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end items-center p-4 bg-gray-50 border-t border-gray-200 space-x-3 space-x-reverse rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "در حال ذخیره..." : "ذخیره کردن"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
