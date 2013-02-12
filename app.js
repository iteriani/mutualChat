var express = require('express'),
    server = require('http'),
    socket = require('socket.io'),
    redis = require('redis');

var app = express(),
    http = require('http'),
    server = http.createServer(app).listen(8080),
    io = require('socket.io').listen(server);

io.set('log level', 1);

//express configuration
app.use("/styles", express.static(__dirname + '/public/styles'));
app.use("/scripts", express.static(__dirname + '/public/scripts'));
app.use("/images", express.static(__dirname + '/public/images'));

//routes
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

var redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

redisClient.auth(process.env.REDIS_SECRET, function (err) {
    if (err) { throw err; }
});

//events
io.sockets.on('connection', function(client) {
    client.once('join', function(user) {
        join(client,user);
    });

    client.on('private', function(message) {
        private_message(client, message);
    });

    client.on("disconnect", function(){
        disconnect(client);
    });
});


//helpers
function join(client,user){
    client.set("user_name",user.name);
    client.set("user_id",user.id);
    client.join(user.name);

    console.log("New connection: "+user.name);

    notify_mutuals(client,user.id,
        function(client,mutual){
            client.emit("add_user", mutual);
            console.log("NOTIFICO a: "+mutual.name + " que "+user.name + " se conecto.");
            client.broadcast.to(mutual.name).emit('add_user',user);
        });

    storeUser(user);
}

function private_message(client,message){
    client.broadcast.to(message.recipient).emit('private',message);
}

function disconnect(client){
    client.get("user_id", function(err,id){
        console.log('Client '+id+' disconnected');
        redisClient.hset(redis_key(id,"object"), "status", "disconnected");

        notify_mutuals(client,id,function(client,mutual){
            console.log("NOTIFICO a: "+mutual.name + " que "+ id + "se desconecto");
            client.broadcast.to(mutual.name).emit('user_disconnected',id);
        });
    });
}

function notify_mutuals(client,user_id,operation){
    redisClient.sinter(redis_key(user_id,"i_said_are_hot"), redis_key(user_id,"said_im_hot"),
        function(err,mutuals){
            mutuals.forEach(function(m){
                redisClient.hgetall(redis_key(m,"object"), function(err,mutual){
                    operation(client,mutual);
                });
            });
    });
}

function storeUser(user){
    redisClient.hmset(redis_key(user.id,"object"),"id",user.id,
                        "name",user.name,"image",user.image,"status", "connected");
}

function redis_key(id,str) {
   return "user:"+id+":"+str;
}

console.log('Chat server is running...');