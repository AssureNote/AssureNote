///<reference path='d.ts/jquery.d.ts'/>
///<reference path='src/AssureNote.ts'/>
///<reference path='src/AssureNoteParser.ts'/>
///<reference path='src/Panel.ts'/>
///<reference path='src/LayoutEngine.ts'/>
///<reference path='src/Viewport.ts'/>

///<reference path='plugin/FullScreenEditor/FullScreenEditor.ts'/>

module AssureNote {

	export class ColorStyle {
		static Default: string = "assureit-default";
		static ToDo: string = "assureit-todo";
		static Searched: string = "assureit-search";
		static Danger: string = "assureit-danger";
	}

	export class NodeView {
		IsVisible: boolean;
		Label: string;
		NodeDoc: string;
		RelativeX: number = 0; // relative x from parent node
        RelativeY: number = 0; // relative y from parent node
		Color: ColorStyle;
		Parent: NodeView;
		Left: NodeView[] = null;
		Right: NodeView[] = null;
		Children: NodeView[] = null;
        Shape: GSNShape = null;

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
            if (this.Left != null) {
                for (var i = 0; i < this.Left.length; i++) {
                    this.Left[i].UpdateViewMap(ViewMap);
                }
            }
            if (this.Right != null) {
                for (var i = 0; i < this.Right.length; i++) {
                    this.Right[i].UpdateViewMap(ViewMap);
                }
            }
            if (this.Children != null) {
                for (var i = 0; i < this.Children.length; i++) {
                    this.Children[i].UpdateViewMap(ViewMap);
                }
            }
		}

        AppendChild(SubNode: NodeView): void {
            if (this.Children == null) {
                this.Children = [];
            }
            this.Children.push(SubNode);
            SubNode.Parent = this;
		}

        AppendLeftNode(SubNode: NodeView): void {
            if (this.Left == null) {
                this.Left = [];
            }
			this.Left.push(SubNode);
            SubNode.Parent = this;
		}

        AppendRightNode(SubNode: NodeView): void {
            if (this.Right == null) {
                this.Right = [];
            }
			this.Right.push(SubNode);
            SubNode.Parent = this;
		}

		GetShape(): GSNShape {
			if (this.Shape == null) {
				this.Shape = AssureNoteUtils.CreateGSNShape(this);
			}
			return this.Shape;
		}

        // Global X: Scale-independent and transform-independent X distance from leftside of the top goal.
        // Return always 0 if this is top goal.
        GetGx(): number {
            if (NodeView.GlobalPositionCache != null && NodeView.GlobalPositionCache[this.Label]) {
                return NodeView.GlobalPositionCache[this.Label].X;
            }
			if (this.Parent == null) {
				return this.RelativeX;
			}
			return this.Parent.GetGx() + this.RelativeX;
		}

        // Global Y: Scale-independent and transform-independent Y distance from top of the top goal.
        // Return always 0 if this is top goal.
        GetGy(): number {
            if (NodeView.GlobalPositionCache != null && NodeView.GlobalPositionCache[this.Label]) {
                return NodeView.GlobalPositionCache[this.Label].Y;
            }
			if (this.Parent == null) {
				return this.RelativeY;
			}
			return this.Parent.GetGy() + this.RelativeY;
        }

        // For memorization
        private static GlobalPositionCache: { [index: string]: Point } = null;
        public static SetGlobalPositionCacheEnabled(State: boolean) {
            if (State && NodeView.GlobalPositionCache == null) {
                NodeView.GlobalPositionCache = {};
            } else if (!State) {
                NodeView.GlobalPositionCache = null;
            }
        }

        // Scale-independent and transform-independent distance from leftside of GSN.
        // Return always (0, 0) if this is top goal.
        private GetGlobalPosition(): Point {
            if (NodeView.GlobalPositionCache != null && NodeView.GlobalPositionCache[this.Label]) {
                return NodeView.GlobalPositionCache[this.Label].Clone();
            }
            if (this.Parent == null) {
                return new Point(this.RelativeX, this.RelativeY);
            }
            var ParentPosition = this.Parent.GetGlobalPosition();
            ParentPosition.X += this.RelativeX;
            ParentPosition.Y += this.RelativeY;
            if (NodeView.GlobalPositionCache != null) {
                NodeView.GlobalPositionCache[this.Label] = ParentPosition.Clone();
            }
            return ParentPosition;
        }

		GetNodeType(): GSNType {
			return this.Model.NodeType;
        }

		Render(DivFrag: DocumentFragment, SvgNodeFrag: DocumentFragment, SvgConnectionFrag: DocumentFragment): void {
            this.Shape.Render(DivFrag, SvgNodeFrag, SvgConnectionFrag);
		}

		Update(Model: GSNNode) {
			//TODO
			this.Model = Model;
			throw "Update is under construction.";
		}

		private GetConnectorPosition(Dir: Direction, GlobalPosition: Point): Point {
			var P = this.Shape.GetConnectorPosition(Dir);
            P.X += GlobalPosition.X;
            P.Y += GlobalPosition.Y;
			return P;
		}

		private SetArrowPosition(P1: Point, P2: Point, Dir: Direction) {
			this.Shape.SetArrowPosition(P1, P2, Dir);
		}

        UpdateDocumentPosition(): void {
            if (!this.IsVisible) {
                return
            }
            AssureNoteApp.Assert((this.Shape != null));
            var GlobalPosition = this.GetGlobalPosition();
            this.Shape.SetPosition(GlobalPosition.X, GlobalPosition.Y);
            this.ForEachVisibleChildren((SubNode: NodeView) => {
                SubNode.UpdateDocumentPosition();
                var P1 = this.GetConnectorPosition(Direction.Bottom, GlobalPosition);
                var P2 = SubNode.GetConnectorPosition(Direction.Top, SubNode.GetGlobalPosition());
                SubNode.SetArrowPosition(P1, P2, Direction.Bottom);
            });
            this.ForEachVisibleRightNodes((SubNode: NodeView) => {
                SubNode.UpdateDocumentPosition();
                var P1 = this.GetConnectorPosition(Direction.Right, GlobalPosition);
                var P2 = SubNode.GetConnectorPosition(Direction.Left, SubNode.GetGlobalPosition());
                SubNode.SetArrowPosition(P1, P2, Direction.Left);
            });
            this.ForEachVisibleLeftNodes((SubNode: NodeView) => {
                SubNode.UpdateDocumentPosition();
                var P1 = this.GetConnectorPosition(Direction.Left, GlobalPosition);
                var P2 = SubNode.GetConnectorPosition(Direction.Right, SubNode.GetGlobalPosition());
                SubNode.SetArrowPosition(P1, P2, Direction.Right);
            });
        }

        private ForEachVisibleSubNode(SubNodes: NodeView[], Action: (NodeView) => void): void {
            if (SubNodes != null) {
                for (var i = 0; i < SubNodes.length; i++) {
                    if (SubNodes[i].IsVisible) {
                        Action(SubNodes[i]);
                    }
                }
            }
        }

        ForEachVisibleChildren(Action: (NodeView) => void): void {
            this.ForEachVisibleSubNode(this.Children, Action);
        }

        ForEachVisibleRightNodes(Action: (NodeView) => void): void {
            this.ForEachVisibleSubNode(this.Right, Action);
        }

        ForEachVisibleLeftNodes(Action: (NodeView) => void): void {
            this.ForEachVisibleSubNode(this.Left, Action);
        }
    }

    export class Rect {
        constructor(public X: number, public Y: number, public Width: number, public Height: number) {
        }
        toString(): string {
            return "(" + [this.X, this.Y, this.Width, this.Height].join(", ") + ")";
        }
        Clone(): Rect {
            return new Rect(this.X, this.Y, this.Width, this.Height);
        }
    }

	export class GSNShape {
		ShapeGroup: SVGGElement;
		ArrowPath: SVGPathElement;
		Content: HTMLElement;
		ColorClassName: string = ColorStyle.Default;
		private NodeWidth: number;
        private NodeHeight: number;
        private TreeBoundingBox: Rect;
        private static ArrowPathMaster: SVGPathElement = null;

		constructor(public NodeView: NodeView) {
			this.Content = null;
			this.NodeWidth = 250;
            this.NodeHeight = 0;
            this.TreeBoundingBox = new Rect(0, 0, 0, 0);
		}

        private static CreateArrowPath(): SVGPathElement {
            if (!GSNShape.ArrowPathMaster) {
                GSNShape.ArrowPathMaster = AssureNoteUtils.CreateSVGElement("path");
                GSNShape.ArrowPathMaster.setAttribute("marker-end", "url(#Triangle-black)");
                GSNShape.ArrowPathMaster.setAttribute("fill", "none");
                GSNShape.ArrowPathMaster.setAttribute("stroke", "gray");
                GSNShape.ArrowPathMaster.setAttribute("d", "M0,0 C0,0 0,0 0,0");
				GSNShape.ArrowPathMaster.setAttribute("d", "M0,0 C0,0 0,0 0,0");
			}
            return <SVGPathElement>GSNShape.ArrowPathMaster.cloneNode();
        }

		SetTreeSize(Width : number, Height: number): void {
            this.TreeBoundingBox.Width = Width;
            this.TreeBoundingBox.Height = Height;
		}

		GetNodeWidth(): number {
            return this.NodeWidth;
		}

        GetNodeHeight(): number {
            if (this.NodeHeight == 0) {
                this.NodeHeight = this.Content.clientHeight;
            }
            return this.NodeHeight;
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

		UpdateHtmlClass() {
			this.Content.className = "node";
		}

		private PrerenderHTMLContent(): void {
            if (this.Content == null) {
				var div = document.createElement("div");
                this.Content = div;

                div.style.position = "absolute";
				div.id = this.NodeView.Label;

				var h4 = document.createElement("h4");
				h4.innerText = this.NodeView.Label;

				var p = document.createElement("p");
				p.innerText = this.NodeView.NodeDoc;

                this.UpdateHtmlClass();

				div.appendChild(h4);
				div.appendChild(p);
			}
        }

        PrerenderContent() {
            this.PrerenderHTMLContent();
            this.PrerenderSVGContent();
        }

        Render(HtmlContentFragment: DocumentFragment, SvgNodeFragment: DocumentFragment, SvgConnectionFragment: DocumentFragment): void {
			SvgNodeFragment.appendChild(this.ShapeGroup);
			if (this.ArrowPath != null && this.NodeView.Parent != null) {
				SvgConnectionFragment.appendChild(this.ArrowPath);
			}
            HtmlContentFragment.appendChild(this.Content);
        }

        FitSizeToContent(): void {
        }

		SetPosition(x: number, y: number): void {
			if (this.NodeView.IsVisible) {
                var div = this.Content;//document.getElementById(this.NodeView.Label);
				if (div != null) {
					div.style.left = x + "px";
					div.style.top  = y + "px";
                }
                var mat = this.ShapeGroup.transform.baseVal.getItem(0).matrix;
			    mat.e = x;
			    mat.f = y;
			}
		}

		PrerenderSVGContent(): void {
            this.ShapeGroup = AssureNoteUtils.CreateSVGElement("g");
			this.ShapeGroup.setAttribute("transform", "translate(0,0)");
            this.ArrowPath = GSNShape.CreateArrowPath();
		}

		SetArrowPosition(P1: Point, P2: Point, Dir: Direction) {
			var start = <SVGPathSegMovetoAbs>this.ArrowPath.pathSegList.getItem(0);
			var curve = <SVGPathSegCurvetoCubicAbs>this.ArrowPath.pathSegList.getItem(1);
			start.x = P1.X;
			start.y = P1.Y;
			curve.x = P2.X;
			curve.y = P2.Y;
			if (Dir == Direction.Bottom || Dir == Direction.Top) {
				curve.x1 = (9 * P1.X + P2.X) / 10;
				curve.y1 = (P1.Y + P2.Y) / 2;
				curve.x2 = (9 * P2.X + P1.X) / 10;
				curve.y2 = (P1.Y + P2.Y) / 2;
			} else {
				curve.x1 = (P1.X + P2.X) / 2;
				curve.y1 = (9 * P1.Y + P2.Y) / 10;
				curve.x2 = (P1.X + P2.X) / 2;
				curve.y2 = (9 * P2.Y + P1.Y) / 10;
			}
		}

		SetArrowColorWhite(IsWhite: boolean) {
			if (IsWhite) {
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

		PrerenderSVGContent(): void {
			super.PrerenderSVGContent();
			this.BodyRect = AssureNoteUtils.CreateSVGElement("rect");
            //this.BodyRect = AssureNoteUtils.CreateSVGElement("use");
			//this.BodyRect.setAttribute("xlink:href", "#goal-masterhoge");
			this.BodyRect.setAttribute("class", this.ColorClassName);
            //this.UndevelopedSymbol = AssureNoteUtils.CreateSVGElement("use");
			//this.UndevelopedSymbol.setAttribute("xlink:href", "#UndevelopdSymbol");
			this.ShapeGroup.appendChild(this.BodyRect);
		}

        FitSizeToContent(): void {
			//super.Resize(CaseViewer, NodeModel, HTMLDoc);
			this.BodyRect.setAttribute("width", this.GetNodeWidth().toString());
			this.BodyRect.setAttribute("height", this.GetNodeHeight().toString());
        }

        UpdateHtmlClass() {
            this.Content.className = "node node-goal";
        }

	}

	export class GSNContextShape extends GSNShape {
		BodyRect: SVGRectElement;

		PrerenderSVGContent(): void {
			super.PrerenderSVGContent();
            this.BodyRect = AssureNoteUtils.CreateSVGElement("rect");
			this.BodyRect.setAttribute("class", this.ColorClassName);
			this.ArrowPath.setAttribute("marker-end", "url(#Triangle-white)");
			this.BodyRect.setAttribute("rx", "10");
			this.BodyRect.setAttribute("ry", "10");
			this.ShapeGroup.appendChild(this.BodyRect);
		}

		FitSizeToContent(): void {
            this.BodyRect.setAttribute("width", this.GetNodeWidth().toString());
            this.BodyRect.setAttribute("height", this.GetNodeHeight().toString());
		}

        UpdateHtmlClass() {
            this.Content.className = "node node-context";
        }

	}

	export class GSNStrategyShape extends GSNShape {
		BodyPolygon: SVGPolygonElement;
		delta: number = 20;

		PrerenderSVGContent(): void {
            super.PrerenderSVGContent();
			this.BodyPolygon = AssureNoteUtils.CreateSVGElement("polygon");
			//this.BodyPolygon = AssureNoteUtils.CreateSVGElement("use");
			this.BodyPolygon.setAttribute("class", this.ColorClassName);
			//this.BodyPolygon.setAttribute("xlink:href", "#strategy-master");
			this.ShapeGroup.appendChild(this.BodyPolygon);
		}

        FitSizeToContent(): void {
            var w: number = this.GetNodeWidth();
            var h: number = this.GetNodeHeight();
            this.BodyPolygon.setAttribute("points", "" + this.delta + ",0 " + w + ",0 " + (w - this.delta) + "," + h + " 0," + h);
		}

        UpdateHtmlClass() {
            this.Content.className = "node node-strategy";
        }

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

		PrerenderSVGContent(): void {
			super.PrerenderSVGContent();
			this.BodyEllipse = AssureNoteUtils.CreateSVGElement("ellipse");
			//this.BodyEllipse = AssureNoteUtils.CreateSVGElement("use");
			this.BodyEllipse.setAttribute("class", this.ColorClassName);
			//this.BodyEllipse.setAttribute("xlink:href", "#evidence-master");
			this.ShapeGroup.appendChild(this.BodyEllipse);
		}

        FitSizeToContent(): void {
			this.BodyEllipse.setAttribute("cx", (this.GetNodeWidth()/ 2).toString());
			this.BodyEllipse.setAttribute("cy", (this.GetNodeHeight() / 2).toString());
			this.BodyEllipse.setAttribute("rx", (this.GetNodeWidth()/ 2).toString());
			this.BodyEllipse.setAttribute("ry", (this.GetNodeHeight() / 2).toString());
        }

        UpdateHtmlClass() {
            this.Content.className = "node node-evidence";
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

	var SamplePlugin = new AssureNote.SamplePlugin();
	AssureNoteApp.PluginManager.SetPlugin("Sample", SamplePlugin);
	var FullScreenEditorPlugin = new AssureNote.FullScreenEditorPlugin();
	AssureNoteApp.PluginManager.SetPlugin("FullScreenEditor", FullScreenEditorPlugin);

});
