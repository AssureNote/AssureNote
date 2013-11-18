///<reference path='src/Api.ts'/>
///<reference path='d.ts/jquery.d.ts'/>
///<reference path='src/AssureNote.ts'/>
///<reference path='src/Panel.ts'/>
///<reference path='src/LayoutEngine.ts'/>
///<reference path='src/PluginManager.ts'/>

module AssureNote {

	export class GSNRecord {
		Parse(file: string): void {
		}
	}

	export class GSNDoc {
	}

	export class GSNNode {
	}

	export class Navigator {
		CurrentDoc: GSNDoc;
		CurrentLabel: string;
		CurrentWx: number;
		CurrentWy: number;

		Display(Label: string, Wx: number, Wy: number): void {
			//TODO
		}

		Redraw(): void {
			this.Display(this.CurrentLabel, this.CurrentWx, this.CurrentWy);
		}

		NavigateUp(): void { }
		NavigateDown(): void { }
		NavigateLeft(): void { }
		NavigateRight(): void { }
		NavigateHome(): void { }
	}

	export class ColorStyle {

	}

	export class NodeView {
		Model: GSNNode;
		IsVisible: boolean;
		Label: string;
		OffsetGx: number;
		OffsetGy: number;
		Width: number;
		Height: number;
		Color: ColorStyle;
		Parent: NodeView;
		Left: NodeView[];
		Right: NodeView[];
		Children: NodeView[];

		GetGx(): number {
			if (this.Parent == null) {
				return this.OffsetGx;
			}
			return this.GetGx() + this.OffsetGx;
		}

		GetGy(): number {
			if (this.Parent == null) {
				return this.OffsetGy;
			}
			return this.GetGy() + this.OffsetGy;
		}

		Layout(LayoutEngine: SimpleLayoutEngine): void {
			LayoutEngine.Layout(this);
			this.OffsetGx = LayoutEngine.Width / 2;
			this.OffsetGy = LevelMargin;
		}

		DisplayContent(Content: HTMLElement) {
			if (this.IsVisible) {

			}
		}
	}

}

$(() => {
	var AssureNoteApp = new AssureNote.AssureNoteApp();
});