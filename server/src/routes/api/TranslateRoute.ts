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

        let file = await fileRepository.findOne({fileId: ctx.request.body.fileId, user: user})
        if (file === undefined || file === null) {
            ctx.body = ResponseData.createFailedResponse("Cannot find file")
            return;
        }

        let res = await bimfaceService.translateFileAsync(file.fileId, file.name);
        if (res !== null) {
            file.status = "translating"
            await fileRepository.save(file)
        }
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

        if (file.status === 'translated') {
            ctx.body = ResponseData.createSuccessResponse(file)
            return
        }

        let res = await bimfaceService.getFileTranslateStatus(file.fileId)
        let status = ''
        if (res.code === 'success') {
            switch (res.data.status) {
                case 'success':
                    status = 'translated'
                    break
                case 'processing':
                    status = 'translating'
                    break
                case 'failed':
                    status = 'failed'
                    break
                default:
                    status = 'failed'
            }
            file.status = status
            const updateResult = await fileRepository.save(file);
            file = await fileRepository.findOne({fileId: file.fileId})
        }

        ctx.body = ResponseData.createSuccessResponse(file)
    })

export default translateRouter