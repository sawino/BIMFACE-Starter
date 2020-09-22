import * as Router from 'koa-router'
let tokenRouter = new Router();
import bimfaceService from '../../services/BimfaceService'
import {ResponseData} from '../../common/ResponseData'
import User from '../../entity/User'
import File from '../../entity/File'
import {getManager} from 'typeorm'
import {checkRole} from '../../middlewares/CheckRole'
import Roles from '../../common/Roles'

tokenRouter.prefix('/token')

tokenRouter
    .get('/accessToken', checkRole(Roles.Admin), async ctx => {
        let token = await bimfaceService.getAccessTokenAsync();
        ctx.body = ResponseData.build(token !== '', token, "Failed to get access token")
    })
    .get('/viewToken', async ctx => {
        const userRepository = await getManager().getRepository(User)
        const user = await userRepository.findOne({id: ctx.state.user.id})
        if (user === undefined) {
            ctx.body = ResponseData.createFailedResponse("Not authorized")
            return;
        }

        const fileRepository = await getManager().getRepository(File);
        console.log(ctx.query.fileId)
        let file = await fileRepository.findOne({fileId: ctx.query.fileId, user: user})
        if (file === undefined || file === null) {
            ctx.body = ResponseData.createFailedResponse("Cannot find file")
            return;
        }
        
        let response = await bimfaceService.getViewTokenAsync(ctx.query.fileId)
        ctx.body = ResponseData.build(response.code === 'success', response.data, "Failed to get file view token")
    })

export default tokenRouter