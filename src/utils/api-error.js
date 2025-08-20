class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something Went wrong",
        errors = [],
        stack  = ""

    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
            // this captureStackTrace() is used to generate stack trace automatically
        }
    }
}

export { ApiError}