///<reference path='../d.ts/jquery.d.ts'/>
var AssureNote;
(function (AssureNote) {
    function RemoteProcedureCall(Uri, Method, Params, ErrorCallback) {
        var ReturnValue = null;
        var Command = {
            jsonrpc: "2.0",
            method: Method,
            id: 1,
            params: Params
        };

        $.ajax({
            type: "POST",
            url: Uri,
            async: false,
            data: Command,
            //dataType: "json",   // FIXME
            //contentType: "application/json; charset=utf-8",   // FIXME
            success: function (Response) {
                ReturnValue = Response;
            },
            error: function (Request, Status, Error) {
                alert("ajax error");
                if (ErrorCallback != null) {
                    ErrorCallback(Request, Status, Error);
                }
            }
        });

        return ReturnValue;
    }

    var RecApi = (function () {
        function RecApi(Uri) {
            this.Uri = Uri;
        }
        RecApi.prototype.GetLatestData = function (Location, Type, ErrorCallback) {
            var Params = {
                location: Location,
                type: Type
            };

            var Response = RemoteProcedureCall(this.Uri, "getLatestData", Params, ErrorCallback);

            if (Response == null) {
                return null;
            }

            if ('result' in Response) {
                return Response.result;
            } else {
                console.log(Response.error);
                return null;
            }
        };
        return RecApi;
    })();
    AssureNote.RecApi = RecApi;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=RecApi.js.map
