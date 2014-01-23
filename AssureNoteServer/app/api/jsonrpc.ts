///<reference path='../DefinitelyTyped/express/express.d.ts'/>

/**
 * @class GLOBAL
 */

import express   = require("express");
import error     = require("./error");
import type      = require('./type');
import domain    = require('domain');
import constant  = require('../constant');
import util_auth = require('../util/auth');
var _ = require('underscore');

export var methods: {[key: string]: type.Method;} = {};
export function add(key:string, method: type.Method) {
    methods[key] = method;
}
export function addModule(module:any) {
    for (var fn in module) {
        if (typeof module[fn] === 'function') add(fn, module[fn]);
    }
}

var authMethods: string[] = [];
export function requireAuth(newAuthMethods:string[]) {
    authMethods = authMethods.concat(newAuthMethods);
}
function isAuthRequired(methodName:string) {
    return _.contains(authMethods, methodName);
}

/**
  * @method httpHandler
  * @static
  * @param {Object} req
  * @param {Object} res
  * @return {void}
  */
export function httpHandler(req: any, res: any) {
    var auth = new util_auth.Auth(req, res);

    function onError(id: any, statusCode: number, error: error.IRPCOverHTTPError) : void {
        res.send(JSON.stringify({
            jsonrpc: '2.0',
            error: error.toStrictRPCError(),
            id: id
        }), error.rpcHttpStatus);
    }

    function getUserId() : string {
        var userId = auth.getUserId();
        if (!userId) {
            userId = constant.SYSTEM_USER_ID;
        }
        return userId;
    }


    res.header('Content-Type', 'application/json');

    if (req.body.jsonrpc !== '2.0') {
        onError(req.body.id, 400, new error.InvalidRequestError('JSON RPC version is invalid or missiong', null));
        return;
    }
    var method: type.Method =  methods[req.body.method];
    if (!method) {
        onError(req.body.id, 404, new error.MethodNotFoundError(req.body.method, null));
        return;
    }
    if (isAuthRequired(req.body.method) && !auth.isLogin()) {
        onError(req.body.id, 200, new error.UnauthorizedError('You have to login before processing ' + method, null));
        return;
    }

    var d = domain.create();
    d.on('error', function(err){
        onError(req.body.id, 500, new error.InternalError('Execution error is occured', JSON.stringify(err)));
    });

    d.run(function() {
        method(req.body.params, getUserId(), {
            onSuccess: function(result: any) {
                res.send(JSON.stringify({
                    jsonrpc: '2.0',
                    result: result,
                    error: null,
                    id: req.body.id
                }), 200);
            },
            onFailure: function(err: error.IRPCOverHTTPError) {
                if (!(err instanceof error.RPCError || err instanceof error.ApplicationError)) {
                    err = new error.InternalError('Execution error is occured', JSON.stringify(err));
                }
                res.send(JSON.stringify({
                    jsonrpc: '2.0',
                error: err.toStrictRPCError(),
                id: req.body.id
                }), err.rpcHttpStatus);
            },
        });
    });
    return;
}

// default api
add('ping', function(params: any, userId: string, callback: type.Callback) {
    callback.onSuccess('ok');
});
add('ping2', function(params: any, userId: string, callback: type.Callback) {
    callback.onSuccess(userId);
});

