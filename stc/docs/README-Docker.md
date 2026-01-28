
### [Using the Makefile (Docker)](README-Make.md)

Make sure you have Docker and Docker Compose installed. Then, navigate to the directory containing the `Makefile`:

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



## Access the Portals

|                    |                                                                                        |                                                                                                  |                                                                                                  | MOBILY DSP                                       | MOBILY VCP      | STC VCP                                                                              |
|--------------------|----------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|--------------------------------------------------|-----------------|--------------------------------------------------------------------------------------|
| Portal             | DEV                                                                                    | PROD                                                                                             | K8s                                                                                              | Credentials                                      | Credentials     | Credentials                                                                          |
| **Admin Portal**   | • [http](http://localhost/adminportal)<br>• [https](https://localhost/adminportal)     | • [http](http://localhost:9080/adminportal)<br>• [https](https://localhost:9443/adminportal)     | • [http](http://localhost:9080/adminportal)<br>• [https](https://localhost:9443/adminportal)     | • administrator / Test@12345 <br>• admin / admin | • admin / admin | • znpzsy / Test@1234 <br>• admin / admin                                             |
| **CC Portal**      | • [http](http://localhost/ccportal)<br>• [https](https://localhost/ccportal)           | • [http](http://localhost:9080/ccportal)<br>• [https](https://localhost:9443/ccportal)           | • [http](http://localhost:9080/ccportal)<br>• [https](https://localhost:9443/ccportal)           | • administrator / Test@12345                     | • admin / admin | • admin / admin                                                                      |
| **Partner Portal** | • [http](http://localhost/partnerportal)<br>• [https](https://localhost/partnerportal) | • [http](http://localhost:9080/partnerportal)<br>• [https](https://localhost:9443/partnerportal) | • [http](http://localhost:9080/partnerportal)<br>• [https](https://localhost:9443/partnerportal) | • okans@okanstore / Okan@321                     | ❌               | • znpzsy / Test@1234 <br>• znpzsy-cp1 / Test@1234 <br>• znpzsy-mypartner / Test@1234 |

### Exposed Ports (K8s)

|                | Test URL                                                                     | Info                                 |     |
|----------------|------------------------------------------------------------------------------|--------------------------------------|-----|
| Admin Portal   | [http://localhost:9444/adminportal](http://localhost:9444/adminportal)       | Will not be able to authenticate     | A3G |
| CC Portal      | [http://localhost:9444/ccportal](http://localhost:9444/ccportal)             | Will not be able to authenticate     | A3G |
| Partner Portal | [http://localhost:9444/partnerportal](http://localhost:9444/partnerportal)   | Will not be able to authenticate     | A3G |
| Server Config  | [http://localhost:9444/server.json](http://localhost:9444/server.json)       | Forbidden! (Requires authentication) | A3G |
| Site Config    | [http://localhost:9444/site.json](http://localhost:9444/site.json)           | Public Access (Get site info)        | A3G |

### Testing Portal Pods (K8s)
<sm>Will require port forwarding.</sm>


|                | Test URL                                                                   | Info                                 |                  |
|----------------|----------------------------------------------------------------------------|--------------------------------------|------------------|
| Admin Portal   | [http://localhost:8080/adminportal](http://localhost:8080/adminportal)     | Will not be able to authenticate     | adminportal      |
| CC Portal      | [http://localhost:8081/ccportal](http://localhost:8081/ccportal)           | Will not be able to authenticate     | ccportal         |
| Partner Portal | [http://localhost:8082/partnerportal](http://localhost:8082/partnerportal) | Will not be able to authenticate     | partnerportal    |


---
