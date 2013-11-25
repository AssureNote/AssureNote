///<reference path='src/Api.ts'/>
///<reference path='d.ts/jquery.d.ts'/>
///<reference path='src/AssureNote.ts'/>
///<reference path='src/AssureNoteParser.ts'/>
///<reference path='src/Panel.ts'/>
///<reference path='src/LayoutEngine.ts'/>
///<reference path='src/PluginManager.ts'/>
///<reference path='src/CaseViewer.ts'/>

module AssureNote {

	export class ColorStyle {
		//TODO
	}

	export class GSNViewer {
		ViewMap: { [index: string]: NodeView };

		constructor(public AssureNoteApp: AssureNoteApp) {
			this.ViewMap = {};
		}

		CreateViewAll(Doc: GSNDoc): void {
			var Keys = Doc.NodeMap.keySet();
			for (var i = 0; i < Keys.length; i++) {
				this.ViewMap[Keys[i]] = new NodeView(Doc.GetNode(Keys[i]));
			}
			if (Doc.TopGoal == null) {
				this.AssureNoteApp.DebugP("Parse Error");
			}
			this.InsertRelative(this.ViewMap[Doc.TopGoal.GetLabel()]);
		}

		private InsertRelative(NodeView: NodeView): void {
			if (NodeView == null) {
				return;
			}
			var Children = NodeView.Model.SubNodeList;
			if (Children == null) {
				return;
			}
			for (var i = 0; i < Children.length; i++) {
				var ChildView = this.ViewMap[Children[i].GetLabel()];
				NodeView.AppendChild(ChildView);
				this.InsertRelative(ChildView);
			}
		}

		CreateView(Node: GSNNode): boolean {
			if (this.ViewMap[Node.LabelNumber] != null) {
				return false;
			}
			this.ViewMap[Node.LabelNumber] = new NodeView(Node);
			return true;
		}

		UpdateView(Node: GSNNode): boolean {
			if (this.ViewMap[Node.LabelNumber] == null) {
				return false;
			}
			this.ViewMap[Node.LabelNumber].Update(Node);
			return true;
		}

		Clear(): void {
			this.ViewMap = {};
		}

		GetKeyList(): string[]{
			return Object.keys(this.ViewMap);
		}

		GetNode(Label: string): NodeView {
			return this.ViewMap[Label];
		}
	}

	export class NodeView {
		//Model: GSNNode;
		IsVisible: boolean;
		Label: string;
		NodeDoc: string;
		OffsetGx: number;
		OffsetGy: number;
		private Width: number;
		private Height: number;
		Color: ColorStyle;
		Parent: NodeView;
		Left: NodeView[] = [];
		Right: NodeView[] = [];
		Children: NodeView[] = [];
		Shape: GSNShape = null;

		constructor(public Model: GSNNode) {
			this.Label = Model.GetLabel();
			this.NodeDoc = Model.NodeDoc;
		}

		private AppendParent(Parent: NodeView): void {
			this.Parent = Parent;
		}

		AppendChild(Child: NodeView): void {
			this.Children.push(Child);
			Child.AppendParent(this);
		}

		GetShape(): GSNShape {
			if (this.Shape == null) {
				this.IsVisible = true;
				this.Shape = AssureNoteUtils.CreateGSNShape(this);
			}
			return this.Shape;
		}

		GetGx(): number {
			if (this.Parent == null) {
				return this.OffsetGx;
			}
			return this.Parent.GetGx() + this.OffsetGx;
		}

		GetGy(): number {
			if (this.Parent == null) {
				return this.OffsetGy;
			}
			return this.Parent.GetGy() + this.OffsetGy;
		}

		GetNodeType(): GSNType {
			return this.Model.NodeType;
		}

		Render(DivFrag: DocumentFragment, SvgNodeFrag: DocumentFragment, SvgConnectionFrag: DocumentFragment): void {
			var Shape = this.GetShape();
			Shape.Render();
			Shape.CreateSVG(SvgNodeFrag, SvgConnectionFrag);
			Shape.CreateHtmlContent(DivFrag);
		}

		Update(Model: GSNNode) {
			//TODO
			this.Model = Model;
			throw "Update is under construction.";
		}

		Resize(LayoutEngine: SimpleLayoutEngine) {
			this.GetShape().Resize(LayoutEngine);
		}
	}

	export class GSNShape {
		ShapeGroup: SVGGElement;
		ArrowPath: SVGPathElement;
		Content: HTMLElement;
		ColorClassName: string = Color.Default;
		private NodeWidth: number;
        private NodeHeight: number;
        public Width: number;
        public Height: number;
        private static ArrowPathMaster: SVGPathElement = null;

		constructor(public NodeView: NodeView) {
			this.Content = null;
		}

        private static CreateArrowPath(): SVGPathElement {
            if (!GSNShape.ArrowPathMaster) {
                GSNShape.ArrowPathMaster = AssureNoteUtils.CreateSVGElement("path");
                GSNShape.ArrowPathMaster.setAttribute("marker-end", "url(#Triangle-black)");
                GSNShape.ArrowPathMaster.setAttribute("fill", "none");
                GSNShape.ArrowPathMaster.setAttribute("stroke", "gray");
                GSNShape.ArrowPathMaster.setAttribute("d", "M0,0 C0,0 0,0 0,0");
            }
            return <SVGPathElement>GSNShape.ArrowPathMaster.cloneNode();
        }

		GetWidth(): number {
			if (this.Width == null) {
				this.Width = 250; //FIXME
			}
            return this.Width;
        }


		GetHeight(): number {
			if (this.Height == null) {
				this.Height = 100; //FIXME
			}
			return this.Height;
        }

		Resize(LayoutEngine: SimpleLayoutEngine): void {
			//this.Width = HTMLDoc.Width;
			//this.Height = HTMLDoc.Height;

			LayoutEngine.Layout(this.NodeView, this);
			this.NodeView.OffsetGx = this.Width / 2;
			this.NodeView.OffsetGy = LevelMargin;
		}

		CreateHtmlContent(Content: DocumentFragment): void {
			if (this.NodeView.IsVisible) {
				var div = document.createElement("div");
				div.style.position = "absolute";
				div.id = this.NodeView.Label;

				var h4 = document.createElement("h4");
				h4.innerText = this.NodeView.Label;

				var p = document.createElement("p");
				p.innerText = this.NodeView.NodeDoc;

				div.appendChild(h4);
				div.appendChild(p);
				Content.appendChild(div);
			}
		}

		CreateSVG(SvgNodeFrag: DocumentFragment, SvgConnectionFrag: DocumentFragment) {
			SvgNodeFrag.appendChild(this.ShapeGroup);
			if (this.ArrowPath != null) {
				SvgConnectionFrag.appendChild(this.ArrowPath);
			}
		}

		SetPosition(x: number, y: number) {
			if (this.NodeView.IsVisible) {
				var div = document.getElementById(this.NodeView.Label);
				if (div != null) {
					div.style.left = x + "px";
					div.style.top  = y + "px";
                }
                var mat = this.ShapeGroup.transform.baseVal.getItem(0).matrix;
			    mat.e = x;
			    mat.f = y;
			}
		}

		Render(): void {
            this.ShapeGroup = AssureNoteUtils.CreateSVGElement("g");
			this.ShapeGroup.setAttribute("transform", "translate(0,0)");
            this.ArrowPath = GSNShape.CreateArrowPath();
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
	}

	export class GSNGoalShape extends GSNShape {
		BodyRect: SVGRectElement;
		UndevelopedSymbol: SVGUseElement;

		Render(): void {
			super.Render();
			this.BodyRect = AssureNoteUtils.CreateSVGElement("rect");
            //this.BodyRect = AssureNoteUtils.CreateSVGElement("use");
			//this.BodyRect.setAttribute("xlink:href", "#goal-masterhoge");
			this.BodyRect.setAttribute("class", this.ColorClassName);
            //this.UndevelopedSymbol = AssureNoteUtils.CreateSVGElement("use");
			//this.UndevelopedSymbol.setAttribute("xlink:href", "#UndevelopdSymbol");
			this.ShapeGroup.appendChild(this.BodyRect);
			this.Resize();
		}

		Resize(): void {
			//super.Resize(CaseViewer, NodeModel, HTMLDoc);
			this.BodyRect.setAttribute("width", this.GetWidth().toString());
			this.BodyRect.setAttribute("height", this.GetHeight().toString());
		}

	}

	export class GSNContextShape extends GSNShape {
		BodyRect: SVGRectElement;

		Render(): void {
			super.Render();
            this.BodyRect = AssureNoteUtils.CreateSVGElement("rect");
			this.BodyRect.setAttribute("class", this.ColorClassName);
			this.ArrowPath.setAttribute("marker-end", "url(#Triangle-white)");
			this.BodyRect.setAttribute("rx", "10");
			this.BodyRect.setAttribute("ry", "10");
			this.ShapeGroup.appendChild(this.BodyRect);
			this.Resize();
		}

		Resize(): void {
			//super.Resize();
			this.BodyRect.setAttribute("width", this.GetWidth().toString());
			this.BodyRect.setAttribute("height", this.GetHeight().toString());
		}

		//SetColor(key: string) {
		//	this.BodyRect.setAttribute("class", key);
		//}

		//GetColor() {
		//	return this.BodyRect.getAttribute("class");
		//}

		//EnableHighlight() {
		//	var CurrentColor: string = this.GetColor();
		//	if (!CurrentColor.match(/-highlight/)) {
		//		this.BodyRect.removeAttribute("class");
		//		this.BodyRect.setAttribute("class", CurrentColor + "-highlight");
		//	}
		//}

		//DisableHighlight() {
		//	var CurrentColor: string = this.GetColor();
		//	this.BodyRect.removeAttribute("class");
		//	this.BodyRect.setAttribute("class", CurrentColor.replace(/-highlight/, ""));
		//}

	}

	export class GSNStrategyShape extends GSNShape {
		BodyPolygon: SVGPolygonElement;
		delta: number = 20;

		Render(): void {
            super.Render();
			this.BodyPolygon = AssureNoteUtils.CreateSVGElement("polygon");
			//this.BodyPolygon = AssureNoteUtils.CreateSVGElement("use");
			this.BodyPolygon.setAttribute("class", this.ColorClassName);
			//this.BodyPolygon.setAttribute("xlink:href", "#strategy-master");
			this.ShapeGroup.appendChild(this.BodyPolygon);
			this.Resize();
		}

        Resize(): void {
            var w: number = this.GetWidth();
            var h: number = this.GetHeight();
            this.BodyPolygon.setAttribute("points", "" + this.delta + ",0 " + w + ",0 " + (w - this.delta) + "," + h + " 0," + h);
		}

		//SetColor(key: string) {
		//	this.BodyPolygon.setAttribute("class", key);
		//}

		//GetColor() {
		//	return this.BodyPolygon.getAttribute("class");
		//}

		GetConnectorPosition(Dir: Direction): Point {
			switch (Dir) {
				case Direction.Right:
					return new Point(this.GetWidth() - this.delta / 2, this.GetHeight() / 2);
				case Direction.Left:
					return new Point(this.delta / 2, this.GetHeight() / 2);
				case Direction.Top:
					return new Point(this.GetWidth() / 2, 0);
				case Direction.Bottom:
					return new Point(this.GetWidth() / 2, this.GetHeight());
			}
		}
	}

	export class GSNEvidenceShape extends GSNShape {
		//BodyEllipse: SVGUseElement;
		BodyEllipse: SVGEllipseElement;

		Render(): void {
			super.Render();
			this.BodyEllipse = AssureNoteUtils.CreateSVGElement("ellipse");
			//this.BodyEllipse = AssureNoteUtils.CreateSVGElement("use");
			this.BodyEllipse.setAttribute("class", this.ColorClassName);
			//this.BodyEllipse.setAttribute("xlink:href", "#evidence-master");
			this.ShapeGroup.appendChild(this.BodyEllipse);
			this.Resize();
		}

        Resize(): void {
			this.BodyEllipse.setAttribute("cx", (this.GetWidth()/ 2).toString());
			this.BodyEllipse.setAttribute("cy", (this.GetHeight() / 2).toString());
			this.BodyEllipse.setAttribute("rx", (this.GetWidth()/ 2).toString());
			this.BodyEllipse.setAttribute("ry", (this.GetHeight() / 2).toString());

		}

	}


}

$(() => {
	var AssureNoteApp = new AssureNote.AssureNoteApp();
	//var node = new AssureNote.GSNNode(new AssureNote.GSNDoc(), null, 1, AssureNote.GSNType.Strategy, "G1", []);
	//var nodeview = new AssureNote.NodeView(node);
	//nodeview.Render();
	//var ele = nodeview.Shape.GetSVG();

	//document.getElementById("svg-node").appendChild(ele);
	//$("#editor-wrapper").hide();
});