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
///<reference path="./MenuBar.ts" />
///<reference path='../d.ts/jquery.d.ts'/>
var AssureNote;
(function (AssureNote) {
    var Plugin = (function () {
        function Plugin() {
            this.HasMenuBarButton = false;
            this.HasEditor = false;
            this.HasDoubleClicked = false;
        }
        Plugin.prototype.ExecCommand = function (AssureNote, Args) {
        };

        Plugin.prototype.Display = function (PluginPanel, GSNDoc, Label) {
        };

        Plugin.prototype.ExecDoubleClicked = function (NodeView) {
        };

        Plugin.prototype.CreateMenuBarButton = function (NodeView) {
            return null;
        };

        Plugin.prototype.EditorEnableCallback = function () {
            return null;
        };

        Plugin.prototype.EditorDisableCallback = function () {
            return null;
        };

        Plugin.prototype.RenderHTML = function (NodeDoc, Model) {
            /* Do nothing */
            return NodeDoc;
        };

        Plugin.prototype.RenderSVG = function (ShapeGroup, NodeView) {
            /* Do nothing */
        };
        return Plugin;
    })();
    AssureNote.Plugin = Plugin;

    //export class SamplePlugin extends Plugin {
    //	constructor() {
    //		super();
    //		this.HasMenuBarButton = true;
    //	}
    //	CreateMenuBarButton(): MenuBarButton {
    //		return new MenuBarButton("sample-id", "images/copy.png", "sample", (event: Event, TargetView: NodeView) => {
    //			alert(TargetView.Label);
    //		});
    //	}
    //}
    var PluginManager = (function () {
        function PluginManager(AssureNoteApp) {
            this.AssureNoteApp = AssureNoteApp;
            this.PluginMap = {};
        }
        PluginManager.prototype.SetPlugin = function (Name, Plugin) {
            if (!this.PluginMap[Name]) {
                this.PluginMap[Name] = Plugin;
            } else {
                this.AssureNoteApp.DebugP("Plugin " + name + " already defined.");
            }
        };

        PluginManager.prototype.GetPanelPlugin = function (Name, Label) {
            //TODO change plugin by Label
            return this.PluginMap[Name];
        };

        PluginManager.prototype.GetCommandPlugin = function (Name) {
            return this.PluginMap[Name];
        };

        PluginManager.prototype.GetMenuBarButtons = function (TargetView) {
            var _this = this;
            var ret = [];
            $.each(this.PluginMap, function (key, value) {
                if (value.HasMenuBarButton) {
                    _this.AssureNoteApp.DebugP("Menu: key=" + key);
                    var Button = value.CreateMenuBarButton(TargetView);
                    if (Button != null) {
                        ret.push(Button);
                    }
                }
            });
            return ret;
        };

        PluginManager.prototype.GetDoubleClicked = function () {
            var ret = null;

            //FIXME Editing mode
            $.each(this.PluginMap, function (key, value) {
                if (value.HasDoubleClicked) {
                    ret = value;
                    return false;
                }
            });
            return ret;
        };

        PluginManager.prototype.InvokeHTMLRenderPlugin = function (NodeDoc, Model) {
            $.each(this.PluginMap, function (key, value) {
                NodeDoc = value.RenderHTML(NodeDoc, Model);
            });
            return NodeDoc;
        };

        PluginManager.prototype.InvokeSVGRenderPlugin = function (ShapeGroup, NodeView) {
            $.each(this.PluginMap, function (key, value) {
                value.RenderSVG(ShapeGroup, NodeView);
            });
        };
        return PluginManager;
    })();
    AssureNote.PluginManager = PluginManager;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Plugin.js.map
