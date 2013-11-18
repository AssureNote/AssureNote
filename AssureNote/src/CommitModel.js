var AssureNote;
(function (AssureNote) {
    var CommitModel = (function () {
        function CommitModel(CommitId, Message, date, userId, userName, LatestFlag) {
            this.CommitId = CommitId;
            this.Message = Message;
            this.date = date;
            this.userId = userId;
            this.userName = userName;
            this.LatestFlag = LatestFlag;
        }
        //Deprecated
        CommitModel.prototype.toString = function () {
            return "date:" + this.date + "\n commiter:" + this.userName + "\n";
        };
        return CommitModel;
    })();
    AssureNote.CommitModel = CommitModel;

    var CommitCollection = (function () {
        function CommitCollection(CommitModels) {
            if (CommitModels == null) {
                CommitModels = [];
            }
            this.CommitModels = CommitModels;
        }
        CommitCollection.prototype.Append = function (CommitModel) {
            this.CommitModels.push(CommitModel);
        };

        CommitCollection.FromJson = function (json_array) {
            var CommitModels = [];
            for (var i = 0; i < json_array.length; i++) {
                var j = json_array[i];
                CommitModels.push(new CommitModel(j.commitId, j.commitMessage, j.dateTime, j.userId, j.userName, false));
            }
            CommitModels[json_array.length - 1].LatestFlag = true;
            return new CommitCollection(CommitModels);
        };

        CommitCollection.prototype.forEach = function (callback) {
            for (var i = 0; i < this.CommitModels.length; i++) {
                callback(i, this.CommitModels[i]);
            }
        };

        CommitCollection.prototype.Size = function () {
            return this.CommitModels.length;
        };
        return CommitCollection;
    })();
    AssureNote.CommitCollection = CommitCollection;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=CommitModel.js.map
