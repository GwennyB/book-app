'use strict';

// add dependencies
const express = require('express');
const app = express();
const superagent = require('superagent');
const PORT = process.env.PORT || 4000;

// middleware (captures req/res and modifies)
app.use(express.urlencoded({ extended: true }));
// app.use(express.static('./public')); // for serving static content

require('dotenv').config();

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
  this.image = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : 'http://www.bsmc.net.au/wp-content/uploads/No-image-available.jpg'; //
  this.authors = data.volumeInfo.authors || 'Authors not listed.';
  this.summary = data.volumeInfo.description || 'Summary not available.'
}

Book.fetch = function (handler,response) {
  // request data from API
  const url = `https://www.googleapis.com/books/v1/volumes?q=${handler.queryType}:${handler.query}`
  superagent.get(url)
    .then(results => {
      let arrOfBooks = Book.makeBooks(results.body.items);
      return arrOfBooks
    })
    .then (results => {
      response.render('./pages/searches/show', { allBooks: results})
    })
}

Book.makeBooks = function (bookData) {
  // build array to return to render
  // make new Book objects for each item in incoming bookData
  let allBooks = [];
  if (bookData.length < 1) {
    return allBooks;
  } else {
    if (bookData.length > 10) {
      bookData = bookData.slice[0,10];
    }
    allBooks = bookData.map( entry => {
      console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~book: ${entry.volumeInfo.title} ~~~` ,entry.volumeInfo.imageLinks);
      let book = new Book(entry);
      return book;
    })
    // console.log('allBooks @ 74: ',allBooks.length);
    return allBooks;
  }
}

app.listen(PORT, () => {
  console.log(`listening to port: ${PORT}`);
});
