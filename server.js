const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const url = require("url");
const ffmpegPath = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const ffprobePath = require("ffprobe-static").path;

// Set the path to the static FFmpeg binary
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// Log the FFprobe path to the console
console.log("FFprobe path:", ffprobePath);

// Create the express app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 1 * 1024 * 1024 * 1024,
});

// Define the directory paths
const tempDir = path.join(__dirname, "temp");
const uploadDir = path.join(__dirname, "uploads");

// Check if the directories exist, if not, create them
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up Multer storage and file filter
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "audio/wav",
      "audio/mpeg", // MP3
      "audio/ogg",
      "video/mp4",
      "video/avi",
      "video/mkv",
      "application/pdf",
      "application/msword", // DOC
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
      "application/vnd.ms-excel", // XLS
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
      "application/vnd.ms-powerpoint", // PPT
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
      "application/zip", // ZIP
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"), false);
    }
  },
});

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.post("/upload", upload.single("file"), (req, res) => {
  if (req.file) {
    const filePath = path.join(uploadDir, req.file.originalname);
    fs.writeFileSync(filePath, req.file.buffer);
    res.send(`File uploaded successfully: ${req.file.originalname}`);
  } else {
    res.status(400).send("No file uploaded or file type is not supported.");
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).send("File size exceeds the 1 GB limit.");
    }
    return res.status(400).send("File upload error.");
  } else if (err) {
    return res.status(400).send(err.message);
  }
  next();
});

const chatSessions = {
  init: [],
  group: [],
};

const connectedClients = new Map();

const validateFileParameters = (fileType, fileName) => {
  const validFormats = [
    "opus",
    "mp3",
    "gif",
    "webp",
    "mp4",
    "avi",
    "mov",
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "zip",
  ];
  const fileExtension = fileName.split(".").pop().toLowerCase();
  if (!validFormats.includes(fileExtension)) {
    return `Invalid file format. Supported formats are: ${validFormats.join(
      ", "
    )}`;
  }
  if (
    !fileType.startsWith("video/") &&
    !fileType.startsWith("application/") &&
    !fileType === "application/zip"
  ) {
    return `Unsupported file type. Expected a video, document, or ZIP file.`;
  }
  return null;
};

const checkVideoProperties = (filePath, callback) => {
  ffmpeg.ffprobe(filePath, (err, metadata) => {
    if (err) {
      return callback(err);
    }

    const videoStream = metadata.streams.find(
      (stream) => stream.codec_type === "video"
    );
    if (!videoStream) {
      return callback(new Error("Video stream not found."));
    }

    const audioStream = metadata.streams.find(
      (stream) => stream.codec_type === "audio"
    );

    const videoCodec = videoStream.codec_name;
    const audioCodec = audioStream ? audioStream.codec_name : null; // Handle missing audio stream
    const format = metadata.format.format_name;

    if (videoCodec !== "h264" && videoCodec !== "libx264") {
      return callback(
        new Error(`Invalid video codec: ${videoCodec}. Expected: h264/libx264.`)
      );
    }

    if (audioStream && audioCodec !== "aac") {
      // Check audio codec only if audio stream exists
      return callback(
        new Error(`Invalid audio codec: ${audioCodec}. Expected: aac.`)
      );
    }

    if (!format.includes("mp4")) {
      return callback(new Error(`Invalid format: ${format}. Expected: mp4.`));
    }

    callback(null, true);
  });
};

io.on("connection", (socket) => {
  const { chatType, username } = url.parse(socket.handshake.url, true).query;

  if (!chatType || !username) {
    socket.emit("error", "Chat type and username are required.");
    socket.disconnect();
    return;
  }

  if (
    connectedClients.has(username) &&
    connectedClients.get(username) !== socket.id
  ) {
    socket.emit("error", "Username is already connected.");
    socket.disconnect();
    return;
  }

  socket.chatType = chatType;
  socket.username = username;

  connectedClients.set(username, socket.id);

  console.log(`New client connected: ${username}, Chat Type: ${chatType}`);

  if (chatType === "chat") {
    if (chatSessions.init.length >= 2) {
      console.log(
        `Chat type 'init' can only have 2 participants. Disconnecting extra participants.`
      );
      socket.emit("error", 'Chat type "init" can only have 2 participants.');
      socket.disconnect();
      return;
    }
    chatSessions.init.push(socket.id);
  } else {
    chatSessions.group.push(socket.id);
  }

  socket.on("sendMessage", (message) => {
    console.log("Message received:", message);

    if (socket.chatType === "chat") {
      const otherParticipantId = chatSessions.init.find(
        (id) => id !== socket.id
      );
      if (otherParticipantId) {
        io.to(otherParticipantId).emit("receiveMessage", message);
      }
    } else {
      chatSessions.group.forEach((id) => {
        if (id !== socket.id) {
          io.to(id).emit("receiveMessage", message);
        }
      });
    }
  });

  socket.on("sendFile", (fileData) => {
    console.log("File received:", fileData.fileName);

    const fileBuffer = Buffer.from(fileData.fileContent);
    const tempDir = path.join(__dirname, "temp");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filePath = path.join(tempDir, fileData.fileName);

    const validationError = validateFileParameters(
      fileData.fileType,
      fileData.fileName
    );
    if (validationError) {
      console.error("Error:", validationError);
      socket.emit("error", { message: validationError });
      return;
    }

    fs.writeFileSync(filePath, fileBuffer);

    if (fileData.fileType.startsWith("video/")) {
      const fileSizeInMB = fileData.fileSize / (1024 * 1024);

      checkVideoProperties(filePath, (err, isValid) => {
        if (err) {
          console.error("Error checking video properties:", err);
          socket.emit("error", { message: "Error checking video properties" });
          return;
        }

        if (!isValid) {
          console.error("Invalid video properties.");
          socket.emit("error", { message: "Invalid video properties." });
          return;
        }

        const outputFilePath = path.join(
          tempDir,
          `compressed_${fileData.fileName}`
        );

        let ffmpegCommand = ffmpeg(filePath)
          .videoCodec("libx264")
          .audioCodec("aac");

        if (fileSizeInMB > 5) {
          // Apply compression settings for files larger than 5MB
          ffmpegCommand = ffmpegCommand
            .videoBitrate("300k") // Reduce video bitrate by 30%
            .audioBitrate("90k") // Reduce audio bitrate by 30%
            .outputOptions([
              "-preset fast", // Adjust encoding speed vs. compression ratio
              "-crf 28", // Set CRF to 28 for lower quality and smaller size
              "-vf scale=-2:720", // Adjust the scaling while maintaining the aspect ratio
            ]);
        } else {
          // No compression; just maintain the original aspect ratio and scale down
          ffmpegCommand = ffmpegCommand.outputOptions([
            "-vf scale=-2:720", // Adjust the scaling while maintaining the aspect ratio
          ]);
        }

        ffmpegCommand
          .on("end", () => {
            console.log("Video processing finished.");
            const compressedData = fs.readFileSync(outputFilePath);

            const compressedFileData = {
              ...fileData,
              fileContent: compressedData,
              fileSize: compressedData.length,
            };

            if (socket.chatType === "chat") {
              const otherParticipantId = chatSessions.init.find(
                (id) => id !== socket.id
              );
              if (otherParticipantId) {
                io.to(otherParticipantId).emit(
                  "receiveFile",
                  compressedFileData
                );
              }
            } else {
              chatSessions.group.forEach((id) => {
                if (id !== socket.id) {
                  io.to(id).emit("receiveFile", compressedFileData);
                }
              });
            }
            fs.unlinkSync(outputFilePath); // Remove the temporary file after sending
          })
          .on("error", (err, stdout, stderr) => {
            console.log("FFprobe path:", ffprobePath);
            console.error("Error processing video:", err);
            console.error("FFmpeg stdout:", stdout);
            console.error("FFmpeg stderr:", stderr);
            socket.emit("error", { message: "Error processing video." });
          })
          .save(outputFilePath);
      });
    } else {
      if (socket.chatType === "chat") {
        // For 'init' chatType, send the file to the other participant
        const otherParticipantId = chatSessions.init.find(
          (id) => id !== socket.id
        );
        if (otherParticipantId) {
          io.to(otherParticipantId).emit("receiveFile", fileData);
        }
      } else {
        // For 'group' chatType, send the file to all participants in the group
        chatSessions.group.forEach((id) => {
          if (id !== socket.id) {
            io.to(id).emit("receiveFile", fileData);
          }
        });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${username}`);

    connectedClients.delete(username);

    if (socket.chatType === "chat") {
      chatSessions.init = chatSessions.init.filter((id) => id !== socket.id);
    } else {
      chatSessions.group = chatSessions.group.filter((id) => id !== socket.id);
    }
  });
});

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
