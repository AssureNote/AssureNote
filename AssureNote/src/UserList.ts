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

module AssureNote {
    export class UserList extends Panel {
        UserName: string;
        UserList: string[]; /* The list of other users */
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
            $('.user-name').text(this.App.GetUserName());
            var List = []; // TODO: Apply Template. For example [{UserName: 'A', Color: 'Red'}]
            (<any>$('#user-list-tmpl')).tmpl(List).appendTo('#user-list');
        }
    }
}