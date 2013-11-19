///<reference path='src/Api.ts'/>
///<reference path='d.ts/jquery.d.ts'/>
///<reference path='src/AssureNote.ts'/>
///<reference path='src/Panel.ts'/>
///<reference path='src/LayoutEngine.ts'/>
///<reference path='src/PluginManager.ts'/>
///<reference path='src/CaseViewer.ts'/>

module AssureNote {

	export class GSNRecord {
		Parse(file: string): void {
		}
	}

	export class GSNDoc {
	}

	export class GSNNode {
		GSNType: GSNType;
	}

	export enum GSNType {
		Goal, Context, Strategy, Evidence, Undefined
	}

	export class Navigator {
		CurrentDoc: GSNDoc;// Convert to caseview
		FocusedLabel: string;
		FocusedWx: number;
		FocusedWy: number;

		Display(Label: string, Wx: number, Wy: number): void {
			//TODO
		}

		Redraw(): void {
			this.Display(this.FocusedLabel, this.FocusedWx, this.FocusedWy);
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
		private Width: number;
		private Height: number;
		Color: ColorStyle;
		Parent: NodeView;
		Left: NodeView[];
		Right: NodeView[];
		Children: NodeView[];
		Shape: GSNShape = null;

		GetShape(): GSNShape {
			if (this.Shape == null) {
				this.Shape = AssureNoteUtils.CreateGSNShape(this);
			}
			return this.Shape;
		}

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
	}

	export class GSNShape {
		ShapeGroup: SVGGElement;
		ArrowPath: SVGPathElement;
		Content: HTMLElement;
		ColorClassName: string;
		Width: number;
		Height: number;

		constructor(public NodeView: NodeView) {
			this.Width = 0;
			this.Height = 0;
			this.Content = null;
		}

		Resize(LayoutEngine: SimpleLayoutEngine): void {
			//this.Width = HTMLDoc.Width;
			//this.Height = HTMLDoc.Height;

			LayoutEngine.Layout(this.NodeView, this);
			this.NodeView.OffsetGx = this.Width / 2;
			this.NodeView.OffsetGy = LevelMargin;
		}

		CreateHtmlContent(Content: HTMLElement): void {
			if (this.NodeView.IsVisible) {
				var div = document.createElement("div");
				div.style.position = "absolute";
				div.id = this.NodeView.Label;

				var h4 = document.createElement("h4");
				h4.innerText = this.NodeView.Label; //TODO

				var p = document.createElement("p");
				p.innerText = this.NodeView.Label; //TODO

				div.appendChild(h4);
				div.appendChild(p);
				Content.appendChild(div);
			}
		}

		SetPosition(x: number, y: number) {
			//var mat = this.ShapeGroup.transform.baseVal.getItem(0).matrix;
			//mat.e = x;
			//mat.f = y;
			if (this.NodeView.IsVisible) {
				var div = document.getElementById(this.NodeView.Label);
				if (div != null) {
					div.style.left = x + "px";
					div.style.top = y + "px";
				}
			}
		}

		Render(): void {
			this.ShapeGroup = <SVGGElement>document.createSVGElement("g");
			this.ShapeGroup.setAttribute("transform", "translate(0,0)");
			this.ArrowPath = <SVGPathElement>document.createSVGElement("path");
			this.ArrowPath.setAttribute("marker-end", "url(#Triangle-black)");
			this.ArrowPath.setAttribute("fill", "none");
			this.ArrowPath.setAttribute("stroke", "gray");
			this.ArrowPath.setAttribute("d", "M0,0 C0,0 0,0 0,0");
		}

		GetSVG(): SVGGElement {
			return this.ShapeGroup;
		}

		GetSVGPath(): SVGPathElement {
			return this.ArrowPath;
		}

		SetArrowPosition(p1: Point, p2: Point, dir: Direction) {
			var start = <SVGPathSegMovetoAbs>this.ArrowPath.pathSegList.getItem(0);
			var curve = <SVGPathSegCurvetoCubicAbs>this.ArrowPath.pathSegList.getItem(1);
			start.x = p1.x;
			start.y = p1.y;
			curve.x = p2.x;
			curve.y = p2.y;
			if (dir == Direction.Bottom || dir == Direction.Top) {
				curve.x1 = (9 * p1.x + p2.x) / 10;
				curve.y1 = (p1.y + p2.y) / 2;
				curve.x2 = (9 * p2.x + p1.x) / 10;
				curve.y2 = (p1.y + p2.y) / 2;
			} else {
				curve.x1 = (p1.x + p2.x) / 2;
				curve.y1 = (9 * p1.y + p2.y) / 10;
				curve.x2 = (p1.x + p2.x) / 2;
				curve.y2 = (9 * p2.y + p1.y) / 10;
			}
		}

		SetArrowColorWhite(white: boolean) {
			if (white) {
				this.ArrowPath.setAttribute("marker-end", "url(#Triangle-white)");
			} else {
				this.ArrowPath.setAttribute("marker-end", "url(#Triangle-black)");
			}
		}

		GetConnectorPosition(Dir: Direction): Point {
			switch (Dir) {
				case Direction.Right:
					return new Point(this.Width, this.Height / 2);
				case Direction.Left:
					return new Point(0, this.Height / 2);
				case Direction.Top:
					return new Point(this.Width / 2, 0);
				case Direction.Bottom:
					return new Point(this.Width / 2, this.Height);
				default:
					return new Point(0, 0);
			}
		}


		GetWidth(): number {
			return 0;
		}

		GetHeight(): number {
			return 0;
		}

	}

	export class GSNGoalShape extends GSNShape {
		BodyRect: SVGRectElement;
		UndevelopedSymbol: SVGUseElement;

		Render(): void {
			super.Render();
			this.BodyRect = <SVGRectElement>document.createSVGElement("rect");
			this.BodyRect.setAttribute("class", this.ColorClassName);
			this.UndevelopedSymbol = <SVGUseElement>document.createSVGElement("use");
			this.UndevelopedSymbol.setAttribute("xlink:href", "#UndevelopdSymbol");
			this.ShapeGroup.appendChild(this.BodyRect);
			this.Resize();
		}

		Resize(): void {
			//super.Resize(CaseViewer, NodeModel, HTMLDoc);
			this.BodyRect.setAttribute("width", this.GetWidth().toString());
			this.BodyRect.setAttribute("height", this.GetHeight().toString());
		}

		SetColor(key: string) {
			this.BodyRect.setAttribute("class", key);
		}

		GetColor() {
			return this.BodyRect.getAttribute("class");
		}

		EnableHighlight() : void {
			var CurrentColor: string = this.GetColor();
			if (!CurrentColor.match(/-highlight/)) {
				this.BodyRect.removeAttribute("class");
				this.BodyRect.setAttribute("class", CurrentColor + "-highlight");
			}
		}

		DisableHighlight() : void {
			var CurrentColor: string = this.GetColor();
			this.BodyRect.removeAttribute("class");
			this.BodyRect.setAttribute("class", CurrentColor.replace(/-highlight/, ""));
		}

		SetUndevelolpedSymbolPosition(point: Point) : void {
			this.UndevelopedSymbol.setAttribute("x", point.x.toString());
			this.UndevelopedSymbol.setAttribute("y", point.y.toString());
		}
	}

	export class GSNContextShape extends GSNShape {
		BodyRect: SVGRectElement;

		Render(): void {
			super.Render();
			this.BodyRect = <SVGRectElement>document.createSVGElement("rect");
			this.BodyRect.setAttribute("class", this.ColorClassName);
			this.ArrowPath.setAttribute("marker-end", "url(#Triangle-white)");
			this.BodyRect.setAttribute("rx", "10");
			this.BodyRect.setAttribute("ry", "10");
			this.ShapeGroup.appendChild(this.BodyRect);
			this.Resize();
		}

		Resize(): void {
			//super.Resize();
			this.BodyRect.setAttribute("width", this.Width.toString());
			this.BodyRect.setAttribute("height", this.Height.toString());
		}

		SetColor(key: string) {
			this.BodyRect.setAttribute("class", key);
		}

		GetColor() {
			return this.BodyRect.getAttribute("class");
		}

		EnableHighlight() {
			var CurrentColor: string = this.GetColor();
			if (!CurrentColor.match(/-highlight/)) {
				this.BodyRect.removeAttribute("class");
				this.BodyRect.setAttribute("class", CurrentColor + "-highlight");
			}
		}

		DisableHighlight() {
			var CurrentColor: string = this.GetColor();
			this.BodyRect.removeAttribute("class");
			this.BodyRect.setAttribute("class", CurrentColor.replace(/-highlight/, ""));
		}

	}

	export class GSNStrategyShape extends GSNShape {
		BodyPolygon: SVGPolygonElement;
		delta: number = 20;

		Render(): void {
			super.Render();
			this.BodyPolygon = <SVGPolygonElement>document.createSVGElement("polygon");
			this.BodyPolygon.setAttribute("class", this.ColorClassName);
			this.ShapeGroup.appendChild(this.BodyPolygon);
			this.Resize();
		}

		Resize(): void {
			this.BodyPolygon.setAttribute("points", "" + this.delta + ",0 " + this.Width + ",0 " + (this.Width - this.delta) + "," + this.Height + " 0," + this.Height);
		}

		SetColor(key: string) {
			this.BodyPolygon.setAttribute("class", key);
		}

		GetColor() {
			return this.BodyPolygon.getAttribute("class");
		}

		//EnableHighlight() {
		//	var CurrentColor: string = this.GetColor();
		//	if (!CurrentColor.match(/-highlight/)) {
		//		this.BodyPolygon.removeAttribute("class");
		//		this.BodyPolygon.setAttribute("class", CurrentColor + "-highlight");
		//	}
		//}

		//DisableHighlight() {
		//	var CurrentColor: string = this.GetColor();
		//	this.BodyPolygon.removeAttribute("class");
		//	this.BodyPolygon.setAttribute("class", CurrentColor.replace(/-highlight/, ""));
		//}

		GetConnectorPosition(Dir: Direction): Point {
			switch (Dir) {
				case Direction.Right:
					return new Point(this.Width - this.delta / 2, this.Height / 2);
				case Direction.Left:
					return new Point(this.delta / 2, this.Height / 2);
				case Direction.Top:
					return new Point(this.Width / 2, 0);
				case Direction.Bottom:
					return new Point(this.Width / 2, this.Height);
			}
		}
	}

	export class GSNEvidenceShape extends GSNShape {
		BodyEllipse: SVGEllipseElement;

		Render(): void {
			super.Render();
			this.BodyEllipse = <SVGEllipseElement>document.createSVGElement("ellipse");
			this.BodyEllipse.setAttribute("class", this.ColorClassName);
			this.ShapeGroup.appendChild(this.BodyEllipse);
			this.Resize();
		}

		Resize(): void {
			this.BodyEllipse.setAttribute("cx", (this.Width / 2).toString());
			this.BodyEllipse.setAttribute("cy", (this.Height / 2).toString());
			this.BodyEllipse.setAttribute("rx", (this.Width / 2).toString());
			this.BodyEllipse.setAttribute("ry", (this.Height / 2).toString());
		}

		/**
		SetColor(key: string) {
			this.BodyEllipse.setAttribute("class", key);
		}

		GetColor() {
			return this.BodyEllipse.getAttribute("class");
		}

		EnableHighlight() {
			var CurrentColor: string = this.GetColor();
			if (!CurrentColor.match(/-highlight/)) {
				this.BodyEllipse.removeAttribute("class");
				this.BodyEllipse.setAttribute("class", CurrentColor + "-highlight");
			}
		}

		DisableHighlight() {
			var CurrentColor: string = this.GetColor();
			this.BodyEllipse.removeAttribute("class");
			this.BodyEllipse.setAttribute("class", CurrentColor.replace(/-highlight/, ""));
		}
		**/
	}


}

$(() => {
	var AssureNoteApp = new AssureNote.AssureNoteApp();
});