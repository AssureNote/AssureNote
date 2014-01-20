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
var AssureNote;
(function (AssureNote) {
    var ScrollManager = (function () {
        function ScrollManager(Viewport) {
            this.Viewport = Viewport;
            this.CurrentX = 0;
            this.CurrentY = 0;
            this.Dx = 0;
            this.Dy = 0;
            this.MainPointerID = null;
            this.Pointers = [];
            this.timer = 0;
            this.ANIMATE_THRESHOLD = 5;
            this.SPEED_MAX = 100;
        }
        ScrollManager.prototype.StartDrag = function (InitialX, InitialY) {
            this.CurrentX = InitialX;
            this.CurrentY = InitialY;
            try  {
                if (this.OnStartDrag) {
                    this.OnStartDrag(this.Viewport);
                }
            } catch (e) {
            }
        };

        ScrollManager.prototype.UpdateDrag = function (CurrentX, CurrentY) {
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
        };

        ScrollManager.prototype.GetMainPointer = function () {
            for (var i = 0; i < this.Pointers.length; ++i) {
                if (this.Pointers[i].identifier === this.MainPointerID) {
                    return this.Pointers[i];
                }
            }
            ;
            return null;
        };

        ScrollManager.prototype.IsDragging = function () {
            return this.MainPointerID != null;
        };

        ScrollManager.prototype.StopAnimation = function () {
            clearInterval(this.timer);
            this.Dx = 0;
            this.Dy = 0;
        };

        ScrollManager.prototype.EndDrag = function () {
            this.MainPointerID = null;
            this.Viewport.SetEventMapLayerPosition(false);
            try  {
                if (this.OnEndDrag) {
                    this.OnEndDrag(this.Viewport);
                }
            } catch (e) {
            }
        };

        ScrollManager.prototype.OnPointerEvent = function (e, Screen) {
            var _this = this;
            this.Pointers = e.getPointerList();
            var IsTherePointer = this.Pointers.length > 0;
            var HasDragJustStarted = IsTherePointer && !this.IsDragging();
            var HasDragJustEnded = !IsTherePointer && this.IsDragging();

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
                    this.timer = setInterval(function () {
                        if (Math.abs(_this.Dx) < _this.ANIMATE_THRESHOLD && Math.abs(_this.Dy) < _this.ANIMATE_THRESHOLD) {
                            _this.StopAnimation();
                        }
                        _this.CurrentX += _this.Dx;
                        _this.CurrentY += _this.Dy;
                        _this.Dx *= 0.95;
                        _this.Dy *= 0.95;
                        Screen.AddOffset(_this.Dx, _this.Dy);
                    }, 16);
                }
                this.EndDrag();
            }
        };

        ScrollManager.prototype.OnDoubleTap = function (e, Screen) {
            var width = Screen.ContentLayer.clientWidth;
            var height = Screen.ContentLayer.clientHeight;
            var pointer = this.Pointers[0];
        };

        ScrollManager.prototype.OnMouseWheel = function (e, Screen) {
            Screen.SetCameraScale(Screen.GetCameraScale() * (1 + e.deltaY * 0.02));
        };
        return ScrollManager;
    })();
    AssureNote.ScrollManager = ScrollManager;

    var ViewportManager = (function () {
        function ViewportManager(SVGLayer, EventMapLayer, ContentLayer, ControlLayer) {
            var _this = this;
            this.SVGLayer = SVGLayer;
            this.EventMapLayer = EventMapLayer;
            this.ContentLayer = ContentLayer;
            this.ControlLayer = ControlLayer;
            this.ScrollManager = new ScrollManager(this);
            this.CameraGX = 0;
            this.CameraGY = 0;
            this.Scale = 1.0;
            this.PageWidth = window.innerWidth;
            this.PageHeight = window.innerHeight;
            this.AnimationFrameTimerHandle = 0;
            this.IsEventMapUpper = false;
            window.addEventListener("resize", function (e) {
                _this.UpdatePageRect();
            });
            this.UpdatePageRect();
            this.SetCameraPageCenter(this.GetPageCenterX(), this.GetPageCenterY());
            this.SetTransformOriginToElement(this.ContentLayer, "left top");
            this.SetTransformOriginToElement(this.ControlLayer, "left top");
            this.UpdateAttr();
            var OnPointer = function (e) {
                _this.ScrollManager.OnPointerEvent(e, _this);
            };
            this.EventMapLayer.addEventListener("pointerdown", OnPointer, false);
            this.EventMapLayer.addEventListener("pointermove", OnPointer, false);
            this.EventMapLayer.addEventListener("pointerup", OnPointer, false);

            //this.EventMapLayer.addEventListener("gesturedoubletap", (e: PointerEvent) => { this.ScrollManager.OnDoubleTap(e, this); }, false);
            //BackGroundLayer.addEventListener("gesturescale", OnPointer, false);
            $(this.EventMapLayer.parentElement).on('mousewheel', function (e) {
                _this.ScrollManager.OnMouseWheel(e, _this);
            });
        }
        ViewportManager.prototype.SetTransformOriginToElement = function (Element, Value) {
            Element.style["transformOrigin"] = Value;
            Element.style["MozTransformOrigin"] = Value;
            Element.style["msTransformOrigin"] = Value;
            Element.style["webkitTransformOrigin"] = Value;
        };

        ViewportManager.prototype.SetTransformToElement = function (Element, Value) {
            Element.style["transform"] = Value;
            Element.style["MozTransform"] = Value;
            Element.style["msTransform"] = Value;
            Element.style["webkitTransform"] = Value;
        };

        ViewportManager.prototype.GetCameraScale = function () {
            return this.Scale;
        };

        ViewportManager.LimitScale = function (Scale) {
            return Math.max(0.02, Math.min(20.0, Scale));
        };

        ViewportManager.prototype.SetCameraScale = function (Scale) {
            this.Scale = ViewportManager.LimitScale(Scale);
            this.UpdateAttr();
        };

        ViewportManager.prototype.GetOffsetPageX = function () {
            return this.CameraCenterPageX - this.CameraGX * this.Scale;
        };

        ViewportManager.prototype.GetOffsetPageY = function () {
            return this.CameraCenterPageY - this.CameraGY * this.Scale;
        };

        ViewportManager.prototype.SetOffset = function (PageX, PageY) {
            this.CameraGX = (this.CameraCenterPageX - PageX) / this.Scale;
            this.CameraGY = (this.CameraCenterPageY - PageY) / this.Scale;
            this.UpdateAttr();
        };

        ViewportManager.prototype.AddOffset = function (PageX, PageY) {
            this.CameraGX -= PageX / this.Scale;
            this.CameraGY -= PageY / this.Scale;
            this.UpdateAttr();
        };

        ViewportManager.prototype.GetCameraGX = function () {
            return this.CameraGX;
        };

        ViewportManager.prototype.GetCameraGY = function () {
            return this.CameraGY;
        };

        ViewportManager.prototype.SetCameraPosition = function (GX, GY) {
            this.SetOffset(this.CameraCenterPageX - GX * this.Scale, this.CameraCenterPageY - GY * this.Scale);
        };

        ViewportManager.prototype.SetCamera = function (GX, GY, Scale) {
            this.Scale = Scale;
            this.SetOffset(this.CameraCenterPageX - GX * this.Scale, this.CameraCenterPageY - GY * this.Scale);
        };

        ViewportManager.prototype.MoveCamera = function (GX, GY, Scale) {
            this.Scale += Scale;
            this.CameraGX += GX;
            this.CameraGY += GY;
            this.UpdateAttr();
        };

        ViewportManager.prototype.GetCameraPageCenterX = function () {
            return this.CameraCenterPageX;
        };

        ViewportManager.prototype.GetCameraPageCenterY = function () {
            return this.CameraCenterPageY;
        };

        ViewportManager.prototype.SetCameraPageCenter = function (PageX, PageY) {
            this.CameraCenterPageX = PageX;
            this.CameraCenterPageY = PageY;
        };

        ViewportManager.prototype.PageXFromGX = function (GX) {
            return this.CameraCenterPageX + (GX - this.CameraGX) * this.Scale;
        };

        ViewportManager.prototype.PageYFromGY = function (GY) {
            return this.CameraCenterPageY + (GY - this.CameraGY) * this.Scale;
        };

        ViewportManager.prototype.GXFromPageX = function (PageX) {
            return (PageX - this.CameraCenterPageX) / this.Scale + this.CameraGX;
        };

        ViewportManager.prototype.GYFromPageY = function (PageY) {
            return (PageY - this.CameraCenterPageY) / this.Scale + this.CameraGY;
        };

        ViewportManager.prototype.ConvertRectGlobalXYFromPageXY = function (PageRect) {
            var x1 = this.GXFromPageX(PageRect.X);
            var y1 = this.GYFromPageY(PageRect.Y);
            var x2 = this.GXFromPageX(PageRect.X + PageRect.Width);
            var y2 = this.GYFromPageY(PageRect.Y + PageRect.Height);
            return new AssureNote.Rect(x1, y1, x2 - x1, y2 - y1);
        };

        ViewportManager.prototype.GetPageWidth = function () {
            return this.PageWidth;
        };

        ViewportManager.prototype.GetPageHeight = function () {
            return this.PageHeight;
        };

        ViewportManager.prototype.GetPageCenterX = function () {
            return this.GetPageWidth() * 0.5;
        };

        ViewportManager.prototype.GetPageCenterY = function () {
            return this.GetPageHeight() * 0.5;
        };

        ViewportManager.prototype.Move = function (GX, GY, Scale, Duration) {
            this.MoveTo(this.GetCameraGX() + GX, this.GetCameraGY() + GY, Scale, Duration);
        };

        ViewportManager.prototype.MoveTo = function (GX, GY, Scale, Duration) {
            var _this = this;
            Scale = ViewportManager.LimitScale(Scale);
            if (Duration <= 0) {
                this.SetCamera(GX, GY, Scale);
                return;
            }

            var VX = (GX - this.GetCameraGX()) / Duration;
            var VY = (GY - this.GetCameraGY()) / Duration;

            var S0 = this.GetCameraScale();
            var ScaleRate = Scale / S0;
            var DInv = 1 / Duration;
            var ScaleFunction = function (t) {
                return S0 * Math.pow(ScaleRate, t * DInv);
            };

            if (VY == 0 && VX == 0 && (Scale == S0)) {
                return;
            }

            if (this.AnimationFrameTimerHandle) {
                cancelAnimationFrame(this.AnimationFrameTimerHandle);
                this.AnimationFrameTimerHandle = 0;
            }

            var lastTime = performance.now();
            var startTime = lastTime;

            var update = function () {
                var currentTime = performance.now();
                var deltaT = currentTime - lastTime;
                if (currentTime - startTime < Duration) {
                    _this.AnimationFrameTimerHandle = requestAnimationFrame(update);
                } else {
                    deltaT = Duration - (lastTime - startTime);
                }
                var DeltaS = ScaleFunction(currentTime - startTime) - ScaleFunction(lastTime - startTime);
                _this.MoveCamera(VX * deltaT, VY * deltaT, DeltaS);
                lastTime = currentTime;
            };
            update();
        };

        ViewportManager.prototype.UpdatePageRect = function () {
            var CameraCenterXRate = this.CameraCenterPageX / this.PageWidth;
            var CameraCenterYRate = this.CameraCenterPageY / this.PageHeight;
            this.PageWidth = window.innerWidth;
            this.PageHeight = window.innerHeight;
            this.SetCameraPageCenter(this.PageWidth * CameraCenterXRate, this.PageHeight * CameraCenterYRate);
        };

        ViewportManager.prototype.SetEventMapLayerPosition = function (IsUpper) {
            if (IsUpper && !this.IsEventMapUpper) {
                $(this.ControlLayer).after(this.EventMapLayer);
            } else if (!IsUpper && this.IsEventMapUpper) {
                $(this.ContentLayer).before(this.EventMapLayer);
            }
            this.IsEventMapUpper = IsUpper;
        };

        ViewportManager.translateA = function (x, y) {
            return "translate(" + x + " " + y + ") ";
        };

        ViewportManager.scaleA = function (scale) {
            return "scale(" + scale + ") ";
        };

        ViewportManager.translateS = function (x, y) {
            return "translate(" + x + "px, " + y + "px) ";
        };

        ViewportManager.scaleS = function (scale) {
            return "scale(" + scale + ") ";
        };

        ViewportManager.prototype.UpdateAttr = function () {
            var OffsetPageX = this.GetOffsetPageX();
            var OffsetPageY = this.GetOffsetPageY();
            var attr = ViewportManager.translateA(OffsetPageX, OffsetPageY) + ViewportManager.scaleA(this.Scale);
            var style = ViewportManager.translateS(OffsetPageX, OffsetPageY) + ViewportManager.scaleS(this.Scale);
            this.SVGLayer.setAttribute("transform", attr);
            this.SetTransformToElement(this.ContentLayer, style);
            this.SetTransformToElement(this.ControlLayer, style);
        };
        return ViewportManager;
    })();
    AssureNote.ViewportManager = ViewportManager;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Viewport.js.map
