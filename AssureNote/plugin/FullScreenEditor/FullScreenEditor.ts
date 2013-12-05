///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />

module AssureNote {
    export class FullScreenEditorPlugin extends Plugin {
        public EditorUtil: EditorUtil;
		constructor(public AssureNoteApp: AssureNoteApp, public textarea: any/*CodeMirror*/, public selector: string) {
			super();
            this.HasMenuBarButton = true;
            this.HasEditor = true;
            this.EditorUtil = new EditorUtil(textarea, selector, {
                position: "absolute",
                top: "5%",
                left: "5%",
                width: "90%",
                height: "90%"
            });
        }

        EnableEditor(WGSN: string): void {
            this.textarea.setValue(WGSN);
            var callback: () => void = this.EditorUtil.EnableEditorCallback();
            if (callback) {
                callback();
            }
        }

        DisableEditor(): void {
            return null;
        }

		CreateMenuBarButton(): MenuBarButton {
			return new MenuBarButton("fullscreeneditor-id", "images/editor.png", "fullscreeneditor",
				(event: Event, TargetView: NodeView) => {
					var Writer = new StringWriter();
					TargetView.Model.FormatSubNode(1, Writer);
                    this.EnableEditor(Writer.toString());
                    console.log(Writer.toString());
			});
		}
	}
}
