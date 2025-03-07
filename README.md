# WebSocket Echo Server

A high-performance WebSocket Echo Server with NGINX proxy that handles WebSocket connections, echoes messages back to clients, and includes comprehensive monitoring, logging, and security features.

## Introduction

The WebSocket Echo Server is designed to demonstrate a production-ready WebSocket implementation with the following features:

- **Scalable Architecture**: Dockerized Node.js WebSocket server behind an NGINX proxy
- **Message Echo**: Echoes both text and binary WebSocket messages back to clients
- **Robust Connection Handling**: Implements proper WebSocket lifecycle management, including heartbeats to detect stale connections
- **Security**: Rate limiting, message size validation, and other security best practices
- **Monitoring**: Health checks, logging, and error handling
- **Easy Deployment**: Simple setup with Docker and Docker Compose

This project serves as a foundation for more complex WebSocket applications and demonstrates best practices for implementing WebSocket servers in production environments.

## Architecture

```
                           ┌───────────────────┐
                           │    Client Apps    │
                           └─────────┬─────────┘
                                     │
                                     ▼
                           ┌───────────────────┐
                           │   NGINX Proxy     │
                           │    (port 8080)    │
                           └─────────┬─────────┘
                                     │
                                     ▼
                           ┌───────────────────┐
                           │  WebSocket Server │
                           │    (port 3000)    │
                           └───────────────────┘
```

The system consists of two main components:

1. **WebSocket Server (Node.js)**: 
   - Built with the `ws` package for WebSocket functionality
   - Uses Express for health check endpoints
   - Handles WebSocket connection lifecycle events
   - Implements heartbeat mechanism for detecting stale connections
   - Logs events using Winston logger
   - Limits message size to 1MB
   - Supports both text and binary messages

2. **NGINX Proxy**:
   - Forwards WebSocket connections to the Node.js server
   - Handles connection upgrades properly
   - Provides rate limiting (100 requests per minute per IP)
   - Adds an additional layer of security
   - Exposes WebSocket endpoint at `ws://localhost:8080/ws`

## Setup and Installation

### Prerequisites

- Docker and Docker Compose installed on your system
- Git (to clone the repository)

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/websocket-echo-server.git
   cd websocket-echo-server
   ```

2. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

3. Verify that the services are running:
   ```bash
   docker-compose ps
   ```

The server will be available at `ws://localhost:8080/ws` for WebSocket connections.

## Usage Examples

### Connecting with a Browser Client

```javascript
// HTML/JavaScript example
const socket = new WebSocket('ws://localhost:8080/ws');

// Connection opened
socket.addEventListener('open', (event) => {
  console.log('Connected to WebSocket server');
  socket.send('Hello Server!');
});

// Listen for messages
socket.addEventListener('message', (event) => {
  console.log('Message from server:', event.data);
});

// Connection closed
socket.addEventListener('close', (event) => {
  console.log('Disconnected from WebSocket server', event.code, event.reason);
});

// Error handling
socket.addEventListener('error', (event) => {
  console.error('WebSocket error:', event);
});
```

### Connecting with a Node.js Client

```javascript
const WebSocket = require('ws');
const socket = new WebSocket('ws://localhost:8080/ws');

socket.on('open', function open() {
  console.log('Connected to WebSocket server');
  socket.send('Hello from Node.js client!');
});

socket.on('message', function incoming(data) {
  console.log('Received message:', data.toString());
});

socket.on('close', function close() {
  console.log('Disconnected from WebSocket server');
});

socket.on('error', function error(err) {
  console.error('WebSocket error:', err);
});
```

### Sending Binary Data

```javascript
// Create a binary message (ArrayBuffer)
const buffer = new Uint8Array([0, 1, 2, 3, 4]).buffer;
socket.send(buffer);

// Or send a Blob (in browser)
const blob = new Blob(['Binary data example']);
socket.send(blob);
```

## Testing

### Manual Testing

You can use tools like [WebSocket King](https://websocketking.com/) or [Postman](https://www.postman.com/) for manual WebSocket testing:

1. Connect to `ws://localhost:8080/ws`
2. Send messages and verify that they are echoed back
3. Test with various message sizes and formats

### Automated Testing

For automated testing, we recommend using libraries like `wscat`, `jest`, or `mocha` with WebSocket clients.

Example using wscat:
```bash
# Install wscat
npm install -g wscat

# Connect to the WebSocket server
wscat -c ws://localhost:8080/ws

# Now you can type messages which will be echoed back
```

### Load Testing

To test how the server handles concurrent connections:

```bash
# Using artillery for load testing
npm install -g artillery
artillery quick --count 100 -n 10 ws://localhost:8080/ws
```

## Troubleshooting

### Common Issues

#### Cannot connect to WebSocket server

- Check if containers are running: `docker-compose ps`
- Verify logs for potential errors: `docker-compose logs`
- Ensure port 8080 is not being used by another application

#### Connection is established but messages are not received

- Check server logs for any error messages: `docker-compose logs server`
- Ensure message size is under 1MB limit
- Verify that client is sending valid WebSocket frames

#### NGINX proxy issues

- Check NGINX logs: `docker-compose logs nginx`
- Verify NGINX configuration is correctly handling WebSocket upgrades

#### Performance issues

- Check resource usage: `docker stats`
- Consider increasing resource limits in docker-compose.yaml if needed

### Viewing Logs

```bash
# View all logs
docker-compose logs

# View only WebSocket server logs
docker-compose logs server

# View only NGINX logs
docker-compose logs nginx

# Follow logs in real-time
docker-compose logs -f
```

## Security Considerations

The WebSocket Echo Server implements several security measures:

1. **Rate Limiting**: NGINX proxy limits requests to 100 per minute per IP address
2. **Message Size Limitation**: Messages larger than 1MB are rejected
3. **Containerization**: Services run in isolated Docker containers
4. **Non-root Users**: Containers run as non-root users
5. **Input Validation**: Server validates WebSocket frames before processing
6. **Resource Limits**: Docker containers have memory and CPU limits
7. **Heartbeat Mechanism**: Detects and cleans up stale connections

### Security Recommendations

- **TLS/SSL**: For production, configure TLS/SSL (WSS) for encrypted WebSocket communication
- **Authentication**: Add authentication for the WebSocket endpoint if needed
- **Regular Updates**: Keep dependencies and base images updated
- **Logging**: Monitor logs for suspicious activity
- **Firewall Rules**: Implement firewall rules to restrict access as necessary

## Development and Contribution Guidelines

### Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   cd server
   npm install
   ```

3. Make changes to the codebase
4. Test your changes locally:
   ```bash
   docker-compose up --build
   ```

### Contribution Guidelines

1. **Branching**: Create a feature branch from `main` (`git checkout -b feature/your-feature`)
2. **Code Style**: Follow existing code style and patterns
3. **Tests**: Include tests for new features or bug fixes
4. **Documentation**: Update documentation to reflect your changes
5. **Pull Requests**: Submit pull requests to the `main` branch with a clear description of changes

### Code Organization

```
/websocket-gateway
├── /nginx
│   ├── nginx.conf - NGINX configuration
│   ├── Dockerfile - NGINX container build instructions
├── /server
│   ├── index.js - WebSocket server implementation
│   ├── package.json - Node.js dependencies
│   ├── Dockerfile - Server container build instructions
├── docker-compose.yaml - Service orchestration
├── README.md - Project documentation
├── REQUIREMENTS.md - Project requirements
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [ws](https://github.com/websockets/ws) - WebSocket implementation for Node.js
- [Express](https://expressjs.com/) - Web framework for Node.js
- [NGINX](https://nginx.org/) - High-performance HTTP server and reverse proxy
- [Docker](https://www.docker.com/) - Containerization platform

