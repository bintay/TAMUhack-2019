# TAMUhack-2019

Video demo and screenshots - https://devpost.com/software/ontheflycommunications

Built in 24 Hours.

To use, the [American Airlines](https://github.com/AmericanAirlines/AA-Mock-Engine) mock engine must be running. URLs in the code might need to be changed depending on the host. You will also need access to microsoft's cogative service API as the codes used here are only available for a short time after TAMUhack (January 27th).

## Inspiration
Having been on long flights, we became aware of the many inefficiencies of in-flight communication.

## What it does
Our platform provides a web-based chat portal that allows passengers 
to send personalized requests to flight attendants in their native 
languages through speech or text, streamlining operations for flight 
attendants and promoting meaningful interactions.

In addition, the platform provides a suit of features including a 
bathroom queuing system and in-flight information regarding times and 
weather.

## How we built it
We began with a simple front end built with Pug and SCSS, filled with
 placeholder data. Different information APIs were added to get 
estimated flight arrival, time remaining, and weather at the destination
 city. After we had a simple interface working, the next step was a 
bathroom queue.

The queue brought the first challenge due to the separation of queues
 for different flights. We used micro-services to facilitate the 
queuing, and used a simple model to predict time remaining until the 
bathroom would become available for use.

The final part of the project was a messaging system for 
passenger-attendant interaction. We began with a simple chat app built 
with socket.io, then slowly expanded to make it easier to use and 
innovative. We used Microsoft Cognitive Services to run natural language
 processing algorithms to predict the type of message the passenger sent
 (food, temperature, etc.) and a sentiment analysis algorithm to predict
 the nature of the message. We then added a translation service that 
would allow a passenger to send a message in their preferred language, 
translate it into the flight attendant's preferred language, and 
translate the attendant's response back into the passenger's preferred 
language. To top it all off, we added a speech to text service.

## Challenges we ran into
One of the challenges was allowing multiple flights to run in 
parallel. This was solved by giving each flight it's own set of 
variables in a map with flight number as a key. Another challenge we ran
 into was getting audio input from the user. We ended up using RecordRTC
 to get the data in a webm blob, sending the blob to the back-end where 
it was converted to wav format by ffmpeg then sent to Microsoft's Speech
 to Text service. Finally, the text was sent back to the user.

## Accomplishments that we're proud of
We're proud of the multifaceted API integration and the appealing, 
easy to use interface. We are also very happy with our use of 
Microsoft's API to solve the problem of cross-lingual communication on 
international flights.

## What we learned
We learning about the cutting edge technologies provided by Microsoft
 through their Cognitive Services API and American Airlines through 
their mock API. We sharpened our full stack web-development skills to 
create an app that could communicate information through RESTful APIs 
and quick, reliable messages through web sockets. We improved our 
interpersonal skills and learned a ton about the various companies 
impacting technology today.

## What's next for OnTheFlyCommunications
We plan on utilizing Big Data to improve message classification, 
sentiment analysis, and flight attendant work flow. We are currently 
working on incorporating IoT devices to interact with the restroom queue
 to improve efficiency. A real-time seat map notification interface is 
in the works to improve flight attendant efficiency. 

## Built With
- sass
- pug
- node.js
- mongodb
- html5
- css
- azure
- microsoft-translator
- natural-language-processing
- sentiment-analysis-online
- openweathermap
- american-airlines-api
- express.js
- javascript
- jquery
- microsoft-cognitive-services
- microsoft-speech-to-text
- socket.io
- airport-code-api
- git
- github
- google-fonts
- font-awesome
- zsh
- ffmpeg
- digitalocean
- domain.com
- microsoft-luis
