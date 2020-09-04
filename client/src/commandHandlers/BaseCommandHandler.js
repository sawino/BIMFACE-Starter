/* eslint-disable no-undef */
class BaseCommandHandler {
    constructor(name) {
        this.name = name
    }

    run(args = {}) {}

    load() {}

    unload() {}
}

export default BaseCommandHandler