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
var Debug = {};

$(function () {
    var AssureNoteApp = new AssureNote.AssureNoteApp();
    Debug.AssureNote = AssureNoteApp;

    var FoldPlugin = new AssureNote.FoldingViewSwitchPlugin(AssureNoteApp);
    AssureNoteApp.PluginManager.SetPlugin("fold", FoldPlugin);
    var MessageChatPlugin = new AssureNote.MessageChatPlugin(AssureNoteApp);
    AssureNoteApp.PluginManager.SetPlugin("message", MessageChatPlugin);
    var ConnectserverPlugin = new AssureNote.ConnectServerPlugin(AssureNoteApp);
    AssureNoteApp.PluginManager.SetPlugin("connect", ConnectserverPlugin);
    var VariableInterpolationPlugin = new AssureNote.VariableInterpolationPlugin(AssureNoteApp);
    AssureNoteApp.PluginManager.SetPlugin("variableinterpolation", VariableInterpolationPlugin);

    AssureNoteApp.LoadNewWGSN("hello.wgsn", $("#default-case").text());
});
//# sourceMappingURL=index.js.map
