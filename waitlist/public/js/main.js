$('#flightNumber').on('keypress', e => {
   setTimeout(() => {
      if ($('#flightNumber').val().length == 4) {
         $('#submit').css('display', 'inline-block');
      } else {
         $('#submit').css('display', 'none');
      }
   }, 10);
});
