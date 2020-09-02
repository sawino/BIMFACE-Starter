import * as Router from 'koa-router'
import tokenRouter from './TokenRoute'
import fileRouter from './FileRoute'
import userRouter from './UserRoute'
import translateRouter from './TranslateRoute'
import fileCustomDataRouter from './FileCustomDataRoute'

let apiRouter = new Router();
apiRouter.prefix('/api')

apiRouter.use(tokenRouter.routes()).use(tokenRouter.allowedMethods())
apiRouter.use(fileRouter.routes()).use(fileRouter.allowedMethods())
apiRouter.use(userRouter.routes()).use(userRouter.allowedMethods())
apiRouter.use(translateRouter.routes()).use(translateRouter.allowedMethods())
apiRouter.use(fileCustomDataRouter.routes()).use(fileCustomDataRouter.allowedMethods())

export default apiRouter