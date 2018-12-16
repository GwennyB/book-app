'use strict';

// add dependencies
const express = require('express');
const app = express();
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
const ejs = require('ejs');

// middleware (captures req/res and modifies)
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public')); // for serving static content

// use PUT and DELETE
app.use(methodOverride((request, response) => {
  if (request.body && typeof request.body === 'object' && '_method' in request.body) {
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}))

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
// let searchResults = []; // to persist search results to enable single item search

// save route - when user selects a book from search results
app.post('/save', saveBook);

// bookID route - displays book details when selected from splash or after saving to DB
app.get('/book/:book_id', getOneBook);

// route to update books in DB
app.put('/update/:book_id', updateBook);

// route to delete books from DB
app.get('/delete/:book_id', deleteBook);

// error route
app.get('/error/:error', handleError);

// update books in DB
function updateBook ( request,response) {
  console.log('inside updateBook - request.params: '); //,request.params
  // console.log('inside updateBook - request.body: ',request.body);
  let SQL = 'UPDATE bookslist SET title=$1,authors=$2,isbn=$3,image=$4,summary=$5,bookshelf=$6 WHERE id=$7 returning id;';
  let {title,authors,isbn,image,summary,bookshelf} = request.body;
  let values = [title,authors,isbn,image,summary,bookshelf,request.params.book_id];

  console.log('values: ',values);

  return client.query(SQL,values)
    .then (results => {
      console.log(`redirect to: /book/${results.rows[0]}`);
      response.redirect(`/book/${results.rows[0].id}`);
    })
    .catch(error => response.redirect(`/error/${error}`));
}

// delete book from database
function deleteBook ( request,response) {
  console.log('deleteBook: request',request.params.book_id);
  let SQL = 'DELETE FROM bookslist WHERE id=$1;';
  let values = [request.params.book_id];

  console.log(`SQL delete: ${SQL}, values = ${values}`);

  return client.query(SQL,values)
    .then (response.redirect('/'))
    .catch(error => response.redirect(`/error/${error}`));
}

// load bookshelves into form select
function getShelves () {
  let SQL = 'SELECT bookshelf FROM bookslist;';
  return client.query(SQL)
    .then (results => results.rows); 
}

// saves selected book to DB after details updated by user
function saveBook (selected,response) {
  console.log('saveBook: selected',selected.body);
  let SQL = 'INSERT INTO bookslist (authors,title,isbn,image,summary,bookshelf) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id;';
  let values = [selected.body.authors,selected.body.title,selected.body.isbn,selected.body.image,selected.body.summary,selected.body.bookshelf];

  console.log('saveBook SQL values: ', values);
  return client.query(SQL,values)
    .then (results => {
      console.log(`/book/${results.rows[0].id}`);
      response.redirect(`/book/${results.rows[0].id}`);
    })
    .catch(error => response.redirect(`/error/${error}`));
}

// retrieve a book from DB by ID
function getOneBook (request,response) {
  console.log('getOneBook request: ',request.params);
  let shelves;
  let SQL = 'SELECT * FROM bookslist WHERE id=$1;';
  let values = [request.params.book_id];
  getShelves()
    .then(results => {
      shelves = results;
    })
    .then (client.query(SQL,values)
    .then( results => {
      console.log('getOneBook results: ',results.rows[0]);
      console.log('getOneBook shelves: ',shelves);
        response.render('./index', {allBooks: results.rows, shelves: shelves});
      })
    )
    .catch(error => response.redirect(`/error/${error}`));
}

// retrieve all books from DB
function getSavedBooks(request,response) {
  let SQL = 'SELECT * from bookslist;';
  getShelves()
  client.query(SQL)
    .then(results => {
      // change values of specific properties to '')
      results.rows.map( val => {
        val.summary = '';
        val.isbn = '';
        val.bookshelf = '';
      })
      response.render('./index', {allBooks: results.rows, shelves: []});
    })
    .catch(error => response.redirect(`/error/${error}`));
}

// set up for API request
function getBooks(request,response) {
  // define handler
  console.log('inside getBooks');
  const handler = {
    query: request.body.search_query,
    queryType: request.body.title==='on' ? 'intitle' : 'inauthor',
  }
  fetch(handler,response);
}

// response object model
function Book (data) {
  this.title = data.volumeInfo.title || 'Title not listed.';
  this.image = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : 'http://www.bsmc.net.au/wp-content/uploads/No-image-available.jpg'; //
  this.authors = data.volumeInfo.authors ? data.volumeInfo.authors.join(', ') : 'Authors not listed.';
  this.summary = data.volumeInfo.description || 'Summary not available.'
  this.isbn = data.volumeInfo.industryIdentifiers ? `${data.volumeInfo.industryIdentifiers[0].type}: ${data.volumeInfo.industryIdentifiers[0].identifier}` : 'ISBN not listed.'
}

// request data from API, ask for formatted response, and send forward
function fetch (handler,response) {
  console.log('inside fetch');
  // request data from API
  let shelves;
  
  const url = `https://www.googleapis.com/books/v1/volumes?q=${handler.queryType}:${handler.query}`
  getShelves()
    .then(results => {
      shelves = results;
    })
    .then (superagent.get(url)
      .then(results => {
        let arrOfBooks = makeBooks(results.body.items);
        return arrOfBooks;
      })
      .then (results => {
      // searchResults = results;
        response.render('./pages/searches/showAPI', { allBooks: results, shelves: shelves})
      })
    )
    .catch(error => response.redirect(`/error/${error}`));
}

// build book objects and populate response array
function makeBooks (bookData) {
  console.log('inside makeBooks, bookData.length: ', bookData.length);
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
function handleError(error,response) {
  console.error(error.params.error);
  response.render('./pages/error', {error: error.params.error});
}

// open port
app.listen(PORT, () => {
  console.log(`listening to port: ${PORT}`);
});
