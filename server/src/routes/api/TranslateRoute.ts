import * as Router from 'koa-router'
import bimfaceService from '../../services/BimfaceService'
import {ResponseData} from '../../common/ResponseData'
import {getManager} from 'typeorm'
import File from '../../entity/File'
import User from '../../entity/User'

let translateRouter = new Router();
translateRouter.prefix('/translate')

translateRouter
    .post('/', async ctx => {
        console.log(ctx.request.body)
        let request: any = ctx.request;
        const fileRepository = await getManager().getRepository(File);
        const userRepository = await getManager().getRepository(User)
        const user = await userRepository.findOne({id: ctx.state.user.id})
        if (user === undefined) {
            ctx.body = ResponseData.createFailedResponse("Not authorized")
            return;
        }

        const file = await fileRepository.findOne({fileId: ctx.request.body.fileId, user: user})
        if (file === undefined || file === null) {
            ctx.body = ResponseData.createFailedResponse("Cannot find file")
            return;
        }

        let res = await bimfaceService.translateFileAsync(file.fileId,
            file.name);

        ctx.body = ResponseData.build(res !== null, file, 'Cannot translate file')
    })
    .get('/', async ctx => {
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

        if (file.isTranslated) {
            ctx.body = ResponseData.createSuccessResponse(file)
            return
        }

        let res = await bimfaceService.getFileTranslateStatus(file.fileId)
        if (res.status === 'success') {
            file.isTranslated = true
            const updateResult = await fileRepository.save(file);
            file = await fileRepository.findOne({fileId: file.fileId})
            console.log(updateResult)
            console.log(file)
        }

        console.log(res)
        ctx.body = ResponseData.build(res.status === 'success', file, res.status, file)
    })

export default translateRouter