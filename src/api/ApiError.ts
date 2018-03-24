export class ApiError {

    public statusCode: number;
    public jsonResponse: any;
    public errorCode: string;

    constructor(statusCode: number, json: any, errCode = "D_UNKNOWN") {
        // Because typescript is just plain dumb
        // https://stackoverflow.com/questions/31626231/custom-error-class-in-typescript
        Error.apply(this, ["ApiError"]);

        if (typeof(json) === "string") json = {message: json};
        this.jsonResponse = json;
        this.statusCode = statusCode;
        this.errorCode = errCode;
    }
}