import React, { useRef, useEffect, useState } from "react";
import VideoPlayer from "./VideoPlayer"; // Import VideoPlayer

const VideoThumbnail = ({ fileContent, fileName }) => {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false); // State to control VideoPlayer visibility
  const [videoUrl, setVideoUrl] = useState(""); // State to hold the video URL
  const videoUrlRef = useRef(null); // Reference to hold the video URL

  // Update the video URL only when the fileContent changes
  useEffect(() => {
    if (fileContent) {
      // Create a URL for the fileContent
      const url = URL.createObjectURL(new Blob([fileContent]));
      setVideoUrl(url);

      // Cleanup the object URL when the component is unmounted or when fileContent changes
      return () => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      };
    }
  }, [fileContent]);

  // Function to handle click event and open VideoPlayer
  const handlePlayClick = () => {
    setIsPlayerOpen(true);
  };

  return (
    <div className="video-file">
      <video
        src={videoUrl}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        muted
        loop
      />
      <div className="video-Playback" onClick={handlePlayClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          className=" play-buttton bi bi-play-fill"
          viewBox="0 0 16 16"
        >
          <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393" />
        </svg>
      </div>
      {isPlayerOpen && (
        <VideoPlayer
          videoSrc={videoUrl} // Pass the video URL to VideoPlayer
          isOpen={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
          fileName={fileName}
        />
      )}
    </div>
  );
};

export default VideoThumbnail;
