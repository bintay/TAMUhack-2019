(function () {
   $('#flightNumber').on('keypress', updateGoButton);
   $(document).ready(updateGoButton);

   $('#submit').on('click', e => {
      $('.home').addClass('animated zoomOut');
      let flightNumber = $('#flightNumber').val();
      let dateString = (new Date()).toISOString().substring(0, 10);
      $.ajax(`http://138.68.253.44:3030/flight?flightNumber=${flightNumber}&date=${dateString}`).done((flight) => {
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

      var socket = io('http://138.68.253.44/');

      let users = new Set();
      let currentUser = null;

      socket.on('message', function (data) {
         data = JSON.parse(data);
         if (data.flight == flightNumber) {
            if (!users.has(data.seat)) {
               users.add(data.seat);
               $('.contacts').append('<div class="customer c-' + data.seat +'">' + data.seat + '</div>');
               $('.contact').append('<div class="scrollV" id="messages-' + data.seat + '" style="display: none"></div>');

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
            
            let emojies = '';
            
            if (data.sentiment < 0.3) emojies += '😡';
            else if (data.sentiment > 0.7) emojies += '🙂';

            if (data.category == 'Food/Drink') emojies += '🍔';
            else if (data.category == 'Noise') emojies += '🔊';
            else if (data.category == 'Technical/Malfunction')  emojies += '🛠';
            else if (data.category == 'Temperature') emojies += '🌡';

            $('#messages-' + data.seat).append('<div class="message"><p><img src=\'/public/images/user.png\' /> ' + data.text + '&nbsp;&nbsp;&nbsp;(' + (emojies.length > 0 ? emojies : '💭') + ')' + '</p></div>');
            document.getElementById('messages-' + data.seat).scrollTo(0, 99999999);
         }
      });

      $('#send').on('click', e => {
         if (currentUser != null) {
            $('#messages-' + currentUser).append('<div class="message"><p><img src=\'/public/images/attendant.png\' /> ' + $('#chat').val() + '</p></div>');
            document.getElementById('messages-' + currentUser).scrollTo(0, 99999999);
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
