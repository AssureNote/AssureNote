/// <reference path="CaseModel.ts" />
/// <reference path="CaseViewer.ts" />
/// <reference path="Api.ts" />
/// <reference path="SideMenuModel.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AssureNote;
(function (AssureNote) {
    var Plugin = (function () {
        function Plugin() {
        }
        Plugin.prototype.ExecCommand = function (AssureNote, Args) {
        };

        Plugin.prototype.Display = function (PluginPanel, GSNDoc, Label) {
        };
        return Plugin;
    })();
    AssureNote.Plugin = Plugin;

    var PluginManager = (function () {
        function PluginManager(AssureNoteApp) {
            this.AssureNoteApp = AssureNoteApp;
            //Editor, etc.
        }
        PluginManager.prototype.GetPanelPlugin = function (Name, Label) {
            return null;
        };

        PluginManager.prototype.GetCommandPlugin = function (CommandLine) {
            return null;
        };
        return PluginManager;
    })();
    AssureNote.PluginManager = PluginManager;

    //---------Deprecated-----------------
    var PlugInSet = (function () {
        function PlugInSet(plugInManager) {
            this.plugInManager = plugInManager;
            //this.ActionPlugIn = null;
            //this.CheckerPlugIn = null;
            this.HTMLRenderPlugIn = null;
            this.SVGRenderPlugIn = null;
            this.LayoutEnginePlugIn = null;

            this.PatternPlugIn = null;

            this.MenuBarContentsPlugIn = null;
            this.ShortcutKeyPlugIn = null;
            this.SideMenuPlugIn = null;

            this.PlugInEnv = null;
        }
        return PlugInSet;
    })();
    AssureNote.PlugInSet = PlugInSet;

    var AbstractPlugIn = (function () {
        function AbstractPlugIn(plugInManager) {
            this.plugInManager = plugInManager;
        }
        AbstractPlugIn.prototype.DeleteFromDOM = function () {
        };

        AbstractPlugIn.prototype.DisableEvent = function (caseViewer, case0, serverApi) {
        };
        return AbstractPlugIn;
    })();
    AssureNote.AbstractPlugIn = AbstractPlugIn;

    var ActionPlugIn = (function (_super) {
        __extends(ActionPlugIn, _super);
        function ActionPlugIn(plugInManager) {
            _super.call(this, plugInManager);
            this.plugInManager = plugInManager;
        }
        ActionPlugIn.prototype.IsEnabled = function (caseViewer, case0) {
            return true;
        };

        ActionPlugIn.prototype.Delegate = function (caseViewer, case0, serverApi) {
            return true;
        };
        return ActionPlugIn;
    })(AbstractPlugIn);
    AssureNote.ActionPlugIn = ActionPlugIn;

    var CheckerPlugIn = (function (_super) {
        __extends(CheckerPlugIn, _super);
        function CheckerPlugIn(plugInManager) {
            _super.call(this, plugInManager);
            this.plugInManager = plugInManager;
        }
        CheckerPlugIn.prototype.IsEnabled = function (caseModel, EventType) {
            return true;
        };

        CheckerPlugIn.prototype.Delegate = function (caseModel, y, z) {
            return true;
        };
        return CheckerPlugIn;
    })(AbstractPlugIn);
    AssureNote.CheckerPlugIn = CheckerPlugIn;

    var HTMLRenderPlugIn = (function (_super) {
        __extends(HTMLRenderPlugIn, _super);
        function HTMLRenderPlugIn(plugInManager) {
            _super.call(this, plugInManager);
            this.plugInManager = plugInManager;
        }
        HTMLRenderPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
            return true;
        };

        HTMLRenderPlugIn.prototype.Delegate = function (caseViewer, caseModel, element) {
            return true;
        };
        return HTMLRenderPlugIn;
    })(AbstractPlugIn);
    AssureNote.HTMLRenderPlugIn = HTMLRenderPlugIn;

    var MenuBarContentsPlugIn = (function (_super) {
        __extends(MenuBarContentsPlugIn, _super);
        function MenuBarContentsPlugIn(plugInManager) {
            _super.call(this, plugInManager);
            this.plugInManager = plugInManager;
        }
        MenuBarContentsPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
            return true;
        };

        MenuBarContentsPlugIn.prototype.Delegate = function (caseViewer, caseModel, element, serverApi) {
            return true;
        };
        return MenuBarContentsPlugIn;
    })(AbstractPlugIn);
    AssureNote.MenuBarContentsPlugIn = MenuBarContentsPlugIn;

    var SVGRenderPlugIn = (function (_super) {
        __extends(SVGRenderPlugIn, _super);
        function SVGRenderPlugIn(plugInManager) {
            _super.call(this, plugInManager);
            this.plugInManager = plugInManager;
        }
        SVGRenderPlugIn.prototype.IsEnabled = function (caseViewer, elementShape/* add args as necessary */ ) {
            return true;
        };

        SVGRenderPlugIn.prototype.Delegate = function (caseViewer, elementShape/* add args as necessary */ ) {
            return true;
        };
        return SVGRenderPlugIn;
    })(AbstractPlugIn);
    AssureNote.SVGRenderPlugIn = SVGRenderPlugIn;

    var LayoutEnginePlugIn = (function (_super) {
        __extends(LayoutEnginePlugIn, _super);
        function LayoutEnginePlugIn(plugInManager) {
            _super.call(this, plugInManager);
            this.plugInManager = plugInManager;
        }
        LayoutEnginePlugIn.prototype.Init = function (ViewMap, Element, x, y, ElementWidth) {
        };

        LayoutEnginePlugIn.prototype.LayoutAllView = function (ElementTop, x, y) {
        };

        LayoutEnginePlugIn.prototype.GetContextIndex = function (Node) {
            for (var i = 0; i < Node.Children.length; i++) {
                if (Node.Children[i].Type == AssureNote.NodeType.Context) {
                    return i;
                }
            }
            return -1;
        };
        return LayoutEnginePlugIn;
    })(AbstractPlugIn);
    AssureNote.LayoutEnginePlugIn = LayoutEnginePlugIn;

    var PatternPlugIn = (function (_super) {
        __extends(PatternPlugIn, _super);
        function PatternPlugIn(plugInManager) {
            _super.call(this, plugInManager);
            this.plugInManager = plugInManager;
        }
        PatternPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
            return true;
        };

        PatternPlugIn.prototype.Delegate = function (caseModel) {
            return true;
        };
        return PatternPlugIn;
    })(AbstractPlugIn);
    AssureNote.PatternPlugIn = PatternPlugIn;

    var ShortcutKeyPlugIn = (function (_super) {
        __extends(ShortcutKeyPlugIn, _super);
        function ShortcutKeyPlugIn(plugInManager) {
            _super.call(this, plugInManager);
            this.plugInManager = plugInManager;
        }
        ShortcutKeyPlugIn.prototype.IsEnabled = function (Case0, serverApi) {
            return true;
        };

        ShortcutKeyPlugIn.prototype.RegisterKeyEvents = function (caseViewer, Case0, serverApi) {
            return true;
        };
        return ShortcutKeyPlugIn;
    })(AbstractPlugIn);
    AssureNote.ShortcutKeyPlugIn = ShortcutKeyPlugIn;

    var SideMenuPlugIn = (function (_super) {
        __extends(SideMenuPlugIn, _super);
        function SideMenuPlugIn(plugInManager) {
            _super.call(this, plugInManager);
            this.plugInManager = plugInManager;
        }
        SideMenuPlugIn.prototype.IsEnabled = function (caseViewer, Case0, serverApi) {
            return true;
        };

        SideMenuPlugIn.prototype.AddMenu = function (caseViewer, Case0, serverApi) {
            return null;
        };
        SideMenuPlugIn.prototype.AddMenus = function (caseViewer, Case0, serverApi) {
            return null;
        };
        return SideMenuPlugIn;
    })(AbstractPlugIn);
    AssureNote.SideMenuPlugIn = SideMenuPlugIn;

    var OldPlugInManager = (function () {
        function OldPlugInManager(basepath) {
            this.basepath = basepath;
            //this.ActionPlugInMap = {};
            //this.CheckerPlugInMap = {};
            this.HTMLRenderPlugInMap = {};
            this.SVGRenderPlugInMap = {};
            this.LayoutEnginePlugInMap = {};

            this.PatternPlugInMap = {};

            this.MenuBarContentsPlugInMap = {};
            this.ShortcutKeyPlugInMap = {};
            this.SideMenuPlugInMap = {};

            this.PlugInEnvMap = {};

            this.UILayer = [];
        }
        //ExecCommand(cmdline: string): void {
        //	//built-in command
        //	//G,E,S,C, ... Jump to node
        //}
        //DrawNode(label: string, wx?: number, wy?: number): void {
        //	//FIXME tetsurom
        //	Node = GetNode(label);
        //	if (!ViewPort.IsVisible(Node, wx, wy)) {
        //		LayoutManager.Do(ViwePort, Node, this, wx, wy);
        //	}
        //	ViewPort.MoveTo(Node, wx, wy);
        //}
        OldPlugInManager.prototype.Redraw = function () {
        };

        OldPlugInManager.prototype.GetNodePosition = function (label) {
            return null;
        };

        //Deprecated
        OldPlugInManager.prototype.SetPlugIn = function (key, plugIn) {
            if (plugIn.HTMLRenderPlugIn) {
                this.SetHTMLRenderPlugIn(key, plugIn.HTMLRenderPlugIn);
            }
            if (plugIn.SVGRenderPlugIn) {
                this.SetSVGRenderPlugIn(key, plugIn.SVGRenderPlugIn);
            }
            if (plugIn.MenuBarContentsPlugIn) {
                this.SetMenuBarContentsPlugIn(key, plugIn.MenuBarContentsPlugIn);
            }
            if (plugIn.LayoutEnginePlugIn) {
                this.SetLayoutEnginePlugIn(key, plugIn.LayoutEnginePlugIn);
            }
            if (plugIn.PatternPlugIn) {
                this.SetPatternPlugIn(key, plugIn.PatternPlugIn);
            }
            if (plugIn.ShortcutKeyPlugIn) {
                this.SetShortcutKeyPlugIn(key, plugIn.ShortcutKeyPlugIn);
            }
            if (plugIn.SideMenuPlugIn) {
                this.SetSideMenuPlugIn(key, plugIn.SideMenuPlugIn);
            }
            if (plugIn.PlugInEnv) {
                this.SetPlugInEnv(key, plugIn.PlugInEnv);
            }
        };

        //private SetActionPlugIn(key: string, actionPlugIn: ActionPlugIn) {
        //	this.ActionPlugInMap[key] = actionPlugIn;
        //}
        //RegisterActionEventListeners(CaseViewer: CaseViewer, case0: Case, serverApi: ServerAPI): void {
        //	for(var key in this.ActionPlugInMap) {
        //		if(this.ActionPlugInMap[key].IsEnabled(CaseViewer, case0)) {
        //			this.ActionPlugInMap[key].Delegate(CaseViewer, case0, serverApi);
        //		}else {
        //			this.ActionPlugInMap[key].DisableEvent(CaseViewer, case0, serverApi);
        //		}
        //	}
        //}
        OldPlugInManager.prototype.SetHTMLRenderPlugIn = function (key, HTMLRenderPlugIn) {
            this.HTMLRenderPlugInMap[key] = HTMLRenderPlugIn;
        };

        OldPlugInManager.prototype.SetSVGRenderPlugIn = function (key, SVGRenderPlugIn) {
            this.SVGRenderPlugInMap[key] = SVGRenderPlugIn;
        };

        OldPlugInManager.prototype.SetMenuBarContentsPlugIn = function (key, MenuBarContentsPlugIn) {
            this.MenuBarContentsPlugInMap[key] = MenuBarContentsPlugIn;
        };

        OldPlugInManager.prototype.SetUseLayoutEngine = function (key) {
            this.UsingLayoutEngine = key;
        };

        OldPlugInManager.prototype.SetLayoutEnginePlugIn = function (key, LayoutEnginePlugIn) {
            this.LayoutEnginePlugInMap[key] = LayoutEnginePlugIn;
        };

        OldPlugInManager.prototype.GetLayoutEngine = function () {
            return this.LayoutEnginePlugInMap[this.UsingLayoutEngine];
        };

        OldPlugInManager.prototype.SetPatternPlugIn = function (key, PatternPlugIn) {
            this.PatternPlugInMap[key] = PatternPlugIn;
        };

        OldPlugInManager.prototype.SetShortcutKeyPlugIn = function (key, ShortcutKeyPlugIn) {
            this.ShortcutKeyPlugInMap[key] = ShortcutKeyPlugIn;
        };

        OldPlugInManager.prototype.SetSideMenuPlugIn = function (key, SideMenuPlugIn) {
            this.SideMenuPlugInMap[key] = SideMenuPlugIn;
        };

        OldPlugInManager.prototype.SetPlugInEnv = function (key, PlugInEnv) {
            this.PlugInEnvMap[key] = PlugInEnv;
        };

        OldPlugInManager.prototype.GetPlugInEnv = function (key) {
            return this.PlugInEnvMap[key];
        };

        OldPlugInManager.prototype.UseUILayer = function (plugin) {
            var beforePlugin = this.UILayer.pop();
            if (beforePlugin != plugin && beforePlugin) {
                beforePlugin.DeleteFromDOM();
            }
            this.UILayer.push(plugin);
        };

        OldPlugInManager.prototype.UnuseUILayer = function (plugin) {
            var beforePlugin = this.UILayer.pop();
            if (beforePlugin) {
                beforePlugin.DeleteFromDOM();
            }
        };

        OldPlugInManager.prototype.InvokePlugInMenuBarContents = function (caseViewer, caseModel, DocBase, serverApi) {
            for (var key in this.MenuBarContentsPlugInMap) {
                var contents = this.MenuBarContentsPlugInMap[key];
                if (contents.IsEnabled(caseViewer, caseModel)) {
                    contents.Delegate(caseViewer, caseModel, DocBase, serverApi);
                }
            }
        };

        OldPlugInManager.prototype.RegisterKeyEvents = function (caseViewer, Case0, serverApi) {
            for (var key in this.ShortcutKeyPlugInMap) {
                var plugin = this.ShortcutKeyPlugInMap[key];
                if (plugin.IsEnabled(Case0, serverApi)) {
                    plugin.RegisterKeyEvents(caseViewer, Case0, serverApi);
                }
            }
        };

        OldPlugInManager.prototype.CreateSideMenu = function (caseViewer, Case0, serverApi) {
            var SideMenuContents = [];
            for (var key in this.SideMenuPlugInMap) {
                var plugin = this.SideMenuPlugInMap[key];
                if (plugin.IsEnabled(caseViewer, Case0, serverApi)) {
                    var content = plugin.AddMenu(caseViewer, Case0, serverApi);
                    if (content != null)
                        SideMenuContents.push(content);
                    var contents = plugin.AddMenus(caseViewer, Case0, serverApi);
                    if (contents != null)
                        SideMenuContents.push.apply(SideMenuContents, contents);
                }
            }
            AssureNote.SideMenu.Create(SideMenuContents);
        };
        return OldPlugInManager;
    })();
    AssureNote.OldPlugInManager = OldPlugInManager;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=PluginManager.js.map
