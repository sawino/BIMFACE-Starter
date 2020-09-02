import authRouter from './AuthRoute'
import homeRouter from './HomeRoute'
import * as Router from 'koa-router'

let unprotectedRouter = new Router();
unprotectedRouter.use(homeRouter.routes()).use(homeRouter.allowedMethods());
unprotectedRouter.use(authRouter.routes()).use(authRouter.allowedMethods())

export default unprotectedRouter