$('#flightNumber').on('keypress', updateGoButton);
$(document).ready(updateGoButton);

$('#submit').on('click', e => {
   console.log('click');
   $('.home').addClass('animated zoomOut');
   setTimeout(() => {
      $('.home').remove();
   }, 1000)
});

function updateGoButton () {
   setTimeout(() => {
      if ($('#flightNumber').val().length == 4) {
         $('#submit').css('display', 'inline-block');
      } else {
         $('#submit').css('display', 'none');
      }
   }, 10);
}
