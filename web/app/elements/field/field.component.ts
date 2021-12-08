import { Component, EventEmitter, forwardRef, Input, Output } from "@angular/core";

@Component({
    selector: "my-field",
    templateUrl: "./field.component.html",
    styleUrls: ["./field.component.scss"],
})
export class FieldComponent{
    @Input() type = "text";
    @Input() value: string;
    @Output() valueChange = new EventEmitter<string>();
    @Input() placeholder?: string;
    @Input() label: string;
    @Input() disabled?: boolean;
    @Input() maxlength?: number;

    public id = `${new Date().getTime()}-field-${Math.random()}`;

    public onValueChange() {
        this.valueChange.emit(this.value);
    }
}
