# Docker Compose Management

The Makefile provides a unified interface for managing multiple environments (dev, prod, etc.).

## Prerequisites

Make sure you have:

- Docker and Docker Compose installed
- Make utility installed
- Navigated to the directory containing the `Makefile` (eg., `stc/vcp`, `mobily/dsp`, `mobily/vcp`etc.)
- Docker Compose files named with the pattern: `docker-compose.<environment>.yml`

## Quick Start

```text

╔════════════════════════════════════════════════════════════════════╗
║ DOCKER COMPOSE COMMANDS                                            ║
╠════════════════════════════════════════════════════════════════════╣
║ Core Operations:                                                   ║
║   start <env>        - Start containers (build & detached)         ║
║   stop <env>         - Stop all containers                         ║
║   restart <env>      - Restart containers with rebuild             ║
║   rebuild <env>      - Rebuild images (no cache)                   ║
║   reset <env>        - Complete cleanup (images, volumes, etc)     ║
║   fresh <env>        - Complete reset + force recreation           ║
║                                                                    ║
║ Monitoring & Info:                                                 ║
║   logs <env>         - Follow container logs                       ║
║   ps <env>           - Show running containers                     ║
║   status <env>       - Detailed container status                   ║
║   health <env>       - Health check status                         ║
║   stats <env>        - Real-time resource usage                    ║
║                                                                    ║
║ Utilities:                                                         ║
║   exec <env>         - Execute command in running container        ║
║   shell <env>        - Open bash shell in main container           ║
║   validate <env>     - Validate compose file syntax                ║
║   list               - List all available environments             ║
║                                                                    ║
║ System Cleanup:                                                    ║
║   cleanup            - Remove stopped containers & unused images   ║
║   prune              - System-wide Docker cleanup                  ║
║                                                                    ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
Examples: make start dev, make logs prod, make shell testbed


```


1. **Navigate to the relevant directory:**
   ```bash
   cd stc/vcp
   ```

2. **View available commands:**
   ```bash
   make
    # or
   make help
   ```

3. **List available environments:**
   ```bash
   make list
   ```

4. **Start your development environment:**
   ```bash
   make start dev
   ```

5. **View logs:**
   ```bash
   make logs dev
   ```

## Environment Setup

Create Docker Compose files for each environment you need:

```
project/
├── docker-compose.dev.yml       # Development environment
├── docker-compose.prod.yml      # Production environment
├── docker-compose.other.yml     # Other environment
└── Makefile                     # This management file
```

## Available Commands

### Core Operations

| Command                | Description                             |
|------------------------|-----------------------------------------|
| `make start <env>`     | Start containers (build & detached)     |
| `make stop <env>`      | Stop all containers                     |
| `make restart <env>`   | Restart containers with rebuild         |
| `make rebuild <env>`   | Rebuild images (no cache)               |
| `make reset <env>`     | Complete cleanup (images, volumes, etc) |
| `make fresh <env>`     | Complete reset + force recreation       |

### Monitoring & Information

| Command             | Description                 |
|---------------------|-----------------------------|
| `make logs <env>`   | Follow container logs       |
| `make ps <env>`     | Show running containers     |
| `make status <env>` | Detailed container status   | 
| `make health <env>` | Health check status         |
| `make stats <env>`  | Real-time resource usage    |

### Utilities

| Command               | Description                            |
|-----------------------|----------------------------------------|
| `make exec <env>`     | Execute command in running container   |
| `make shell <env>`    | Open bash shell in main container      |
| `make validate <env>` | Validate compose file syntax           |
| `make list`           | List all available environments        |

### System Cleanup

| Command          | Description                                 |
|------------------|---------------------------------------------|
| `make cleanup`   | Remove stopped containers & unused images   |
| `make prune`     | System-wide Docker cleanup                  |

## Usage Examples

### Development Workflow

```bash
# Start development environment
make start dev

# View logs
make logs dev

# Check container status
make ps dev

# Open shell in main container
make shell dev

# Stop when done
make stop dev
```

### Testing Environment

```bash
# Start fresh testing environment
make fresh test

# Run specific command in container
make exec test
# Then enter container name and command when prompted

# View real-time resource usage
make stats test

# Complete cleanup
make reset test
```

### Production Deployment

```bash
# Validate configuration first
make validate prod

# Start production environment
make start prod

# Monitor health
make health prod

# View detailed status
make status prod
```

### Troubleshooting

```bash
# Rebuild without cache if issues occur
make rebuild prod

# Complete reset if needed
make reset prod

# System-wide cleanup
make cleanup
```


## Features

- **Confirmation prompts** for destructive operations (`reset`, `prune`)
- **File existence checks** before attempting operations
- **Environment validation** to prevent accidental operations
- **Graceful error handling** with helpful suggestions

## Troubleshooting

### Common Issues

1. **"Environment not specified" error:**
   ```bash
   # Wrong
   make start
   
   # Correct
   make start dev
   ```

2. **"Compose file not found" error:**
    - Ensure your file follows the naming pattern: `docker-compose.<env>.yml`
    - Use `make list` to see available environments

3. **Permission errors:**
   ```bash
   # Make sure Docker daemon is running and you have permissions
   sudo systemctl start docker
   ```

4. **Container won't start:**
   ```bash
   # Check the compose file syntax
   make validate dev
   
   # View detailed logs
   make logs dev
   ```

## Best Practices

1. **Always validate** your compose files before deployment:
   ```bash
   make validate prod
   ```

2. **Use environment-specific settings** in your compose files
3. **Regular cleanup** to free up disk space:
   ```bash
   make cleanup
   ```

4. **Monitor resource usage**:
   ```bash
   make stats prod
   ```

5. **Use `fresh` command** when you need a completely clean restart:
   ```bash
   make fresh dev
   ```



---

---
*Last updated: June 2025*
