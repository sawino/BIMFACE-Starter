import * as Koa from 'koa'
import {apiRouter, unprotectedRouter} from './routes'
import "reflect-metadata";
import {createConnection, getConnectionOptions} from 'typeorm';
import * as bodyParser from 'koa-bodyparser';
import globalConfigs from './configs/GlobalConfigs'
import * as jwt from 'koa-jwt'
import {ResponseData} from './common/ResponseData'
import bimfaceService from './services/BimfaceService'

const app: Koa = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const logger = require('koa-logger')
const cors = require('koa2-cors')
const koaBody = require('koa-body')

// error handler
onerror(app)
app.use(function (ctx, next) {
    return next().catch((err) => {
      if (err.status === 401) {
        ctx.status = 401;
        let errorMessage = 'Authentication error';
        if (err.originalError !== null 
            && err.originalError !== undefined 
            && err.originalError.name === 'TokenExpiredError') {
            errorMessage = 'Authentication expired'
        }
        ctx.body = ResponseData.createFailedResponse(errorMessage)
      } else {
         throw err;
        // ctx.body = ResponseData.createFailedResponse('Unknown error');
      }
    });
});

// middlewares
app.use(cors())
app.use(koaBody({
    multipart: true
}));
app.use(bodyParser())
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + './../public'))
app.use(views(__dirname + './../views', {
  extension: 'ejs'
}));

(async () => {
    try {
        let connectionOptions = await getConnectionOptions(globalConfigs.getDbConnectionName())
        connectionOptions = Object.assign(connectionOptions, globalConfigs.getTypeOrmConfig())
        let connection = await createConnection(connectionOptions)
        if (connection !== null) {
            // app.use((ctx, next) => ctx.state = Object.assign(ctx.state, {connection: connection}))
            console.log(`Database: ${connection.options.type} connected`)
        }
        
        await bimfaceService.initAsync()

    } catch(err) {
        console.log(err)
    }
})()

// logger
app.use(async (ctx, next) => {
  const start: Date = new Date()
  await next()
  const ms: number = new Date().getTime() - start.getTime()
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(unprotectedRouter.routes()).use(unprotectedRouter.allowedMethods())
// make sure this is added before procted routes
app.use(jwt({secret: globalConfigs.getJwtSecret()}).unless({path: [/^\/public/, /^\/auth/]}))
app.use(apiRouter.routes()).use(apiRouter.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

export {app} 
