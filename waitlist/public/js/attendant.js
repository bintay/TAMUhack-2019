(function () {
   $('#flightNumber').on('keypress', updateGoButton);
   $(document).ready(updateGoButton);

   $('#submit').on('click', e => {
      $('.home').addClass('animated zoomOut');
      let flightNumber = $('#flightNumber').val();
      let dateString = (new Date()).toISOString().substring(0, 10);
      $.ajax(`http://localhost:3030/flight?flightNumber=${flightNumber}&date=${dateString}`).done((flight) => {
         setTimeout(() => {
            $('.home').remove();
            $('.dashboard').addClass('animated zoomIn');
            $('.dashboard').css('display', 'grid');

         }, 1000);
      }).fail((res) => {
         setTimeout(() => {
            $('.home').remove();
            $('.error h1').text('error locating flight');
            $('.error').addClass('animated zoomIn');
            $('.error').css('display', 'block');
         }, 1000);
      });

      var socket = io('http://localhost:32100/');

      let users = new Set();
      let currentUser = null;

      socket.on('message', function (data) {
         data = JSON.parse(data);
         console.log(data);
         if (data.flight == flightNumber) {
            if (!users.has(data.seat)) {
               users.add(data.seat);
               $('.contacts').append('<div class="customer c-' + data.seat +'">' + data.seat + '</div>');
               $('.contact').append('<div id="messages-' + data.seat + '" style="display: none"></div>');

               $('.customer').on('click', function (e) {
                  console.log(e);
                  if (currentUser != null) {
                     $('#messages-' + currentUser).css('display', 'none');
                  } else {
                     $('#messages').css('display', 'none');
                  }
                  $('#messages-' + $(this).text()).css('display', 'block');
                  $(this).removeClass('alert');
                  currentUser = $(this).text();
               });
            }
            $('.customer.c-' + data.seat).addClass('alert');
            $('#messages-' + data.seat).append('<div class="message"><p><img src=\'/public/images/user.png\' /> ' + data.text + '</p></div>');
            document.getElementById('messages').scrollTo(0, document.body.scrollHeight);
         }
      });

      $('#send').on('click', e => {
         if (currentUser != null) {
            $('#messages-' + currentUser).append('<div class="message"><p><img src=\'/public/images/attendant.png\' /> ' + $('#chat').val() + '</p></div>');
            socket.emit('response', JSON.stringify({'seat': currentUser, 'flight': flightNumber, 'text': $('#chat').val()}));
         }
      });
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
})();
