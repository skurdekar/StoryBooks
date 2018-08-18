const express = require('express');
const mongoose = require('mongoose');
const app = express();
const auth = require('./routes/auth');
const index = require('./routes/index');
const stories = require('./routes/stories');
const passport = require('passport');
const session = require('express-session')
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');


// Load Keys
const keys = require('./config/keys');

// handlebars helpers
const {
    truncate, stripTags, formatDate, select, editIcon
} = require('./helpers/hbs');

// Load User Model
require('./models/User');

// Load Passport config
require('./config/passport')(passport);

// Connect to Mongo
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true
})
.then(() => console.log("Mongo DB connected..."))
.catch(err => console.log(`Mongo DB connection error -> ${err.message}`));

// Body parser middleware
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json());

// method override middleware
app.use(methodOverride('_method'));

// Handlebars template engine
app.engine('handlebars', exphbs({
    helpers: {
        truncate: truncate,
        stripTags: stripTags,
        formatDate: formatDate,
        select: select,
        editIcon: editIcon
    },
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(cookieParser());

// Express session middleware
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', auth);
app.use('/stories', stories);
app.use('/', index);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`server started on port ${port}`)
});