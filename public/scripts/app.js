'use strict';

$('form').css('display','none');
$('li').on('click', function(event) {
  event.preventDefault();
  // TODO - get vars from Select button press
  let image = ($(this)[0].children[0].children[0].currentSrc); // image URL
  let title = ($(this)[0].children[1].innerHTML); // title
  let authors = ($(this)[0].children[2].innerHTML); // authors
  let summary = ($(this)[0].children[3].innerHTML); // summary
  let isbn = ($(this)[0].children[4].innerHTML); // isbn
  
  console.log($('form'));
  
  // $('form').attr("action", `/search/${isbn}`);
  $('form input[name="title"]').val(title);
  $('form input[name="authors"]').val(authors);
  $('form input[name="isbn"]').val(isbn);
  $('form input[name="image"]').val(image);
  $('form textarea').val(summary);
  // // $('input[name="bookshelf"]').val();
  $('li,h4').css('display','none');
  $('form').css('display','block');
});
