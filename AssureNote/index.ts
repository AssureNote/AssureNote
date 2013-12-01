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

	export class NodeView {
		IsVisible: boolean;
		Label: string;
		NodeDoc: string;
		RelativeX: number = 0; // relative x from parent node
        RelativeY: number = 0; // relative y from parent node
		Color: ColorStyle;
		Parent: NodeView;
		Left: NodeView[] = [];
		Right: NodeView[] = [];
		Children: NodeView[] = [];
		Shape: GSNShape = null;

		private ConnectorStartPoint: Direction;
		private ConnectorEndPoint: Direction;

		constructor(public Model: GSNNode, IsRecursive: boolean) {
			this.Label = Model.GetLabel();
			this.NodeDoc = Model.NodeDoc;
			this.IsVisible = true;
			if (IsRecursive && Model.SubNodeList != null) {
				for (var i = 0; i < Model.SubNodeList.length; i++) {
					var SubNode = Model.SubNodeList[i];
					var SubView = new NodeView(SubNode, IsRecursive);
					if (SubNode.NodeType == GSNType.Context) {
						// Layout Engine allowed to move a node left-side
						this.AppendRightNode(SubView);
					} else {
						this.AppendChild(SubView);
					}
				}
			}
		}

		UpdateViewMap(ViewMap: { [index: string]: NodeView }) : void {
			ViewMap[this.Label] = this;
			for (var i = 0; i < this.Left.length; i++) {
				this.Left[i].UpdateViewMap(ViewMap);
			}
			for (var i = 0; i < this.Right.length; i++) {
				this.Right[i].UpdateViewMap(ViewMap);
			}
			for (var i = 0; i < this.Children.length; i++) {
				this.Children[i].UpdateViewMap(ViewMap);
			}
		}

		private AppendParent(Parent: NodeView): void {
			this.Parent = Parent;
		}

		AppendChild(Child: NodeView): void {
			this.Children.push(Child);
			Child.AppendParent(this);
		}

		AppendLeftNode(Node: NodeView): void {
			this.Left.push(Node);
			Node.AppendParent(this);
		}

		AppendRightNode(Node: NodeView): void {
			this.Right.push(Node);
			Node.AppendParent(this);
		}

		GetShape(): GSNShape {
			if (this.Shape == null) {
				this.Shape = AssureNoteUtils.CreateGSNShape(this);
			}
			return this.Shape;
		}

		GetDocumentWx(wx: number): number {
			if (this.Parent == null) {
				return wx + this.RelativeX;
			}
			return this.Parent.GetDocumentWx(wx) + this.RelativeX;
		}

		GetDocumentWy(wy: number): number {
			if (this.Parent == null) {
				return wy + this.RelativeY;
			}
			return this.Parent.GetDocumentWy(wy) + this.RelativeY;
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

		Resize() {
			//this.GetShape().Resize();
		}

		GetDocumentConnectorPosition(Dir: Direction, wx: number, wy: number): Point {
			var p = this.Shape.GetConnectorPosition(Dir);

			p.x += this.GetDocumentWx(wx);
			p.y += this.GetDocumentWy(wy);
			return p;
		}

		SetArrowPosition(p1: Point, p2: Point, dir: Direction) {
			this.Shape.SetArrowPosition(p1, p2, dir);
		}

		SetDocumentPosition(wx: number, wy: number): void {
			if (this.IsVisible) {
				AssureNoteApp.Assert((this.Shape != null));
				this.Shape.SetPosition(this.GetDocumentWx(wx), this.GetDocumentWy(wy));
				for (var i = 0; i < this.Children.length; i++) {
					var SubNode = this.Children[i];
					SubNode.SetDocumentPosition(wx, wy);
					var P1 = this.GetDocumentConnectorPosition(Direction.Bottom, wx, wy);
					var P2 = SubNode.GetDocumentConnectorPosition(Direction.Top, wx, wy);
					SubNode.SetArrowPosition(P1, P2, Direction.Bottom);
				}

				for (var i = 0; i < this.Right.length; i++) {
					var SubNode = this.Right[i];
					SubNode.SetDocumentPosition(wx, wy);
					var P1 = this.GetDocumentConnectorPosition(Direction.Right, wx, wy);
					var P2 = SubNode.GetDocumentConnectorPosition(Direction.Left, wx, wy);
					SubNode.SetArrowPosition(P1, P2, Direction.Left);
				}

				for (var i = 0; i < this.Left.length; i++) {
					var SubNode = this.Left[i];
					SubNode.SetDocumentPosition(wx, wy);
					var P1 = this.GetDocumentConnectorPosition(Direction.Left, wx, wy);
					var P2 = SubNode.GetDocumentConnectorPosition(Direction.Right, wx, wy);
					SubNode.SetArrowPosition(P1, P2, Direction.Right);
				}
			}
		}
    }

    export class Rect {
        constructor(public X: number, public Y: number, public Width: number, public Height: number) {
        }
        toString(): string {
            return "(" + [this.X, this.Y, this.Width, this.Height].join(", ") + ")";
        }
    }

	export class GSNShape {
		ShapeGroup: SVGGElement;
		ArrowPath: SVGPathElement;
		Content: HTMLElement;
		ColorClassName: string = Color.Default;
		private NodeWidth: number;
        private NodeHeight: number;
        private TreeBoundingBox: Rect;
        //private TreeWidth: number; // Width of the bounding box contains all subnodes (left nodes, right nodes and children)
        //private TreeHeight: number;
        private static ArrowPathMaster: SVGPathElement = null;

		constructor(public NodeView: NodeView) {
			this.Content = null;
			this.NodeWidth = 250;
            this.NodeHeight = 100;
            this.TreeBoundingBox = new Rect(0, 0, 0, 0);
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

		SetTreeSize(Width : number, Height: number): void {
            this.TreeBoundingBox.Width = Width;
            this.TreeBoundingBox.Height = Height;
//			if (this.NodeHeight == 0) {
//				this.TreeWidth = Width;
//				this.NodeHeight = Height;
//			}
		}

		GetNodeWidth(): number {
			return 250; //FIXME
		}

		GetNodeHeight(): number {
			return 100; //FIXME
		}

		GetTreeWidth(): number {
            if (this.TreeBoundingBox.Width == 0) {
                this.TreeBoundingBox.Width = 250; //FIXME
			}
            return this.TreeBoundingBox.Width;
        }

		GetTreeHeight(): number {
            if (this.TreeBoundingBox.Height == 0) {
                this.TreeBoundingBox.Height = 100; //FIXME
			}
            return this.TreeBoundingBox.Height;
        }

        GetTreeLeftX(): number {
            return this.TreeBoundingBox.X;
        }

        GetTreeUpperY(): number {
            return this.TreeBoundingBox.Y;
        }

        SetTreeUpperLeft(X: number, Y: number): void {
            this.TreeBoundingBox.X = X;
            this.TreeBoundingBox.Y = Y;
        }

		//Resize(): void {
		//	//this.Width = HTMLDoc.Width;
		//	//this.Height = HTMLDoc.Height;

		//	//LayoutEngine.Layout(this.NodeView, this);
		//	this.NodeView.OffsetGx = this.Width / 2;
		//	this.NodeView.OffsetGy = LevelMargin;
		//}

		UpdateWidth() {
			switch (this.NodeView.Model.NodeType) {
				case GSNType.Goal:
					this.Content.className = "node node-goal";
					break;
				case GSNType.Context:
					this.Content.className = "node node-context";
					break;
				case GSNType.Strategy:
					this.Content.className = "node node-strategy";
					break;
				case GSNType.Evidence:
				default:
					this.Content.className = "node node-evidence";
					break;
			}
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
				this.Content = div;
				this.UpdateWidth();
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
					return new Point(this.GetNodeWidth(), this.GetNodeHeight() / 2);
				case Direction.Left:
					return new Point(0, this.GetNodeHeight() / 2);
				case Direction.Top:
					return new Point(this.GetNodeWidth() / 2, 0);
				case Direction.Bottom:
					return new Point(this.GetNodeWidth() / 2, this.GetNodeHeight());
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
			this.BodyRect.setAttribute("width", this.GetNodeWidth().toString());
			this.BodyRect.setAttribute("height", this.GetNodeHeight().toString());
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
			this.BodyRect.setAttribute("width", this.GetTreeWidth().toString());
			this.BodyRect.setAttribute("height", this.GetTreeHeight().toString());
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
            var w: number = this.GetNodeWidth();
            var h: number = this.GetNodeHeight();
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
					return new Point(this.GetNodeWidth() - this.delta / 2, this.GetNodeHeight() / 2);
				case Direction.Left:
					return new Point(this.delta / 2, this.GetNodeHeight() / 2);
				case Direction.Top:
					return new Point(this.GetNodeWidth() / 2, 0);
				case Direction.Bottom:
					return new Point(this.GetNodeWidth() / 2, this.GetNodeHeight());
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
			this.BodyEllipse.setAttribute("cx", (this.GetNodeWidth()/ 2).toString());
			this.BodyEllipse.setAttribute("cy", (this.GetNodeHeight() / 2).toString());
			this.BodyEllipse.setAttribute("rx", (this.GetNodeWidth()/ 2).toString());
			this.BodyEllipse.setAttribute("ry", (this.GetNodeHeight() / 2).toString());

		}

	}


}

$(() => {
	var AssureNoteApp = new AssureNote.AssureNoteApp();

	var Menu: AssureNote.SideMenuContent[] = [];
	Menu.push(new AssureNote.SideMenuContent("#", "Download", "download-wgsn", "glyphicon-floppy-disk", (ev: Event) => {
		var Writer = new StringWriter();
		AssureNoteApp.MasterRecord.FormatRecord(Writer);
		AssureNote.AssureNoteUtils.SaveAs(Writer.toString(), "downlaod.wgsn"); //FIXME file name
	}));
	AssureNote.SideMenu.Create(Menu);

});