import {Context} from 'koa'
import {IMiddleware} from'koa-router'
import {getManager} from 'typeorm'
import {ResponseData} from '../common/ResponseData'

export const checkRole = (role: string) => {
    return async(ctx: Context, next: () => Promise<any>) => {
        if (ctx.state.user.role !== role) {
            ctx.body = ResponseData.createFailedResponse('Permission Denied')
            return
        }

        await next()
    }
}


