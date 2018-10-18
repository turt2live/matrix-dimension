/**
 * Thrown when there is a problem with a given API call. This is special-cased in the responder
 * to create a JSON error response with the status code given.
 */
export class ApiError {

    /**
     * The HTTP status code to return
     */
    public statusCode: number;

    /**
     * An object to be returned as JSON to the caller
     */
    public jsonResponse: object;

    /**
     * The internal error code to describe what went wrong
     */
    public errorCode: string;

    /**
     * Creates a new API error
     * @param {number} statusCode The HTTP status code to return
     * @param {string|object} json An object to be returned as JSON or a message to be returned (which is
     * then converted to JSON as {message: "your_message"})
     * @param {string} errCode The internal error code to describe what went wrong
     */
    constructor(statusCode: number, json: string | object, errCode = "D_UNKNOWN") {
        // Because typescript is just plain dumb
        // https://stackoverflow.com/questions/31626231/custom-error-class-in-typescript
        Error.apply(this, ["ApiError"]);

        if (typeof(json) === "string") json = {message: json};
        this.jsonResponse = json;
        this.statusCode = statusCode;
        this.errorCode = errCode;

        this.jsonResponse["dim_errcode"] = this.errorCode;
    }
}