class ResponseData {

    public code: string
    public message: string
    public data: string

    constructor(code, message, data) {
        this.code = code
        this.message = message
        this.data = data
    }

    static createSuccessResponse(data) {
        return new ResponseData(ResponseCode.success, '', data)
    }

    static createFailedResponse(message, data = {}) {
        return new ResponseData(ResponseCode.failed, message, data)
    }

    static build(isSuccess, successData = {}, failedMessage = '', failedData = {}) {
        return isSuccess === true ?
            ResponseData.createSuccessResponse(successData)
            : ResponseData.createFailedResponse(failedMessage, failedData);
    }
}

enum ResponseCode {
    success = '0',
    failed = '1'
}

export {ResponseData, ResponseCode}


