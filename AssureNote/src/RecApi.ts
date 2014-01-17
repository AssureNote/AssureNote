///<reference path='../d.ts/jquery.d.ts'/>

module AssureNote {

	function RemoteProcedureCall(Uri: string, Method: string, Params: any, ErrorCallback: (Request, Status, Error) => void): any {
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
			success: function(Response) {
				ReturnValue = Response;
			},
			error: function(Request, Status, Error) {
				alert("ajax error")	;
				if(ErrorCallback != null) {
					ErrorCallback(Request, Status, Error);
				}
			}
		});

		return ReturnValue;
	}

	export class RecApi {

		constructor(public Uri: string) {
		}

		GetLatestData(Location: string, Type: string, ErrorCallback: (Request, Status, Error) => void): any {
			var Params = {
				location: Location,
				type: Type
			};

			var Response = RemoteProcedureCall(this.Uri, "getLatestData", Params, ErrorCallback);

			if(Response == null) {
				return null;   // ajax error
			}

			if('result' in Response) {
				return Response.result;
			}
			else {
				console.log(Response.error)   // for debug
				return null;
			}
		}
	}

}
