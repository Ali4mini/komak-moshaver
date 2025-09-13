import { useState, useRef } from "react";

const ImageUploader = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    // files is a FileList object, convert it to a standard array
    if (files && files.length > 0) {
      onFilesSelected(Array.from(files));
    }
  };

  // --- Event Handlers for Drag and Drop ---

  // 1. When a file is dragged into the drop zone
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  // 2. This is crucial to prevent the browser's default behavior (opening the file)
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 3. When a file is dragged out of the drop zone
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // 4. When a file is dropped onto the zone
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // The dropped files are in e.dataTransfer.files
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  // --- Event Handler for the regular file input click ---
  const handleFileChange = (e) => {
    const files = e.target.files;
    handleFiles(files);
  };

  // A helper function to trigger the hidden input field
  const onLabelClick = () => {
    fileInputRef.current.click();
  };

  const dropzoneClasses = `
    flex flex-col items-center justify-center w-full max-w-lg p-8 
    cursor-pointer bg-indigo-50 text-indigo-700 font-semibold rounded-lg 
    border-2 border-dashed border-indigo-300 transition-all duration-300 ease-in-out
    ${isDragging ? "border-indigo-600 bg-indigo-100 scale-105" : "hover:bg-indigo-100"}
  `;

  return (
    <div
      className={dropzoneClasses}
      onClick={onLabelClick} // Use onClick on the div instead of a label
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />

      <svg
        className="w-12 h-12 mb-3 text-indigo-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        ></path>
      </svg>

      <p className="text-center">
        {isDragging
          ? "اینجا رها کنید"
          : "عکس ها را به اینجا بکشید و یا کلیک کنید"}
      </p>
    </div>
  );
};

export default ImageUploader;
