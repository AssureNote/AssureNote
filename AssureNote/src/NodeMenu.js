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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="./AssureNote.ts" />
var AssureNote;
(function (AssureNote) {
    var NodeMenuItem = (function () {
        function NodeMenuItem(ElementId, ImagePath, Title, EventHandler) {
            this.ElementId = ElementId;
            this.ImagePath = ImagePath;
            this.Title = Title;
            this.EventHandler = EventHandler;
        }
        NodeMenuItem.prototype.EnableEventHandler = function (MenuBar) {
            var _this = this;
            MenuBar.Menu.append('<a href="#" ><img id="' + this.ElementId + '" src="' + Config.BASEPATH + this.ImagePath + '" title="' + this.Title + '" alt="' + this.Title + '" /></a>');
            $("#" + this.ElementId).click(function (event) {
                _this.EventHandler(event, MenuBar.CurrentView);
                MenuBar.Remove();
            });
        };
        return NodeMenuItem;
    })();
    AssureNote.NodeMenuItem = NodeMenuItem;

    var NodeMenu = (function (_super) {
        __extends(NodeMenu, _super);
        function NodeMenu(AssureNoteApp) {
            _super.call(this, AssureNoteApp);
            this.AssureNoteApp = AssureNoteApp;
            this.IsEnable = false;
        }
        NodeMenu.prototype.CreateButtons = function (Contents) {
            for (var i = 0; i < Contents.length; i++) {
                var Button = Contents[i];
                Button.EnableEventHandler(this);
            }
        };

        NodeMenu.prototype.Create = function (CurrentView, ControlLayer, Contents) {
            var _this = this;
            this.IsEnable = true;
            this.CurrentView = CurrentView;
            $('#menu').remove();
            this.Menu = $('<div id="menu" style="display: none;"></div>');
            this.Menu.appendTo(ControlLayer);
            this.CreateButtons(Contents);

            var refresh = function () {
                AssureNote.AssureNoteApp.Assert(_this.CurrentView != null);
                var Node = _this.CurrentView;
                var Top = Node.GetGY() + Node.Shape.GetNodeHeight() + 5;
                var Left = Node.GetGX() + (Node.Shape.GetNodeWidth() - _this.Menu.width()) / 2;
                _this.Menu.css({ position: 'absolute', top: Top, left: Left, display: 'block', opacity: 0 });
            };

            this.Menu.jqDock({
                align: 'bottom',
                idle: 1500,
                size: 45,
                distance: 60,
                labels: 'tc',
                duration: 200,
                fadeIn: 200,
                source: function () {
                    return this.src.replace(/(jpg|gif)$/, 'png');
                },
                onReady: refresh
            });
        };

        NodeMenu.prototype.Remove = function () {
            this.Menu.remove();
            this.Menu = null;
            this.CurrentView = null;
            this.IsEnable = false;
        };
        return NodeMenu;
    })(AssureNote.Panel);
    AssureNote.NodeMenu = NodeMenu;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=NodeMenu.js.map
