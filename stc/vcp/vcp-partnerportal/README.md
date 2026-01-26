# Digital Services Platform Partner Web Application
---

## Installation
Install curl to download _node_ installer
<pre>
]$ sudo apt-get install curl
</pre>
Install _nodejs_ and _npm_

This command will install both _node_ (which is legacy but required) and _nodejs_ 
<pre>
]$ curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
]$ sudo apt-get install -y nodejs
</pre>
Go to project directory
<pre>
]$ cd $PROJECT_DIRECTORY
</pre>
Install necessary required libraries automatically with npm

This will install all development dependencies to the _node_modules_ directory which is going to automatically created.
<pre>
]$ npm install
</pre>
Install _bower_ globally with the _-g_ parameter. Bower allows you to install dependencies that required by your application.
<pre>
]$ sudo npm install bower -g
</pre>

Install all bower dependencies

_--force_ used since compatibilities of the versions of the components have tested together.

For more information about the **Bower** please visit: <a href="http://bower.io/">http://bower.io/</a>
<pre>
]$ bower install --force
</pre>
After that install the task runner named Gulp

For more information about the **Gulp** please visit: <a href="http://gulpjs.com/">http://gulpjs.com/</a>
<pre>
]$ sudo npm install gulp -g
</pre>


## Building Distribution

In order to build production distribution from the source use the default task of the gulp.

The default task builds the source and compress it. It creates a distribution directory named _dist_ and a compressed file which
contains the content of it like this "vcp-partnerportal-\<timestamp\>.tar.gz".

To run the default task of the gulp (it is defined in the _gulpfile.js_ file) it is enough to run only _gulp_ command on the command prompt:
<pre>
]$ gulp
</pre>

In order to build the source only:
<pre>
]$ gulp build
</pre>

In order to compress the _dist_ directory only (this depends the build task and runs before the compressing everytime):
<pre>
]$ gulp compress
</pre>

## Deploying to a Remote Server

To deploy a remote server gulp deploy task can be used. Deploy task needs a cluster as parameter which is found in deployConfig.json file.
When executed without a cluster, task simply points out possible clusters.
deployConfig.json can be created by copying deployConfig.json.example file. 

<pre>
]$ gulp deploy --cluster test
</pre>

## Running a HTTP Server

In order to serve the application please use the task named _server_. This task will raise a server, connect to it and check for changes in source code
<pre>
]$ gulp server
</pre>
