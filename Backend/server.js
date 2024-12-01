import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;
const MAX_PORT_ATTEMPTS = 10;

app.use(cors());
app.use(express.json());

// WebSocket connection handling
io.on("connection", (socket) => {
    console.log("Client connected");
    
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

// Endpoint for receiving detection notifications from Python script
app.post("/detection", (req, res) => {
    const { personCount } = req.body;
    console.log(`Detected ${personCount} people`);
    
    // Emit the detection event to all connected clients
    io.emit("detection", { personCount });
    
    res.json({ status: "ok" });
});

// Timer endpoints
let remainingSeconds = 0;

app.get("/timer", (req, res) => {
    res.json({remainingSeconds})
});

app.post("/timer", (req, res) => {
    const { seconds } = req.body;
    if (typeof seconds === 'number') {
        remainingSeconds = seconds;
        console.log(remainingSeconds);
        res.json({ remainingSeconds });
    } else {
        res.status(400).json({ error: "Invalid input" });
    }
});

// Try ports sequentially until one works
const startServer = async (startPort) => {
    for (let port = startPort; port < startPort + MAX_PORT_ATTEMPTS; port++) {
        try {
            await new Promise((resolve, reject) => {
                const server = httpServer.listen(port, () => {
                    console.log(`Server is running at http://localhost:${port}/`);
                    resolve();
                });
                
                server.on('error', (error) => {
                    if (error.code === 'EADDRINUSE') {
                        console.log(`Port ${port} is in use, trying next port...`);
                        reject(error);
                    } else {
                        console.log("Error occurred, server can't start", error);
                        reject(error);
                    }
                });
            });
            // If we get here, the server started successfully
            return port;
        } catch (error) {
            if (port === startPort + MAX_PORT_ATTEMPTS - 1) {
                throw new Error('Could not find an available port');
            }
            // Continue to next port
            continue;
        }
    }
};

// Start the server
startServer(PORT)
    .then(port => {
        console.log(`Server successfully started on port ${port}`);
    })
    .catch(error => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
