import * as Router from 'koa-router'
import bimfaceService from '../../services/BimfaceService'
import {ResponseData} from '../../common/ResponseData'
import Request from '../../utils/Request'
import {getManager} from 'typeorm'
import File from '../../entity/File'
import User from '../../entity/User'
import FileCustomData from '../../entity/FileCustomData'

const fs = require('fs')
const qs = require('querystring')

let fileRouter = new Router();
fileRouter.prefix('/files')

fileRouter
    .get('/', async ctx => {
        const fileRepository = await getManager().getRepository(File);
        const userRepository = await getManager().getRepository(User);
        const user = await userRepository.findOne({id: ctx.state.user.id})
        const fileInfoArray = await fileRepository.find({user: user})
        ctx.body = ResponseData.build(fileInfoArray != null, fileInfoArray, "Cannot get files information")
    })
    .post('/', async ctx => {
        let request: any = ctx.request;
        const userRepository = await getManager().getRepository(User)
        const user = await userRepository.findOne({id: ctx.state.user.id}, {relations: ["files"]});
        console.log(user)
        if (user === undefined || user === null) {
            ctx.body = ResponseData.createFailedResponse("Authentication Failed")
            return
        }

        const fileRepository = await getManager().getRepository(File)
        let res = await bimfaceService.uploadFileAsync(request.files.file.name,
            request.files.file.path,
            request.files.file.size);

        if (res === null) {
            ctx.body = ResponseData.createFailedResponse("Failed to upload file")
            return;
        }

        let file = new File();
        console.log(res)
        console.log(file)
        file.name = res.name;
        file.isTranslated = false
        file.fileId = res.fileId
        file.user = user;
        const savedFile = await fileRepository.save(file)

        ctx.body = ResponseData.createSuccessResponse(file)
    })
    .delete('/', async ctx => {
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

        let res = await bimfaceService.deleteFileAsync(ctx.query.fileId);
    
        if (res.code === 'success') {
            const dataRepository = await getManager().getRepository(FileCustomData)
            await dataRepository.delete({file: file})
            await fileRepository.delete({id: file.id})
        }

        let resObject = {
            fileId: file.fileId
        }

        ctx.body = ResponseData.build(res.code === 'success', resObject, "Failed to delete file", resObject);
    })

export default fileRouter