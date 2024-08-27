import React, { useEffect, useRef, useState, forwardRef } from "react";
import "../css/DropdownMenu.css"; // Make sure to create this CSS file
import FileUploadPopUp from "./FileUploadPopUp"; // Import the FileUploadPopUp component

const DropdownMenu = forwardRef(({ isOpen, onClose, handleSendFile }, ref) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const dropdownMenuRef = useRef(null);

  // Handler for file input changes
  const handleFileChange = (event, fileType) => {
    const files = event.target.files;
    if (files.length > 0) {
      setSelectedFile({
        file: files[0],
        type: fileType,
      });
      setShowFileUpload(true); // Show the file upload component
      onClose(); // Close the dropdown
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <>
          <div className="dropdown-backdrop" onClick={onClose} />
          <div className="dropdown-menu show" ref={dropdownMenuRef}>
            <button
              className="dropdown-item"
              onClick={() => document.getElementById("image-upload").click()}
            >
              Photos & Videos
              <input
                type="file"
                id="image-upload"
                accept="image/*,video/*"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e, "photos and videos")}
              />
            </button>
            <button
              className="dropdown-item"
              onClick={() => document.getElementById("document-upload").click()}
            >
              Documents
              <input
                type="file"
                id="document-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e, "documents")}
              />
            </button>
            <button
              className="dropdown-item"
              onClick={() => document.getElementById("document-upload").click()}
            >
              Audio Files
              <input
                type="file"
                id="audio-upload"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e, "documents")}
              />
            </button>
            <button
              className="dropdown-item"
              onClick={() => document.getElementById("file-upload").click()}
            >
              Upload Any File
              <input
                type="file"
                id="file-upload"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e, "files")}
              />
            </button>
          </div>
        </>
      )}
      {showFileUpload && (
        <FileUploadPopUp
          file={selectedFile.file}
          onClose={() => setShowFileUpload(false)}
          handleSendFile={handleSendFile} // Pass handleSendFile prop
        />
      )}
    </>
  );
});

export default DropdownMenu;
