
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
    //console.log($('#variable').attr("lessonName"));
    //console.log($('#variable').attr("datetime"));

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
            $.ajaxSetup({
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                }
            });
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
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else { 
            $('#variable').html("");
            $('#loc').html("Geolocation is required !");
        }

    }

    function showPosition(position) {
        var objData = {};

        objData.lessonName = $('#variable').attr("lessonName");
        objData.datetime = $('#variable').attr("datetime");
        objData.geoLat = position.coords.latitude;
        objData.geoLong = position.coords.longitude;
        objData.name = $(name).val().trim();
        objData.admin = $(admin).val().trim();
    //$('#loc').html("Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude);
        var posting = $.post( "/update-db", objData , updateUI);
    }

    function showError(error) {
        $('#variable').html("");
        switch(error.code) {
            case error.PERMISSION_DENIED:
                $('#loc').html("User denied the request for Geolocation.")
                break;
            case error.POSITION_UNAVAILABLE:
                $('#loc').html("Location information is unavailable.")
                break;
            case error.TIMEOUT:
                $('#loc').html("The request to get user location timed out.")
                break;
            case error.UNKNOWN_ERROR:
                $('#loc').html("An unknown error occurred.")
                break;
        }
    }

    function updateUI(data, status)
    {
        $('#variable').html("");
        $('#loc').html("Successful");
    }
    

})(jQuery);