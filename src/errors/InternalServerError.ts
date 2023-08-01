export default class InternalServerError extends Error {
    errors: any;
    cause?: Error;
    code: number;

    constructor(message: any, errors?: any, cause?: Error, code: number = 500) {
        super(message);
        this.errors = errors;
        this.cause = cause;
        this.code = code;
    }
}
