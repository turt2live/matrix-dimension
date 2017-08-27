import { Component } from "@angular/core";
import { ScalarService } from "../../shared/scalar.service";

@Component({
    selector: "my-scalar-close",
    templateUrl: "./scalar-close.component.html",
    styleUrls: ["./scalar-close.component.scss"],
})
export class ScalarCloseComponent {

    constructor(private scalar: ScalarService) {
    }

    public closeScalar() {
        this.scalar.close();
    }
}
