import React, { useState, useEffect } from "react";
import "../css/VideoPlayer.css"; // Import the CSS file

function VideoPlayer({ videoSrc, isOpen, onClose, fileName }) {
  const [modalIsOpen, setModalIsOpen] = useState(isOpen);
  const [downloadUrl, setDownloadUrl] = useState("");
  console.log(videoSrc);

  // Update the modal state when the isOpen prop changes
  useEffect(() => {
    setModalIsOpen(isOpen);
  }, [isOpen]);

  // Handle blob URL conversion
  useEffect(() => {
    if (videoSrc && videoSrc instanceof Blob) {
      const url = URL.createObjectURL(videoSrc);
      setDownloadUrl(url);
      return () => URL.revokeObjectURL(url); // Clean up
    } else {
      setDownloadUrl(videoSrc);
    }
  }, [videoSrc]);

  const closeModal = () => {
    setModalIsOpen(false);
    onClose(); // Notify parent component to reset the state
  };

  // Ensure fileName has a .mp4 extension
  const ensureMp4Extension = (name) => {
    if (!name.endsWith(".mp4")) {
      return `${name}.mp4`;
    }
    return name;
  };

  return (
    <div>
      {modalIsOpen && (
        <div className="custom-modal">
          <div className="custom-modal-content">
            <button onClick={closeModal} className="modal-close-button">
              <svg viewBox="0 0 24 24">
                <path d="M19.5 5.5L18 4l-6 6-6-6L4.5 5.5 10.5 12l-6 6L6 19.5l6-6 6 6 1.5-1.5-6-6z" />
              </svg>
            </button>
            {downloadUrl && (
              <div className="video-container">
                <video controls autoPlay>
                  <source src={downloadUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <a
                  href={downloadUrl}
                  download={ensureMp4Extension(fileName)}
                  className="download-button"
                >
                  <button>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      className="bi bi-download"
                      viewBox="0 0 16 16"
                    >
                      <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                      <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
                    </svg>
                  </button>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
