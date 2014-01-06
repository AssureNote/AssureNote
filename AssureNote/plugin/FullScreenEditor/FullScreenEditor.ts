///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />

module AssureNote {
    export class FullScreenEditorPlugin extends Plugin {
        public EditorUtil: EditorUtil;
		constructor(public AssureNoteApp: AssureNoteApp, public textarea: CodeMirror.Editor, public selector: string) {
			super();
            this.HasMenuBarButton = true;
            this.HasEditor = true;
            this.EditorUtil = new EditorUtil(AssureNoteApp, textarea, selector, {
                position: "fixed",
                top: "5%",
                left: "5%",
                width: "90%",
                height: "90%"
            });
            CodeMirror.on(this.textarea, 'cursorActivity', (doc: CodeMirror.Doc) => this.MoveBackgroundNode(doc));
        }

		ExecCommand(AssureNoteApp: AssureNoteApp, Args: string[]): void {
			var Label: string;
			if (Args.length < 1) {
				Label = AssureNoteApp.MasterRecord.GetLatestDoc().TopNode.GetLabel();
			} else {
				Label = Args[0].toUpperCase();
			}
			var event = document.createEvent("UIEvents");
			var TargetView = AssureNoteApp.PictgramPanel.ViewMap[Label];
			if (TargetView != null) {
				if (TargetView.GetNodeType() == GSNType.Strategy) {
					AssureNoteApp.DebugP("Strategy " + Label+ " cannot open FullScreenEditor.");
					return;
				}
				var Writer = new StringWriter();
				TargetView.Model.FormatSubNode(1, Writer);
                this.EditorUtil.EnableEditor(Writer.toString().trim(), TargetView);
			} else {
				AssureNoteApp.DebugP(Label + " not found.");
			}
		}

		CreateMenuBarButton(NodeView: NodeView): MenuBarButton {
			if (NodeView.GetNodeType() == GSNType.Strategy) {
				return null;
			}
			return new MenuBarButton("fullscreeneditor-id", "images/editor.png", "fullscreeneditor",
				(event: Event, TargetView: NodeView) => {
					var Writer = new StringWriter();
					TargetView.Model.FormatSubNode(1, Writer);
                    this.EditorUtil.EnableEditor(Writer.toString().trim(), TargetView);
			});
        }

        /* This focuses on the node where the cursor of CodeMirror indicate */
        MoveBackgroundNode(doc: CodeMirror.Doc) {
            var UID: string = null;
            var line = doc.getCursor().line;
            while (line >= 0) {
                var LineString: string = doc.getLine(line);
                if (LineString.startsWith('*')) {
                    UID = WikiSyntax.ParseUID(LineString);
                    break;
                }
                line -= 1;
            }
            if (UID != null) {
                var Keys: string[] = Object.keys(this.AssureNoteApp.PictgramPanel.ViewMap);
                for (var i in Keys) {
                    var View: NodeView = this.AssureNoteApp.PictgramPanel.ViewMap[Keys[i]];
                    /* Node exists and visible */
                    if (View && View.Model && Lib.DecToHex(View.Model.UID) == UID) {
                        console.log(View.GetCenterGX() + ' ' + View.GetCenterGY());
                        this.AssureNoteApp.PictgramPanel.Viewport.SetCaseCenter(View.GetCenterGX(), View.GetCenterGY());
                    }
                }
            }
        }
	}
}
