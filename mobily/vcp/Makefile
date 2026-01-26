# Docker Compose Management Makefile
# Usage: make <command> <environment>
# Example: make start dev, make logs prod, make help

# Color palette
GREEN := \033[0;32m
RED := \033[0;31m
YELLOW := \033[1;33m
BLUE := \033[0;34m
PURPLE := \033[0;35m
CYAN := \033[0;36m
WHITE := \033[1;37m
BOLD := \033[1m
GRAY := \033[38;5;240m
DIM := \033[2m
DIMGRAY := \033[2;38;5;240m
NC := \033[0m

# ENV name comes from second argument
ENV := $(word 2, $(MAKECMDGOALS))
COMPOSE := docker-compose.$(ENV).yml

define banner
	@echo ""
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════════════╗$(NC)"
	@printf "$(CYAN)║$(NC) $(BOLD)%-66s$(NC) $(CYAN)║$(NC)\n" ""
	@printf "$(CYAN)║$(NC) $(BOLD)%-66s$(NC) $(CYAN)║$(NC)\n" "DOCKER COMPOSE MANAGER"
	@printf "$(CYAN)║$(NC) $(BOLD)%-66s$(NC) $(CYAN)║$(NC)\n" ""
	@echo "$(CYAN)╠════════════════════════════════════════════════════════════════════╣$(NC)"
	@echo "$(CYAN)╠════════════════════════════════════════════════════════════════════╣$(NC)"
	@printf "$(CYAN)║$(NC) * $(YELLOW)%-8s$(NC)%9s$(PURPLE)$(BOLD)  | $(NC)* $(YELLOW)%6s$(BOLD)$(NC)%35s$(CYAN) ║$(NC)\n" "Env.:" "$(ENV)" "File:" "docker-compose.$(ENV).yml"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
endef

define success_banner
    @echo ""
	@echo "$(GREEN)╔════════════════════════════════════════════════════════════════════╗$(NC)"
	@printf "$(GREEN)║ $(BOLD)%-66s ║$(NC)\n" "SUCCESS"
	@printf "$(GREEN)║$(NC) $(DIM)%-26s$(NC) $(BOLD)$(YELLOW)%38s$(NC)  $(GREEN)║$(NC)\n" "Operation completed for: " "$(ENV)"
	@echo "$(GREEN)╚════════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
endef

define check_env
	@if [ -z "$(ENV)" ]; then \
		echo "$(RED)→ → →     Error: Environment not specified!$(NC)"; \
		echo "$(YELLOW)Usage: make <command> <environment>$(NC)"; \
		echo "$(YELLOW)Example: make start dev$(NC)"; \
		exit 1; \
	fi
	@if [ ! -f "$(COMPOSE)" ]; then \
		echo "$(RED)→ → →     Error: File $(COMPOSE) not found!$(NC)"; \
		echo "$(YELLOW)Available compose files:$(NC)"; \
		ls -1 docker-compose.*.yml 2>/dev/null | sed 's/^/  - /' || echo "  No compose files found"; \
		exit 1; \
	fi
endef

.PHONY: help start stop restart rebuild reset logs ps status health exec shell cleanup prune list validate stats

# Default target
help:
	@echo ""
	@echo "$(PURPLE)╔════════════════════════════════════════════════════════════════════╗$(NC)"
	@printf "$(PURPLE)║$(NC) $(BOLD)%-66s$(NC) $(PURPLE)║$(NC)\n" "DOCKER COMPOSE COMMANDS"
	@echo "$(PURPLE)╠════════════════════════════════════════════════════════════════════╣$(NC)"
	@printf "$(PURPLE)║$(NC) $(BOLD)%-66s$(NC) $(PURPLE)║$(NC)\n" "Core Operations:"
	@printf "$(PURPLE)║$(NC)   $(GREEN)%-18s$(NC) - %-43s $(PURPLE)║$(NC)\n" "start <env>" "Start containers (build & detached)"
	@printf "$(PURPLE)║$(NC)   $(GREEN)%-18s$(NC) - %-43s $(PURPLE)║$(NC)\n" "stop <env>" "Stop all containers"
	@printf "$(PURPLE)║$(NC)   $(GREEN)%-18s$(NC) - %-43s $(PURPLE)║$(NC)\n" "restart <env>" "Restart containers with rebuild"
	@printf "$(PURPLE)║$(NC)   $(YELLOW)%-18s$(NC) - %-43s $(PURPLE)║$(NC)\n" "rebuild <env>" "Rebuild images (no cache)"
	@printf "$(PURPLE)║$(NC)   $(RED)%-18s$(NC) - %-43s $(PURPLE)║$(NC)\n" "reset <env>" "Complete cleanup (images, volumes, etc)"
	@printf "$(PURPLE)║$(NC)   $(PURPLE)%-18s$(NC) - %-43s $(PURPLE)║$(NC)\n" "fresh <env>" "Complete reset + force recreation"
	@printf "$(PURPLE)║$(NC) $(BOLD)%-66s$(NC) $(PURPLE)║$(NC)\n" ""
	@printf "$(PURPLE)║$(NC) $(BOLD)%-66s$(NC) $(PURPLE)║$(NC)\n" "Monitoring & Info:"
	@printf "$(PURPLE)║$(NC)   $(CYAN)%-18s$(NC) - %-43s $(PURPLE)║$(NC)\n" "logs <env>" "Follow container logs"
	@printf "$(PURPLE)║$(NC)   $(CYAN)%-18s$(NC) - %-43s $(PURPLE)║$(NC)\n" "ps <env>" "Show running containers"
	@printf "$(PURPLE)║$(NC)   $(CYAN)%-18s$(NC) - %-43s $(PURPLE)║$(NC)\n" "status <env>" "Detailed container status"
	@printf "$(PURPLE)║$(NC)   $(CYAN)%-18s$(NC) - %-43s $(PURPLE)║$(NC)\n" "health <env>" "Health check status"
	@printf "$(PURPLE)║$(NC)   $(CYAN)%-18s$(NC) - %-43s $(PURPLE)║$(NC)\n" "stats <env>" "Real-time resource usage"
	@printf "$(PURPLE)║$(NC) $(BOLD)%-66s$(NC) $(PURPLE)║$(NC)\n" ""
	@printf "$(PURPLE)║$(NC) $(BOLD)%-66s$(NC) $(PURPLE)║$(NC)\n" "Utilities:"
	@printf "$(PURPLE)║$(NC)   $(BLUE)%-18s$(NC) - %-43s $(PURPLE)║$(NC)\n" "exec <env>" "Execute command in running container"
	@printf "$(PURPLE)║$(NC)   $(BLUE)%-18s$(NC) - %-43s $(PURPLE)║$(NC)\n" "shell <env>" "Open bash shell in main container"
	@printf "$(PURPLE)║$(NC)   $(WHITE)%-18s$(NC) - %-43s $(PURPLE)║$(NC)\n" "validate <env>" "Validate compose file syntax"
	@printf "$(PURPLE)║$(NC)   $(WHITE)%-18s$(NC) - %-43s $(PURPLE)║$(NC)\n" "list" "List all available environments"
	@printf "$(PURPLE)║$(NC) $(BOLD)%-66s$(NC) $(PURPLE)║$(NC)\n" ""
	@printf "$(PURPLE)║$(NC) $(BOLD)%-66s$(NC) $(PURPLE)║$(NC)\n" "System Cleanup:"
	@printf "$(PURPLE)║$(NC)   $(RED)%-18s$(NC) - %-43s $(PURPLE)║$(NC)\n" "cleanup" "Remove stopped containers & unused images"
	@printf "$(PURPLE)║$(NC)   $(RED)%-18s$(NC) - %-43s $(PURPLE)║$(NC)\n" "prune" "System-wide Docker cleanup"
	@printf "$(PURPLE)║$(NC) $(BOLD)%-66s$(NC) $(PURPLE)║$(NC)\n" ""
	@printf "$(PURPLE)║$(NC) $(BOLD)%-66s$(NC) $(PURPLE)║$(NC)\n" ""
	@echo "$(PURPLE)╚════════════════════════════════════════════════════════════════════╝$(NC)"
	@echo "$(DIM)Examples: make start dev, make logs prod, make shell testbed$(NC)"
	@echo ""

show:
	$(call check_env)
	$(call banner)
	@echo "$(DIM) ** Environments: dev, prod..$(NC)"
	@echo "$(DIM)Current environment: $(BOLD)$(YELLOW)$(ENV)$(NC)"
	make help

start:
	$(call check_env)
	$(call banner)
	@echo "$(GREEN)→ → →     Starting containers...$(NC)"
	docker-compose -f $(COMPOSE) up --build -d
	$(call success_banner)

stop:
	$(call check_env)
	$(call banner)
	@echo "$(YELLOW)→ → →     Stopping containers...$(NC)"
	docker-compose -f $(COMPOSE) down
	@echo "$(GREEN)→ → →     Containers stopped successfully$(NC)"

restart:
	$(call check_env)
	$(call banner)
	@echo "$(YELLOW)→ → →     Restarting containers...$(NC)"
	docker-compose -f $(COMPOSE) down
	@echo "$(BLUE)→ → →     Building and starting...$(NC)"
	docker-compose -f $(COMPOSE) up --build -d
	$(call success_banner)

rebuild:
	$(call check_env)
	$(call banner)
	@echo "$(RED)→ → →     Rebuilding images (no cache)...$(NC)"
	docker-compose -f $(COMPOSE) build --no-cache
	@echo "$(GREEN)→ → →     Rebuild completed$(NC)"

reset:
	$(call check_env)
	$(call banner)
	@echo "$(RED)→ → →     FULL RESET - Removing everything...$(NC)"
	@echo "$(YELLOW)⚠️  This will remove images, volumes, and orphaned containers$(NC)"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	docker-compose -f $(COMPOSE) down --rmi all --volumes --remove-orphans
	@echo "$(GREEN)→ → →     Environment reset completed$(NC)"

# New enhanced command for complete restart with force recreation
fresh:
	$(call check_env)
	$(call banner)
	@echo "$(PURPLE)→ → →     Fresh start with force recreation...$(NC)"
	docker-compose -f $(COMPOSE) down --rmi all --volumes --remove-orphans
	docker-compose -f $(COMPOSE) up --build --force-recreate -d
	$(call success_banner)

logs:
	$(call check_env)
	@echo "$(CYAN)→ → →     Following logs for $(BOLD)$(ENV)$(NC)$(CYAN)...$(NC)"
	@echo "$(DIM)Press Ctrl+C to exit$(NC)"
	docker-compose -f $(COMPOSE) logs -f

ps:
	$(call check_env)
	@echo "$(CYAN)→ → →     Container status for $(BOLD)$(ENV)$(NC):"
	docker-compose -f $(COMPOSE) ps

status:
	$(call check_env)
	@echo "$(CYAN)→ → →     Detailed status for $(BOLD)$(ENV)$(NC):"
	@echo ""
	docker-compose -f $(COMPOSE) ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

health:
	$(call check_env)
	@echo "$(GREEN)→ → →     Health check status for $(BOLD)$(ENV)$(NC):"
	@docker-compose -f $(COMPOSE) ps --format "table {{.Name}}\t{{.Status}}" | grep -E "(healthy|unhealthy|starting)" || echo "No health checks configured"

stats:
	$(call check_env)
	@echo "$(BLUE)→ → →     Resource usage for $(BOLD)$(ENV)$(NC):"
	@echo "$(DIM)Press Ctrl+C to exit$(NC)"
	docker stats $$(docker-compose -f $(COMPOSE) ps -q)

exec:
	$(call check_env)
	@echo "$(BLUE)→ → →     Available containers for $(BOLD)$(ENV)$(NC):"
	@docker-compose -f $(COMPOSE) ps --format "table {{.Name}}\t{{.Status}}"
	@echo ""
	@read -p "Enter container name: " container; \
	read -p "Enter command (default: bash): " cmd; \
	cmd=$${cmd:-bash}; \
	docker-compose -f $(COMPOSE) exec $$container $$cmd

shell:
	$(call check_env)
	@echo "$(BLUE)→ → →     Opening shell in main container for $(BOLD)$(ENV)$(NC)..."
	@container=$$(docker-compose -f $(COMPOSE) ps -q | head -n1); \
	if [ -z "$$container" ]; then \
		echo "$(RED)→ → →     No running containers found$(NC)"; \
		exit 1; \
	fi; \
	docker exec -it $$container /bin/bash || docker exec -it $$container /bin/sh

validate:
	$(call check_env)
	@echo "$(WHITE)→ → →     Validating $(BOLD)$(COMPOSE)$(NC)..."
	@( \
		docker-compose -f $(COMPOSE) config > /dev/null && \
		echo "$(GREEN)→ → →     Compose file is valid$(NC)" || \
		echo "$(RED)→ → →     Compose file has errors$(NC)" \
	)

list:
	@echo "$(PURPLE)→ → →     Available environments:$(NC)"
	@echo ""
	@for file in docker-compose.*.yml; do \
		if [ -f "$$file" ]; then \
			env=$$(echo $$file | sed 's/docker-compose\.\(.*\)\.yml/\1/'); \
			echo "  $(GREEN)$$env$(NC) $(DIM)($$file)$(NC)"; \
		fi \
	done 2>/dev/null || echo "  $(RED)No compose files found$(NC)"
	@echo ""

cleanup:
	@echo "$(RED)→ → →     Cleaning up Docker system...$(NC)"
	@echo "$(YELLOW)Removing stopped containers...$(NC)"
	docker container prune -f
	@echo "$(YELLOW)Removing unused images...$(NC)"
	docker image prune -f
	@echo "$(YELLOW)Removing unused networks...$(NC)"
	docker network prune -f
	@echo "$(GREEN)→ → →     Cleanup completed$(NC)"

prune:
	@echo "$(RED)→ → →     SYSTEM-WIDE Docker cleanup...$(NC)"
	@echo "$(YELLOW)⚠️  This will remove ALL unused containers, networks, images, and volumes$(NC)"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	docker system prune -af --volumes
	@echo "$(GREEN)→ → →     System prune completed$(NC)"

%:
	@echo "$(DIM)→ → →     Unknown command: $(YELLOW)'$@'$(NC)"
	@echo "$(DIMGRAY)Try: $(BLUE)'make start dev'$(NC)"
	@echo "$(DIMGRAY)Use 'make help' to see available targets$(NC)"
	@exit 1


# Prevent Make from treating environment names as targets
dev prod staging testbed local test production override development development-local development-test development-staging development-production development-override production-local production-test production-staging production-development production-override staging-local staging-test staging-development staging-production staging-override testbed-local testbed-test testbed-development testbed-production testbed-override local-local local-test local-development local-production local-override override-local override-test override-development override-production override-testbed override-development-local override-development-test override-development-production override-development-override:
	@:
