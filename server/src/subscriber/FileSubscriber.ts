import {EventSubscriber, EntitySubscriberInterface, RemoveEvent} from "typeorm";
import FileCustomData from '../entity/FileCustomData'
import File from '../entity/File'

@EventSubscriber()
export class FileSubscriber implements EntitySubscriberInterface<File> {
    listenTo() {
        return File;
    }

    async beforeRemove(event: RemoveEvent<File>) {
        const customDataArray = await event.manager.find(FileCustomData, {file: event.entity})
        await event.manager.remove(FileCustomData, customDataArray)
    }
}
