# 🎮 Grid App: Real-Time Shared Multi-Player Grid

**Grid App** is a fast-paced, real-time interactive grid game where players compete to dominate space! Built with a modern full-stack architecture, it features seamless synchronization across sessions, allowing users to claim blocks, customize their profiles, and climb the leaderboard in real-time.

![Grid.io Preview](file:///C:/Users/Sameer/.gemini/antigravity/brain/92a99220-d4c8-45e8-afa1-2bbcd8d0a895/media__1771071916865.png)

## 🚀 Features

-   **Real-Time Synchronization**: Uses WebSockets (STOMP) for instant block updates and live player counts.
-   **Robust Sync Strategy**: Hybrid REST-WebSocket approach ensuring 100% reliable state updates.
-   **Interactive Grid**: Smooth pan and zoom experience on a shared grid.
-   **Custom Profiles**: Instant name and color updates across all connected clients.
-   **Live Leaderboard**: Watch the rankings shift as players capture and unown blocks.
-   **Production Ready**: Includes Docker support and a unified build pipeline.

## 🛠️ Tech Stack

### Frontend
-   **React 19**: Modern UI with Hook-based state management.
-   **Tailwind CSS 4**: Sleek, dark-themed styling.
-   **Framer Motion**: Smooth micro-animations for an interactive feel.
-   **STOMPjs**: Handling real-time messaging protocols.

### Backend
-   **Spring Boot 3**: High-performance REST and WebSocket API.
-   **Spring WebSocket**: STOMP over WebSockets for bi-directional communication.
-   **JPA / H2**: In-memory data persistence for ultra-fast game state.
-   **Maven**: Dependency and build management.

## 🏗️ Getting Started

### Prerequisites
-   **JDK 17** or higher
-   **Node.js 20+**

### Local Development

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/sameer-ssr99/gridapp.git
    cd gridapp
    ```

2.  **Start the Backend**:
    ```bash
    cd backend
    mvn spring-boot:run
    ```

3.  **Start the Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    Visit `http://localhost:5173` to play!

## 📦 Deployment

### Production JAR build
Run our automation script to bundle the frontend into the backend JAR:
```powershell
./deploy.ps1
```
The application will be available as a single file: `backend/target/gridapp-0.0.1-SNAPSHOT.jar`.

### Docker
Run the entire stack with one command:
```bash
docker-compose up --build
```

## 🌐 Live Demo
The project is currently hosted on Render! 
Check it out here: **[Your Render Link Here]**

---

Created with ❤️ by Sameer
