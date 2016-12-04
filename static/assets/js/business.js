$(document).ready(function(){
    // Hide radio buttons until we send
    // our first tweet
    $('#radioBtns').hide(0);
    var tweetBody = $('#message');
    var characters = 140;

    // Show number of charaters left after one key press
    tweetBody.keyup(function(){
        var  remaining = characters - $(this).val().length;
        $('#msgBlock').text(remaining+" Characters remaining");
        if($(this).val().length > characters){
            $(this).val($(this).val().substr(0, characters));
        }

        if(remaining <= 10)
            $('#msgBlock').css("color","red");
        else if(remaining <= 20)
            $('#msgBlock').css("color","orange");
        else
            $('#msgBlock').css("color","black");
    });

    // On Tweet button click, do cool stuff
    $('#btn').click(function(){
        var tweet = tweetBody.val();
        var animRate = 750;
        if(tweet.length > 0){
            $.post('announce',
            {
                message: tweet
            },
            function(data, status){

                if(status === 'success'){
                    $('.rm').slideUp(animRate);
                    $('#motto').html('Thank you!<br><br>Would you like to<br>send another tweet?');

                    $('#radioBtns').show(animRate, function(){
                      $('#robot_yes').click(function(){
                        $('#motto').html('Speak your mind!');
                        $('#message').val('');
                        $('.rm').slideDown(animRate);
                        $('#radioBtns').hide(animRate);
                        $('#robot_yes').prop('checked', false);
                      });

                      $('#robot_no').click(function(){
                        $('#motto').html('Thank you!');
                        $('#radioBtns').slideUp(animRate);
                      });
                    });
                }else{
                    alert('Um..something happened on our side.\nTry again in a few minutes please!');
                }
                
            });
        }else{
            alert('You have to say something first!');
        }
    });

});
