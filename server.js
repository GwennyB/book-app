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
    queryType: request.body.title==='on' ? intitle : inauthor,
    // cacheHit: () => {
    //   // for DB cache
    // },
    // cacheMiss: () => {
    //   // for DB cache
    // }
  }
  // call DB search
  // fetch data from API (if DB empty)
  const booksToRender = Book.fetch(handler);
  // call save to DB
  // send formatted data to render (use booksToRender)
}

function Book (data) {
  this.title = data.title;
  this.image = data.imageLinks.smallThumbnail;
  this.authors = data.authors;
  this.summary = data.description
}

Book.fetch(request){
  // request data from API
  const url = `https://www.googleapis.books/v1/volumes?q=${request.queryType}:${request.query}`

  superagent.get(url)
    .then(results => {
      // send book data (from DB or API) to makeBooks
      return Book.makeBooks(results);
    })
    .catch(error => handleError(error));
}

Book.makeBooks(bookData) {
  // build array to return to render
  const allBooks = [];
  // make new Book objects for each item in incoming bookData
  bookData.body.items.slice(0,10).map( entry => {
    allBooks.push(new Book(entry));
  })
  return allBooks;
}

function handleError(error,status) {
  console.error('Sorry, there was an error.');
}



app.listen(PORT, () => {
  console.log(`listening to port: ${PORT}`);
});
