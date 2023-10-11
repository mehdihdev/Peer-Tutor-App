var express = require('express');
var app = express();
var path = require("path");
var bodyParser = require('body-parser');
var fs = require('fs');
const { parse } = require("csv-parse");
var csv = require('csv-parser');

const { google } = require('googleapis');
const credentials = require('./credentials.json');
const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: GMAIL_SCOPES,
  });
  

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'./public')));


app.get('/', function(req, res) {
    console.log('Authorize this app by visiting this url:', url);

  res.render('index');
});

app.post('/match', function(req,res){
    StudentName = req.body.studentsType
    focusClass = req.body.subjects
    StudentEmail = req.body.email

    let tutors = [];
    fs.createReadStream('public/tutors.csv')
        .pipe(csv({
            mapHeaders: ({ header }) => {
                if (header === 'Student Name ') return 'name';
                if (header === 'Student E-mail') return 'email';
                if (header === 'Focus Class 1') return 'focusClass1';
                if (header === 'Focus Class 2') return 'focusClass2';
                return header;
            }
        }))
        .on('data', (row) => {
            tutors.push(row);
        })
        .on('end', () => {
            console.log('Tutors loaded');
            filterTutors(tutors);
        });
        

    function filterTutors(tutors) {
        const potentialTutors = tutors.filter(tutor =>
            tutor.focusClass1 === focusClass || tutor.focusClass2 === focusClass
        );
        console.log(potentialTutors);
        if (potentialTutors.length === 0) {
            return res.status(404).send('No tutors available for this class.');
        }
        const matchedTutor = potentialTutors[Math.floor(Math.random() * potentialTutors.length)];
        res.send(`You have been matched with: ${matchedTutor.name}`)
    }

    // Mock sending an email
    //sendEmail(studentEmail, `You are matched with ${matchedTutor.name}`);
    //sendEmail(matchedTutor.email, `You are matched with ${studentName}`);

    function sendEmail() {

    }

    //res.send(`Matched with ${matchedTutor.name}`);

  });


app.listen(8080);
console.log('Server is listening on port 8080');