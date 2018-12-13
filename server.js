'use strict';

// add dependencies
const express = require('express');
const app = express();
const superagent = require('superagent');
const pg = require('pg');
const ejs = require('ejs');

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
app.get(('/'), getSavedBooks); // renders all books already in DB

// search route - renders search form
app.get(('/search'), (request, response) => {
  response.render('./pages/searches/search');
});
app.post('/search', getBooks); // requests, processes, and renders search results
let searchResults = []; // to persist search results to enable single item search

// save route - when user selects a book from search results
app.post('/save', (request,response) => {
  console.log('request',request.body);
  saveBook(request.body,response);
});

 // bookID route - displays book details when selected from splash or after saving to DB
app.get('/book/:book_id', getOneBook);

// saves selected book to DB after details updated by user
function saveBook (selected,response) {
  console.log('saveBook: selected',selected.body);
  let SQL = 'INSERT INTO bookslist (authors,title,isbn,image,summary) VALUES ($1,$2,$3,$4,$5) RETURNING id;';

  let values = [selected.authors,selected.title,selected.isbn,selected.image,selected.summary];
  console.log('values: ', values);
  return client.query(SQL,values)
    .then (results => {
      console.log(`/book/${results.rows[0].id}`);
      response.redirect(`/book/${results.rows[0].id}`);
    })
    .catch(error => handleError(error));
}

// retrieve a book from DB by ID
function getOneBook (request,response) {
  console.log('getOneBook request: ',request.params);
  let SQL = 'SELECT * FROM bookslist WHERE id=$1;';
  let values = [request.params.book_id];
  return client.query(SQL,values)
    .then( results => {
      console.log('getOneBook results: ',results.rows[0]);
      response.render('./index', {allBooks: results.rows});
    })
    .catch(error => handleError(error));
}

// retrieve all books from DB
function getSavedBooks(request,response) {
  let SQL = 'SELECT * from bookslist;';
  return client.query(SQL)
    .then(results => {
      response.render('./index', {allBooks: results.rows});
    })
    .catch(error => handleError(error));
}

// set up for API request
function getBooks(request,response) {
  // define handler
  console.log('inside getBooks');
  const handler = {
    query: request.body.search_query,
    queryType: request.body.title==='on' ? 'intitle' : 'inauthor',
  }
  Book.fetch(handler,response);
}

// response object model
function Book (data) {
  this.title = data.volumeInfo.title || 'Title not listed.';
  this.image = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : 'http://www.bsmc.net.au/wp-content/uploads/No-image-available.jpg'; //
  this.authors = data.volumeInfo.authors ? data.volumeInfo.authors.join(', ') : 'Authors not listed.';
  this.summary = data.volumeInfo.description || 'Summary not available.'
  this.isbn = data.volumeInfo.industryIdentifiers ? data.volumeInfo.industryIdentifiers[0].identifier : 'ISBN not listed.'
}

// request data from API, ask for formatted response, and send forward
Book.fetch = function (handler,response) {
  console.log('inside fetch');
  // request data from API
  const url = `https://www.googleapis.com/books/v1/volumes?q=${handler.queryType}:${handler.query}`
  superagent.get(url)
    .then(results => {
      let arrOfBooks = Book.makeBooks(results.body.items);
      return arrOfBooks;
    })
    .then (results => {
      searchResults = results;
      // console.log('results to showAPI', results);
      response.render('./pages/searches/showAPI', { allBooks: results})
    })
    .catch(error => handleError(error));
  }

// build book objects and populate response array
Book.makeBooks = function (bookData) {
  console.log('inside makeBooks', bookData);
  // build array to return to render
  // make new Book objects for each item in incoming bookData
  let allBooks = [];
  if (bookData.length < 1) {
    return allBooks;
  } else {
    if (bookData.length > 10) {
      bookData = bookData.slice[0,10];
    }
    // console.log('bookData: ',bookData[0]);
    allBooks = bookData.map( entry => {
      let book = new Book(entry);
      return book;
    })
    return allBooks;
  }
}

// handle errors, but not gracefully
function handleError(error) {
  console.error('Sorry, there was an error.');
}

// open port
app.listen(PORT, () => {
  console.log(`listening to port: ${PORT}`);
});
