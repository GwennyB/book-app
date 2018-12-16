$('.hamburger').addClass("show");
$('nav').removeClass("show");
$('nav').addClass("hidden");

$('.hamburger').on('click', function(event) {
  event.preventDefault();
  
  $('.hamburger').addClass("hidden");
  $('.hamburger>img').addClass("hidden");
  $('nav').removeClass("hidden");
  $('nav').addClass("show");
})

