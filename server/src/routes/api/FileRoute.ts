import * as Router from 'koa-router'
import bimfaceService from '../../services/BimfaceService'
import {ResponseData} from '../../common/ResponseData'
import {getManager} from 'typeorm'
import File from '../../entity/File'
import User from '../../entity/User'
import FileStatus from '../../common/FileStatus'

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
        let response = await bimfaceService.uploadFileAsync(request.files.file.name,
            request.files.file.path,
            request.files.file.size);

        if (response.code !== 'success') {
            ctx.body = ResponseData.createFailedResponse("Failed to upload file")
            return;
        }

        let file = new File();
        file.name = response.data.name;
        file.status = FileStatus.Uploaded
        file.fileId = response.data.fileId
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
            await fileRepository.remove(file)
        }

        let resObject = {
            fileId: file.fileId
        }

        ctx.body = ResponseData.build(res.code === 'success', resObject, "Failed to delete file", resObject);
    })

export default fileRouter