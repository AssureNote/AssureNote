///<reference path='./Plugin.ts'/>

module AssureNote {
    export class EditorUtil {
        constructor(public textarea: any/*codemirror*/, public selector: string, public CSS: any) {
            $(this.textarea.getWrapperElement()).css({
                height: "100%",
                width: "100%",
                background: "rgba(255, 255, 255, 0.85)"
            });
            $(selector).css(CSS);
            //$(selector).css({ display: "none" });
        }

        EnableEditorCallback(): () => void {
            $(this.selector).css({ display: "block" });
            return null;
        }

        DisableEditorCallback() : () => void {
            return null;
        }
    }
}
