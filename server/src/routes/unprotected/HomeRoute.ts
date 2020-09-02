import * as Router from 'koa-router'
import {Context} from 'koa'
let homeRouter = new Router();

homeRouter.prefix('/')

homeRouter.get('/', async (ctx: Context, next) => {
    await ctx.render('index')
})

export default homeRouter
