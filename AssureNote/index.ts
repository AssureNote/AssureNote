///<reference path='d.ts/jquery.d.ts'/>
///<reference path='src/AssureNote.ts'/>
///<reference path='src/AssureNoteParser.ts'/>
///<reference path='src/Panel.ts'/>
///<reference path='src/LayoutEngine.ts'/>
///<reference path='src/Viewport.ts'/>

///<reference path='plugin/FoldingViewSwitch/FoldingViewSwitch.ts'/>
///<reference path='plugin/FullScreenEditor/FullScreenEditor.ts'/>
///<reference path='plugin/MessageChat/MessageChat.ts'/>
///<reference path='plugin/VariableInterpolation/VariableInterpolation.ts'/>

module AssureNote {

	export class ColorStyle {
		static Default: string = "assurenote-default";
		static ToDo: string = "assurenote-todo";
		static Searched: string = "assurenote-search";
		static Danger: string = "assurenote-danger";
	}

	export class NodeView {
		IsVisible: boolean;
		IsFolded: boolean;
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
			this.IsFolded = false;
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

		UpdateViewMap(ViewMap: { [index: string]: NodeView }): void {
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

        UpdateShape(): GSNShape {
            this.Shape = AssureNoteUtils.CreateGSNShape(this);
            return this.Shape;
        }

        // Global X: Scale-independent and transform-independent X distance from leftside of the top goal.
        // Return always 0 if this is top goal.
        GetGX(): number {
            if (NodeView.GlobalPositionCache != null && NodeView.GlobalPositionCache[this.Label]) {
                return NodeView.GlobalPositionCache[this.Label].X;
            }
			if (this.Parent == null) {
				return this.RelativeX;
			}
			return this.Parent.GetGX() + this.RelativeX;
		}

        // Global Y: Scale-independent and transform-independent Y distance from top of the top goal.
        // Return always 0 if this is top goal.
        GetGY(): number {
            if (NodeView.GlobalPositionCache != null && NodeView.GlobalPositionCache[this.Label]) {
                return NodeView.GlobalPositionCache[this.Label].Y;
            }
			if (this.Parent == null) {
				return this.RelativeY;
			}
			return this.Parent.GetGY() + this.RelativeY;
        }

        // Global center X/Y: Node center position
        GetCenterGX(): number {
            return this.GetGX() + this.Shape.GetNodeWidth() * 0.5;
        }

        GetCenterGY(): number {
            return this.GetGY() + this.Shape.GetNodeHeight() * 0.5;
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

        SaveFoldedFlag(OldViewMap: { [index: string]: NodeView }): void {
            if (OldViewMap[this.Model.GetLabel()]) {
                this.IsFolded = OldViewMap[this.Model.GetLabel()].IsFolded;
            }

            for (var i = 0; this.Children && i < this.Children.length; i++) {
                this.Children[i].SaveFoldedFlag(OldViewMap);
            }
		}

		private GetConnectorPosition(Dir: Direction, GlobalPosition: Point): Point {
			var P = this.Shape.GetConnectorPosition(Dir);
            P.X += GlobalPosition.X;
            P.Y += GlobalPosition.Y;
			return P;
		}

		private SetArrowPosition(P1: Point, P2: Point, Dir: Direction, Duration?: number) {
            this.Shape.SetArrowPosition(P1, P2, Dir, Duration);
		}

        UpdateDocumentPosition(Duration?: number, CSSAnimationBuffer?: string[]): void {
            if (!this.IsVisible) {
                return
            }
            AssureNoteApp.Assert((this.Shape != null));
            var GlobalPosition = this.GetGlobalPosition();
            this.Shape.SetPosition(GlobalPosition.X, GlobalPosition.Y, Duration, CSSAnimationBuffer);
            var P1 = this.GetConnectorPosition(Direction.Bottom, GlobalPosition);
            this.ForEachVisibleChildren((SubNode: NodeView) => {
                var P2 = SubNode.GetConnectorPosition(Direction.Top, SubNode.GetGlobalPosition());
                SubNode.SetArrowPosition(P1, P2, Direction.Bottom, Duration);
                SubNode.UpdateDocumentPosition(Duration, CSSAnimationBuffer);
            });
            P1 = this.GetConnectorPosition(Direction.Right, GlobalPosition);
            this.ForEachVisibleRightNodes((SubNode: NodeView) => {
                var P2 = SubNode.GetConnectorPosition(Direction.Left, SubNode.GetGlobalPosition());
                SubNode.SetArrowPosition(P1, P2, Direction.Left, Duration);
                SubNode.UpdateDocumentPosition(Duration, CSSAnimationBuffer);
            });
            P1 = this.GetConnectorPosition(Direction.Left, GlobalPosition);
            this.ForEachVisibleLeftNodes((SubNode: NodeView) => {
                var P2 = SubNode.GetConnectorPosition(Direction.Right, SubNode.GetGlobalPosition());
                SubNode.SetArrowPosition(P1, P2, Direction.Right, Duration);
                SubNode.UpdateDocumentPosition(Duration, CSSAnimationBuffer);
            });
        }

        private ForEachVisibleSubNode(SubNodes: NodeView[], Action: (NodeView) => any): boolean {
            if (SubNodes != null && !this.IsFolded) {
                for (var i = 0; i < SubNodes.length; i++) {
                    if (SubNodes[i].IsVisible) {
                        if (Action(SubNodes[i]) === false) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }

        ForEachVisibleChildren(Action: (SubNode: NodeView) => any): void {
            this.ForEachVisibleSubNode(this.Children, Action);
        }

        ForEachVisibleRightNodes(Action: (SubNode: NodeView) => any): void {
            this.ForEachVisibleSubNode(this.Right, Action);
        }

        ForEachVisibleLeftNodes(Action: (SubNode: NodeView) => any): void {
            this.ForEachVisibleSubNode(this.Left, Action);
        }

        ForEachVisibleAllSubNodes(Action: (SubNode: NodeView) => any): boolean {
            if (this.ForEachVisibleSubNode(this.Left, Action) &&
                this.ForEachVisibleSubNode(this.Right, Action) &&
                this.ForEachVisibleSubNode(this.Children, Action)) return true;
            return false;
        }

        TraverseVisibleNode(Action: (SubNode: NodeView) => any): void {
            Action(this);
            this.ForEachVisibleAllSubNodes((SubNode: NodeView) => { SubNode.TraverseVisibleNode(Action); });
        }

        private ForEachSubNode(SubNodes: NodeView[], Action: (NodeView) => any): boolean {
            if (SubNodes != null) {
                for (var i = 0; i < SubNodes.length; i++) {
                    if (!Action(SubNodes[i])) {
                        return false;
                    }
                }
            }
            return true;
        }

        ForEachAllSubNodes(Action: (SubNode: NodeView) => any): boolean {
            if (this.ForEachSubNode(this.Left, Action) &&
                this.ForEachSubNode(this.Right, Action) &&
                this.ForEachSubNode(this.Children, Action)) return true;
            return false;
        }

        TraverseNode(Action: (SubNode: NodeView) => any): boolean {
            if (Action(this) === false) return false;
            if (this.ForEachAllSubNodes((SubNode: NodeView) => { return SubNode.TraverseNode(Action); })) return true;
            return false;
        }

        ClearAnimationCache(Force?: boolean): void {
            if (Force || !this.IsVisible) {
                this.GetShape().ClearAnimationCache();
            }
            if (Force || this.IsFolded) {
                this.ForEachAllSubNodes((SubNode: NodeView) => {
                    SubNode.ClearAnimationCache(true);
                });
            }
            else {
                this.ForEachAllSubNodes((SubNode: NodeView) => {
                    SubNode.ClearAnimationCache();
                });
            }
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
        private HeadBoundingBox: Rect; // Head is the node and Left and Right.
        private TreeBoundingBox: Rect; // Tree is Head and Children
        private static ArrowPathMaster: SVGPathElement = null;

		constructor(public NodeView: NodeView) {
			this.Content = null;
			this.NodeWidth = 250;
            this.NodeHeight = 0;
            this.HeadBoundingBox = new Rect(0, 0, 0, 0);
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

        SetHeadSize(Width: number, Height: number): void {
            this.HeadBoundingBox.Width = Width;
            this.HeadBoundingBox.Height = Height;
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

        GetHeadWidth(): number {
            if (this.HeadBoundingBox.Width == 0) {
                this.HeadBoundingBox.Width = 250; //FIXME
            }
            return this.HeadBoundingBox.Width;
        }

        GetHeadHeight(): number {
            if (this.HeadBoundingBox.Height == 0) {
                this.HeadBoundingBox.Height = 100; //FIXME
            }
            return this.HeadBoundingBox.Height;
        }

        GetTreeLeftX(): number {
            return this.TreeBoundingBox.X;
        }

        GetHeadLeftX(): number {
            return this.HeadBoundingBox.X;
        }

        SetTreeUpperLeft(X: number, Y: number): void {
            this.TreeBoundingBox.X = X;
            this.TreeBoundingBox.Y = Y;
        }

        SetHeadUpperLeft(X: number, Y: number): void {
            this.HeadBoundingBox.X = X;
            this.HeadBoundingBox.Y = Y;
        }

		UpdateHtmlClass() {
			this.Content.className = "node";
        }

		private PrerenderHTMLContent(manager: PluginManager): void {
            if (this.Content == null) {
				var div = document.createElement("div");
                this.Content = div;

                div.style.position = "absolute";
				div.id = this.NodeView.Label;

				var h4 = document.createElement("h4");
				h4.textContent = this.NodeView.Label;

                var p = document.createElement("p");
                p.innerHTML = manager.InvokeHTMLRenderPlugin(this.NodeView.NodeDoc.trim(), this.NodeView.Model);
                this.UpdateHtmlClass();
				div.appendChild(h4);
                div.appendChild(p);
			}
        }

        PrerenderContent(manager: PluginManager) {
            this.PrerenderHTMLContent(manager);
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

        private GX = null;
        private GY = null;

        private static CSSAnimationDefinitionCount = 0;
        private static GetCSSAnimationID(): number {
            return GSNShape.CSSAnimationDefinitionCount++;
        }

        private PreviousAnimateElement: SVGElement = null;
        private PreviousArrowAnimateElement: SVGElement = null;

        private RemoveAnimateElement(Animate: SVGElement) {
            if (Animate) {
                var Parent = Animate.parentNode;
                if (Parent) {
                    Parent.removeChild(Animate);
                }
            }
        }

        SetPosition(x: number, y: number, Duration?: number, CSSAnimationBuffer?: string[]): void {
			if (this.NodeView.IsVisible) {
                var div = this.Content;
				if (div != null) {
					div.style.left = x + "px";
                    div.style.top = y + "px";
                    if (Duration > 0) {
                        var AnimationName: string = "GSNNodeCSSAnim" + GSNShape.GetCSSAnimationID();
                        if (this.PreviousAnimateElement) {
                            this.RemoveAnimateElement(this.PreviousAnimateElement);
                            this.PreviousAnimateElement = null
                        }
                        var AnimationStyleString = AnimationName + " " + Duration / 1000 + "s ease-out";
                        this.Content.style["animation"] = AnimationStyleString;
                        this.Content.style["MozAnimation"] = AnimationStyleString;
                        this.Content.style["webkitAnimation"] = AnimationStyleString;
                        this.Content.style["msAnimation"] = AnimationStyleString;
                        var AnimateElement: any;
                        if (this.GX == null || this.GY == null) {
                            CSSAnimationBuffer.push(AssureNoteUtils.CreateCSSFadeinAnimationDefinition("-webkit-", AnimationName));
                            CSSAnimationBuffer.push(AssureNoteUtils.CreateCSSFadeinAnimationDefinition("-moz-", AnimationName));
                            CSSAnimationBuffer.push(AssureNoteUtils.CreateCSSFadeinAnimationDefinition("-ms-", AnimationName));
                            CSSAnimationBuffer.push(AssureNoteUtils.CreateCSSFadeinAnimationDefinition("", AnimationName));
                            AnimateElement = AssureNoteUtils.CreateSVGFadeinAnimateElement(Duration);
                        } else {
                            CSSAnimationBuffer.push(AssureNoteUtils.CreateCSSMoveAnimationDefinition("-webkit-", AnimationName, this.GX, this.GY));
                            CSSAnimationBuffer.push(AssureNoteUtils.CreateCSSMoveAnimationDefinition("-moz-", AnimationName, this.GX, this.GY));
                            CSSAnimationBuffer.push(AssureNoteUtils.CreateCSSMoveAnimationDefinition("-ms-", AnimationName, this.GX, this.GY));
                            CSSAnimationBuffer.push(AssureNoteUtils.CreateCSSMoveAnimationDefinition("", AnimationName, this.GX, this.GY));
                            AnimateElement = AssureNoteUtils.CreateSVGMoveAnimateElement(Duration, this.GX - x, this.GY - y);
                        }
                        this.ShapeGroup.appendChild(AnimateElement);
                        AnimateElement.beginElement();
                        this.PreviousAnimateElement = AnimateElement;
                    }
                }
                var mat = this.ShapeGroup.transform.baseVal.getItem(0).matrix;
			    mat.e = x;
			    mat.f = y;
            }
            this.GX = x;
            this.GY = y;
        }

        ClearAnimationCache(): void {
            this.GX = null;
            this.GY = null;
            if (this.Content) {
                this.Content.style.removeProperty("animation");
                this.Content.style.removeProperty("MozAnimation");
                this.Content.style.removeProperty("webkitAnimation");
                this.Content.style.removeProperty("msAnimation");
            }
            if (this.PreviousAnimateElement) {
                this.RemoveAnimateElement(this.PreviousAnimateElement);
                this.PreviousAnimateElement = null
            }
            if (this.PreviousArrowAnimateElement) {
                this.RemoveAnimateElement(this.PreviousArrowAnimateElement);
                this.PreviousArrowAnimateElement = null
            }
        }

		PrerenderSVGContent(): void {
            this.ShapeGroup = AssureNoteUtils.CreateSVGElement("g");
			this.ShapeGroup.setAttribute("transform", "translate(0,0)");
            this.ArrowPath = GSNShape.CreateArrowPath();
        }

        private OldArrowPath: string;

        SetArrowPosition(P1: Point, P2: Point, Dir: Direction, Duration?: number) {
			var start = <SVGPathSegMovetoAbs>this.ArrowPath.pathSegList.getItem(0);
            var curve = <SVGPathSegCurvetoCubicAbs>this.ArrowPath.pathSegList.getItem(1);
			start.x = P1.X;
			start.y = P1.Y;
			curve.x = P2.X;
			curve.y = P2.Y;
            if (Dir == Direction.Bottom || Dir == Direction.Top) {
                var DiffX = Math.abs(P1.X - P2.X);
                curve.x1 = (9 * P1.X + P2.X) / 10;
                curve.y1 = P2.Y;
                curve.x2 = (9 * P2.X + P1.X) / 10;
                curve.y2 = P1.Y;
                if (DiffX > 300) {
                    curve.x1 = P1.X - 10 * (P1.X - P2.X < 0 ? -1 : 1);
                    curve.x2 = P2.X + 10 * (P1.X - P2.X < 0 ? -1 : 1);
                }
                if (DiffX < 50) {
                    curve.y1 = curve.y2 = (P1.Y + P2.Y) * 0.5;
                }
			} else {
				curve.x1 = (P1.X + P2.X) / 2;
				curve.y1 = (9 * P1.Y + P2.Y) / 10;
				curve.x2 = (P1.X + P2.X) / 2;
				curve.y2 = (9 * P2.Y + P1.Y) / 10;
            }
            if (Duration > 0) {
                
                var NewPath = this.ArrowPath.getAttribute("d");
                if (this.PreviousArrowAnimateElement) {
                    this.RemoveAnimateElement(this.PreviousArrowAnimateElement);
                    this.PreviousArrowAnimateElement = null
                }
                if (this.GX == null || this.GY == null) {
                    var AnimateElement: any = AssureNoteUtils.CreateSVGFadeinAnimateElement(Duration);
                } else {
                    var AnimateElement: any = AssureNoteUtils.CreateSVGArrowAnimateElement(Duration, this.OldArrowPath, NewPath);
                }

                this.ArrowPath.appendChild(AnimateElement);
                AnimateElement.beginElement();
                this.PreviousArrowAnimateElement = AnimateElement;
                this.OldArrowPath = NewPath;
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
		ModuleRect: SVGRectElement;
		UndevelopedSymbol: SVGPolygonElement;

		PrerenderSVGContent(): void {
			super.PrerenderSVGContent();
			this.BodyRect = AssureNoteUtils.CreateSVGElement("rect");
			this.BodyRect.setAttribute("class", this.ColorClassName);
			this.ShapeGroup.appendChild(this.BodyRect);
			if (this.NodeView.IsFolded) {
				this.ModuleRect = AssureNoteUtils.CreateSVGElement("rect");
				this.ModuleRect.setAttribute("class", this.ColorClassName);
				this.ModuleRect.setAttribute("width", "80px");
				this.ModuleRect.setAttribute("height", "13px");
				this.ModuleRect.setAttribute("y", "-13px");
				this.ShapeGroup.appendChild(this.ModuleRect);
			}
			if (this.NodeView.Children == null && !this.NodeView.IsFolded) {
				this.UndevelopedSymbol = AssureNoteUtils.CreateSVGElement("polygon");
				this.UndevelopedSymbol.setAttribute("points", "0 -20 -20 0 0 20 20 0");
				this.UndevelopedSymbol.setAttribute("class", this.ColorClassName);
				this.ShapeGroup.appendChild(this.UndevelopedSymbol);
			}
		}

        FitSizeToContent(): void {
			this.BodyRect.setAttribute("width", this.GetNodeWidth().toString());
			this.BodyRect.setAttribute("height", this.GetNodeHeight().toString());
			if (this.NodeView.Children == null && !this.NodeView.IsFolded) {
				var x = (this.GetNodeWidth() / 2).toString();
				var y = (this.GetNodeHeight() + 20).toString();
				this.UndevelopedSymbol.setAttribute("transform", "translate(" + x + "," + y +")");
				this.UndevelopedSymbol.setAttribute("y", y+"px");
			}
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
			this.BodyPolygon.setAttribute("class", this.ColorClassName);
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
		BodyEllipse: SVGEllipseElement;

		PrerenderSVGContent(): void {
			super.PrerenderSVGContent();
			this.BodyEllipse = AssureNoteUtils.CreateSVGElement("ellipse");
			this.BodyEllipse.setAttribute("class", this.ColorClassName);
			this.ShapeGroup.appendChild(this.BodyEllipse);
        }

        GetNodeHeight(): number {
            if (this["NodeHeight"] == 0) {
                this["NodeHeight"] = Math.max(this.Content.clientHeight, this.GetNodeWidth());
            }
            return this["NodeHeight"];
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

var Debug = <any>{};

$(() => {
	var AssureNoteApp = new AssureNote.AssureNoteApp();
	Debug.AssureNote = AssureNoteApp;

	//var Menu: AssureNote.SideMenuContent[] = [];
	//Menu.push(new AssureNote.SideMenuContent("#", "Download", "download-wgsn", "glyphicon-floppy-disk", (ev: Event) => {
	//	var Writer = new StringWriter();
	//	AssureNoteApp.MasterRecord.FormatRecord(Writer);
	//	AssureNote.AssureNoteUtils.SaveAs(Writer.toString(), AssureNoteApp.WGSNName);
	//}));
	//
	//Menu.push(new AssureNote.SideMenuContent("#", "New Case", "new-wgsn", "glyphicon-plus", (ev: Event) => {
	//	var Name = prompt("Enter the file name");
	//	AssureNoteApp.LoadNewWGSN(Name, "* G1");
	//}));

	//AssureNote.SideMenu.Create(Menu);

    var FoldPlugin = new AssureNote.FoldingViewSwitchPlugin(AssureNoteApp);
    AssureNoteApp.PluginManager.SetPlugin("fold", FoldPlugin);
    var MessageChatPlugin = new AssureNote.MessageChatPlugin(AssureNoteApp);
    AssureNoteApp.PluginManager.SetPlugin("message", MessageChatPlugin);
    var ConnectserverPlugin = new AssureNote.ConnectServerPlugin(AssureNoteApp);
    AssureNoteApp.PluginManager.SetPlugin("connect", ConnectserverPlugin);
    var VariableInterpolationPlugin = new AssureNote.VariableInterpolationPlugin(AssureNoteApp);
    AssureNoteApp.PluginManager.SetPlugin("variableinterpolation", VariableInterpolationPlugin);
});
