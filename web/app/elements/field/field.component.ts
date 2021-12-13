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
    @Input() asSelect?: boolean;
    @Input() selectOptions?: ({key: string, value?: string}|string)[];

    public id = `${new Date().getTime()}-field-${Math.random()}`;

    public get options(): {key: string, value: string}[] {
        return this.selectOptions.map(p => {
            if (typeof(p) === 'string') {
                return {key: p, value: p};
            }
            return {key: p.key, value: p.value ?? p.key};
        });
    }

    public onValueChange() {
        this.valueChange.emit(this.value);
    }
}
