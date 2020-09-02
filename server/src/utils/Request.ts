import Axios from 'axios'

class Request {
    constructor() {}
    static async get(url, options) {
        return await Axios.get(url, options);
    }

    static async post(url, data, options) {
        return await Axios.post(url, data, options);
    }

    static async put(url, data, options) {
        return await Axios.put(url, data, options);
    }

    static async delete(url, options) {
        return await Axios.delete(url, options)
    }
}

export default Request