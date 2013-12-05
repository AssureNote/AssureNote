///<reference path='./Plugin.ts'/>

module AssureNote {
    export class Editor {
        constructor(public AssureNoteApp: AssureNoteApp, public selector: string, public EditorPlugin: Plugin) {
            $(selector).css({ display: 'none', opacity: '1.0' });
        }

        EnableEditor() : void {

        }

        DisableEditor() : void {

        }
    }
}
