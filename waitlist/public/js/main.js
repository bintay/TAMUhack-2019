(function () {
   $('#flightNumber').on('keypress', updateGoButton);
   $(document).ready(updateGoButton);

   $('#submit').on('click', e => {
      $('.home').addClass('animated zoomOut');
      let date = new Date();
      let dateString = date.toISOString().substring(0, 10);
      let flightNumber = $('#flightNumber').val();
      $.ajax(`http://localhost:3030/flight?flightNumber=${flightNumber}&date=${dateString}`).done((flight) => {
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
