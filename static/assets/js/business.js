$(document).ready(function(){
    
    var tweetBody = $('#message');
    var characters = 140;
    
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
    
    $('#btn').click(function(){
        var tweet = tweetBody.val();
        if(tweet.length > 0){
            $.post('announce',
            {
                message: tweet
            },
            function(data, status){
                if(status === 'success'){
                    alert('Tweet sent! Thank you!');
                    $('hr').slideUp(2000);
                    $('#asdf').slideUp(2000);
                    $('#motto').text('Thank you!');
                }else{
                    alert('Um..something happened on our side.\nTry again in a few minutes please!');
                }
            });
        }else{
            alert('Need a tweet body!');
        }
    });
    
});