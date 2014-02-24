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
///<reference path='../d.ts/jquery.d.ts'/>
var AssureNote;
(function (AssureNote) {
    var CommandParser = (function () {
        function CommandParser(line) {
            if (line) {
                this.Parse(line);
            }
        }
        CommandParser.prototype.Parse = function (line) {
            var s = line.split(/\s+/);
            if (s.length > 0) {
                if (s[0][0] == null) {
                    this.Method = "";
                    return;
                }
                this.RawString = line;
                if (s[0][0].match(/\//) != null) {
                    this.Method = "search";
                    this.Args = [];
                    this.Args.push(line.slice(1));
                    return;
                } else if (s[0][0].match(/:/) != null) {
                    this.Method = s[0].slice(1);
                    if (s.length > 1) {
                        this.Args = s.slice(1);
                    }
                } else if (s[0][0].match(/@/) != null) {
                    this.Method = "message";
                    this.Args = [];
                    this.Args.push(line.slice(1));
                }
            }
        };

        CommandParser.prototype.GetRawString = function () {
            return this.RawString;
        };

        CommandParser.prototype.GetMethod = function () {
            AssureNote.AssureNoteApp.Assert(this.Method != null);
            return this.Method;
        };

        CommandParser.prototype.GetArgs = function () {
            if (this.Args == null) {
                this.Args = [];
            }
            return this.Args;
        };

        CommandParser.prototype.GetArg = function (n) {
            return this.Args[n];
        };
        return CommandParser;
    })();
    AssureNote.CommandParser = CommandParser;

    var CommandLine = (function (_super) {
        __extends(CommandLine, _super);
        //TODO search libreadline API
        function CommandLine(App) {
            _super.call(this, App);
            this.App = App;
            this.Element = $("#command-line");
            this.IsEnable = true;
            this.IsVisible = false;
            this.HistoryList = [];
            this.HistoryIndex = 0;
        }
        CommandLine.prototype.Enable = function () {
            this.IsEnable = true;
        };

        CommandLine.prototype.Disable = function () {
            this.IsEnable = false;
            this.Hide();
        };

        CommandLine.prototype.Clear = function () {
            this.Element.val("");
        };

        CommandLine.prototype.Show = function () {
            this.Element.css("display", "block");
            this.Element.focus();
            this.HistoryIndex = 0;
            this.IsVisible = true;
        };

        CommandLine.prototype.Hide = function () {
            this.Element.css("display", "none");
            this.IsVisible = false;
        };

        CommandLine.prototype.GetValue = function () {
            return this.Element.val();
        };

        CommandLine.prototype.AddHistory = function (line) {
            this.HistoryList.splice(0, 0, line);
        };

        CommandLine.prototype.SaveHistory = function () {
            localStorage.setItem("commandline:history", JSON.stringify(this.HistoryList));
        };

        CommandLine.prototype.LoadHistory = function () {
            var list = localStorage.getItem("commandline:history");
            if (list != null) {
                this.HistoryList = JSON.parse(list);
            }
        };

        CommandLine.prototype.OnActivate = function () {
            this.Show();
        };

        CommandLine.prototype.OnDeactivate = function () {
            this.Hide();
            this.Clear();
        };

        //TODO recognize : or / or @
        CommandLine.prototype.ShowNextHistory = function () {
            if (this.HistoryIndex > 0) {
                this.HistoryIndex -= 1;
                this.Element.val(this.HistoryList[this.HistoryIndex]);
            } else if (this.HistoryIndex == 0) {
                this.Element.val(":");
            }
        };

        CommandLine.prototype.ShowPrevHistory = function () {
            if (this.HistoryIndex < this.HistoryList.length) {
                this.Element.val(this.HistoryList[this.HistoryIndex]);
                this.HistoryIndex += 1;
            }
        };

        CommandLine.prototype.IsEmpty = function () {
            return this.Element.val() == "";
        };

        CommandLine.prototype.OnKeyDown = function (Event) {
            var handled = true;
            switch (Event.keyCode) {
                case 27:
                    this.App.PictgramPanel.Activate();
                    Event.preventDefault();
                    break;
                case 38:
                    this.ShowPrevHistory();
                    break;
                case 40:
                    this.ShowNextHistory();
                    break;
                case 8:
                    if (this.IsEmpty()) {
                        this.App.PictgramPanel.Activate();
                        Event.preventDefault();
                        break;
                    }
                    break;
                case 13:
                    Event.preventDefault();
                    var ParsedCommand = new CommandParser(this.GetValue());
                    console.log(ParsedCommand.GetMethod());
                    this.App.ExecCommand(ParsedCommand);
                    this.AddHistory(ParsedCommand.GetRawString());
                    if (this.IsActive()) {
                        this.App.PictgramPanel.Activate();
                    }
                    break;
                default:
                    handled = false;
                    break;
            }
            if (handled) {
                Event.stopPropagation();
            }
        };
        return CommandLine;
    })(AssureNote.Panel);
    AssureNote.CommandLine = CommandLine;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=CommandLine.js.map
