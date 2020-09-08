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

let fileCustomDataRouter = new Router();
fileCustomDataRouter.prefix('/fileCustomData')

fileCustomDataRouter
    .get('/', async ctx => {
        const userRepository = await getManager().getRepository(User);
        const user = await userRepository.findOne({id: ctx.state.user.id})
        const fileRepository = await getManager().getRepository(File);
        const file = await fileRepository.findOne({fileId: ctx.request.query.fileId});
        const customDataRepository = await getManager().getRepository(FileCustomData)
        const dataArray = await customDataRepository.find({user: user, file: file})
        ctx.body = ResponseData.build(dataArray !== undefined, dataArray, "Cannot get file custom data")
    })
    .get('/:id', async ctx => {
        const userRepository = await getManager().getRepository(User);
        const user = await userRepository.findOne({id: ctx.state.user.id})
        const customDataRepository = await getManager().getRepository(FileCustomData)
        const data = await customDataRepository.findOne({id: ctx.params.id, user: user})
        ctx.body = ResponseData.build(data !== undefined, data, "Cannot get file custom data")
    })
    .delete('/:id', async ctx => {
        const userRepository = await getManager().getRepository(User)
        const user = await userRepository.findOne({id: ctx.state.user.id})
        if (user === undefined) {
            ctx.body = ResponseData.createFailedResponse("Not authorized")
            return;
        }

        const dataRepository = await getManager().getRepository(FileCustomData);
        let data = await dataRepository.findOne({id: ctx.params.id, user: user})
        if (data === undefined ) {
            ctx.body = ResponseData.createFailedResponse("Cannot find file custom data")
            return;
        } 

        let res = await dataRepository.remove(data);
        ctx.body = ResponseData.createSuccessResponse("");
    })
    .put("/", async ctx => {
        const userRepository = await getManager().getRepository(User)
        const user = await userRepository.findOne({id: ctx.state.user.id})
        if (user === undefined) {
            ctx.body = ResponseData.createFailedResponse("Not authorized")
            return;
        }

        const fileRepository = await getManager().getRepository(File)
        const file = await fileRepository.findOne({fileId: ctx.request.body.fileId})
        if (file === undefined) {
            ctx.body = ResponseData.createFailedResponse("Cannot find file")
            return;
        }

        const dataRepository = await getManager().getRepository(FileCustomData);
        let data = await dataRepository.findOne({file: file, user: user})
        if (data === undefined ) {
            data = new FileCustomData();
        }

        data.file = file;
        data.user = user;
        data.content = JSON.stringify(ctx.request.body.content)
        data.name = ctx.request.body.name || ""
        const savedData = await dataRepository.save(data)
        ctx.body = ResponseData.createSuccessResponse(savedData)
    })

export default fileCustomDataRouter