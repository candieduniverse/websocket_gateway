# WebSocket Echo Server with NGINX Proxy

## **Introduction**

This project implements a **WebSocket echo server** using **Node.js**, with **NGINX acting as a reverse proxy**. The architecture consists of two **Dockerized services**, orchestrated using **Docker Compose**.

### **Purpose**

The purpose of this project is to provide a robust, scalable WebSocket communication infrastructure that can serve as a foundation for real-time applications. By implementing a WebSocket echo server behind an NGINX proxy, we create a production-ready setup that demonstrates best practices for WebSocket deployment.

### **Benefits**

- **Scalability**: The NGINX proxy can handle numerous concurrent connections efficiently
- **Deployment Flexibility**: Dockerized components allow for easy deployment across different environments
- **Maintainability**: Clear separation of concerns between proxy and application layers
- **Performance**: Optimized for low-latency real-time communication
- **Extensibility**: Provides a solid foundation for more complex WebSocket applications

## **Project Overview**

## **Architecture**
The system consists of the following components:

1. **WebSocket Client** → Connects via WebSocket.
2. **NGINX Reverse Proxy** → Handles WebSocket connections and forwards traffic to the WebSocket server.
3. **WebSocket Server (Node.js)** → Implements a simple **echo server**, which streams received data back to the client immediately.

### **System Diagram**

```
┌────────────────┐     WebSocket (ws://)     ┌─────────────────┐     Internal Network     ┌─────────────────┐
│                │◄───────────────────────────┤                 │◄────────────────────────┤                 │
│  WebSocket     │                            │  NGINX Reverse  │                          │  Node.js        │
│  Client        │───────────────────────────►│  Proxy          │────────────────────────►│  WebSocket      │
│                │      Port 8080             │  (Docker)       │       Port 3000         │  Server (Docker)│
└────────────────┘                            └─────────────────┘                          └─────────────────┘
```

---

## **Functional Requirements**
### **1. WebSocket Server**
- Must be implemented in **Node.js**.
- Must use the `ws` package (version 8.x or higher) to handle WebSocket connections.
- Must **echo** received messages back to the client **without modification**.
- Must automatically accept WebSocket connections from NGINX.
- Must run in a **Docker container**.
- Must implement proper connection lifecycle handling:
  - Connection establishment with appropriate logging
  - Message receipt acknowledgment (internally)
  - Connection termination handling with cleanup
- Must support concurrent connections (at least 100 simultaneous clients).
- Should implement heartbeat mechanism to detect and clean up stale connections.
- Must handle binary messages in addition to text messages.
- Must limit individual message size to 1MB to prevent memory issues.

### **2. NGINX Reverse Proxy**
- Must be configured to **forward WebSocket connections** (`ws://` and `wss://`) to the WebSocket server.
- Must handle WebSocket **connection upgrades** (`Upgrade` and `Connection` headers).
- Must be **Dockerized** with a separate `Dockerfile`.
- Must expose a **public WebSocket endpoint** (`ws://localhost:8080/ws`).
- Must use NGINX version 1.26.0 or higher.
- Must include proper request timeout configurations (60s minimum for WebSocket connections).
- Should include basic rate limiting to prevent DoS attacks (100 requests per minute per IP).

---

## **Non-Functional Requirements**

### **Error Handling Requirements**
- The WebSocket server must handle and log all connection errors.
- Must implement graceful error recovery for unexpected disconnections.
- Must provide meaningful error messages in logs with appropriate severity levels.
- Must handle and recover from NGINX restarts without manual intervention.
- Edge cases to handle:
  - Client disconnection without proper close frames
  - Malformed WebSocket frames
  - Excessive message sizes
  - Network interruptions
### **1. Project Structure**
- Must follow a **clear, modular layout**:
/websocket-gateway
 ├── /nginx
 │ ├── nginx.conf
 │ ├── Dockerfile
 ├── /server
 │ ├── index.js
 │ ├── package.json
 │ ├── Dockerfile
 ├── docker-compose.yaml
 ├── README.md
 ├── REQUIREMENTS.md

- Must use **separate directories** for `nginx` and `server` configurations.

### **2. Dockerization**
- Must use **Docker Compose** to manage the containers.
- Must have a **dedicated Dockerfile** for both:
- **NGINX**
- **Node.js WebSocket Server**
- Containers must communicate using a **Docker network**.

### **3. WebSocket Connection Handling**
- NGINX must correctly **proxy WebSocket traffic** to the server.
- The server must maintain **persistent WebSocket connections**.
- The server must **echo** messages as soon as they are received.

### **4. Deployment and Run**
- Running `docker-compose up` must start both the **WebSocket server** and **NGINX proxy**.
- The WebSocket server must be accessible at:
- `ws://localhost:8080/ws` (via NGINX)
- `ws://server:3000` (direct, internal Docker network)
- The logs should clearly show **received and echoed messages**.

### **5. Port Mapping**
- The WebSocket server should run on **port 3000** internally.
- NGINX should expose WebSocket traffic on **port 8080**.

---

## **Testing Requirements**
- Must have unit tests for WebSocket server functionality.
- Must have integration tests verifying NGINX-to-server communication.
- Must have end-to-end tests simulating client connections.
- Must include load testing with at least 100 concurrent connections.
- Should include test coverage reporting (minimum 80% code coverage).
- Tests must validate:
  - Connection establishment
  - Message echo functionality
  - Error handling scenarios
  - Connection termination

## **Documentation Requirements**
- Must include detailed README with setup and usage instructions.
- Must include API documentation for WebSocket endpoints.
- Must document all configuration options for both components.
- Must include troubleshooting guide for common issues.
- Must include comments in configuration files explaining key settings.
- Should include examples of client-side code for connecting to the server.

## **Acceptance Criteria**
- ✅ WebSocket clients can connect to `ws://localhost:8080/ws`.
- ✅ Clients can send messages and receive the **exact same message** back.
- ✅ Running `docker-compose up` correctly starts and links both containers.
- ✅ NGINX correctly **proxies WebSocket traffic**.
- ✅ The project structure is well-organized with clear separation of concerns.
- ✅ Containers are independently buildable using `Dockerfile`s.

---

## **Future Enhancements (Not in Scope)**
- Authentication and authorization.
- Redis integration for message processing.
- SSL termination with NGINX (`wss://` support).
- Load balancing with multiple WebSocket servers.

---

## **Security Considerations**
- All dependencies must be regularly updated to address security vulnerabilities.
- The NGINX configuration must follow security best practices.
- The WebSocket server must validate incoming messages to prevent injection attacks.
- Container images should be based on minimal, security-hardened base images.
- Resource limits must be set on containers to prevent DoS attacks.
- Network access between containers should follow the principle of least privilege.

## **Dependencies**

### **WebSocket Server**
- Node.js: v16.x or higher
- ws package: v8.x or higher
- express: v4.x (if used for health checks)
- winston: v3.x (for logging)

### **NGINX Proxy**
- NGINX: v1.18.0 or higher
- Docker: v20.10 or higher
- Docker Compose: v2.x

---

