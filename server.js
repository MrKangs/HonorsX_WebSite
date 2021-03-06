//Server file for website
//Author: Adam Kerr, Keegan, Kenneth

// All for the express server side part
var express = require('express');
var exp_handle = require("express-handlebars");
var app = express();
var port = process.env.PORT || 3000;

// All for the MongoDB part
var MongoClient = require('mongodb').MongoClient;
var connectionString = 'mongodb+srv://MrKangs:zwqF2R6aIoN184kh@hcsahonorsx-el8jr.mongodb.net/test?retryWrites=true&w=majority';

// Setting up as handlebars view
app.engine('handlebars', exp_handle({ defualtLayout: "main"}));
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.static('public'));

// This is change the calander month: 6 = July, 5 = June and such order
var monthindex = 6;

MongoClient.connect(connectionString, {useUnifiedTopology: true})
.then(client => {

  console.log("Connected to Database");
  const db = client.db('HCSA_HonorsX');
  const homeCollection = db.collection('homeData');
  const eventCollection = db.collection('eventData');
  const communityServiceCollection = db.collection('communityServiceData');
  const calendarCollection = db.collection('calendarData');
  const peopleCollection = db.collection('peopleData');

  
// This statment will manage the Home Page
  app.get('/', function(req, res, next) {
    homeCollection.find().toArray()
    .then(results => {
      eventCollection.find().toArray()
      .then(result => {
        communityServiceCollection.find().toArray()
        .then(resultss => {
          console.log(result[0]);
          res.render("homePage", {
            welcome_message: results[0].Welcome_Message,
            Intro: results[0].intro,
            goal_message: results[0].Goal_Message,
            Goal1: results[0].goal1,
            Goal2: results[0].goal2,
            Goal3: results[0].goal3,
            upcoming_event_message: results[0].Upcoming_Event_Message,
            Image1: results[0].image1,
            Image2: results[0].image2,
            Image3: results[0].image3,
            Image4: results[0].image4,
            sourceEvent: result[0].sourceEvent,
            nameEvent: result[0].nameEvent,
            detailsEvent: result[0].detailsEvent,
            descriptionEvent: result[0].descriptionEvent,
            faqtsEvent: 1,
            sourceCom: resultss[0].sourceCom,
            nameCom: resultss[0].nameCom,
            detailsCom: resultss[0].detailsCom,
            descriptionCom: resultss[0].descriptionCom,
            faqtsCom: 1
          });
        })

      console.log("Serving the Home Page");
      res.status(200);
    });    
  })});
  
// This statment will manage the Event Page 
  app.get("/events", function(req, res, next){
    calendarCollection.find().toArray()
    .then(calendar => {
      eventCollection.find().toArray()
      .then(results => {
        res.render('eventsPage', {
          EVENTS: results,
          script: "./events.js",
          faqtsEvent: 1,
          month: calendar[monthindex].month,
          weekdays: calendar[monthindex].weekdays,
          daysofweek: calendar[monthindex].dates,
        });
      })
      console.log("Serving the Events Page");
      res.status(200);
    })
    
  });
  
// This statment will manage the Event Page calander part
  app.post("/events/:indexM/changeMonth", function(req, res, next){
    var direction = req.params.indexM;
    if(direction == 1 && monthindex < 11){
      monthindex += 1;
    }
    else if(direction == 0 && monthindex > 0){
      monthindex -= 1;
    }
  });

// This statment will manage the Event Page RSVP part
  app.post("/events/:event/addPerson", function(req, res, next){
    var n = req.params.event;
    var newObj = {
      person: req.body.person,
      email: req.body.email,
      id: req.body.ID
    }

    console.log(newObj);
    if (eventCollection.find({eventNum: n})){
      console.log("It passes");
      eventCollection.findOneAndUpdate({eventNum: n}, {$addToSet: {'going': newObj}})
    .then(result => {
      console.log("Updated!");
      res.status(200);
      res.redirect('/events');
      })
    }
    else{
      res.status(400).send("This request needs both a name, email, and ONID");
    }
  });

// This statment will manage the Community Service Page    
  app.get('/community-service', function(req, res, next){

    calendarCollection.find().toArray()
    .then(calendar => {
      communityServiceCollection.find().toArray()
      .then(results => {
        res.render('communityServicePage',{
          COMMUNITY: results,
          script: "./communityService.js",
          faqtsCom: 1,
          month: calendar[monthindex].month,
          weekdays: calendar[monthindex].weekdays,
          daysofweek: calendar[monthindex].dates,
        });
      });
      console.log("Serving the Community Service Page");
      res.status(200);
    })
  });

// This statment will manage the Community Service Page Calander part
  app.post("/community-service/:indexM/changeMonth", function(req, res, next){
    var direction = req.params.indexM;
    if(direction == 1 && monthindex < 11){
      monthindex += 1;
    }
    else if(direction == 0 && monthindex > 0){
      monthindex -= 1;
    }
  });

// This statment will manage the Community Service Page RSVP part
  app.post("/community-service/:community/addPerson", function(req, res, next){
    var n = req.params.community;
    var newObj = {
      person: req.body.person,
      email: req.body.email,
      id: req.body.ID
    }

    console.log(newObj);
    if (communityServiceCollection.find({serviceNum: n})){
      console.log("It passes");
      communityServiceCollection.findOneAndUpdate({serviceNum: n}, {$addToSet: {'going': newObj}})
    .then(result => {
      console.log("Updated!");
      res.status(200);
      res.redirect('/community-service');
      })
    }
    else{
      res.status(400).send("This request needs both a name, email, and ONID");
    }
  });

// This statment will manage the Member Page
  app.get('/members', function(req, res, next){
    peopleCollection.find().toArray()
    .then(results => {
      res.render('peoplePage', {
        PEOPLE: results
      });
      console.log("Serving the Members Page");
      res.status(200);
    });
  });
  
  app.get('*', function(req, res){
    console.log("Serving the 404 Page");
    res.status(404);
    res.render('404Page', {
    });
  });
}).catch(error => console.error(error));

app.listen(port, function(){
  console.log("Server is listening on this port: ", port);
});
