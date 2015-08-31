function updateDepth(book, newPage) {
  var page = book.turn('page'),
    pages = book.turn('pages'),
    depthWidth = 16 * Math.min(1, page*2/pages);

  newPage = newPage || page;

  if (newPage>3)
    $('.sj-book .p2 .depth').css({
      width: depthWidth,
      left: 20 - depthWidth
    });
  else
    $('.sj-book .p2 .depth').css({width: 0});

  depthWidth = 16*Math.min(1, (pages-page)*2/pages);

  if (newPage<pages-3)
    $('.sj-book .p15 .depth').css({
      width: depthWidth,
      right: 20 - depthWidth
    });
  else
    $('.sj-book .p15 .depth').css({width: 0});
}

function numberOfViews(book) {
  return book.turn('pages') / 2 + 1;
}

function getViewNumber(book, page) {
  return parseInt((page || book.turn('page'))/2 + 1, 10);
}

function moveBar(yes) {
  if (Modernizr && Modernizr.csstransforms) {
    $('#slider .ui-slider-handle').css({zIndex: yes ? -1 : 10000});
  }
}

function isChrome() {
  return navigator.userAgent.indexOf('Chrome')!=-1;
}


function loadApp() {
  var flipBook = $('.sj-book');
  var slider = $("#slider");

  // Slider
  var currentNum = 0;
  slider.slider({
    min: 1,
    max: 100,
    start: function (event, ui) {
      moveBar(false);
      currentNum = $(this).slider('value');
    },
    stop: function () {
      var toNum = 0;
      if ($(this).slider('value') > currentNum) {
        toNum = $(this).slider('value') * 2 - 2;
      } else {
        toNum = $(this).slider('value') * 2 - 1;
      }
      $('.sj-book').turn('page', Math.max(1, toNum));
    }
  });

  // URIs
  Hash.on('^page\/([0-9]*)$', {
    yep: function (path, parts) {
      var page = parts[1];
      if (page !== undefined) {
        if (flipBook.turn('is'))
          flipBook.turn('page', page);
      }
    },
    nop: function (path) {
      if (flipBook.turn('is'))
        flipBook.turn('page', 1);
    }
  });

  // Arrows
  $(document).keydown(function (e) {
    var previous = 37, next = 39;
    switch (e.keyCode) {
      case previous:
        flipBook.turn('previous');
        break;
      case next:
        flipBook.turn('next');
        break;
    }
  });

  var window_height = Math.min($(window).height(), 670);
  var book_height = window_height - 70;
  var book_width = book_height / 600 * 960;

  $('.hard').css({'width': book_width / 2 + 'px', 'height': book_height + 'px'});
  $('#canvas').css({'width': book_width + 'px', 'height': book_height + 'px'});
  $('.own-size').css({'width': book_width / 2 - 20 + 'px', 'height': book_height - 18 + 'px'});

  flipBook.turn({
    elevation: 50,
    acceleration: !isChrome(),
    autoCenter: true,
    gradients: true,
    duration: 1000,
    pages: 16,
    width: book_width,
    height: book_height,
    when: {
      turning: function (e, page, view) {
        var book = $(this),
          currentPage = book.turn('page'),
          pages = book.turn('pages');
        if (currentPage > 3 && currentPage < pages - 3) {
          if (page == 1) {
            book.turn('page', 2).turn('stop').turn('page', page);
            e.preventDefault();
            return;
          } else if (page == pages) {
            book.turn('page', pages - 1).turn('stop').turn('page', page);
            e.preventDefault();
            return;
          }
        } else if (page > 3 && page < pages - 3) {
          if (currentPage == 1) {
            book.turn('page', 2).turn('stop').turn('page', page);
            e.preventDefault();
            return;
          } else if (currentPage == pages) {
            book.turn('page', pages - 1).turn('stop').turn('page', page);
            e.preventDefault();
            return;
          }
        }

        updateDepth(book, page);

        if (page >= 2)
          $('.sj-book .p2').addClass('fixed');
        else
          $('.sj-book .p2').removeClass('fixed');

        if (page < book.turn('pages'))
          $('.sj-book .p15').addClass('fixed');
        else
          $('.sj-book .p15').removeClass('fixed');

        Hash.go('page/' + page).update();

      },

      turned: function (e, page, view) {
        var book = $(this);
        if (page == 2 || page == 3) {
          book.turn('peel', 'br');
        }
        updateDepth(book);
        slider.slider('value', getViewNumber(book, page));
        book.turn('center');
      },

      start: function (e, pageObj) {
        moveBar(true);
      },

      end: function (e, pageObj) {
        var book = $(this);
        updateDepth(book);
        setTimeout(function () {
          $('#slider').slider('value', getViewNumber(book));
        }, 1);
        moveBar(false);
      }
    }
  });

  if (flipBook.width() == 0 || flipBook.height() == 0) {
    setTimeout(loadApp, 10);
    return;
  }

  slider.slider('option', 'max', numberOfViews(flipBook));
  flipBook.addClass('animated');
  // Show canvas
  $('#canvas').css({visibility: ''});
}

// Hide canvas
$('#canvas').css({visibility: 'hidden'});

yepnope({
  test: Modernizr.csstransforms,
  yep: ['./scripts/turn.min.js'],
  nope: ['./scripts/turn.html4.min.js', './styles/jquery.ui.html4.css'],
  both: ['./styles/jquery.ui.css'],
  complete: loadApp
});
