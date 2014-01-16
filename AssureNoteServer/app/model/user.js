var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model = require('./model');
var error = require('../api/error');

var User = (function () {
    function User(key, displayName, authId) {
        this.key = key;
        this.displayName = displayName;
        this.authId = authId;
    }
    User.tableToObject = function (row) {
        return new User(row.id_key, row.display_name, row.auth_id);
    };
    return User;
})();
exports.User = User;

var UserDAO = (function (_super) {
    __extends(UserDAO, _super);
    function UserDAO() {
        _super.apply(this, arguments);
    }
    UserDAO.prototype.login = function (key, auth_id, callback) {
        var _this = this;
        function validate(key) {
            var checks = [];
            if (key.length == 0)
                checks.push('User key is required.');
            if (key.length > 45)
                checks.push('User key should not exceed 45 characters.');
            if (checks.length > 0) {
                callback(new error.InvalidParamsError(checks, null), null);
                return false;
            }
            return true;
        }
        if (!validate(key))
            return;

        this.select(key, function (err, resultSelect) {
            if (err) {
                callback(err, null);
                return;
            }

            if (resultSelect) {
                callback(err, resultSelect);
                return;
            } else {
                _this.insert(key, key, auth_id, function (err, resultInsert) {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    callback(null, resultInsert);
                    return;
                });
            }
        });
    };

    UserDAO.prototype.register = function (key, displayName, authId, callback) {
        function validate(key, name) {
            var checks = [];
            if (name.length == 0)
                checks.push('Display name is required.');
            if (name.length > 45)
                checks.push('Display name should not exceed 45 characters.');
            if (key.length == 0)
                checks.push('User key is required.');
            if (key.length > 45)
                checks.push('User key should not exceed 45 characters.');
            if (checks.length > 0) {
                callback(new error.InvalidParamsError(checks, null), null);
                return false;
            }
            return true;
        }
        if (!validate(key, displayName))
            return;

        this.insert(key, name, authId, function (err, resultInsert) {
            if (err) {
                callback(err, null);
                return;
            } else {
                callback(null, resultInsert);
            }
        });
    };

    UserDAO.prototype.select = function (key, callback) {
        this.con.query('SELECT * FROM user WHERE id_key = ? ', [key], function (err, result) {
            if (err) {
                callback(err, null);
                return;
            }
            var resultUser = null;
            if (result.length == 0) {
                err = new error.NotFoundError('UserId Not Found.');
            } else {
                resultUser = User.tableToObject(result[0]);
            }
            callback(err, resultUser);
        });
    };

    UserDAO.prototype.insert = function (key, name, auth_id, callback) {
        if (!auth_id)
            auth_id = '';
        this.con.query('INSERT INTO user(id_key, display_name, auth_id) VALUES(?, ?, ?) ', [key, name, auth_id], function (err, result) {
            if (err) {
                if (err.code == 'ER_DUP_ENTRY') {
                    err = new error.DuplicatedError('The login name is already exist.');
                }
                callback(err, null);
                return;
            }
            callback(err, new User(key, name, auth_id));
        });
    };
    return UserDAO;
})(model.DAO);
exports.UserDAO = UserDAO;
