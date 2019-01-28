(function () {
   $('#flightNumber').on('keypress', updateGoButton);
   $(document).ready(updateGoButton);

   let owmToFa = {
      '01': 'sun',
      '02': 'cloud',
      '03': 'cloud',
      '04': 'cloud',
      '09': 'cloud-rain',
      '10': 'cloud-rain',
      '11': 'bolt',
      '13': 'snowflake',
      '50': 'cloud'
   }

   $('#submit').on('click', e => {
      $('.home').addClass('animated zoomOut');
      let date = new Date();
      let dateString = date.toISOString().substring(0, 10);
      let flightNumber = $('#flightNumber').val();
      $.ajax(`http://localhost:3030/flight?flightNumber=${flightNumber}&date=${dateString}`).done((flight) => {
         let apcmFrom = new apc('single', {key : 'afc1687c79', secret: '1359a92bfb15320'});
         let apcmTo = new apc('single', {key : 'afc1687c79', secret: '1359a92bfb15320'});

         let cityFrom, cityTo;

         apcmFrom.onSuccess = function (data) {
            $("span.cityFrom").text(data.airport.city);
            $.getJSON("http://api.openweathermap.org/data/2.5/weather?q=" + data.airport.city + "&APPID=7e51a05cec93ac75b075312cdbc06167",function(json){
               $('span.weatherFrom').html(json.weather[0].description + ' &nbsp;&nbsp;<i class="fas fa-' + owmToFa[json.weather[0].icon.substring(0, 2)] + '"></i> ');
           });
         }

         apcmFrom.onError = function (data) {
            console.log('error');
            console.log(data);
         }

         apcmTo.onSuccess = function (data) {
            $("span.cityTo").text(data.airport.city);
            $.getJSON("http://api.openweathermap.org/data/2.5/weather?q=" + data.airport.city + "&APPID=7e51a05cec93ac75b075312cdbc06167",function(json){
               $('span.weatherTo').html(json.weather[0].description + ' &nbsp;&nbsp;<i class="fas fa-' + owmToFa[json.weather[0].icon.substring(0, 2)] + '"></i> ');
           });
         }

         apcmFrom.onError = function (data) {
            console.log('error');
            console.log(data);
         }

         apcmFrom.request(flight.originCode);
         apcmTo.request(flight.destinationCode);

         setTimeout(() => {
            $('.home').remove();
            $('.dashboard').addClass('animated zoomIn');
            $('.dashboard').css('display', 'grid');

            setInterval(updateTimes(flight), 30000);
         }, 1000);
      }).fail((res) => {
         setTimeout(() => {
            $('.home').remove();
            $('.error h1').text('error locating flight');
            $('.error').addClass('animated zoomIn');
            $('.error').css('display', 'block');
         }, 1000);
      });

      $('.button.queue').on('click', e => {
         if ($('.button.queue').text() == 'Join queue') {
            let seat = $('#seatNumber').val();
            if (seat == '') {
               $('#seatNumber').addClass('animated shake');
               setTimeout(() => { $('#seatNumber').removeClass('animated shake'); }, 1000);
            } else {
               $.post(`http://localhost:32100/bathroom/add/${flightNumber}/${seat}`, (data) => {
                  $('.button.queue').text('Exit queue');
               });
            }
         } else {
            let seat = $('#seatNumber').val();
            if (seat == '') {
               $('#seatNumber').addClass('animated shake');
               setTimeout(() => { $('#seatNumber').removeClass('animated shake'); }, 1000);
            } else {
               $.post(`http://localhost:32100/bathroom/remove/${flightNumber}/${seat}`, (data) => {
                  $('.button.queue').text('Join queue');
               });
            }
         }
         updateWaitTime(flightNumber);
      });

      updateWaitTime(flightNumber);
      setInterval(() => { updateWaitTime(flightNumber); }, 5000);

      var socket = io('http://localhost:32100/');

      socket.on('response', function (data) {
         let seat = $('#seatNumber').val();
         if (seat.length > 0) {
            data = JSON.parse(data);
            console.log(data);
            if (data.flight == flightNumber && data.seat == seat) {
               $('#messages').append('<div class="message"><p><img src=\'/public/images/attendant.png\' /> ' + data.text + '</p></div>');
               document.getElementById('messages').scrollTo(0, 999999999);
            }
         }
      });

      $('#send').on('click', e => {
         let seat = $('#seatNumber').val();
         let msg = $('#chat').val();
         if (seat.length <= 0) {
            $('#seatNumber').addClass('animated shake');
            setTimeout(() => { $('#seatNumber').removeClass('animated shake'); }, 1000);
         } else if (msg.length > 0) {
            $('#messages').append('<div class="message"><p><img src=\'/public/images/user.png\' /> ' + msg + '</p></div>');
            socket.emit('message', JSON.stringify({
               text: $('#chat').val(),
               flight: flightNumber,
               seat: seat
            }));
            document.getElementById('messages').scrollTo(0, 999999999);
         }
      });

      $('.mic').on('click', e => clickMic(e));
      $('.stop').on('click', e => clickStop(e));
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

   function updateWaitTime (flightNumber) {
      let seat = $('#seatNumber').val();
      if (seat == null || seat.length == 0) {
         seat = '***';
      }
      $.get(`http://localhost:32100/bathroom/wait/${flightNumber}/${seat}`, (data) => {
         if (data.time == '0' && $('.button.queue').text() == 'Exit queue') {
            alert('IT\'S POTTY TIME 💩');
            $('.button.queue').text('I\'m done!');
            $('span.bathroomWait').text('Your turn');
         } else if (data.time == '0' && $('.button.queue').text() == 'I\'m done!') {
            $('span.bathroomWait').text('Your turn');
         } else {
            $('span.bathroomWait').text('< ' + data.time + ' minutes');
         }
      });
   }

   function updateTimes (flight) {
      // get times
      let departureTimeDate = new Date(flight.estimatedDepartureTime);
      let arrivalTimeDate = new Date(flight.estimatedArrivalTime);

      let departureTime = departureTimeDate.toLocaleTimeString();
      let arrivalTime = arrivalTimeDate.toLocaleTimeString();

      // remove seconds on time
      departureTime = departureTime.substring(0, 4) + departureTime.substring(7, 10);
      arrivalTime = arrivalTime.substring(0, 4) + arrivalTime.substring(7, 10);

      let currentTime = new Date();

      // time until we arrive
      let msTillArrival = arrivalTimeDate - currentTime;
      let minutes = Math.floor(((msTillArrival / 1000) / 60) % 60);
      let hours = Math.floor(((msTillArrival / 1000) / 60) / 60);

      // update text
      $('span.departure').text(departureTime);
      $('span.arrival').text(arrivalTime);
      $('span.timeleft').text(`${hours} Hour${hours == 1 ? '' : 's'}, ${minutes} Minute${minutes == 1 ? '' : 's'}`);
   }

   let recorder;

   function clickMic (e) {
      console.log('click');
      navigator.mediaDevices.getUserMedia({
         audio: true
      }).then(async function(stream) {
         recorder = RecordRTC(stream, {
            type: 'audio',
         });
         recorder.startRecording();
      });
      $('.stop').css('display', 'inline');
      $('.mic').css('display', 'none');
   }

   function clickStop (e) {
      recorder.stopRecording(function() {
         let blob = recorder.getBlob();
         var fd = new FormData();
         fd.append('data', blob);
         $.ajax({
            type: 'POST',
            url: 'http://localhost:32100/speech/',
            data: fd,
            processData: false,
            contentType: false
         }).done(function(data) {
            data = JSON.parse(data);
            $('#chat').val(data.privText);
         });
         $('.mic').css('display', 'inline');
         $('.stop').css('display', 'none');
      });
   }
})();
