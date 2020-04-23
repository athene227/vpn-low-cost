document.addEventListener('DOMContentLoaded', function(){
  $(document).ready(function(){
    var message = "";
    $("#first_name").change(function(){
      message = "";
      message += nameChanged(this.value) + ", ";
    });
    $("#last_name").change(function(){
      message += nameChanged(this.value);
    });
    $("#btn1").click(function(){
      $.ajax(
        {
          url: "http://localhost:8081",
          type: "POST",
          data: message,
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

function nameChanged(value)
{
  return value;
}
