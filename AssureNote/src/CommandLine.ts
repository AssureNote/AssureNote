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

///<reference path='../d.ts/jquery.d.ts'/>

module AssureNote {

    export class CommandParser {
        private Method: string;
        private Args: string[];
        private RawString: string;

        constructor() {
        }

        Parse(line: string): void {
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
        }

        GetRawString(): string {
            return this.RawString;
        }

        GetMethod(): string {
            AssureNoteApp.Assert(this.Method != null);
            return this.Method;
        }

        GetArgs(): string[]{
            if (this.Args == null) {
                this.Args = [];
            }
            return this.Args;
        }

        GetArg(n: number): string {
            return this.Args[n];
        }

    }

    export class CommandLine extends Panel {
        Element: JQuery;
        IsVisible: boolean;
        IsEnable: boolean;
        private HistoryList: string[];
        private HistoryIndex: number;
        //TODO search libreadline API
        constructor(public App: AssureNoteApp) {
            super(App);
            this.Element = $("#command-line");
            this.IsEnable = true;
            this.IsVisible = false;
            this.HistoryList = [];
            this.HistoryIndex = 0;
        }

        Enable(): void {
            this.IsEnable = true;
        }

        Disable(): void {
            this.IsEnable = false;
            this.Hide();
        }

        Clear(): void {
            this.Element.val("");
        }

        Show(): void {
            this.Element.css("display", "block");
            this.Element.focus();
            this.HistoryIndex = 0;
            this.IsVisible = true;
        }

        Hide(): void {
            this.Element.css("display","none");
            this.IsVisible = false;
        }

        GetValue(): string {
            return this.Element.val();
        }

        AddHistory(line: string): void {
            this.HistoryList.splice(0,0, line);
        }

        SaveHistory(): void {
            localStorage.setItem("commandline:history", JSON.stringify(this.HistoryList));
        }

        LoadHistory(): void {
            var list = localStorage.getItem("commandline:history");
            if(list != null) {
                this.HistoryList = JSON.parse(list);
            }
        }

        OnActivate(): void {
            this.Show();
        }

        OnDeactivate(): void {
            this.Hide();
            this.Clear();
        }

        //TODO recognize : or / or @
        ShowNextHistory(): void {
            if(this.HistoryIndex > 0) {
                this.HistoryIndex -= 1;
                this.Element.val(this.HistoryList[this.HistoryIndex]);
            } else if(this.HistoryIndex == 0) {
                this.Element.val(":");
            }
        }

        ShowPrevHistory(): void {
            if(this.HistoryIndex < this.HistoryList.length) {
                this.Element.val(this.HistoryList[this.HistoryIndex]);
                this.HistoryIndex += 1;
            }
        }

        IsEmpty(): boolean {
            return this.Element.val() == "";
        }

        OnKeyDown(Event: KeyboardEvent): void {
            var handled = true;
            switch (Event.keyCode) {
                case 27: /*Esc*/
                    this.App.PictgramPanel.Activate();
                    Event.preventDefault();
                    break;
                case 38: /*up*/
                    this.ShowPrevHistory();
                    break;
                case 40: /*down*/
                    this.ShowNextHistory();
                    break;
                case 8: /*BackSpace*/
                    if (this.IsEmpty()) {
                        this.App.PictgramPanel.Activate();
                        Event.preventDefault();
                        break;
                    }
                    break;
                case 13: /*Enter*/
                    Event.preventDefault();
                    var ParsedCommand = new CommandParser();
                    ParsedCommand.Parse(this.GetValue());
                    if (ParsedCommand.GetMethod() == "search") {
                        this.App.PictgramPanel.Search.Search(this.App.PictgramPanel.MasterView, ParsedCommand.GetArgs()[0]);
                    }
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
        }
    }

}
