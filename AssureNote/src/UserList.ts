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

///<reference path="./AssureNote.ts" />
///<reference path="../d.ts/jquery_plugins.d.ts" />

module AssureNote {
    export class UserItem {
        constructor(public UserName: string, public Color: string, public IsEditMode: boolean, public SID: string) {
        }
    }

    export class UserList extends Panel {
        UserName: string;
        UserList: UserItem[]; /* The list of other users */
        constructor(public App: AssureNoteApp) {
            super(App);
            this.UserName = 'Guest';
            this.UserList = [];
            $('.change-user').on('click', (e: JQueryEventObject) => {
                var Name = prompt('Enter the new user name', '');
                if (Name == '') Name = 'Guest';
                this.App.SetUserName(Name);
                this.Show();
            });
        }

        Show() {
            var found: boolean = false;
            for (var i in this.UserList) {
                if (this.UserList[i].IsEditMode) {
                    found = true;
                }
            }
            this.App.ModeManager.ReadOnly(found);
            $('.user-name').text(this.App.GetUserName());
            $('#user-list-tmpl').tmpl(this.UserList).appendTo($('#user-list').empty());
        }

        AddUser(Info: { User: string; Mode: number; SID: string }) {
            var Color: string = this.GetRandomColor();
            var IsEditMode: boolean = (Info.Mode == AssureNoteMode.Edit) ? true : false;
            this.UserList.push(new UserItem(Info.User, Color, IsEditMode, Info.SID));
            this.Show();
            var StyleName: string = "highlight-" + Info.SID;
            var ColorInfo: any = {stroke:Color};
            AssureNoteUtils.DefineColorStyle(StyleName, ColorInfo);
        }

        UpdateEditMode(Info: { User: string; Mode: number; SID: string }) {
            for (var i in this.UserList) {
                if (this.UserList[i].SID == Info.SID) {
                    var UserItem: UserItem = this.UserList[i];
                    UserItem.IsEditMode = (Info.Mode == AssureNoteMode.Edit);
                }
            }
            this.Show();
        }

        RemoveUser(SID: string) {
            for (var i: number = 0; i < this.UserList.length; i++) {
                if (this.UserList[i].SID == SID) {
                    this.UserList.splice(i, 1);//Index of UserInfo and UserList is same since push data in the same time
                    break;
                }
            }
            this.Show();
        }

        GetRandomColor() : string {
            var color :string;
            do {
                color = Math.floor(Math.random() * 0xFFFFFF).toString(16);
                for (var i: number = color.length; i < 6; i++){
                    color = "0" + color;
                }
            } while (color == "000000" || color == "FFFFFF");
            return "#" + color;
        }

        AddFocusedUserColor(SID:string, View: NodeView) {
            var StyleName: string = "highlight-" + SID;
            View.Shape.AddColorStyle(StyleName);
        }

        RemoveFocusedUserColor(SID: string, View: NodeView) {
            var StyleName: string = "highlight-" + SID;
            View.Shape.RemoveColorStyle(StyleName);
        }
    }
}
