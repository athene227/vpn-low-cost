document.addEventListener('DOMContentLoaded', function(){
  $(document).ready(function(){
    $("#btn1").click(function(){
      $.ajax(
        {
          url: "http://localhost:8081",
          data: "Hello",
          success: function(data, status, jqXhr){
            $("#welcome_p").html(data);
        },
        error: function(jqXhr, textStatus, errorMessage){
          console.log("Failure to connect! Error code: " + errorMessage);
        }
      });
    });
  });
});
