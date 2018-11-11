
(function() {
  let selectedRange
  var Card = { //카드의 파트를 생성
    cardPartGenerator: function(parentWidth, parentHeight,margin, partid) {
      let part = document.createElement("div");

      $(part).attr({
          class: 'part',
          id: partid,
          contenteditable: 'true',
          spellcheck: 'false',
          placeholder : '내용을 작성하세요!'
        }).css({
          width : parentWidth - margin * 2,
          height : parentHeight - margin * 2,
          'background-color' : 'transparent',
          padding : 3,
          position : 'relative',
          'margin' : margin,
          display : 'inline-block',
        })
      return $(part);
    },
  //카드의 파트를 나눔
    cardPartDivider: function(option) {
      let parent = $('#editField');
      let parentHeight = parent.height();
      let parentWidth = parent.width();
      let margin = 7;

      if (option === 0) {
        parent.empty();
        parent.append(this.cardPartGenerator(parentWidth, parentHeight,margin, 'single'));
        parent.removeClass('d-flex');
        $('#verticalRange').val(3).addClass('hidden');
        $('#horizentalRange').val(2).addClass('hidden');

      } else if (option === 1) {
        parent.empty();
        parent.append(this.cardPartGenerator(parentWidth, parentHeight / 2 ,margin,  'upper'));
        parent.append(this.cardPartGenerator(parentWidth, parentHeight / 2 ,margin,  'downer'));
        parent.css('display', 'inline-block')
        $('#verticalRange').val(3).removeClass('hidden');
        $('#horizentalRange').val(2).addClass('hidden');

      } else if (option === 2) {
        parent.empty();
        parent.append(this.cardPartGenerator(parentWidth / 2, parentHeight ,margin, 'left'));
        parent.append(this.cardPartGenerator(parentWidth / 2, parentHeight ,margin, 'right'));
        parent.css('display', 'inline-flex');
        $('#verticalRange').val(3).addClass('hidden');
        $('#horizentalRange').val(2).removeClass('hidden');

      }
    },
  }
  //레이아웃을 선택하여 PartDivider에 전달
  $('.card-part-btn').on('click', function(event) {
    let data = $(this).data();
    Card.cardPartDivider(data.part);
    autoThumnailSave();
  });

  //cardSave 작업을 진행
  $('#cardSave').on('click', function(event){
    let saveData = new Array();//전송 데이터 저장 장소
    saveTothumnail();
    $('.thumnail-item').each(function(index, element){
      let card = $(this).find('.card-editor');
      let cardData = new Object();
      cardData.cardId = card.attr('data-cardid');
      cardData.cardNumber = index +1;
      cardData.content = card[0].outerHTML;
      saveData.push(cardData);
    });

  let reqData = JSON.stringify(saveData);
  $('.loading').removeClass('hidden');
    $.ajax({
      url: '/cardSave',
      type: 'POST',
      data: { 'workId' : pageData.workId,
              'subjectId' : pageData.subjectId,
              'reqData'  : reqData},
    }).done(function(res){
      let newCard = res.newCard;
      newCard.forEach(function(item, index){
        $($('.thumnail-item')[item.cardNumber-1]).find('.card-editor').attr('data-cardid', item.cardId);
      });
      $('.editing').find('.modal').remove();
      $('.loading').addClass('hidden');
    });
  });

  $('.text-edit-btn').on('click', function(){
    let command = $(this).data().command;
    OverLineStyle(function(){document.execCommand(command,false)});
    autoThumnailSave();
  })

  $('.fontsize-item').on('click', function(){
    $('.fontsize-item').removeClass('active');
    $(this).addClass('active');
    let command = "fontSize";
    let fontSize = $(this).data().fontsize;
    $('.fontSize').text(fontSize);
    OverLineStyle(function(){document.execCommand(command, false, '7')});
    let fontElements = document.getElementsByTagName("font");
    for (let i = 0, len = fontElements.length; i < len; ++i) {
      if (fontElements[i].size == "7") {
          fontElements[i].removeAttribute("size");
          fontElements[i].style.fontSize = `${fontSize}px`;
      }
    }
    autoThumnailSave();
  })

  $('.fontFamily-menu').on('click','.fontFamily-item',function(){
    let command = "fontName";
    let fontFamily = $(this).data().fontfamily;
    $('.fontFamily').text(fontFamily);
    OverLineStyle(function(){document.execCommand(command, false, fontFamily)});
    autoThumnailSave();
  })
  $('.thumnail-order').sortable({
    axis: "y"
  });
  $('.thumnail-order').disableSelection();

  $('.thumnail-order').on('click', '.thumnail-item', function(event){
    if ($(this).is('.editing'))
      return;
    saveTothumnail();
    $('.editing').removeClass('editing');
    updateWorkingField(this);
  })

// card plus button action function
  $('#card-plus-btn').on('click', function(){
    saveTothumnail();// 현재 작업 내용을 저장
     $('.editing').removeClass('editing');
    let cardData = {
      cardNumber : getNextCardNumber(),
      workId : pageData.workId,
      subjectId : pageData.subjectId,
    };
      updateCard(cardData.cardNumber); //현재 작업필드를 업데이트
      addThumnail();// 현재 카드를 썸네일에 저장
      $(".thumnailWrapper").scrollTop($(".thumnailWrapper")[0].scrollHeight);
  });

  $('.thumnail-order').on('click','.trash-can-btn', function(event){
    event.preventDefault();
    event.stopPropagation();

    let listItem = $(this).parent();
    if (listItem.is('.editing')){
      if(listItem.next().length){
        listItem.next().addClass('editing');
        updateWorkingField(listItem.next());
      }else if(listItem.prev().length){
        listItem.prev().addClass('editing');
        updateWorkingField(listItem.prev());
      }
    }
    listItem.remove();

  })

  let verticalSet = [[392,42], [333,101], [275, 159], [217,217], [159, 275], [101, 333], [42, 397]];

  $('#verticalRange').on('input', function () {
    $('#editField > #upper').outerHeight(verticalSet[$(this).val()][0]);
    $('#editField > #downer').outerHeight(verticalSet[$(this).val()][1]);
  });

  let horizentaSet = [[50,202],[88,164],[126,126],[164,88],[202,50]];

  $('#horizentalRange').on('input', function(){
    $('#editField > #left').outerWidth(horizentaSet[$(this).val()][0]);
    $('#editField > #right').outerWidth(horizentaSet[$(this).val()][1]);
  });

  let colorSet = ['#1ABC9C',  '#16A085',  '#27AE60',  '#3498DB',
  '#2980B9',  '#9B59B6',  '#34495E',  '#2C3E50',
  '#F1C40F',  '#F39C12',  '#E67E22',  '#BDC3C7',
  '#D35400',  '#ffffff',  '#ECF0F1',  '#95A5A6',
  '#7F8C8D', '#000000','#f5aa73', '#c99853'];

  $(".background-colorpick").colorPick({
     'allowRecent' : false,
     'paletteLabel' : '배경색상 선택',
     'palette' : colorSet,
     'onColorSelected': function() {
     this.element.css({'backgroundColor': this.color, 'color': this.color});
     $('#editField').css('background-color', this.color);
     autoThumnailSave();
   } });
   $('#backgroundReset').on('click', function(){
     $('#editField').css({
       'background-color' : 'white',
       'background' : ''})
       autoThumnailSave();
   })

   $('#textColorChange').colorPick({
     'allowRecent' : false,
     'paletteLabel' : '글자색상 섵택',
     'palette' : colorSet,
     'onColorSelected': function() {
       $('.text-svg').css({'backgroundColor': this.color});
       restoreSelection();
       let color = this.color
       $("[data-toggle = 'modal']").attr('contenteditable' , 'true');
       document.execCommand('foreColor', false, color);
       $("[data-toggle = 'modal']").attr('contenteditable' , 'false');
       autoThumnailSave();
     }
   });

   $('.card-editor-wrapper').on('blur', '.part', function(event) {
     saveSelection();
   });

   $('#E-PostIT').on('click', function() {
     if (!selectedRange || selectedRange.collapsed){
       alert('영역을 선택하세요');
       return
     }

     let selectedString = selectedRange.toString();
     let saveLocation = $('.editing').find('card-editor');

     let modalId = `${pageData.subjectId}${IDgeneration()}`
     document.execCommand('CreateLink', false, 'tempOverLine');
     var overLine = $('[href = tempOverLine]');
     overLine.attr({
         'href' : '',
         'contenteditable' : 'false',
         'class' : `E-Post-Link`,
         'data-toggle' : 'modal',
         'data-target' : `#${modalId}`,
         'data-modalId' : `${modalId}`,
         'style' : "text-decoration: overline"});

     var selection = restoreSelection();
     selection.collapseToEnd();

     restoreSelection();
     document.execCommand('inserttext', false, ' ');
     Modal = modalGeneration(modalId, selectedString);

     $('#editField').append(Modal);
     $(`#${modalId}`).modal('show');
   });

   modalGeneration = function(modalId, selectedString) {

     modal = `<div class='modal fade' data-modalId = '${modalId}' id="${modalId}" tabindex="-1" role="dialog">
           <div class="modal-dialog" role="document">
             <div class="modal-content">
               <div class="modal-header">
                 <h4 class="modal-title">${selectedString}
                 </h4>
                   <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
               </div>
               <div class="modal-body" style = "text-align : center" contenteditable = 'true' placeholder = 'Overline을 작성하세요!' spellcheck="false">

               </div>
               <div class="modal-footer">
               <label class='modal-button-label btn btn-outline-primary btn-default' style='margin : 2px'>
                       IMG<input id = 'modalImgInput' type="file" style="display: none" accept="image/x-png,image/gif,image/jpeg";>
                     </label>
                 <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
               </div>
             </div>
           </div>`

     return modal
   }


 $('.card-editor-wrapper').on('focus', "[contenteditable='true']", function() {
     const $this = $(this);
     $this.data('before', $this.html());
 }).on('blur keyup paste input', "[contenteditable='true']", function() {
     const $this = $(this);
     if ($this.data('before') !== $this.html()) {
         $this.data('before', $this.html());
         $this.trigger('change');
     }
 });


 function OverLineStyle(callback){
     // $("[data-toggle = 'modal']").attr('contenteditable' , 'true');
     callback();
     // $("[data-toggle = 'modal']").attr('contenteditable' , 'false');
}

  function saveTothumnail(){
    let currentThumnail = $('.editing');
    let cardId = $('.editing').find('.card-editor').attr('data-cardid');
    currentThumnail.find('.card-editor').remove();
    modalRefresh();
    $('#editField').clone().addClass('thumnail-card-transform').removeAttr('id').attr('data-cardid', cardId).appendTo(currentThumnail);
  }
  function autoThumnailSave(){
    let currentThumnail = $('.editing');
    let cardId = $('.editing').find('.card-editor').attr('data-cardid');
    currentThumnail.find('.card-editor').remove();
    $('#editField').clone(true)
    .addClass('thumnail-card-transform')
    .removeAttr('id')
    .attr('data-cardid', cardId)
    .find('.modal')
    .remove().end()
    .appendTo(currentThumnail);
  }
  function updateWorkingField(thumnailItem){
    let clickedCard = $(thumnailItem).addClass('editing').find('.card-editor');
    $('.card-editor-wrapper').empty();
    clickedCard.clone(true).removeClass('thumnail-card-transform').attr('id', 'editField').appendTo('.card-editor-wrapper');
    clickedCard.find('.modal').remove();

  }

  function getNextCardNumber(){
    return ($('.thumnail-order .thumnail-item').length + 1);
  }

  function updateCard(cardNumber){
    let editField = $('#editField');
    editField.attr('data-cardId','')

    Card.cardPartDivider(1);
    editField.css({
      'background-color': '#ffffff',
      'background' : ''
    });

  }


  function addThumnail(){
    let thumnail = document.createElement("li");
    let trashIcon = `<span class="trash-can-btn position-absolute">
                      <image class="trash-can" src="/image/svg/trashcan.svg"></image>
                    </span>`

    $(thumnail).addClass('thumnail-item editing');
    $('#editField').clone(true).addClass('thumnail-card-transform').removeAttr('id').appendTo($(thumnail));
    $(thumnail).append(trashIcon);
    $(thumnail).appendTo('.thumnail-order');
  }

  function getCurrentRange() {
    var sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      return sel.getRangeAt(0);
    }
  };
  function saveSelection() {
    selectedRange = getCurrentRange();
  };

  function restoreSelection() {
    var selection = window.getSelection();
    if (selectedRange) {
      try {
        selection.removeAllRanges();
      } catch (ex) {
        document.body.createTextRange().select();
        document.selection.empty();
      }
      selection.addRange(selectedRange);
    }
    return selection;
  };
//dataURL to Bolb
  function dataURItoBlob(dataurl) {
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], {type:mime});
  }
  //**blob to dataURL**
  function blobToDataURL(blob, callback) {
      var a = new FileReader();
      a.onload = function(e) {callback(e.target.result)};
      a.readAsDataURL(blob);
  }

  function IDgeneration(){
    return '_' + Math.random().toString(36).substr(2, 9);
  }
//클립보드에서 붙혀넣기 시 스타일 복사 해오지 않기
  function modalRefresh(){
    $('#editField').find('.modal').each(function(index,element){
      let modalId = $(this).attr('id');
      if ($('#editField').find(`[data-target='#${modalId}']`).length === 0){
         $(this).remove();
      }
    });
  }
  $(document).on('paste','[contenteditable]', function(e) {
    e.preventDefault();
    var text = '';
    if (e.clipboardData || e.originalEvent.clipboardData) {
      text = (e.originalEvent || e).clipboardData.getData('text/plain');
    } else if (window.clipboardData) {
      text = window.clipboardData.getData('Text');
    }
    if (document.queryCommandSupported('insertText')) {
      document.execCommand('insertText', false, text);
    } else {
      document.execCommand('paste', false, text);
    }
});
})()
