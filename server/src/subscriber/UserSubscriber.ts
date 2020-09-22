import {EventSubscriber, EntitySubscriberInterface, RemoveEvent} from "typeorm";
import FileCustomData from '../entity/FileCustomData'
import File from '../entity/File'
import User from '../entity/User'

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
    listenTo() {
        return User;
    }

    async beforeRemove(event: RemoveEvent<User>) {
        const files = await event.manager.find(File, {user: event.entity})
        await event.manager.remove(File, files)
    }
}
