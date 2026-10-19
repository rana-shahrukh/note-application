# Docker MongoDB Notes API

A simple REST API built from scratch using Node.js, Express, MongoDB, and Docker.

This project demonstrates Docker networking, MongoDB data persistence using Docker volumes, Git SHA based image tagging, and a multi-stage Docker build.

## Project Architecture

The application consists of two Docker containers:

- **App container** - Node.js + Express REST API
- **MongoDB container** - MongoDB database

Both containers communicate through a Docker bridge network.

```text
                Docker Network
                     |
          +----------+----------+
          |                     |
     notes-api             notes-mongodb
   Node.js / Express           MongoDB
          |                     |
          +---------------------+
                    |
             mongodb_data
              Docker Volume




API Testing
Health check:
curl http://localhost:3000/health
Create a note:
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"First Note","content":"Docker and MongoDB are working"}'
Get notes:
curl http://localhost:3000/api/notes
MongoDB Persistence
MongoDB uses the named volume mongodb_data, mounted at /data/db.
Persistence was tested by recreating the containers:
docker compose down
docker compose up -d
curl http://localhost:3000/api/notes
The previously created note remained available.
Git SHA Image
The image is tagged using the current Git commit SHA:
GIT_SHA=$(git rev-parse --short HEAD)
docker build --build-arg GIT_SHA="$GIT_SHA" -t notes-api:$GIT_SHA .
The Dockerfile stores the SHA as an image label:
ARG GIT_SHA=dev
LABEL org.opencontainers.image.revision=$GIT_SHA
Multi-Stage Build
The main Dockerfile uses two stages:
Dependencies
Runtime
A separate Dockerfile.single-stage was created for comparison.
docker build -f Dockerfile.single-stage -t notes-api:single .
docker images notes-api
Image Size Comparison
Image
Build Type
Size
notes-api:<git-sha>
Multi-stage
63.7 MB
notes-api:single
Single-stage
63.7 MB
Both images are approximately the same size because the application has no separate compilation step and both images install only production dependencies.
Conclusion
This project demonstrates:
REST API development
Docker containerization
Docker Compose
Docker networking
MongoDB
Persistent Docker volume
Git SHA image tagging
Multi-stage Docker build
Image size comparison

