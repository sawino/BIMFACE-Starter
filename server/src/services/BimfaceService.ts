import Base64 from '../utils/Base64'
import globalConfigs from '../configs/GlobalConfigs'
import Request from '../utils/Request'
const qs = require('querystring')
const fs = require('fs')

class BimfaceService {
    expireMiniuteThreshold: number;
    accessToken: string;
    accessTokenExpireTime: string;

    constructor() {
        this.expireMiniuteThreshold = 30
        this.accessToken = '';
        this.accessTokenExpireTime = '';
    }
    
    async initAsync() {
        await this.ensureAccessTokenAsync()
    }

    // -------------------- token start --------------------------
    async ensureAccessTokenAsync() {
        if (this.isNeedToRefreshToken()) {
            let appInfoBase64 = Base64(globalConfigs.getBimfaceAppKey() + ':' + globalConfigs.getBimfaceAppSecret())
            let options = {
                headers: {
                    "Authorization": "Basic " + appInfoBase64
                }
            }

            let response = await Request.post('https://api.bimface.com/oauth2/token', '', options)

            if (response.data.code !== 'success') {
                throw response.data.message
            }

            this.accessToken = response.data.data.token
            this.accessTokenExpireTime = response.data.data.expireTime
        }
    }

    public async getFileViewTokenAsync(id) {
        let query = {
            fileId: id
        }

        let queryString = qs.stringify(query)
        let response = await Request.get('https://api.bimface.com/view/token?'+ queryString, await this.getAuthOptionsAsync());
        if (response.data.code !== 'success') {
            return ''
        }

        return response.data.data;
    }

    public async getAccessTokenAsync() {
        await this.ensureAccessTokenAsync()
        return this.accessToken
    }

    public async getAuthHeaderAsync() {
        let accessToken = await this.getAccessTokenAsync();

        let headers = {'Authorization': 'bearer ' + accessToken};
        return headers;
    }

    public async getAuthOptionsAsync() {
        return {
            headers: await this.getAuthHeaderAsync()
        }
    }
    // -------------------- token end --------------------------

    // -------------------- file start --------------------------
    public async getFileInfoArrayAsync(args) {
        //offset, rows, startTime, endTime, status, suffixa
        let queryString = qs.stringify(args)
        let response = await Request.get('https://file.bimface.com/files?' + queryString, await this.getAuthOptionsAsync());
        if (response.data.code !== 'success') {
            return null
        }

        return response.data.data
    }

    public async uploadFileAsync(fileName, filePath, contentLength) {
        let options = await this.getAuthOptionsAsync();
        options.headers = Object.assign(options.headers, { "Content-Length": contentLength });
        options.headers = Object.assign(options.headers, { "Content-Type": "application/octet-stream" });
        options = Object.assign(options, {
            params: {
                "name": fileName
            }
        })

        let url = "https://file.bimface.com/upload";

        try {

            let res = await Request.put(url, fs.createReadStream(filePath), options)
            console.log(res)
            if (res.data.code === 'success') {
                return res.data.data
            } else {
                return null
            }

        } catch (err) {
            console.log("upload error: " + err);
            return null
        }
    }

    public async deleteFileAsync(fileId) {
        let options = await this.getAuthOptionsAsync();
        options = Object.assign(options, {
            params: {
                fileId: fileId
            }
        })

        let res = await Request.delete("https://file.bimface.com/file", options);
        return res.data
    }
    // -------------------- file end --------------------------

    // -------------------- translate start --------------------------
    public async translateFileAsync(fileId, rootName, translateOptions: any = {}) {
        translateOptions = translateOptions || {}

        let options = await this.getAuthOptionsAsync();
        let tempTranslateOptions = {
            callback: translateOptions.callback || '',
            config: translateOptions.config || {},
            source: {
                compressed: false,
                fileId: fileId,
                rootName: rootName
            }
        }

        let res = await Request.put('https://api.bimface.com/translate', tempTranslateOptions, options);
        if (res.data.code !== 'success') {
            return null
        }

        return res.data.data
    }

    public async getFileTranslateStatus(fileId) {
        let options = await this.getAuthOptionsAsync()
        options = Object.assign(options, {
            params: {
                fileId: fileId
            }
        })
    
        let res = await Request.get('https://api.bimface.com/translate', options)
        return res.data
    }
    // -------------------- translate end --------------------------

    // -------------------- utils start --------------------------
    isNeedToRefreshToken() {
        let token = this.accessToken
        let expireTime = this.accessTokenExpireTime
        
        let now = new Date()
        let expireDate = expireTime === '' ? now : new Date(expireTime)
        let leftTime = expireDate.getTime() - now.getTime()
        let leftMinutes = Math.floor(leftTime / 1000 / 60);
        return leftMinutes < this.expireMiniuteThreshold
    }
    // -------------------- utils end --------------------------
}

let bimface = new BimfaceService();

export default bimface;

