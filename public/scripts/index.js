(function($){
    var user_name = null,
        server = null,
        mutual=false;

    var scroll_chat = function(){
        $('#messages').scrollTop($('#messages').get(0).scrollHeight);
    }

    var append_message = function (msg){
        $("#messages").append("<li class='message_row'><span class='name'>"+ msg.name +"</span>: "+msg.data+"</li>");
        scroll_chat();
    }


    var send_message = function(message){
        server.emit("messages",message);

        $("#message").val("");
        $("#messages").append("<li class='message_row'> <span class='name'> You:</span>"+message+"</li>");
        scroll_chat();
    };

    var send_private = function(message, guest){
        server.emit("private",message,guest);

        $("#message").val("");
        $("#messages").append("<li class='message_row'> <span class='name'> You:</span>(private with "+guest+") "+message+"</li>");
        scroll_chat();
    };

    function bindDOMEvents(){
        $("#message").keypress(function(event){
            if ( event.which == 13 ) {
                var text = $(this).val();
                var guest=$(".mutual_friend").text().replace(/^\s*|\s*$/g, '')

                if(mutual)
                    send_private(text,guest);
                else
                    send_message(text);
            }
        });

        $("#quit_mutual").click(function(){
            $("#alerts").hide();
            $(".private_user").removeClass("private_user");

            mutual = false;
        });

        $("#users").on('click', '.user_name a', function(){
            $("#alerts").show();
            $("#alert_message").html("You're in a private chat with "+$(this).text());
            mutual = true;
            $(".private_user").removeClass("private_user");
            $(".mutual_friend").removeClass("mutual_friend");
            $(this).parent().addClass("private_user");
            $(this).addClass("mutual_friend");
        });
    }

    // bind socket.io event handlers, this events fired in the server
    function bindSocketEvents(){
        server.on('messages', function (data) {
            append_message(data);
        });

        server.on('add_user',function(user_name) {
            $('#users').append("<li id='" +user_name+ "' class='user_name'><a href='#'>"+user_name+"</a></li>");
        });

        server.on('private', function(data){
            append_message(data);
        });

        server.on('user_leave', function(user_name) {
            $("#"+user_name).remove();
        })
    }

    function connect(){
        while(!user_name){
            user_name = prompt("Pick a name:")
        }

        $('#users').append("<li class='user_name you'>"+user_name+"</li>");

        server =  io.connect();
        server.emit("join", user_name);

        bindSocketEvents();
    }

    // on document ready, bind the DOM elements to events
    $(function(){
        bindDOMEvents();
        connect();
    });

})(jQuery);
