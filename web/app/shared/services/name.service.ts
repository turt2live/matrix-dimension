import { Injectable } from "@angular/core";
import * as gobyInit from "goby";

const goby = gobyInit.init({
    // Converts words to a url-safe name
    // Ie: "hello world how-are you" becomes "HelloWorldHowAreYou"
    decorator: parts => parts.map(p => p ? p.split('-').map(p2 => p2 ? p2[0].toUpperCase() + p2.substring(1).toLowerCase() : '').join('') : '').join(''),
});

@Injectable()
export class NameService {
    constructor() {
    }

    public getHumanReadableName(): string {
        return goby.generate(["adj", "pre", "suf"]);
    }
}
