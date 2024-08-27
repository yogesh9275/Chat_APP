import "../css/FileUploadPopUp.css";
import React, { useEffect, useState } from 'react';
import { FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileAlt } from 'react-icons/fa'; // Import icons for different file types

const FileUploadPopUp = ({ file, onClose, handleSendFile }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState('');
  const [fileMessage, setFileMessage] = useState('');

  useEffect(() => {
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
        setFileType('image');
      } else {
        setFileType(fileExtension);
      }
    }
  }, [file]);

  const convertImageToWebP = async (imageFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name.replace(/\.\w+$/, '.webp'), {
                  type: 'image/webp',
                  lastModified: Date.now(),
                }));
              } else {
                reject(new Error('Conversion to WebP failed.'));
              }
            },
            'image/webp',
            0.8 // Quality setting (optional)
          );
        };
      };

      reader.onerror = (error) => reject(error);
    });
  };

  const handleSend = async () => {
    if (file) {
      if (fileType === 'image') {
        const webpFile = await convertImageToWebP(file);
        handleSendFile(webpFile);
      } else {
        handleSendFile(file);
      }
      onClose();
    }
  };

  const renderFileIcon = () => {
    switch (fileType) {
      case 'pdf':
        return <FaFilePdf size={50} color="#FF0000" />;
      case 'doc':
      case 'docx':
        return <FaFileWord size={50} color="#0072C6" />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel size={50} color="#217346" />;
      case 'ppt':
      case 'pptx':
        return <FaFilePowerpoint size={50} color="#D24726" />;
      default:
        return <FaFileAlt size={50} color="#808080" />;
    }
  };

  return (
    <div className="file-upload-popup">
      <div className="popup-content">
        <button className="close-btn" onClick={onClose}>X</button>
        <div className="file-preview">
          {fileType === 'image' ? (
            <img src={previewUrl} alt="Preview" className="file-image" />
          ) : (
            <div className="file-icon">
              {renderFileIcon()}
              <p>{file.name}</p>
            </div>
          )}
        </div>
        <textarea
          placeholder="Add a message..."
          className="file-message"
          value={fileMessage}
          onChange={(e) => setFileMessage(e.target.value)}
        ></textarea>
        <div className="button-group">
          <button className="send-btn" onClick={handleSend}>Send</button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadPopUp;
