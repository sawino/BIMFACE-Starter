class GlobalConfigs {
    configs: any;

    constructor() {
        this.configs = {
            nodeEnv: '',
            port: '',
            isProduction: '',
            bimfaceAppKey: '',
            bimfaceAppSecret: '',
            jwtSecret: '',
            jwtExpireIn: '',
            typeOrmConfig: {
                "type": "",
                "host": "",
                "port": "",
                "username": "",
                "password": "",
                "database": "",
                "synchronize": true,
                "logging": false,
                "entities": [
                   "src/entity/**/*.ts"
                ],
                "migrations": [
                   "src/migration/**/*.ts"
                ],
                "subscribers": [
                   "src/subscriber/**/*.ts"
                ],
                "cli": {
                   "entitiesDir": "src/entity",
                   "migrationsDir": "src/migration",
                   "subscribersDir": "src/subscriber"
                }
             }
        }

        this.configs['nodeEnv'] = process.env.NODE_ENV || 'development'
        this.configs['isProduction'] = (this.configs['nodeEnv'] === 'production')

        this.setValue(this.configs, 'port', 'PORT', 'not_defined', '3000');
        this.setValue(this.configs, 'bimfaceAppKey', 'BIMFACE_APP_KEY', 'not_defined', 'not_defined');
        this.setValue(this.configs, 'bimfaceAppSecret', 'BIMFACE_APP_SECRET', 'not_defined', 'not_defined')
        this.setValue(this.configs, 'jwtSecret', 'JWT_SECRET', 'not_defined', '!you-need-to-change-this!')
        this.setValue(this.configs, 'jwtExpireIn', 'JWT_EXPIRE_IN', 'not_defined', '24h')
        this.setValue(this.configs['typeOrmConfig'], 'type', 'DB_TYPE', 'not_defined', 'mysql')
        this.setValue(this.configs['typeOrmConfig'], 'host', 'DB_HOST', 'not_defined', 'localhost')
        this.setValue(this.configs['typeOrmConfig'], 'port', 'DB_PORT', 'not_defined', '3306')
        this.setValue(this.configs['typeOrmConfig'], 'username', 'DB_USER_NAME', 'not_defined', 'not_defined')
        this.setValue(this.configs['typeOrmConfig'], 'password', 'DB_PASSWORD', 'not_defined', 'not_defined')
        this.setValue(this.configs['typeOrmConfig'], 'database', 'DB_DATABASE', 'not_defined', 'bimface_starter')
    }

    public  getPort() {
        return this.configs['port']
    }

    public getNodeEnv() {
        return this.configs['nodeEnv']
    }

    public getIsProduction() {
        return this.configs['isProduction']
    }

    public getBimfaceAppKey() {
        return this.configs['bimfaceAppKey']
    }

    public getBimfaceAppSecret() {
        return this.configs['bimfaceAppSecret']
    }

    public getJwtSecret() {
        return this.configs['jwtSecret']
    }

    public getJwtExpireIn() {
        return this.configs['jwtExpireIn']
    }

    public getTypeOrmConfig() {
        return this.configs['typeOrmConfig']
    }

    private setValue(obj: any, variable: string, envKey: string, productionValue: string, developmentValue: string) {
        obj[variable] = process.env[envKey] || ''
        if (obj[variable] == '') {
            obj[variable] = this.getIsProduction() ? productionValue : developmentValue
        }
    }
}

let globalConfigs = new GlobalConfigs()

export default globalConfigs