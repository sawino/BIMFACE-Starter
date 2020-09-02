import {Context} from 'koa'

export default class AuthHelper {
    public static isDifferentUser(ctx: Context) {
        const userId = +ctx.params.id
        if (userId !== +ctx.state.user.id) {
            return true;
        }

        return false
    }
}