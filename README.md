# BIMFACE-Starter
A starter for [BIMFACE](http://www.bimface.com) development which has both client and server. The client users can upload / translate files and save / load business data (like tags) using the program.

# Technology Stack
* Server
  * Typescript, KOA2, TypeORM, JWT
* Client
  * Javascript (ES6), Vue, Element-UI, Webpack

# How to use
## Preparation
* Prepare BIMFACE AppKey and AppSecret
  * Register the BIMFACE account
  * Get AppKey and AppSecret from [BIMFACE Console](https://bimface.com/user-console#/application/information)
* Prepare Database. Basically, you can use any database, and mysql is the database used in the starter.
  * Install [mysql](https://www.mysql.com/)
  * Log in the mysql with your account. 
    * ```mysql -u <your_db_account_name> -p```
  * Create starter database. 'utf8' is needed for characters like Chinese.
    * ```CREATE DATABASE bimface_starter CHARACTER SET='utf8';```
* Prepare Node.js environment
  * Install [Node](https://nodejs.org/en/)
## Start Server 
* Go to *server* folder.
* Install dependencies.
  * ```npm install```
* Set up environment variables. Mac/Linux terminal uses ```export <var_name>=<var_value>``` and Windows terminal uses ```set <var_name>=<var_value>```. The examples below use Mac style.
    * Set BIMFACE app key. ```export BIMFACE_APP_KEY=<your_key>```
    * Set BIMFACE app secret. ```export BIMFACE_APP_SECRET=<your_secret>```
    * Set database user name. ```export DB_USER_NAME=<your_name>```
    * Set database user password. ```export DB_PASSWORD=<your_password>```

* Run server. The default server address is *http://localhost:3000*
  * ```npm run dev```
## Start Client
* Go to *client* folder.
* Install dependencies.
  * ```npm install```
* Run client. The default client address is *http://localhost:8080*. The port will be different if it's occupied by other program.
  * ```npm run dev```

## Use the program
* Navigate to *http://localhost:8080* in your browser.
* Sign up and sign in.
* Go to File Management from top menu Data Management.
* Upload your model files (e.g., rvt) or CAD files (e.g., dwg) using the *plus* button. If you don't have any, download the sample files from [BIMFACE Developer Guide](https://bimface.com/developer-guide/887). The uploaded files will be placed in the *Untranslated Files* category.
* Check the files and translate them using the *flying plane* button. Wait for a moment for the data processing and the translated files will be placed in the *Translated Files* category.
* Click on the file names to view them. And you can do extra operations with 3D models, like adding some tags using the menues at the top.

# How does it work
The *server* uses BIMFACE service to upload / translate / delete files and stores business data to the database you created.

# Environment Variables
* Server
  * `NODE_ENV`, the switch for production and developement variables. Values could be 'production' or 'development' and the latter is the default.
  * `PORT`, the port of the server, default is *3000*.
  * `BIMFACE_APP_KEY`, the app key of BIMFACE.
  * `BIMFACE_APP_SECRET`, the app secret of BIMFACE.
  * `JWT_SECRET`, the secret of JWT authentication. **YOU SHOULD USE YOUR OWN SECRET** instead of using the default *!you-need-to-change-this!*
  * `JWT_EXPIRE_IN`, the JWT token expire time, default is *24h* which means 24 hours.
  * `DB_TYPE`, type name of the database, default is *mysql*.
  * `DB_HOST`, the host of the database, default is *localhost*.
  * `DB_PORT`, the port of the database, default is *3306*
  * `DB_USER_NAME`, the user name of the database.
  * `DB_PASSWORD`, the user password of the database.
  * `DB_DATABASE`, the database name, default is *bimface_starter*
> If you want to use the same settings in your team, or wish to set up variables in code, input the configs in the *src/configs/GlobalConfigs.ts*.

> The system variables overwrite the settings in *GloabalConfigs.ts*
* Client
  * `NODE_ENV`, the switch for production and developement variables. Values could be 'production' or 'development' and the latter is the default.
> Set the host address for producton and development at *src/store/modules/configs.js*
# Licensing
No. Feel free to use or modify the code.

# FAQ
* How to save / load / extend the business data?
  * Go to *client/src/components/FileViewer.ts*, check save() and load() methods. Each file has a custom data for business data storage, and the size is 16 MB.
* How to 
* How to deploy the output in production?
  * For server
    * ```npm run build```
    * ```npm run prd``` or place the outputs of *dist/* to your server and run with the *www.js* file.
  * For client
    * ```npm run build```
    * Place the outputs of *dist/* to your server.

