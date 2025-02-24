## Kuechenheld Coding Challenge

#### Overview

Appointment Booking System

-   **Admin Side**: A showroom manager can create time blocks for different staffs (e.g., Staff A, B, C) with arbitrary durations (20 min, 35 min, 19min, etc.). Each block has a start and end time
-   **User Side**: The customer selects an appointment duration (e.g., 10 min, 15 min, 30 min) from a dropdown. Based on the selected duration, available slots from the blocks (different blocks for different staff, don not join blocks of 2 different staff) should be shown. If a customer books a part of a block (e.g., a 10-minute appointment in a 30-minute block), the remaining continuous time should be available for booking by other customers if possible. If a time block (e.g., 10:00 - 10:20) is available, and a customer books part of it (e.g., from 10:05 to 10:15), then the entire 20-minute block is considered booked

#### Description

The running application consists of 2 pages:

-   `/admin`: The showroom manager can create time blocks for different staffs
-   `/user`: The customer can schedule appointment w.r.t given duration

#### Manual Run

Checkout [backend](./backend/README.md#manual-run) and [frontend](./frontend/README.md#manual-run) to run the application manually

#### Docker

For convinience, run the application with [docker compose](https://docs.docker.com/reference/compose-file/)

-   Make sure [docker](https://docs.docker.com/) installed on your machine. The current implementation works on **docker 20+**
-   Create the following `.env` files to setup the service environments

```.env
#### .frontend.env

NEXT_PUBLIC_SERVER_URL=/api
```

```.env
#### .backend.env

# Environment
NODE_ENV=<running environment. 'dev' or 'prod'>

# Server Configuration
HOST=0.0.0.0
PORT=2204

# Database Configuration
DATABASE_HOST=database
DATABASE_PORT=3306
DATABASE_USERNAME=<mysql user account>
DATABASE_PASSWORD=<mysql password account>
DATABASE_NAME=<mysql database name>

# Redis Configuration
REDIS_HOST=pubsub
REDIS_PORT=6379
```

```.env
#### .database.env

MYSQL_ROOT_PASSWORD=<mysql password root>
MYSQL_DATABASE=<mysql database name>
MYSQL_USER=<mysql user account>
MYSQL_PASSWORD=<mysql password account>
```

-   Build the service images `docker compose up --build`
-   Start the application with `docker compose up` and stop with `docker compose down`

#### Kubernetes

The application can run on [Kubernetes](https://kubernetes.io/). For local run, make sure that [minikube](https://kubernetes.io/de/docs/tasks/tools/install-minikube/) installed on your machine

-   The application launches deployments of the frontend and backend. For that, their images need to be built

```sh
#### from project root
eval $(minikube docker-env)
cd backend
docker build -t kh-challenge_backend:latest .
cd ../frontend
docker build -t kh-challenge_frontend:latest .
```

-   Use [k8s-compose.sh](./k8s-compose.sh) to create the application

```sh
./k8s-compose.sh
```
- Use [k8s-decompose.sh](./k8s-decompose.sh) to delete the resources
```sh
./k8s-decompose.sh
```
