'use strict';

const express = require('express');
const app = express();

const ejs = require('ejs');
const superagent = require('superagent');


// require('dotenv').config();
const PORT = process.env.PORT || 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));


//set templating engine
app.set('view engine', 'ejs');
app.get(('/'), (request, response) => {
  response.render('index');
});

app.post('/search', getBooks);

function getBooks(request,response) {
  // define handler
  const handler = {
    query: request.body.search_query,
    queryType: request.body.title==='on' ? 'intitle' : 'inauthor',
    // cacheHit: () => {
    //   // for DB cache
    // },
    // cacheMiss: () => {
    //   // for DB cache
    // }
  }
  // call DB search
  // fetch data from API (if DB empty)
  Book.fetch(handler,response);
  // call save to DB
}

function Book (data) {
  this.title = data.volumeInfo.title || 'Title not listed.';
  this.image = data.volumeInfo.imageLinks.smallThumbnail || 'http://www.bsmc.net.au/wp-content/uploads/No-image-available.jpg';
  this.authors = data.volumeInfo.authors || 'Authors not listed.';
  this.summary = data.volumeInfo.description || 'Summary not available.'
}

Book.fetch = function (request,response) {
  // request data from API
  const url = `https://www.googleapis.com/books/v1/volumes?q=${request.queryType}:${request.query}`

  superagent.get(url)
    .then(results => {
      Book.makeBooks(results.body.items,response);})
    .catch(error => handleError(error));
}

Book.makeBooks = function (bookData,response) {
  // build array to return to render
  const allBooks = [];
  // make new Book objects for each item in incoming bookData
  bookData.slice(0,10).map( entry => {
    allBooks.push(new Book(entry));
  })
  response.render('./pages/searches/show', allBooks);
}

function handleError(error,status) {
  console.error('Sorry, there was an error.');
}



app.listen(PORT, () => {
  console.log(`listening to port: ${PORT}`);
});
