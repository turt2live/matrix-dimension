export class ApiError {

    public statusCode: number;
    public jsonResponse: any;

    constructor(statusCode: number, json: any) {
        // Because typescript is just plain dumb
        // https://stackoverflow.com/questions/31626231/custom-error-class-in-typescript
        Error.apply(this, ["ApiError"]);

        if (typeof(json) === "string") json = {message: json};
        this.jsonResponse = json;
        this.statusCode = statusCode;
    }
}