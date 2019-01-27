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
      });

      updateWaitTime(flightNumber);
      setInterval(() => { updateWaitTime(flightNumber); }, 5000)
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
      if (seat.length == 0) {
         let seat = '***';
      }
      $.get(`http://localhost:32100/bathroom/wait/${flightNumber}/${seat}`, (data) => {
         $('span.bathroomWait').text(data.time);
      });
   }
})();
