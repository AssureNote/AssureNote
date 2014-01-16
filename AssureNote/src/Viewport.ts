// ***************************************************************************
// Copyright (c) 2014, AssureNote project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// *  Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
// *  Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
// TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
// PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// **************************************************************************

///<reference path="../d.ts/jquery.d.ts" />
///<reference path="../d.ts/pointer.d.ts" />

/* VIEW (MVC) */
module AssureNote {

	export class ScrollManager {
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

		private StartDrag(InitialX: number, InitialY: number) {
			this.CurrentX = InitialX;
            this.CurrentY = InitialY;
            try {
                if (this.OnStartDrag) {
                    this.OnStartDrag(this.Viewport);
                }
            } catch (e) {
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
            try {
                if (this.OnEndDrag) {
                    this.OnEndDrag(this.Viewport);
                }
            } catch (e) {
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
                    this.Viewport.SetEventMapLayerPosition(true);
                    this.StartDrag(mainPointer.pageX, mainPointer.pageY);
				} else {
                    var mainPointer = this.GetMainPointer();
                    if (mainPointer) {
                        this.UpdateDrag(mainPointer.pageX, mainPointer.pageY);
                        Screen.AddOffset(this.Dx, this.Dy);
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
                        Screen.AddOffset(this.Dx, this.Dy);
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
            Screen.SetCameraScale(Screen.GetCameraScale() * (1 + e.deltaY * 0.02));
        }
	}

	export class ViewportManager {
		//windowX, windowY
		ScrollManager: ScrollManager = new ScrollManager(this);
		private OffsetPageX: number = 0;
		private OffsetPageY: number = 0;
        private Scale: number = 1.0;
        private PageWidth: number = window.innerWidth;
        private PageHeight: number = window.innerHeight;
        private CameraCenterPageX: number;
        private CameraCenterPageY: number;

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
            window.addEventListener("resize", (e) => { this.UpdatePageRect(); });
            this.UpdatePageRect();
            this.SetCameraPageCenter(this.GetPageCenterX(), this.GetPageCenterY());
            this.SetTransformOriginToElement(this.ContentLayer, "left top");
            this.SetTransformOriginToElement(this.ControlLayer, "left top");
			this.UpdateAttr();
			var OnPointer = (e: PointerEvent) => { this.ScrollManager.OnPointerEvent(e, this); };
			this.EventMapLayer.addEventListener("pointerdown", OnPointer, false);
			this.EventMapLayer.addEventListener("pointermove", OnPointer, false);
			this.EventMapLayer.addEventListener("pointerup", OnPointer, false);
			//this.EventMapLayer.addEventListener("gesturedoubletap", (e: PointerEvent) => { this.ScrollManager.OnDoubleTap(e, this); }, false);
            //BackGroundLayer.addEventListener("gesturescale", OnPointer, false);
            $(this.EventMapLayer.parentElement).on('mousewheel', (e: any) => { this.ScrollManager.OnMouseWheel(e, this); });
        }

        GetCameraScale(): number {
            return this.Scale;
        }

        SetCameraScale(scale: number): void {
            scale = Math.max(0.02, Math.min(20.0, scale));
            var scaleChange = scale / this.Scale;
            var cx = this.CameraCenterPageX;
            var cy = this.CameraCenterPageY;
            this.OffsetPageX = scaleChange * (this.OffsetPageX - cx) + cx;
            this.OffsetPageY = scaleChange * (this.OffsetPageY - cy) + cy;
            this.Scale = scale;
			this.UpdateAttr();
		}

		private SetOffset(PageX: number, PageY: number): void {
			this.OffsetPageX = PageX;
			this.OffsetPageY = PageY;
			this.UpdateAttr();
        }

        AddOffset(PageX: number, PageY: number): void {
            this.OffsetPageX += PageX;
            this.OffsetPageY += PageY;
            this.UpdateAttr();
        }

        GetCameraGX(): number {
            return (this.CameraCenterPageX - this.OffsetPageX) / this.Scale;
        }

        GetCameraGY(): number {
            return (this.CameraCenterPageY - this.OffsetPageY) / this.Scale;
        }

        SetCameraPosition(GX: number, GY: number): void {
            this.SetOffset(this.CameraCenterPageX - GX * this.Scale, this.CameraCenterPageY - GY * this.Scale);
        }

        SetCamera(GX: number, GY: number, Scale: number): void {
            this.Scale = Scale;
            this.SetOffset(this.CameraCenterPageX - GX * this.Scale, this.CameraCenterPageY - GY * this.Scale);
        }

        private MoveCamera(GX: number, GY: number, Scale: number): void {
            this.Scale += Scale;
            this.OffsetPageX -= GX * this.Scale;
            this.OffsetPageY -= GY * this.Scale;
            this.UpdateAttr();
        }

        GetCameraPageCenterX(): number {
            return this.CameraCenterPageX;
        }

        GetCameraPageCenterY(): number {
            return this.CameraCenterPageY;
        }

        SetCameraPageCenter(PageX: number, PageY: number): void {
            this.CameraCenterPageX = PageX;
            this.CameraCenterPageY = PageY;
        }

        PageXFromGX(GX: number): number {
            return this.OffsetPageX + this.Scale * GX;
        }

        PageYFromGY(GY: number): number {
            return this.OffsetPageY + this.Scale * GY;
        }

        GXFromPageX(PageX: number): number {
            return (PageX - this.OffsetPageX) / this.Scale;
		}

		GYFromPageY(PageY: number): number {
            return (PageY - this.OffsetPageY) / this.Scale;
        }

        ConvertRectGlobalXYFromPageXY(PageRect: Rect): Rect {
            var x1 = this.GXFromPageX(PageRect.X);
            var y1 = this.GYFromPageY(PageRect.Y);
            var x2 = this.GXFromPageX(PageRect.X + PageRect.Width);
            var y2 = this.GYFromPageY(PageRect.Y + PageRect.Height);
            return new Rect(x1, y1, x2 - x1, y2 - y1); 
        }

		GetPageWidth(): number {
            return this.PageWidth;
		}

		GetPageHeight(): number {
            return this.PageHeight;
        }

		GetPageCenterX(): number {
			return this.GetPageWidth() * 0.5;
		}

		GetPageCenterY(): number {
            return this.GetPageHeight() * 0.5;
		}

        private AnimationFrameTimerHandle: number = 0;

        Move(GX: number, GY: number, scale: number, duration: number): void {
            this.MoveTo(this.GetCameraGX() + GX, this.GetCameraGY() + GY, scale, duration);
        }

        MoveTo(GX: number, GY: number, scale: number, duration: number): void {
            if (duration <= 0) {
                this.SetCamera(GX, GY, scale);
                return;
            }

            var VX = (GX - this.GetCameraGX()) / duration;
            var VY = (GY - this.GetCameraGY()) / duration;
            var VS = (scale - this.GetCameraScale()) / duration;

            if (VY == 0 && VX == 0 && VS == 0) {
                return;
            }

            if (this.AnimationFrameTimerHandle) {
                cancelAnimationFrame(this.AnimationFrameTimerHandle);
                this.AnimationFrameTimerHandle = 0;
            }

            var lastTime: number = performance.now();
            var startTime = lastTime; 

            var update: any = () => {
                var currentTime: number = performance.now();
                var deltaT = currentTime - lastTime;
                if (currentTime - startTime < duration) {
                    this.AnimationFrameTimerHandle = requestAnimationFrame(update);
                } else {
                    deltaT = duration - (lastTime - startTime);
                }
                this.MoveCamera(VX * deltaT, VY * deltaT, VS * deltaT);
                lastTime = currentTime;
            }
            update();
        }

        private UpdatePageRect(): void {
            var CameraCenterXRate = this.CameraCenterPageX / this.PageWidth;
            var CameraCenterYRate = this.CameraCenterPageY / this.PageHeight;
            this.PageWidth = window.innerWidth;
            this.PageHeight = window.innerHeight;
            this.SetCameraPageCenter(this.PageWidth * CameraCenterXRate, this.PageHeight * CameraCenterYRate);
        }

        private IsEventMapUpper: boolean = false;
        public SetEventMapLayerPosition(IsUpper: boolean) {
            if (IsUpper && !this.IsEventMapUpper) {
                $(this.ControlLayer).after(this.EventMapLayer);
            } else if (!IsUpper && this.IsEventMapUpper) {
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
            var attr: string = ViewportManager.translateA(this.OffsetPageX, this.OffsetPageY) + ViewportManager.scaleA(this.Scale);
            var style: string = ViewportManager.translateS(this.OffsetPageX, this.OffsetPageY) + ViewportManager.scaleS(this.Scale);
            this.SVGLayer.setAttribute("transform", attr);
            this.SetTransformToElement(this.ContentLayer, style);
            this.SetTransformToElement(this.ControlLayer, style);
        }
	}
}
