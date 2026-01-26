# Authentication, Authorization, and Audit Log Management Application and Proxy Gateway

---

## About the Branch

This branch contains the source code for A3GW, which has been upgraded to use Node.js v20.14.0 LTS (Iron).

## Installation (Working on Your Local Machine)

This application requires Node.js and npm. **For managing Node.js versions on your local environment**, it is recommended to use `nvm` (Node Version Manager). If you will be working on portal projects written in AngularJS, `nvm` allows you to easily switch between different versions of Node.js, which is necessary for running both A3G and the portals.

Other resources:

* [Working on Your Local Machine (Ubuntu)][3]
* [Working on Your Local Machine (Mac OS X)][4]
* [Running A3GW and Portals Together][5]


### Install nvm Script

To install or update nvm, use the [install script][1] with cURL:

```sh
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.39.1/install.sh | bash
```

or with Wget:

```sh
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.39.1/install.sh | bash
```

### Verify nvm Installation

To verify that nvm has been installed, run:

```sh
command -v nvm
```

You should see `nvm` as the output if the installation was successful. Note that `which nvm` will not work because `nvm` is a sourced shell function, not an executable binary.

### Installing Node via nvm

To download, compile, and install the latest release of Node.js, run:

```sh
nvm install node
```

In any new shell, use the installed version:

```sh
nvm use node
```

To install a specific release of Node.js, run:

```sh
nvm install 20.14.0
```

After installing, you can set the specific version of Node.js to be used in your shell session:

```sh
nvm use 20.14.0
```

Set a Default Version (optional):

If you want a specific version to be the default whenever you open a new terminal session, use:

```sh
nvm alias default 11.3.0
```
Verify Installation:

You can verify that the correct version of Node.js is being used by running:

```sh
node -v
```
This should output the version number you installed, such as v11.3.0.

For more details, visit [nvm's GitHub page](https://github.com/creationix/nvm).


### Node.js Version

This application requires Node.js version 20.14 Iron. If you've set a different node version as default, please do not forget to run
```sh
nvm use 20
Now using node v20.14.0 (npm v10.7.0)
```

## Installing Required Libraries with npm

Install all development dependencies to the `node_modules` directory by running:

```sh
npm install
```

## Configuration

Configuration files are located under the `conf` directory:

- **jwt_config.json**: JWT secret key and algorithm. Rename `jwt_config.json.example` to create the config file.
- **logger_config.json**: Audit log configuration. Rename `logger_config.json.example` to create the config file.
- **auth_config.json**: Contains IP addresses of the Auth server. Rename `auth_config.json.example` to create the config file.
- **server_config.json**: Web application-specific definitions and filter constants. Rename `server_config.json.example` to create the config file.
- **service_proxies_config.json**: Proxy definitions for backend services used by portal applications to obtain data.
- **idle_config.json (Optional)**: Specifies idle timeout and keep-alive interval values. Rename `idle_config.json.example` to create the config file.




## Running the Servers - On Your Local Environment

See the scripts section under the `package.json` [file][6].

To run the application server:
```sh
npm run appsrv
```

To run the authentication & authorization (CMPF) server:
```sh
npm run authsrv
```

You could also use the following commands:

### Starting the Application Directly with Node

You can directly start the application using Node.js with the following command:

```sh
node src/app.js --auth_config=auth_config.json --jwt_config=jwt_config.json --logger_config=logger_config.json --server_config=server_config.json --idle_config=idle_config.json --service_proxies_file=service_proxies_config.js
```

```sh
node src/app_auth.js --auth_config=auth_config.json -jwt_config=jwt_config.json --logger_config=logger_config.json --server_config=server_config.json --idle_config=idle_config.json --service_proxies_file=service_proxies_config.js
```


## Running the Servers - Production Environment or Testbeds

To run the application and start the proxy gateway servers, use the [pm2][2] (process manager) tool. The [quickstart guide][2] provides installation and usage instructions.


To install `pm2` globally for your selected node version, you could run the following command on your local machine:

```sh
 npm install pm2@latest -g  
 ```


Rename the server configuration file `ecosystem.config.js.example` to `ecosystem.config.js` and execute the following command to start all servers:

```sh
pm2 start ecosystem.config.js
```


### Installing and Running the Upgraded Version (PM2 v5.4.1 & NodeJS v20.14.0)
If the server you're working on contains a previous (outdated) deployment of A3G, please check the node version & pm2 version beforehand.

Access the remote server via ssh and switch user to `coeadmin`:

```sh
---------------------------------------------------------
UNAUTHORIZED ACCESS TO THIS DEVICE IS PROHIBITED
You must have explicit, authorized permission to access
or configure this device. Unauthorized attempts and
actions to access or use this system may result in civil
and/or criminal penalties. All activities performed on
this device are logged and monitored.
---------------------------------------------------------
        _          _               _  _
       | |_   ___ | |  ___  _ __  (_)| |_  _   _
       | __| / _ \| | / _ \| '_ \ | || __|| | | |
       | |_  | __/| | | __/| | | || || |_ | |_| |
        \__| \___||_| \___||_| |_||_| \__| \__, |
                                           |___/
Register this system with Red Hat Insights: insights-client --register
Create an account or view all your systems at https://red.ht/insights-dashboard
Last failed login: Tue Jun 25 12:31:01 +03 2024 from 10.35.39.184 on ssh:notty
There was 1 failed login attempt since the last successful login.
Last login: Tue Jun 25 12:09:54 2024 from 10.34.34.34
[root@stc1 ~]# sudo su - coeadmin
Last login: Tue Jun 25 12:10:43 +03 2024 on pts/0
1) A3GW               4) Cluster CHGGW      7) Cluster PORTAL
2) Cluster CMPF       5) Cluster SCRMNGR
3) Cluster CMPFCACHE  6) Cluster SMSPORTAL
Select a cluster or 'q' to quit: 1
┌─────────────────────────┬────┬──────┬────────┬───┬──────┬───────────┐
│ Name                    │ id │ mode │ status │ ↺ │ cpu  │ memory    │
├─────────────────────────┼────┼──────┼────────┼───┼──────┼───────────┤
│ a3gw_cmpf               │ 1  │ fork │ online │ 1 │ 0.1% │ 42.2 MB   │
│ a3gw_vcp                │ 0  │ fork │ online │ 1 │ 0.1% │ 59.1 MB   │
│ http_static_server_8085 │ 2  │ fork │ online │ 1 │ 0%   │ 27.6 MB   │
└─────────────────────────┴────┴──────┴────────┴───┴──────┴───────────┘
 Use `pm2 show <id|name>` to get more details about an app
[coeadmin@stc1 current]$ 
```

You will be working on the A3GW cluster.

Checking for node:
```sh
[coeadmin@stc1 current]$ command -v node
/space/nodejs/current/bin/node

[coeadmin@stc1 current]$ ll /space/nodejs/
total 18196
lrwxrwxrwx 1 coeadmin canvas       38 Sep 22  2023 current -> /space/nodejs/node-v10.15.0-linux-x64/
drwxr-xr-x 6 coeadmin canvas      108 Dec 26  2018 node-v10.15.0-linux-x64
-rwxr-xr-x 1 coeadmin canvas 18630524 Sep 22  2023 node-v10.15.0-linux-x64.tar.gz

```

On this server, Node v10.15.0 and pm2 v3.1.3 was previously installed.

#### Installing NodeJS (Offline)

Find Node v20.14.0 LTS (Iron) and download it from [Node.js](https://nodejs.org/dist/v20.14.0/)

> You could also download the latest 20.x tarball (most likely the x64 version) [Node.js](https://nodejs.org/dist/latest-v20.x).


Transfer the tarball to your server:

```sh
# scp node-v20.14.0-linux-x64.tar.gz root@10.35.39.101:/tmp
# root@10.35.39.101's password: 
# node-v20.14.0-linux-x64   9% 4384KB 508.6KB/s   01:21 ETA
scp node-v20.14.0-linux-x64.tar.gz <username>@<server_ip_address>:/tmp
```

Copy the package to the library directory:

```sh
## If /space/nodejs is not already present, please make a directory for it:
# mkdir /space/nodejs
cd /space/nodejs
mv /tmp/node-v20.14.0-linux-x64.tar.gz .
tar xvzf node-v20.14.0-linux-x64.tar.gz 
ln -s /space/nodejs/node-v20.14.0 /space/nodejs/current
```

Edit the bash_profile file:

```sh
vim ~/.bash_profile
```

Add the following lines:

```sh
# Node.js
export NODEJS_HOME=/space/nodejs/current
export PATH=$NODEJS_HOME/bin:$PATH
```

Reload the terminal session:

```sh
. ~/.bash_profile
```

Verify the Node.js installation and check the version:

```sh
node -v
npm -v
```

### Installing PM2 (Offline)

On a computer with internet access, download the pm2 tarball from [GitHub](https://github.com/Unitech/PM2/releases) or use the following command:

```sh
wget --content-disposition https://github.com/Unitech/pm2/archive/refs/tags/v5.4.1.tar.gz
```

Extract and install dependencies:

```sh
tar xvzf pm2-5.4.1.tar.gz -C /tmp/
cd /tmp/pm2-5.4.1
npm install
```

Compress again:

```sh
cd /tmp
tar zvcf pm2-5.4.1_with_modules.tar.gz pm2-5.4.1
```

Transfer the tarball to your server:

```sh
# scp pm2-5.4.1_with_modules.tar.gz root@10.35.39.101:/tmp
# root@10.35.39.101's password: 
# pm2-5.4.1_with_modules.tar.gz                            100% 7862KB 555.8KB/s   00:14  
scp /tmp/pm2-5.4.1_with_modules.tar.gz <username>@<server_ip_address>:/tmp
```

On the server, extract the tarball:

```sh
mkdir /space/pm2
tar -xvzf /tmp/pm2-5.4.1_with_modules.tar.gz -C /space/pm2/
# unlink /space/pm2/current/
ln -s /space/pm2/pm2-5.4.1 /space/pm2/current
ln -s /space/pm2/pm2-3.1.3 /space/pm2/current
```

Copy the installed pm2 directory to Node's `node_modules` directory:

```sh
#  cp -r /space/pm2/pm2-5.4.1 /space/nodejs/node-v20.14.0-linux-x64/lib/node_modules/pm2
cp -r /space/pm2/pm2-5.4.1 /space/nodejs/current/lib/node_modules/pm2
```

Edit the bash_profile file:

```sh
vim ~/.bash_profile
```

Add the following lines:

```sh
# pm2
export PM2_HOME=~/.pm2
export PM2_LIB_HOME=/space/pm2/current
export PATH=$PM2_LIB_HOME/bin:$PATH
```

Reload the terminal session:

```sh
. ~/.bash_profile
```

Verify the pm2 installation and check the version:

```sh
pm2 -v
```


### Starting the Application Directly with Node

You can directly start the application using Node.js with the following command:

```sh
node src/app.js --auth_config=auth_config.json --jwt_config=jwt_config.json --logger_config=logger_config.json --server_config=server_config.json --idle_config=idle_config.json --service_proxies_file=service_proxies_config.js
```

### Starting the Application with pm2

Alternatively, you can use pm2 to start the application:

```sh
pm2 start src/app.js --name a3gw_vcp
```

You can provide custom configuration files to the application via command line parameters:

```sh
pm2 start src/app.js --name a3gw_vcp -- --auth_config=auth_config.json --jwt_config=jwt_config.json --logger_config=logger_config.json --server_config=server_config.json --idle_config=idle_config.json --service_proxies_file=service_proxies_config.js
```

Ensure that configuration files are named `auth_config`, `jwt_config`, `logger_config`, `server_config`, `idle_config`, and `service_proxies_file` and are located in the `conf` directory.

### Custom Authentication Service

You can specify a different Authentication & Authorization service implementation using the `auth_service` parameter:

```sh
pm2 start src/app.js --name a3gw_vcp -- --auth_service=auth_service_other.js --auth_config=auth_config_other.json
```

Note the use of two dash characters (`--`) after the process name to provide parameters to your application script.

### Serving Static Files with pm2

Optionally, you can serve static files of the VCP/CSP portal applications via pm2. All static files will be served on port 8085 with the following command:

```sh
pm2 serve /var/www/html/ 8085 --name "all_web_applications_8085"
```

[1]: https://github.com/creationix/nvm/blob/v0.39.1/install.sh
[2]: http://pm2.keymetrics.io/docs/usage/quick-start/
[3]: https://telenity.atlassian.net/wiki/spaces/PROD/pages/166166913/Working+on+Your+Local+Machine+Ubuntu
[4]: https://telenity.atlassian.net/wiki/spaces/PROD/pages/166199998/Working+on+Your+Local+Machine+Mac+OS+X
[5]: https://telenity.atlassian.net/wiki/spaces/PROD/pages/167247895/Running+A3GW+and+Portals+Together
[6]: package.json