## Kuechenheld Coding Challenge - Backend

#### Manual Run

- Backend uses [mysql](https://www.mysql.com/) to store the application data. Make sure mysql run-to-run. The current implementation works on **mysql 8+**
- Backend uses [redis](https://www.redis.io/) as pubsub system to synchronize backend instances. Make sure redis run-to-run. The current implementation works on **Redis 7+**
- Make sure [Node](https://nodejs.org/) installed on your machine. The current implementation works on **Node 20+**
- Install required dependencies: `npm install`
- Set the following variables in the environment. You can either set the variable manually or create `.env` file

```.env
#### .env

# Environment
NODE_ENV=<running environment. 'dev' or 'prod'>

# Server Configuration
HOST=<backend host. localhost by default>
PORT=<backend port. 2204 by default>

# Database Configuration
DATABASE_HOST=<mysql host. localhost by default>
DATABASE_PORT=<mysql port. 3306 by default>
DATABASE_USERNAME=<mysql user account>
DATABASE_PASSWORD=<mysql password account>
DATABASE_NAME=<mysql database name>

# Redis Configuration
REDIS_HOST=<redis host. localhost by default>
REDIS_PORT=<redis port. 6379 by default>
```

- Run in development: `npm run start`
- By default, backend is available on [http://localhost:2204](http://localhost:2204)

#### Docker

Checkout [Docker](../README.md#docker) for running the whole application
