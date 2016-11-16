import {Component, Input, OnChanges, OnInit, Output, EventEmitter, ExistingProvider, ViewChild, ViewEncapsulation, forwardRef} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';

// import {DEFAULT_STYLES} from './style';
import {SelectDropdownComponent} from './select-dropdown.component';
import {OptionList} from './option-list';

export const SELECT_VALUE_ACCESSOR: ExistingProvider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectComponent),
    multi: true
};

@Component({
    selector: 'ng-select',
    templateUrl: 'select.component.html',
    styleUrls: ['select.component.css'],
    providers: [
        SELECT_VALUE_ACCESSOR
    ],
    encapsulation: ViewEncapsulation.None
})

export class SelectComponent implements ControlValueAccessor, OnInit, OnChanges {

    // Class names.
    private S2: string = 'select2';
    private S2_CONTAINER: string = this.S2 + '-container';
    private S2_SELECTION: string = this.S2 + '-selection';

    @Input() options: Array<{ value: string; label: string; }>;

    @Input() theme: string;
    @Input() multiple: boolean;
    @Input() placeholder: string;
    @Input() allowClear: boolean;

    @Output() opened: EventEmitter<null> = new EventEmitter<null>();
    @Output() closed: EventEmitter<null> = new EventEmitter<null>();
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();
    @Output() deselected: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('selection') selectionSpan: any;
    @ViewChild('dropdown') dropdown: SelectDropdownComponent;
    @ViewChild('searchInput') searchInput: any;

    // Select options.
    private _optionList: OptionList;
    get optionList(): OptionList { return this._optionList; }

    // State variables.
    isDisabled: boolean = false;
    isBelow: boolean = true;
    isOpen: boolean = false;
    hasFocus: boolean = false;

    width: number;
    top: number;
    left: number;

    onChange = (_: any) => {};
    onTouched = () => {};

    /***************************************************************************
     * Event handlers.
     **************************************************************************/

    ngOnInit() {
        this.initDefaults();
    }

    ngOnChanges(changes: any) {
        if (changes.hasOwnProperty('options')) {
            this.updateOptionsList(changes['options'].isFirstChange());
        }
    }

    onSelectionClick(event: any) {
        this.toggleDropdown();

        if (this.multiple) {
            this.searchInput.nativeElement.focus();
        }
        event.stopPropagation();
    }

    /**
     * Event handler of the single select clear (x) button click. It is assumed
     * that there is exactly one item selected.
     *
     * The `deselect` method is used instead of `clear`, to heve the deselected
     * event emitted.
     */
    onClearClick(event: any) {
        // this.deselect(this.selection[0].value);
        event.stopPropagation();
    }

    onClearItemClick(event: any) {
        this.deselect(event.target.dataset.value);
        event.stopPropagation();
    }

    onToggleSelect(optionValue: any) {
        this.toggleSelect(optionValue);
    }

    onClose(focus: any) {
        this.close(focus);
    }

    onWindowClick() {
        this.close(false);
    }

    onWindowResize() {
        this.updateWidth();
    }

    onKeydown(event: any) {
        this.handleKeyDown(event);
    }

    onInput(event: any) {

        // Open dropdown, if it is currently closed.
        if (!this.isOpen) {
            this.open();
            // HACK
            setTimeout(() => {
                this.handleInput(event);
            }, 100);
        }
        else {
            this.handleInput(event);
        }
    }

    onSearchKeydown(event: any) {
        this.handleSearchKeyDown(event);
    }

    /***************************************************************************
     * Initialization.
     **************************************************************************/

    private initDefaults() {
        if (typeof this.multiple === 'undefined') {
            this.multiple = false;
        }
        if (typeof this.theme === 'undefined') {
            this.theme = 'default';
        }
        if (typeof this.allowClear === 'undefined') {
            this.allowClear = false;
        }
    }

    private updateOptionsList(firstTime: boolean) {
        let v: Array<string>;

        if (!firstTime) {
            v = this.optionList.value;
        }

        this._optionList = new OptionList(this.options);

        if (!firstTime) {
            this._optionList.value = v;
        }
    }

    /***************************************************************************
     * Dropdown toggle.
     **************************************************************************/

    toggleDropdown() {
        if (!this.isDisabled) {
            this.isOpen ? this.close(true) : this.open();
        }
    }

    open() {
        if (!this.isOpen) {
            this.updateWidth();
            this.updatePosition();
            this.isOpen = true;
            this.opened.emit(null);
        }
    }

    close(focus: boolean) {
        if (this.isOpen) {
            this.isOpen = false;
            if (focus) {
                this.focus();
            }
            this.closed.emit(null);
        }
    }

    /***************************************************************************
     * Select.
     **************************************************************************/

    toggleSelect(value: string) {

        /*
        if (!this.multiple && this.selection.length > 0) {
            this.selection[0].selected = false;
        }

        this.optionsDict[value].selected ?
            this.deselect(value) : this.select(value);

        if (this.multiple) {
            this.searchInput.nativeElement.value = '';
            this.searchInput.nativeElement.focus();
        }
        else {
            this.focus();
        }*/
    }

    select(index: number) {
        this.optionList[index].selected = true;
        this.onChange(this.getOutputValue());
        this.selected.emit(this.optionList[index].undecoratedCopy());
    }

    deselect(index: number) {
        let option = this.optionList[index];
        option.selected = false;
        this.onChange(this.getOutputValue());
        this.deselected.emit({
            value: option.value,
            label: option.label
        });
    }

    updateSelection() {
        /*let s: Array<any> = [];
        let v: Array<string> = [];
        for (let optionValue of this.optionValues) {
            if (this.optionsDict[optionValue].selected) {
                let opt = this.optionsDict[optionValue];
                s.push(opt);
                v.push(opt.value);
            }
        }

        this.selection = s;
        this.value = v;

        // TODO first check if value has changed?
        this.onChange(this.getOutputValue());*/
    }

    popSelect() {
        /*
        if (this.selection.length > 0) {
            this.selection[this.selection.length - 1].selected = false;
            this.updateSelection();
            this.onChange(this.getOutputValue());
        }*/
    }

    clear() {
        if (this.optionList.hasSelected()) {
            this.optionList.clearSelection();
            this.onChange(this.getOutputValue());
        }
    }

    getOutputValue(): any {
        let v = this.optionList.value.slice(0);
        return v.length === 0 ? '' : this.multiple ? v : v[0];
    }

    /***************************************************************************
     * ControlValueAccessor interface methods.
     **************************************************************************/

    writeValue(value: any) {

        if (typeof value === 'undefined' || value === null || value === '') {
            value = [];
        }

        if (typeof value === 'string') {
            value = [value];
        }

        this.optionList.value = value;
    }

    registerOnChange(fn: (_: any) => void) {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void) {
        this.onTouched = fn;
    }

    /***************************************************************************
     * Keys.
     **************************************************************************/

    private KEYS: any = {
        BACKSPACE: 8,
        TAB: 9,
        ENTER: 13,
        ESC: 27,
        SPACE: 32,
        UP: 38,
        DOWN: 40
    };

    handleKeyDown(event: any) {

        let key = event.which;

        if (key === this.KEYS.ENTER || key === this.KEYS.SPACE ||
            (key === this.KEYS.DOWN && event.altKey)) {

            this.open();
            event.preventDefault();
        }
    }

    handleInput(event: any) {
        // this.dropdown.filter(event.target.value);
    }

    handleSearchKeyDown(event: any) {

        /*let key = event.which;

        if (key === this.KEYS.ENTER) {
            if (typeof this.dropdown !== 'undefined') {
                let hl = this.dropdown.highlighted;

                if (hl !== null) {
                    this.onToggleSelect(hl.value);
                }
            }
        }
        else if (key === this.KEYS.BACKSPACE) {
            if (this.searchInput.nativeElement.value === '') {
                this.popSelect();
            }
        }
        else if (key === this.KEYS.UP) {
            if (typeof this.dropdown === 'undefined') {
                this.open();
            }
            else {
                this.dropdown.highlightPrevious();
            }
        }
        else if (key === this.KEYS.DOWN) {
            if (typeof this.dropdown === 'undefined') {
                this.open();
            }
            else {
                this.dropdown.highlightNext();
            }
        }
        else if (key === this.KEYS.ESC) {
            this.close(true);
        }*/
    }

    /***************************************************************************
     * Layout/Style/Classes/Focus.
     **************************************************************************/

    focus() {
        this.hasFocus = true;
        if (this.multiple) {
            this.searchInput.nativeElement.focus();
        }
        else {
            this.selectionSpan.nativeElement.focus();
        }
    }

    blur() {
        this.hasFocus = false;
        this.selectionSpan.nativeElement.blur();
    }

    updateWidth() {
        this.width = this.selectionSpan.nativeElement.offsetWidth;
    }

    updatePosition() {
        let e = this.selectionSpan.nativeElement;
        this.left = e.offsetLeft;
        this.top = e.offsetTop + e.offsetHeight;
    }

    getContainerClass(): any {
        let result = {};

        result[this.S2] = true;

        let c = this.S2_CONTAINER;
        result[c] = true;
        result[c + '--open'] = this.isOpen;
        result[c + '--focus'] = this.hasFocus;
        result[c + '--' + this.theme] = true;
        result[c + '--' + (this.isBelow ? 'below' : 'above')] = true;

        return result;
    }

    getSelectionClass(): any {
        let result = {};

        let s = this.S2_SELECTION;
        result[s] = true;
        result[s + '--' + (this.multiple ? 'multiple' : 'single')] = true;

        return result;
    }

    showPlaceholder(): boolean {
        // return typeof this.placeholder !== 'undefined' &&
        // this.selection.length === 0;
        return true;
    }

    getPlaceholder(): string {
        return this.showPlaceholder() ? this.placeholder : '';
    }

    getInputStyle(): any {

        let width: number;

        if (typeof this.searchInput === 'undefined') {
            width = 200;
        }
        else if (this.showPlaceholder() &&
                 this.searchInput.nativeElement.value.length === 0 ) {

            width = 10 + 10 * this.placeholder.length;
        }
        else {
            width = 10 + 10 * this.searchInput.nativeElement.value.length;
        }

        return {
            'width': width + 'px'
        };
    }
}
