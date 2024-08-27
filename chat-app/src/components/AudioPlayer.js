import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { FaPlay, FaPause } from 'react-icons/fa'; // Import the icons

const AudioPlayer = ({ audioUrl }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const waveformRef = useRef(null);
    const wavesurferRef = useRef(null);

    useEffect(() => {
          // Dynamically import the CSS file
          import('../css/AudioPlayer.css').then(() => {
            // CSS loaded
            console.log('CSS loaded');
        }).catch(err => {
            console.error('Failed to load CSS:', err);
        });

        // Initialize WaveSurfer
        wavesurferRef.current = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#ddd',
            progressColor: '#3b82f6',
            cursorColor: '#3b82f6',
            height: 20,
            normalize: true,
        });

        // Load the audio URL
        wavesurferRef.current.load(audioUrl);

        // Set up event listeners
        wavesurferRef.current.on('ready', () => {
            setDuration(wavesurferRef.current.getDuration());
        });

        wavesurferRef.current.on('audioprocess', () => {
            setCurrentTime(wavesurferRef.current.getCurrentTime());
        });

        wavesurferRef.current.on('seek', () => {
            setCurrentTime(wavesurferRef.current.getCurrentTime());
        });

        wavesurferRef.current.on('finish', () => {
            setIsPlaying(false);
        });

        // Cleanup function
        return () => {
            if (wavesurferRef.current) {
                wavesurferRef.current.destroy();
            }
        };
    }, [audioUrl]);

    const togglePlayPause = () => {
        if (isPlaying) {
            wavesurferRef.current.pause();
        } else {
            wavesurferRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    return (
        <div className="voice-player-card">
        <div className="player-content">
            <div className="controls-waveform-container">
                <div className="controls">
                    <button className="play-pause-button" onClick={togglePlayPause}>
                    {isPlaying ? <FaPause /> : <FaPlay />}
                    </button>
                </div>
                <div className="timer">
                <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
            </div>
                <div className="waveform-container" ref={waveformRef} />
            </div>
        </div>
    </div>
    );
};

export default AudioPlayer;
