var Auth = (function () {
    function Auth(req, res) {
        this.req = req;
        this.res = res;
    }
    Auth.prototype.isLogin = function () {
        return this.req.session.UserId != null;
    };

    Auth.prototype.set = function (UserId, UserName) {
        this.res.cookie('UserId', UserId);
        this.res.cookie('UserName', UserName);
        this.res.cookie('sessionUserId', UserId, { signed: true });
        this.res.cookie('sessionUserName', UserName, { signed: true });
        this.req.session.UserId = UserId;
        this.req.session.UserName = UserName;
    };

    Auth.prototype.getLoginName = function () {
        console.log('Login Name: ' + this.req.session.UserName);
        return this.req.session.UserName;
    };

    Auth.prototype.getUserId = function () {
        if (this.req.session.UserId)
            return this.req.session.UserId;
        return undefined;
    };

    Auth.prototype.clear = function () {
        this.res.clearCookie('UserId');
        this.res.clearCookie('UserName');
        this.res.clearCookie('sessionUserId');
        this.res.clearCookie('sessionUserName');
        delete this.req.session.UserId;
        delete this.req.session.UserName;
    };
    return Auth;
})();
exports.Auth = Auth;
