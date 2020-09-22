import * as Router from 'koa-router'
import { getManager } from 'typeorm'
import { Context } from 'koa'
import User from '../../entity/User'
import { ResponseData } from '../../common/ResponseData'
import AuthHelper from '../../utils/AuthHelper'
import * as argon2 from 'argon2'
import {checkRole} from '../../middlewares/CheckRole'
import Roles from '../../common/Roles'
import { O_RDONLY } from 'constants'

let userRouter = new Router();
userRouter.prefix('/users')

userRouter
    .get('/', checkRole(Roles.Admin), async ctx => {
        const userRepository = getManager().getRepository(User);
        const users = await userRepository.find()
        ctx.body = ResponseData.build(users !== null, users, 'Failed to get users');
    })
    .get('/:id', checkRole(Roles.Admin), async ctx => {
        const userRepository = getManager().getRepository(User);
        const user = await userRepository.findOne({id: ctx.params.id})
        ctx.body = ResponseData.build(user !== undefined, user, `Failed to get user with id ${ctx.params.id}`);
   })
    .put('/:id', checkRole(Roles.Admin), async ctx => {
        let user = await getManager().findOne(User, {id: ctx.params.id})
        if (user === undefined) {
            ctx.body = ResponseData.createFailedResponse(`Cannot find user with id ${ctx.params.id}`)
            return
        }

        user.name = ctx.request.body.name
        user.password = await argon2.hash(ctx.request.body.password)
        user.email = ctx.request.body.email
        user.role = ctx.request.body.role

        const {password, ...tempUser} = user
        await getManager().save(user)

        ctx.body = ResponseData.createSuccessResponse(tempUser)
    })
    .put('/', async ctx => {
        const userRepository = getManager().getRepository(User);
        const existedUser = await userRepository.findOne({id: ctx.state.user.id}, {select: ['password']})
        if (existedUser === undefined) {
            ctx.body = ResponseData.createFailedResponse("Not authenticated")
        }

        let isVerified = await argon2.verify(existedUser.password, ctx.request.body.password)
        if (!isVerified) {
            ctx.body = ResponseData.createFailedResponse("Wrong password")
            return
        }

        let updateData = {
            email: ctx.request.body.email,
            password: await argon2.hash(ctx.request.body.newPassword)
        }

        await userRepository.update({id: ctx.state.user.id}, updateData)
        const updatedUser = await userRepository.findOne({id: ctx.state.user.id})
        let user = {
            name: updatedUser.name,
            email: updatedUser.email
        }

        ctx.body = ResponseData.build(updatedUser !== null, user, `Failed to update user with id ${ctx.params.id}`);
    })
    .delete('/:id', checkRole(Roles.Admin), async ctx => {
        let user = await getManager().findOne(User, {id: ctx.params.id})
        if (user === undefined) {
            ctx.body = ResponseData.createFailedResponse(`Cannot find user with id ${ctx.params.id}`)
            return
        }
        
        await getManager().remove(User, user)
        ctx.body = ResponseData.createSuccessResponse('User deleted');
    });

export default userRouter