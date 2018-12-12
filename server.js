'use strict';

// add dependencies
const express = require('express');
const app = express();
const superagent = require('superagent');
const pg = require('pg');

// middleware (captures req/res and modifies)
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public')); // for serving static content

require('dotenv').config();
const PORT = process.env.PORT;

// connect db client
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

//set templating engine
app.set('view engine', 'ejs');
app.get(('/'), getSavedBooks); // 

app.get(('/search'), (request, response) => {
  response.render('./pages/searches/search');
});
app.post('/search', getBooks);

app.get('/books/:book_id', getOneBook);

function getOneBook (request,response) {
  let SQL = 'SELECT * FROM bookslist WHERE id=$1;';
  console.log('request.params.book_id',request.params);
  let values = [request.params.book_id];
  return client.query(SQL,values)
    .then( results => {
      console.log('SQL results: ',results.rows);
      response.render('./pages/detail', {book: results.rows[0]});
    })
    .catch(error => handleError(error));

}

function getSavedBooks(request,response) {
  let SQL = 'SELECT * from bookslist;';
  return client.query(SQL)
    .then(results => {
      response.render('./pages/searches/showDB', {allBooks: results.rows});
    })
    .catch(error => handleError(error));
}


function getBooks(request,response) {
  // define handler
  const handler = {
    query: request.body.search_query,
    queryType: request.body.title==='on' ? 'intitle' : 'inauthor',
  }
  Book.fetch(handler,response);
}

function Book (data) {
  this.title = data.volumeInfo.title || 'Title not listed.';
  this.image = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : 'http://www.bsmc.net.au/wp-content/uploads/No-image-available.jpg'; //
  this.authors = data.volumeInfo.authors.join(', ') || 'Authors not listed.';
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
    .catch(error => handleError(error));
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

function handleError(error) {
  response.send('Sorry, there was an error.');
}

app.listen(PORT, () => {
  console.log(`listening to port: ${PORT}`);
});
