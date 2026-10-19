# Notes API

A containerized REST API for managing notes, built with **Node.js / Express** and **MongoDB**, orchestrated with **Docker Compose**. The project demonstrates Docker networking, persistent volumes, Git SHA image tagging, and multi-stage builds.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [API Testing](#api-testing)
- [MongoDB Persistence](#mongodb-persistence)
- [Docker Image Build](#docker-image-build)
- [Image Size Comparison](#image-size-comparison)
- [Conclusion](#conclusion)

## Features

- RESTful API built with Node.js and Express
- MongoDB for data storage
- Docker Compose for multi-container orchestration
- Dedicated Docker network for service communication
- Named Docker volume for persistent data
- Git SHA image tagging with OCI-compliant labels
- Multi-stage Dockerfile with a single-stage variant for comparison

## Architecture

```text
                 Docker Network
                       |
          +------------+------------+
          |                         |
      notes-api               notes-mongodb
   Node.js / Express             MongoDB
          |                         |
          +------------+------------+
                       |
                 mongodb_data
                 (Docker Volume)
```

| Service          | Technology         | Description                          |
| ---------------- | ------------------ | ------------------------------------ |
| `notes-api`      | Node.js / Express  | REST API exposed on port `3000`      |
| `notes-mongodb`  | MongoDB            | Database, data stored in `/data/db`  |
| `mongodb_data`   | Docker named volume | Persists MongoDB data across restarts |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/)

## Getting Started

```bash
# Clone the repository
git clone <repository-url>
cd <repository-folder>

# Build and start all services
docker compose up -d --build

# Verify the API is running
curl http://localhost:3000/health
```

To stop the services:

```bash
docker compose down
```

## API Reference

| Method | Endpoint      | Description        |
| ------ | ------------- | ------------------ |
| GET    | `/health`     | Health check       |
| POST   | `/api/notes`  | Create a new note  |
| GET    | `/api/notes`  | Retrieve all notes |

## API Testing

**Health check**

```bash
curl http://localhost:3000/health
```

**Create a note**

```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"First Note","content":"Docker and MongoDB are working"}'
```

**Get all notes**

```bash
curl http://localhost:3000/api/notes
```

## MongoDB Persistence

MongoDB uses the named volume `mongodb_data`, mounted at `/data/db`.

Persistence was verified by recreating the containers:

```bash
docker compose down
docker compose up -d
curl http://localhost:3000/api/notes
```

The previously created note remained available, confirming that data survives container recreation.

> **Note:** `docker compose down -v` removes named volumes and will delete the stored data.

## Docker Image Build

### Git SHA Tagging

Images are tagged with the current Git commit SHA for traceability:

```bash
GIT_SHA=$(git rev-parse --short HEAD)
docker build --build-arg GIT_SHA="$GIT_SHA" -t notes-api:$GIT_SHA .
```

The Dockerfile stores the SHA as an OCI image label:

```dockerfile
ARG GIT_SHA=dev
LABEL org.opencontainers.image.revision=$GIT_SHA
```

### Multi-Stage Build

The main `Dockerfile` uses two stages:

1. **Dependencies**: installs production dependencies
2. **Runtime**: copies only what is needed to run the application

A separate `Dockerfile.single-stage` is included for comparison:

```bash
docker build -f Dockerfile.single-stage -t notes-api:single .
docker images notes-api
```

## Image Size Comparison

| Image                 | Build Type   | Size    |
| --------------------- | ------------ | ------- |
| `notes-api:<git-sha>` | Multi-stage  | 63.7 MB |
| `notes-api:single`    | Single-stage | 63.7 MB |

Both images are approximately the same size because the application has no separate compilation step and both install only production dependencies. Multi-stage builds show a larger benefit when a build step (e.g., TypeScript compilation or bundling) or dev dependencies would otherwise remain in the final image.

## Conclusion

This project demonstrates:

- REST API development with Node.js and Express
- Docker containerization
- Docker Compose orchestration
- Docker networking
- MongoDB integration
- Persistent storage with a Docker volume
- Git SHA image tagging
- Multi-stage Docker builds
- Image size comparison
