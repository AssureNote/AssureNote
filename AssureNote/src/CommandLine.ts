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

		constructor() {
		}

		Parse(line: string): void {
			var s = line.split(" ");
            if (s.length > 0) {
                if (s[0][0] == null) {
                    this.Method = "";
                    return;
                }
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

	export class CommandLine {
		Element: JQuery;
		IsVisible: boolean;
		IsEnable: boolean;
		constructor() {
			this.Element = $("#command-line");
			this.IsEnable = true;
			this.IsVisible = false;
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
			this.IsVisible = true;
		}

		Hide(): void {
			this.Element.css("display","none");
			this.IsVisible = false;
		}

		GetValue(): string {
			return this.Element.val();
		}
	}

}
