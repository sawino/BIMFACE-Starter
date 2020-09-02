import * as Router from 'koa-router'
import { getManager } from 'typeorm'
import { Context } from 'koa'
import User from '../../entity/User'
import { ResponseData } from '../../common/ResponseData'
import AuthHelper from '../../utils/AuthHelper'
import * as argon2 from 'argon2'

let userRouter = new Router();
userRouter.prefix('/users')

userRouter
    .get('/', async ctx => {
        ctx.body = ResponseData.createFailedResponse("Not Available")
        // const userRepository = getManager().getRepository(User);
        // const users = await userRepository.find()
        // ctx.body = ResponseData.build(users !== null, users, 'Failed to get users');
    })
    .get('/:id', async ctx => {
        ctx.body = ResponseData.createFailedResponse("Not Available")
        // if (AuthHelper.isDifferentUser(ctx)) {
        //     ctx.body = ResponseData.createFailedResponse("Not Authorized");
        //     return;
        // }

        // const userRepository = getManager().getRepository(User);
        // const user = await userRepository.findOne(+ctx.params.id)
        // ctx.body = ResponseData.build(user !== null, user, `Failed to get user with id ${ctx.params.id}`);
   })
    .put('/', async ctx => {
        const userRepository = getManager().getRepository(User);
        let updateData = {
            email: ctx.request.body.email,
            password: await argon2.hash(ctx.request.body.password)
        }

        await userRepository.update(+ctx.state.user.id, updateData)
        const updatedUser = await userRepository.findOne(+ctx.state.user.id)
        let user = {
            name: updatedUser.name,
            email: updatedUser.email
        }

        ctx.body = ResponseData.build(updatedUser !== null, user, `Failed to update user with id ${ctx.params.id}`);
    })
    .delete('/:id', async ctx => {
        ctx.body = ResponseData.createFailedResponse("Not Available")
        // 
        // if (AuthHelper.isDifferentUser(ctx)) {
        //     ctx.body = ResponseData.createFailedResponse("Not Authorized");
        // }

        // let request: any = ctx.request;
        // const userRepository = getManager().getRepository(User);
        // todo: delete file from bimface
        // todo: delete file custom data from db
        // todo: delete file from db
        // await userRepository.delete(+ctx.params.id)
        // ctx.body = ResponseData.build(true);
    });

export default userRouter