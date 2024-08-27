import React, { useState, useRef, useEffect } from "react";
import {
  FaRecordVinyl,
  FaPause,
  FaPlay,
  FaStop,
  FaTrashAlt,
  FaDownload,
  FaTimes,
} from "react-icons/fa";
import CustomAudioPlayer from "./AudioPlayer";
import "../css/AudioRecorder.css"; // Ensure the CSS file is imported
import { VscSend } from "react-icons/vsc";
const AudioRecorder = ({ onClose, handleSendFile }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [timer, setTimer] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/opus",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        setAudioBlob(audioBlob);
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setTimer(0);
    } catch (err) {
      console.error("Error accessing media devices.", err);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    setAudioBlob(null);
    setTimer(0);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const sendRecording = async () => {
    if (audioUrl) {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
     
      // Use the appropriate MIME type based on the recorded file type
      const audioFile = new File(
        [blob],
        "recording." + blob.type.split("/")[1],
        { type: blob.type }
      );
      console.log(blob.type);
      handleSendFile(audioFile);
      deleteRecording();
      onClose(); // Close the component after sending the recording
    } else {
      alert("No recording to send.");
    }
  };

  return (
    <div className="voice-recorder">
      {/* Conditionally render audio-recorder-controls */}
      {!audioUrl && (
        <div className="audio-recorder-controls">
          <button onClick={startRecording} disabled={isRecording}>
            <FaRecordVinyl />
          </button>
          {isRecording && !isPaused && (
            <button onClick={pauseRecording}>
              <FaPause />
            </button>
          )}
          {isRecording && isPaused && (
            <button onClick={resumeRecording}>
              <FaPlay />
            </button>
          )}
          <div className="timer-display">
            <h3>{formatTime(timer)}</h3>
          </div>
          <button onClick={stopRecording} disabled={!isRecording}>
            <FaStop />
          </button>
          <button onClick={deleteRecording} disabled={!audioUrl}>
            <FaTrashAlt />
          </button>
          {audioUrl && (
            <a href={audioUrl} download="recorded_audio.ogg">
              <button>
                <FaDownload />
              </button>
            </a>
          )}
        </div>
      )}
      {audioUrl && <CustomAudioPlayer audioUrl={audioUrl} />}
      <div className="recorder-controls">
        <button
          onClick={sendRecording}
          className="send-btn"
          aria-label="Send recording"
        >
          <VscSend />
        </button>

        <button
          onClick={onClose}
          className="close-btn"
          aria-label="Close recorder"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};



export default AudioRecorder;
