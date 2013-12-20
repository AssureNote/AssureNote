/// <reference path="../d.ts/jquery.d.ts" />
/// <reference path="../d.ts/pointer.d.ts" />

interface JQuery {
	svg(loadUrl: string): JQuery;
	svg(x: Function): JQuery;
}

interface Document {
	createSVGElement: (name: string) => Element;
}

document.createSVGElement = function (name: string): Element {
	return document.createElementNS('http://www.w3.org/2000/svg', name);
}


/* VIEW (MVC) */
module AssureNote {

	export class ScrollManager {
        private InitialOffsetX: number = 0;
        private InitialOffsetY: number = 0;
        private InitialX: number = 0;
        private InitialY: number = 0;
        private CurrentX: number = 0;
        private CurrentY: number = 0;
        private Dx: number = 0;
        private Dy: number = 0;
        private MainPointerID: number = null;
		private Pointers: Pointer[] = [];

		private timer: number = 0;
		private ANIMATE_THRESHOLD: number = 5;
        private SPEED_MAX: number = 100;


        constructor(private Viewport: ViewportManager) {
        }

		private SetInitialOffset(InitialOffsetX: number, InitialOffsetY: number) {
			this.InitialOffsetX = InitialOffsetX;
			this.InitialOffsetY = InitialOffsetY;
		}

		private StartDrag(InitialX: number, InitialY: number) {
			this.InitialX = InitialX;
			this.InitialY = InitialY;
			this.CurrentX = InitialX;
            this.CurrentY = InitialY;
            if (this.OnStartDrag) {
                this.OnStartDrag(this.Viewport);
            }
		}

		private UpdateDrag(CurrentX: number, CurrentY: number) {
			this.Dx = CurrentX - this.CurrentX;
			this.Dy = CurrentY - this.CurrentY;
			var speed = this.Dx * this.Dx + this.Dy + this.Dy;
			if (speed > this.SPEED_MAX * this.SPEED_MAX) {
				this.Dx *= ((this.SPEED_MAX * this.SPEED_MAX) / speed);
				this.Dy *= ((this.SPEED_MAX * this.SPEED_MAX) / speed);
			}

			this.CurrentX = CurrentX;
            this.CurrentY = CurrentY;
            if (this.OnDragged) {
                this.OnDragged(this.Viewport);
            }
		}

		private CalcOffsetX(): number {
			return this.CurrentX - this.InitialX + this.InitialOffsetX;
		}

		private CalcOffsetY(): number {
			return this.CurrentY - this.InitialY + this.InitialOffsetY;
		}

		private GetMainPointer(): Pointer {
			for (var i = 0; i < this.Pointers.length; ++i) {
				if (this.Pointers[i].identifier === this.MainPointerID) {
					return this.Pointers[i]
				}
			};
			return null;
		}

		private IsDragging(): boolean {
			return this.MainPointerID != null;
		}

		private StopAnimation(): void {
			clearInterval(this.timer);
			this.Dx = 0;
			this.Dy = 0;
        }

        private EndDrag() {
            this.MainPointerID = null;
            this.Viewport.SetEventMapLayerPosition(false);
            if (this.OnEndDrag) {
                this.OnEndDrag(this.Viewport);
            }
        }

        OnDragged: (Viewport: ViewportManager) => void;
        OnStartDrag: (Viewport: ViewportManager) => void;
        OnEndDrag: (Viewport: ViewportManager) => void;

		OnPointerEvent(e: PointerEvent, Screen: ViewportManager) {
            this.Pointers = e.getPointerList();
            var IsTherePointer: boolean = this.Pointers.length > 0;
            var HasDragJustStarted: boolean = IsTherePointer && !this.IsDragging();
            var HasDragJustEnded: boolean = !IsTherePointer && this.IsDragging();

            if (IsTherePointer) {
                if (HasDragJustStarted) {
                    this.StopAnimation();
                    this.timer = null;
                    var mainPointer = this.Pointers[0];
                    this.MainPointerID = mainPointer.identifier;
                    this.SetInitialOffset(Screen.GetOffsetX(), Screen.GetOffsetY());
                    this.StartDrag(mainPointer.pageX, mainPointer.pageY);
                    this.Viewport.SetEventMapLayerPosition(true);
				} else {
                    var mainPointer = this.GetMainPointer();
                    if (mainPointer) {
                        this.UpdateDrag(mainPointer.pageX, mainPointer.pageY);
                        Screen.SetOffset(this.CalcOffsetX(), this.CalcOffsetY());
                    } else {
                        this.EndDrag();
                    }
				}
			} else {
                if (HasDragJustEnded) {
					if (this.timer) {
						this.StopAnimation();
						this.timer = null;
					}
					this.timer = setInterval(() => {
						if (Math.abs(this.Dx) < this.ANIMATE_THRESHOLD && Math.abs(this.Dy) < this.ANIMATE_THRESHOLD) {
							this.StopAnimation();
						}
						this.CurrentX += this.Dx;
						this.CurrentY += this.Dy;
						this.Dx *= 0.95;
						this.Dy *= 0.95;
						Screen.SetOffset(this.CalcOffsetX(), this.CalcOffsetY());
					}, 16);
				}
                this.EndDrag();
			}
		}

		OnDoubleTap(e: PointerEvent, Screen: ViewportManager) {
			var width: number = Screen.ContentLayer.clientWidth;
			var height: number = Screen.ContentLayer.clientHeight;
			var pointer = this.Pointers[0];
        }

        OnMouseWheel(e: { deltaX: number; deltaY: number }, Screen: ViewportManager) {
            Screen.SetScale(Screen.GetScale() * (1 + e.deltaY * 0.02));
        }
	}

	export class ViewportManager {
		//windowX, windowY
		ScrollManager: ScrollManager = new ScrollManager(this);
		private OffsetX: number = 0;
		private OffsetY: number = 0;
		private LogicalOffsetX: number = 0;
		private LogicalOffsetY: number = 0;
        private Scale: number = 1.0;
        private HTMLBodyBoundingRect: ClientRect;

        private SetTransformOriginToElement(Element: HTMLElement, Value: string) {
            Element.style["transformOrigin"] = Value;
            Element.style["MozTransformOrigin"] = Value;
            Element.style["msTransformOrigin"] = Value;
            Element.style["webkitTransformOrigin"] = Value;
        }

        private SetTransformToElement(Element: HTMLElement, Value: string) {
            Element.style["transform"] = Value;
            Element.style["MozTransform"] = Value;
            Element.style["msTransform"] = Value;
            Element.style["webkitTransform"] = Value;
        }

		constructor(public SVGLayer: SVGGElement, public EventMapLayer: HTMLDivElement, public ContentLayer: HTMLDivElement, public ControlLayer: HTMLDivElement) {
            this.SetTransformOriginToElement(this.ContentLayer, "left top");
            this.SetTransformOriginToElement(this.ControlLayer, "left top");
			this.UpdateAttr();
			var OnPointer = (e: PointerEvent) => { this.ScrollManager.OnPointerEvent(e, this); };
			this.EventMapLayer.addEventListener("pointerdown", OnPointer, false);
			this.EventMapLayer.addEventListener("pointermove", OnPointer, false);
			this.EventMapLayer.addEventListener("pointerup", OnPointer, false);
			//this.EventMapLayer.addEventListener("gesturedoubletap", (e: PointerEvent) => { this.ScrollManager.OnDoubleTap(e, this); }, false);
            //BackGroundLayer.addEventListener("gesturescale", OnPointer, false);
            $(this.EventMapLayer.parentElement).on('mousewheel', (e) => { this.ScrollManager.OnMouseWheel(e, this); });
            document.body.addEventListener("resize", (e) => { this.HTMLBodyBoundingRect = document.body.getBoundingClientRect(); });
            this.HTMLBodyBoundingRect = document.body.getBoundingClientRect();
        }

        private IsEventMapUpper: boolean = false;
        public SetEventMapLayerPosition(IsUpper: boolean) {
            if (IsUpper && !this.IsEventMapUpper) {
                $(this.ControlLayer).after(this.EventMapLayer);
            } else if(!IsUpper && this.IsEventMapUpper){
                $(this.ContentLayer).before(this.EventMapLayer);
            }
            this.IsEventMapUpper = IsUpper;
        }

		private static translateA(x: number, y: number): string {
			return "translate(" + x + " " + y + ") ";
		}

		private static scaleA(scale: number): string {
			return "scale(" + scale + ") ";
		}

		private static translateS(x: number, y: number): string {
			return "translate(" + x + "px, " + y + "px) ";
		}

		private static scaleS(scale: number): string {
			return "scale(" + scale + ") ";
		}

		private UpdateAttr(): void {
			var attr: string = ViewportManager.translateA(this.OffsetX, this.OffsetY) + ViewportManager.scaleA(this.Scale);
			var style: string = ViewportManager.translateS(this.OffsetX, this.OffsetY) + ViewportManager.scaleS(this.Scale);
			this.SVGLayer.setAttribute("transform", attr);
            this.SetTransformToElement(this.ContentLayer, style);
            this.SetTransformToElement(this.ControlLayer, style);
		}

        SetScale(scale: number): void {
            scale = Math.max(0.2, Math.min(2.0, scale));
			this.Scale = scale;
			var cx = this.GetPageCenterX();
			var cy = this.GetPageCenterY();
			this.OffsetX = (this.LogicalOffsetX - cx) * scale + cx;
			this.OffsetY = (this.LogicalOffsetY - cy) * scale + cy;
			this.UpdateAttr();
		}

		SetOffset(x: number, y: number): void {
			this.OffsetX = x;
			this.OffsetY = y;
			this.LogicalOffsetX = this.CalcLogicalOffsetX(x);
			this.LogicalOffsetY = this.CalcLogicalOffsetY(y);
			this.UpdateAttr();
		}

		SetLogicalOffset(x: number, y: number, scale?: number): void {
			this.LogicalOffsetX = x;
			this.LogicalOffsetY = y;
			this.SetScale(scale || this.Scale);
		}

		GetLogicalOffsetX(): number {
			return this.LogicalOffsetX;
		}

		GetLogicalOffsetY(): number {
			return this.LogicalOffsetY;
		}

		private CalcLogicalOffsetX(OffsetX: number): number {
			var cx = this.GetPageCenterX();
			return (OffsetX - cx) / this.Scale + cx;
		}

		private CalcLogicalOffsetY(OffsetY: number): number {
			var cy = this.GetPageCenterY();
			return (OffsetY - cy) / this.Scale + cy;
        }

        PageXFromGX(GX: number) {
            return (this.GetLogicalOffsetX() - GX) * this.Scale + this.GetPageCenterX();
        }

        PageYFromGY(GY: number) {
            return (this.GetLogicalOffsetY() - GY) * this.Scale + this.GetPageCenterY();
        }

		GXFromPageX(PageX: number): number {
            return (PageX - this.GetPageCenterX()) / this.Scale + this.GetPageCenterX() - this.GetLogicalOffsetX();
		}

		GYFromPageY(PageY: number): number {
            return (PageY - this.GetPageCenterY()) / this.Scale + this.GetPageCenterY() - this.GetLogicalOffsetY();
        }

        ConvertRectGlobalXYFromPageXY(PageRect: Rect): Rect {
            var x1 = this.GXFromPageX(PageRect.X);
            var y1 = this.GYFromPageY(PageRect.Y);
            var x2 = this.GXFromPageX(PageRect.X + PageRect.Width);
            var y2 = this.GYFromPageY(PageRect.Y + PageRect.Height);
            return new Rect(x1, y1, x2 - x1, y2 - y1); 
        }

		GetOffsetX(): number {
			return this.OffsetX;
		}

		GetOffsetY(): number {
			return this.OffsetY;
		}

		GetWidth(): number {
            return this.HTMLBodyBoundingRect.width;
		}

		GetHeight(): number {
            return this.HTMLBodyBoundingRect.height;
        }

        GetPageRect(): Rect {
            return new Rect(0, 0, this.GetWidth(), this.GetHeight());
        }

		GetPageCenterX(): number {
			return this.GetWidth() / 2;
		}

		GetPageCenterY(): number {
			return this.GetHeight() / 2;
		}

		GetScale() {
			return this.Scale;
		}

		SetCaseCenter(X: number, Y: number): void {
            var NewOffsetX = this.OffsetX + (this.GetPageCenterX() - (this.OffsetX + X * this.Scale));
            var NewOffsetY = this.OffsetY + (this.GetPageCenterY() - (this.OffsetY + Y * this.Scale));
			this.SetOffset(NewOffsetX, NewOffsetY);
		}
	}
}
