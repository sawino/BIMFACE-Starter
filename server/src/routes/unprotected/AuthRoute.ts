import { Context } from 'koa'
import * as Router from  'koa-router'
import * as argon2 from 'argon2'
import { getManager } from 'typeorm'
import User from '../../entity/User'
import { ResponseData } from '../../common/ResponseData'
import * as jwt from 'jsonwebtoken'
import globalConfigs from '../../configs/GlobalConfigs'
import Roles from '../../common/Roles'

let authRouter = new Router();
authRouter.prefix('/auth');

authRouter
    .post('/login', async ctx => {
        const userRepository = getManager().getRepository(User);

        const user = await userRepository
            .createQueryBuilder()
            .where({name: ctx.request.body.name})
            .addSelect('User.password')
            .getOne();
   
        let errorMessage = '';
        let token = ''
        if (!user) {
            errorMessage = `User doesn't exist`;
        } else if (await argon2.verify(user.password, ctx.request.body.password)) {
            token = jwt.sign({id: user.id, role: user.role}, globalConfigs.getJwtSecret(), {expiresIn: globalConfigs.getJwtExpireIn()})
        } else {
            errorMessage = 'Password incorrect'
        }

        let responsObject = {
            token: token,
            name: user.name,
            email: user.email
        }
        
        ctx.body = ResponseData.build(errorMessage.length === 0, responsObject, errorMessage)
    })
    .post('/register', async ctx => {
        const userRepository = getManager().getRepository(User);
        const storedUser = await userRepository.findOne({where:[{name: ctx.request.body.name}, 
            {email: ctx.request.body.email}]})
        if (storedUser !== undefined) {
            ctx.body = ResponseData.createFailedResponse('User name or email existed')
            return;
        }

        const newUser = new User();
        newUser.name = ctx.request.body.name;
        newUser.email = ctx.request.body.email;
        newUser.role = Roles.User
        newUser.password = await argon2.hash(ctx.request.body.password);

        const tempUser = await userRepository.save(newUser);
        let user = new User();
        user.name = tempUser.name
        user.email = tempUser.email
        
        ctx.body = ResponseData.createSuccessResponse(user);
    });

export default authRouter