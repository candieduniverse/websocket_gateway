const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'server.log' })
  ]
});

// Constants
const PORT = 3000;
const MAX_MESSAGE_SIZE = 1024 * 1024; // 1MB
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const MAX_CONNECTIONS = 100;

// Create Express app
const app = express();

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.status(200).send('OK');
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({
  server,
  maxPayload: MAX_MESSAGE_SIZE,
  clientTracking: true,
});

// Connection counter
let connectionCount = 0;

// Set up WebSocket server
wss.on('connection', (ws, req) => {
  // Check if max connections limit reached
  if (connectionCount >= MAX_CONNECTIONS) {
    logger.warn(`Connection limit reached (${MAX_CONNECTIONS}). Rejecting new connection.`);
    ws.close(1013, 'Maximum connections reached');
    return;
  }
  
  connectionCount++;
  
  // Set properties for this connection
  ws.isAlive = true;
  ws.ip = req.socket.remoteAddress;
  
  logger.info(`Client connected from ${ws.ip}. Total connections: ${connectionCount}`);
  
  // Set up ping-pong heartbeat
  ws.on('pong', () => {
    ws.isAlive = true;
    logger.debug(`Received pong from ${ws.ip}`);
  });
  
  // Handle incoming messages
  ws.on('message', (message, isBinary) => {
    try {
      // Log message size and type
      const size = message.length;
      const type = isBinary ? 'binary' : 'text';
      
      logger.info(`Received ${type} message of ${size} bytes from ${ws.ip}`);
      
      // Echo the message back to the client with the same format
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message, { binary: isBinary }, (err) => {
          if (err) {
            logger.error(`Error sending message to ${ws.ip}: ${err.message}`);
          } else {
            logger.debug(`Echo sent to ${ws.ip} (${size} bytes)`);
          }
        });
      }
    } catch (error) {
      logger.error(`Error processing message: ${error.message}`);
    }
  });
  
  // Handle connection close
  ws.on('close', (code, reason) => {
    connectionCount--;
    logger.info(`Client ${ws.ip} disconnected. Code: ${code}, Reason: ${reason || 'No reason provided'}. Remaining connections: ${connectionCount}`);
  });
  
  // Handle errors
  ws.on('error', (error) => {
    logger.error(`WebSocket error for ${ws.ip}: ${error.message}`);
    try {
      ws.close(1011, 'Internal server error');
    } catch (closeError) {
      logger.error(`Error while closing connection: ${closeError.message}`);
    }
  });
  
  // Send a welcome message
  ws.send('Welcome to the WebSocket Echo Server!');
});

// Heartbeat interval to detect and clean up stale connections
const interval = setInterval(() => {
  logger.debug('Running heartbeat check');
  
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      logger.info(`Terminating stale connection from ${ws.ip}`);
      return ws.terminate();
    }
    
    ws.isAlive = false;
    ws.ping(() => {});
    logger.debug(`Ping sent to ${ws.ip}`);
  });
}, HEARTBEAT_INTERVAL);

// Handle server closure
wss.on('close', () => {
  clearInterval(interval);
  logger.info('WebSocket server closed');
});

// Error handling for the WebSocket server
wss.on('error', (error) => {
  logger.error(`WebSocket server error: ${error.message}`);
});

// Start the server
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`WebSocket endpoint: ws://localhost:${PORT}`);
  logger.info(`Health check endpoint: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing server...');
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  wss.close(() => {
    logger.info('WebSocket server closed');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received. Closing server...');
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  wss.close(() => {
    logger.info('WebSocket server closed');
  });
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught exception: ${error.message}`);
  logger.error(error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise rejection', reason);
  process.exit(1);
});

