(function(){
  let currentCard = 1;
  let isModalShow = false;
  let cardWidth = 0;
  let totalCards = $('.thumnail-item').length;

  $('.total-cards-number').append(totalCards);


  if($('.thumnail-item')[1]){
    cardWidth = $($('.thumnail-item')[1]).position().left;
  }
  let scrollbarWidth = getScrollbarWidth();
  updateCard(currentCard);


  $(document).on('click', '.thumnail-item', function(){
    updateCard(Number($(this).find('.card-number').text()));
  });

  $(document).keydown(function(event){
    if (isModalShow == false){
      if(event.keyCode =='37'){
      // console.log(event.keyCode);
        if(currentCard == 1)
          return;
        currentCard = currentCard - 1;
        updateCard(currentCard);
      }else if(event.keyCode == '39'){
        if(currentCard == $('.thumnail-item').length)
          return;
        currentCard = currentCard + 1;
        updateCard(currentCard);
      }
    }else{
      if(event.keyCode == '37'){
        if(currentCard == 1){
          return;
        }else if(currentCard == 2){
          currentCard = 1;
          updateCard(currentCard);
        }else{
          currentCard = currentCard - 2;
          updateCard(currentCard);
        }
    }

    if(event.keyCode == '39'){
      if(currentCard == $('.thumnail-item').length){
        return;
      }else if(currentCard == $('.thumnail-item').length -1){
        currentCard = $('.thumnail-item').length;
        updateCard(currentCard);
      }else{
        currentCard = currentCard + 2;
        updateCard(currentCard);
      }
      }
    }
  })

  $('.card-display').on('shown.bs.modal', '.modal', function(event){
    var zIndex = 1060;
    $(this).css('z-index', zIndex);
    $('.modal-backdrop').not('.viewModal-backdrop').css('z-index', zIndex -1);
  });

  $('.card-display').on('hidden.bs.modal', '.modal', function(event){
    if(isModalShow){
        $('body').addClass('modal-open');
        $('body').css('padding-right', scrollbarWidth);
    }
  })

  $('#viewModal').on('shown.bs.modal', function(event){
    isModalShow = true;
    event.preventDefault();
    event.stopPropagation();
    $('.modal-backdrop').addClass('viewModal-backdrop');
  });

  $('#viewModal').on('hidden.bs.modal',function(event){
    event.preventDefault();
    event.stopPropagation();
    isModalShow = false;
  });


  $('.card-text-nav-btn').on('click', function(){
    let textcardValue;
    if(isModalShow){
      let ModalValue = $(this).parent().find('.card-text-input');
      textcardValue = Number($(ModalValue).val());
    }else{
      textcardValue = Number($('.card-text-input').val());
    }
    // console.log(textcardValue);
    if(textcardValue <= 0){
      updateCard(1);
      $('.card-text-input').val(1);
    }else if (textcardValue > totalCards){
      updateCard(totalCards);
      $('.card-text-input').val(totalCards);
    }else{
      updateCard(textcardValue);
      $('.card-text-input').val(textcardValue);
    }
  })

  $('.last-card-btn').on('click', function(){
    updateCard(totalCards);
  })

  $('.first-card-btn').on('click',function(){
    updateCard(1);
  })

  $('.scroll-arrow').on('click', function(){

    let listOrder = $('.card-order');
    if($(this).hasClass('left-arrow')){
      listOrder.scrollLeft(listOrder.scrollLeft()-200);
    }else if($(this).hasClass('right-arrow')){
      listOrder.scrollLeft(listOrder.scrollLeft()+200);
  }
})

  $('.modal-card-nav-btn').on('click',function(){
  if($(this).is('.left')){
    if(currentCard == 1){
      return;
    }else if(currentCard == 2){
      currentCard = 1;
    }else{
      currentCard = currentCard - 2;
    }
  }else if($(this).is('.right')){
    if(currentCard == $('.thumnail-item').length){
      return;
    }else if(currentCard == $('.thumnail-item').length -1){
      currentCard = $('.thumnail-item').length;
    }else{
      currentCard = currentCard + 2;
    }
  }
  updateCard(currentCard);
});

  $('.card-nav-btn').on('click', function(){

      if($(this).is('.left-btn')){
        if(currentCard == 1){
          return;
        }else
          currentCard = currentCard-1;
        updateCard(currentCard);

      }else if($(this).is('.right-btn')){
        if(currentCard == $('.thumnail-item').length){
          return;
        }else
          currentCard = currentCard+1;
        updateCard(currentCard);
        }
      })


  function updateCard(currentCardNumber){
    let Contents = $('.thumnail-item')[currentCardNumber-1];
    $('.thumnail-item.active').removeClass('active');
    $(Contents).addClass('active');

    let contents = $(Contents).find('.card-editor').clone().removeClass('thumnail-card-transform');
    $('.card-display .card-editor').remove();
    $('.card-display').append(contents);
    currentCard = currentCardNumber;
    $('.card-text-input').val(currentCard);
    updateCardView(currentCardNumber, contents);
    scrollCenter(currentCard);
  }

  function updateCardView(currentCardNumber, contents){
    let currentContents = $(contents).clone();
    let nextContents = $($('.thumnail-item')[currentCardNumber]).find('.card-editor').clone().removeClass('thumnail-card-transform');

    if((currentCardNumber == totalCards) || (totalCards == 1) ){

      $('.contents-display .card-editor').remove();
      $('.contents-display').append(currentContents);
    }else{
      $('.contents-display .card-editor').remove();
      $('.contents-display').append(currentContents);
      $('.contents-display').append(nextContents);
    }
  }

  function scrollCenter(currentCard){
    let listOrder = $('.card-order');
    let position = 0;
    let centerPosition = 0;
    listOrder.scrollLeft(0);
    position = $($('.thumnail-item')[currentCard-1]).position().left;
    centerPosition = position - ((4 * cardWidth) + (cardWidth/2));
    // console.log(centerPosition);
    listOrder.scrollLeft(centerPosition);
  }

  function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }

})()
