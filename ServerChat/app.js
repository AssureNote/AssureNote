///<reference path='d.ts/socket.io/socket.io.d.ts' />
var socketio = require('socket.io');

var io = socketio.listen(3002);

io.sockets.on('connection', function (socket) {
    console.log('connection');
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
});

//# sourceMappingURL=app.js.map
