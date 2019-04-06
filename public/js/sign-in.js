
(function ($) {
    "use strict";


    /*==================================================================
    [ Focus Contact2 ]*/
    $('.input3').each(function(){
        $(this).on('blur', function(){
            if($(this).val().trim() != "") {
                $(this).addClass('has-val');
            }
            else {
                $(this).removeClass('has-val');
            }
        })    
    })
            
    
    /*==================================================================
    [ Validate ]*/
    var name = $('.validate-input input[name="name"]');
    var admin = $('.validate-input input[name="admin"]');

    $('.validate-form').on('submit',function(event){
        var check = true;
        event.preventDefault();

        if($(name).val().trim() == ''){
            showValidate(name);
            check=false;
        }

        if($(admin).val().trim() == ''){
            showValidate(admin);
            check=false;
        }

        if(check){
            var objReg = {};
            objReg.name = $(name).val().trim();
            objReg.admin = $(admin).val().trim();
            var posting = $.post( "/register", objReg , getLocation);
        }
    });


    $('.validate-form .input3').each(function(){
        $(this).focus(function(){
           hideValidate(this);
       });
    });

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    
    function getLocation(data, status) {
        $('#loc').html("Successful");
        
        //if (navigator.geolocation) {
        //    navigator.geolocation.getCurrentPosition(showPosition);
        //} else { 
        //    $('#loc').html("Geolocation is not supported by this browser.");
        //}

    }

    function showPosition(position) {
        $('#loc').html("Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude);
    } 
    

})(jQuery);