# Containerization of the Web Applications (Portals)

## Build Process
The application uses Gulp for build automation with the following pipeline:
1. Install Node.js dependencies via npm
2. Install frontend dependencies via Bower
3. Build and package the application
4. Serve via development server (dev) or Nginx (prod)


## Configuration Files

### Gulp Configuration
The `gulpfile.js` has been modified for containerization:
- Server binds to `0.0.0.0` instead of localhost for container accessibility
- Configures static file serving for various asset types (fonts, images, JS, i18n)
- Sets up middleware for proper routing of admin portal resources

```js
// gulpfile.js -- host the portal on 0.0.0.0
// Raise a web server.
gulp.task('connect', ['fast-dist'], function () {
    return connect.server({
        root: bases.src,
        host: "0.0.0.0",
        port: 8080,
        middleware: function (connect) {
            return [
                //...
            ];
        }
    });
});
```

### Nginx Configuration
Location: `nginx/default.conf`
- Listens on port `8080`/`8081`/`8082` (depending on the portal)
- Implements fallback routing for SPA behavior (`try_files`)
- Handles admin portal asset routing


```nginx
server {
  listen 8080;
 
  location / {
    root /usr/share/nginx/html;
    index index.html index.htm;
    try_files $uri $uri/ /index.html;
  }
}
```


## Docker Configurations

Node.js Dependencies
- `npm-shrinkwrap`: Ensures consistent dependency versions
- `gulp`: Build automation and development server
- `bower`: Frontend package management


### Key Differences: Development vs Production

| Aspect                   | Development                 | Prod                                  |
|--------------------------|-----------------------------|---------------------------------------|
| **Base Image**           | node:10-alpine              | Multi-stage (node:10 → nginx:1.21)    |
| **Package Installation** | Global (gulp, bower)        | Global (not a security best practice) |
| **Serving**              | Gulp development server     | Nginx static server                   |
| **Live Reloading**       | ✅ Available                 | ❌ Static assets only                  |
| **Image Size**           | Larger (includes dev tools) | Smaller (runtime optimized)           |
| **Use Case**             | Development, debugging      | Production deployment                 |

***Development Environment (`Dockerfile.dev`)***
- Uses Node.js 10 for better legacy project compatibility
- Installs Gulp and Bower globally for easier development
- Mounts source code for live development
- Runs `gulp server` for development serving
- Exposes port 8080 for external access


***Production Environment (`Dockerfile.prod`)***

**Multi-Stage Process**:
1. **Build Stage**:
    - Similar to dev.
    - Creates distribution tarball using Gulp

2. **Runtime Stage**:
    - Uses lightweight Nginx Alpine image
    - Copies built assets from build stage
    - Extracts and serves static files
    - Removes build artifacts (tarball) for minimal image size


## Usage

### For Development
1. Use `Dockerfile.dev` for active development
2. Mounted source code as volumes for live editing
3. Access the application at `http://localhost:8080/adminportal`, or the appropriate port & name for your portal
4. Changes to be be reflected through Gulp's watch functionality

### For Production
1. Use `Dockerfile.prod` for deployment
2. Built assets are baked into the image
3. Nginx serves static files

> **npm-shrinkwrap**: Ensures consistent dependency versions


## Troubleshooting

### Common Issues
- **A web server is already running**: Ensure no other services are using port 8080
- **Port conflicts**: Ensure port 8080 is available on your host
- **Permission issues**: Development dockerfile uses `--allow-root` for bower
- **Build failures**: Check Node.js version compatibility with legacy packages
- **Asset loading**: Verify nginx configuration matches your asset paths

### Debugging
- Use `-it` flag for interactive debugging 
- Check container logs for build or runtime errors
- Verify port mappings with `docker ps`


---

---

# Containerization of the Web Server (HTTPD Reverse Proxy)

The Apache HTTP Server acts as a reverse proxy for the A3GW backend services, providing SSL termination, security header applications and routing requests to various portal applications and authentication services.

```
# Sample Dockerfile for Apache HTTP Server

# Latest lightweight Alpine-based image (2.4.63 as of June 2025)
FROM httpd:alpine 

RUN mkdir -p /usr/local/apache2/conf.d
COPY ./vcp/conf.d /usr/local/apache2/conf.d
COPY ./vcp/conf/httpd.conf /usr/local/apache2/conf/httpd.conf

# Copy CA (Certification Authority) Public Key
COPY ./vcp/openssl.prod/server.crt /usr/local/apache2/conf/server.crt
COPY ./vcp/openssl.prod/server.key /usr/local/apache2/conf/server.key

```

### Proxy Configuration

#### Authentication Services
- **CMPF Auth**: Routes `/cmpf-auth-rest/*` to `http://a3gw:8445`
    - Token refresh endpoint: `/cmpf-auth-rest/refresh-token`
    - Main auth REST API: `/cmpf-auth-rest`

#### Portal Applications
Routes portal requests to `http://a3gw:8444`:
- **Admin Portal**: `/adminportal` → Admin interface
- **CC Portal**: `/ccportal` → Customer care interface
- **Partner Portal**: `/partnerportal` → Partner interface

#### Supporting Services
- **VCP Services**: `/vcp/services` or `/dsp/services` → Core VCP backend services
- **Configuration**: `/conf` → Configuration management
- **Site Metadata**: `/site.json` → Site configuration data
- **CAPTCHA**: `/img/captcha.png` → CAPTCHA image generation

#### Security Headers
- **Content Security Policy**: Applied to report pages to allow blob downloads
- **CORS Support**: Configured for XMLHttpRequest blob handling

### SSL/TLS Configuration

#### Certificate Management
Each environment maintains separate SSL certificates:
- **Production**: `vcp/openssl.prod/server.{crt,key}`
- **Development**: `vcp/openssl.dev/server.{crt,key}`
- **K8s Local**: K8s environments use pre-generated production certs unless overridden by dev/test-specific certs (e.g., `openssl.dev/) for local testing.

#### Port Configuration
- **HTTP**: Port 80 (container) → 9080 (host)
- **HTTPS**: Port 443 (container) → 9443 (host)

### Network Architecture

```
Client Request (to port 9080/9443)
         ↓
Apache HTTP Server Container
         ↓
Reverse Proxy Rules (proxy.conf)
         ↓
Backend Services (a3gw:8444/8445)
```

#### Service Routing
- **Port 8444**: Portal applications and core services
- **Port 8445**: Authentication services and CAPTCHA
- **Host `a3gw`**: Backend gateway server

### Integration with Portal Containers

The Apache reverse proxy works in conjunction with the portal containers:
1. **Portal containers** serve applications on port 8080
2. **Apache proxy** receives external requests on ports 9080/9443
3. **Backend gateway (a3gw)** aggregates portal services on ports 8444/8445
4. **Reverse proxy rules** route requests to appropriate backend services

### Environment-Specific Configurations

| Environment      | Config Directory   | SSL Certificates  | Use Case             |
|------------------|--------------------|-------------------|----------------------|
| **Production**   | `vcp/conf.d.prod`  | `openssl.prod/`   | Live deployment      |
| **Development**  | `vcp/conf.d.dev`   | `openssl.dev/`    | Local development    |
| **K8s Local**    | `vcp/conf.d.k8s`   | `openssl.prod/`   | Kubernetes testing   |


## Troubleshooting

### Common Issues
- **Port conflicts**: Ensure ports `8080`, `8081` & `8082` (portals), `9080`/`9443` (Apache) are available
- **Build failures**: Check Node.js version compatibility with legacy packages
- **SSL certificate issues**: Ensure certificate files exist in correct directories
- **Proxy errors**: Check backend service availability on a3gw host
- **CORS issues**: Verify Content Security Policy headers for blob downloads

### Debugging
- Use `-it` flag for interactive debugging
- Check container logs for build or runtime errors
- Verify port mappings with `docker ps`
- Test proxy connectivity: `curl -k https://localhost:9443/adminportal`
- Check SSL certificate validity: `openssl x509 -in server.crt -text -noout`


---

---


# Containerization of A3GW (Node.js Proxy Server)

A3GW is a Node.js-based API gateway that provides:
- Request routing to multiple portal applications
- Authentication services via CMPF Auth
- Static file serving for configuration and public assets
- Rate limiting, audit logging & filtering etc.

> `server_config.json` **proxy.servicesHttpHost**: Bind address (`0.0.0.0` for container access)

## Core Components
- **Main Application** (`app.js`): Primary API gateway on port 8444
- **Auth Service** (`app_auth.js`): CMPF authentication service on port 8445
- **Static Servers**: Private (8085) and public (8086) file serving
- **PM2 Process Manager**: Multi-process orchestration for deployments

***Ports***
- **8444**: Main API gateway (portal routing, services)
- **8445**: Authentication services and CAPTCHA
- **8085**: Private static file server (internal access)
- **8086**: Public static file server (external access)
  
<sm>See the `ecosystem.config.js` file</sm>


## Application Routing Configuration

### Portal Applications
The gateway routes requests to containerized portal applications:

| Portal             | Path             | Target Container   | Port |
|--------------------|------------------|--------------------|------|
| **Admin Portal**   | `/adminportal`   | `vcpadminportal`   | 8080 |
| **Customer Care**  | `/ccportal`      | `vcpccportal`      | 8081 |
| **Partner Portal** | `/partnerportal` | `vcppartnerportal` | 8082 |

### Static Resources
- **Configuration**: `/conf` → Private static server (8085)
- **Site Metadata**: `/site.json` → Public static server (8086)

### Authentication & Security
- **Bearer Token**: Authorization header-based authentication (8445)
- **Token Management**: Refresh token support (8445)
- **Rate Limiting**: Configurable request throttling (production: enabled, dev: disabled)
- **CAPTCHA**: Enabled for partner portal registration (8445)

### Content Filtering
- **Allowed Origins**: Localhost (configurable per environment)
- **File Extensions**: CSS, JS, fonts, images, maps
- **Allowed Files**: `app.html`, `index.html`, `site.json`
- **Directories**: `/public`, `/login`, `/partials`, `/i18n`
- **Special Paths**: Pentaho report generation
- **REST Services**: Backend API services 


## Network Flow Diagram

```
External Request → Apache Proxy (9443/9080)
                      ↓             ↓
A3GW Main Gateway (8444) ← Auth Service (8445)
                      ↓
Portal Containers (8080-8082)

```

### Service Communication
- **Inbound**: Apache HTTP server forwards requests
- **Portal Routing**: Proxies to individual portal containers
- **Auth Integration**: Coordinates with CMPF authentication
- **Static Serving**: Internal file serving for configuration and assets


### Runtime Dependencies
- **Portal Containers**: Must be available at configured hostnames
- **Static Files**: Environment-specific configuration and assets
- **SSL Certificates**: For HTTPS communication (if enabled)

## Troubleshooting

### Common Issues
- **Port Conflicts**: Ensure 8444/8445 are available
- **Container Communication**: Verify portal container hostnames

### Debug Commands
```bash
# Check process status
docker exec -it <container> pm2 status

# View application logs
docker exec -it <container> pm2 logs

# Test gateway routing
curl http://localhost:8444/adminportal
curl http://localhost:8445/cmpf-auth-rest

# Verify static file serving
curl http://localhost:8444/conf
curl http://localhost:8444/site.json
```

---

---
*Last updated: June 2025*
