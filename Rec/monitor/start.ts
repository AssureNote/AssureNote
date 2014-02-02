///<reference path='d.ts/DefinitelyTyped/node/node.d.ts'/>

var $ = require('node-jquery');

function RemoteProcedureCall(URL: string, Method: string, Params: any) {
    var Command = {
        jsonrpc: "2.0",
        method: Method,
        id: 1,
        params: Params
    };
    $.post(URL, Command);
}

function PushRawData(URL: string, Location: string, Type: string, Data: number, AuthId: string, Context: string) {
    var Params = {
        location: Location,
        type: Type,
        data: Data,
        authid: AuthId,
        context: Context
    };
    RemoteProcedureCall(URL, "pushRawData", Params);
}

function Start() {
    var Timer = setInterval(function() {
        var URL = 'http://localhost:3001/api/3.0/';
        PushRawData(URL, 'ServerA1', 'CpuUsage', Math.floor(Math.random()*100), 'xxxxx@gmail.com', 'Test');
        PushRawData(URL, 'ServerA2', 'CpuUsage', Math.floor(Math.random()*50), 'xxxxx@gmail.com', 'Test');
        PushRawData(URL, 'ServerA1', 'MemUsage', Math.floor(Math.random()*100), 'xxxxx@gmail.com', 'Test');
        PushRawData(URL, 'ServerA2', 'MemUsage', Math.floor(Math.random()*50), 'xxxxx@gmail.com', 'Test');
        PushRawData(URL, 'ServerB1', 'CpuUsage', Math.floor(Math.random()*100), 'xxxxx@gmail.com', 'Test');
        PushRawData(URL, 'ServerB2', 'CpuUsage', Math.floor(Math.random()*50), 'xxxxx@gmail.com', 'Test');
        PushRawData(URL, 'ServerB1', 'MemUsage', Math.floor(Math.random()*100), 'xxxxx@gmail.com', 'Test');
        PushRawData(URL, 'ServerB2', 'MemUsage', Math.floor(Math.random()*50), 'xxxxx@gmail.com', 'Test');
    }, 5000);
}

Start();
