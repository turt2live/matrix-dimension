import { Component } from "@angular/core";
import { ScalarClientApiService } from "../../shared/services/scalar/scalar-client-api.service";

@Component({
    selector: "app-scalar-close",
    templateUrl: "./scalar-close.component.html",
    styleUrls: ["./scalar-close.component.scss"],
})
export class ScalarCloseComponent {
    constructor(private scalar: ScalarClientApiService) {}

    public closeScalar() {
        console.log("Closing scalar...");
        this.scalar.close();
    }
}
