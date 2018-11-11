(function() {
  var editingpart;
  var modalnumber = 0;
  var currentlayout = 'single';
  var Card = { //카드의 파트를 생성

    cardPartGenerator: function(parentWidth, parentHeight, margin, partid) {
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
          'min-height' : 100,
          margin :  margin,
          'background-color' : 'transparent',
          padding : 4,
          position : 'relative',
        })

      return $(part);
    },
    //카드의 파트를 나눔
    cardPartDivider: function(option) {
      let parent = $('.card_edit');
      let parentHeight = parent.height();
      let parentWidth = parent.width();
      let margin = 5;
      let dragbar = document.createElement("div");
      $(dragbar).attr({
        id: 'dragbar',
      });

      if (option === 'divid-0') {
        currentlayout = 'single';
        $('.part').remove();
        $('#dragbar').remove();
        parent.removeClass('row');
        parent.append(this.cardPartGenerator(parentWidth, parentHeight, margin, 'single'));
      } else if (option == 'divid-1') {
        currentlayout = 'updown';
        $('.part').remove();
        $('#dragbar').remove();
        parent.removeClass('row');
        parent.append(this.cardPartGenerator(parentWidth, parentHeight / 2, margin, 'upper'));
        $(dragbar).attr('data-directon', 'col');
        parent.append(dragbar);
        parent.append(this.cardPartGenerator(parentWidth, parentHeight / 2, margin, 'downer'));
      } else if (option == 'divid-2') {
        console.log('divid-2');
        currentlayout = 'leftright';
        $('.part').remove();
        $('#dragbar').remove();
        parent.addClass('row');
        parent.append(this.cardPartGenerator(parentWidth / 2, parentHeight, margin - 1, 'left'));
        $(dragbar).attr('data-directon', 'row');
        parent.append(dragbar);
        parent.append(this.cardPartGenerator(parentWidth / 2, parentHeight, margin - 1, 'right'));
      }
    },
  }
  getCurrentRange = function() {
    var sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      return sel.getRangeAt(0);
    }
  };
  saveSelection = function() {
    selectedRange = getCurrentRange();
  };

  restoreSelection = function() {
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

  $('.card_edit').on('blur', '.part', function(event) {
    if (ishovered == false) {
      hover.css('visibility', 'hidden');
    }
    saveSelection();
  });

  $('.card_edit').on('focus', '.part', function(event) {
    hover = $('.editbuttonSet');

    hover.css('display', 'inline-block');
    hover.css('visibility', 'visible');
    hover.offset({
      top: $(this).offset().top - 45
    });
    hover.offset({
      left: $(this).offset().left - 140
    });
  });

  var ishovered = false;
  $('.editbuttonSet').mouseenter(function(event) {
    ishovered = true;
  });

  $('.editbuttonSet').mouseleave(function(event) {
    ishovered = false;
  });

  $('.card-edit-btn').on('click', function(event) {
    $('#partwrap_part0').focus();
    let buttonId = $(this).attr('id');
    OverLineStyle(function(){document.execCommand(buttonId)});
  });

  $('.card_edit').on('click', ".part", function(event) {
    editingpart = $(this);
  });

  $('.card-part-btn').on('click', function(event) {
    let buttonId = $(this).attr('id');
    Card.cardPartDivider(buttonId);
  });

  function readURL(input) {

    if (editingpart === undefined) {
      alert('이미지를 업로드할 부분을 선택하세요');
      return;
    }
    $(editingpart).empty();
    if (input.files && input.files[0]) {
      if(!isImage(input.files[0])){
        alert('이미지 파일을 선택해주세요');
        return;
      }
      var reader = new FileReader();
      reader.readAsDataURL(input.files[0]);
      reader.onload = function(e) {

        let imgData = new FormData();

        const imgBolb = dataURItoBlob(e.target.result);

        imgData.append('cardImg', imgBolb);
        $.ajax({
            url: '/cardImgSave',
            type: 'post',
            enctype: "multipart/form-data",
            data: imgData,
            processData: false,
            contentType: false,
          })
          .done(function(response) {
            var image = document.createElement("img");
            console.log(response);
            imgUrl = response;

            $(image).attr({
              id: 'image',
              src: imgUrl,
            }).css({
              position : 'absolute',
              width: (currentlayout == 'updown' || currentlayout == 'single') ? $('.part').width() : '',
              height: currentlayout == 'leftright' ? $('.part').height() : '',
            }).draggable({
              axis: (currentlayout == 'leftright') ? 'x' : 'y',
              // containment : $('#dragbarScope'),
            });

            var closeButton = document.createElement('img');

            $(closeButton).attr({
              class : 'close',
              src : './image/close.svg',
            });

            editingpart.attr('contenteditable', 'false');
            $(editingpart).addClass('imgpart');
            $(editingpart).append($(image));
            $(editingpart).append(closeButton);
          })
          .fail(function(error) {
            console.log(error);
            alert('이미지 업로드를 실패하였습니다.');
          })

      }
    }
  }

  function readImgURL(input, object){

      if (input.files && input.files[0]) {
        var reader = new FileReader();
        if(!isImage(input.files[0])){
          alert('이미지 파일을 선택해주세요');
          return;
        }
        reader.readAsDataURL(input.files[0]);
        reader.onload = function(e) {
          backgroundColor = $('.card_edit').css('background-color');
          let imgData = new FormData();
          const imgBolb = dataURItoBlob(e.target.result);


          imgData.append('cardImg', imgBolb);
          $.ajax({
              url: '/cardImgSave',
              type: 'post',
              enctype: "multipart/form-data",
              data: imgData,
              processData: false,
              contentType: false,
            })
            .done(function(response) {
              imgUrl = response;
              if( object != null){
                let image = document.createElement("img");
                $(image).css({
                  width : object.width(),
                });
                $(image).attr({
                  src : imgUrl,
                });

                object.append(image);

              }else{
              $('.card_edit')
              .css({
                'background' : `url('${imgUrl}') no-repeat`,
                'background-position' : 'center center',
                'background-color' : backgroundColor,
              });
              }
            })
            .fail(function(error) {
              console.log(error);
              alert('이미지 업로드를 실패하였습니다.');
            })

        }
      }
}


function isImage(file){
   return (file['type'].split('/')[0] =='image');//returns true or false

}

  $('.card_edit').on('click', '#close', function(event){
    console.log($(this).parent());
    $(this).parent().empty().attr({
      contenteditable : true
    }).removeClass('imgpart');

  });

  $('#backGroundImginput').change(function(){
    readImgURL(this);
    this.value = '';
  })

  $('.card_edit').on('change', '#modalImgInput', function(event){
    let thisModal = $(this).parent().parent().prev();
    console.log(thisModal);
    readImgURL(this, thisModal);
    this.value = '';
  })


  $("#imgInput").change(function() {
    ishovered = false;
    readURL(this);
    hover.css('visibility', 'hidden');
    this.value ='';
  });

  $('#imgInput')
  var fontsize = new Array(1, 2, 3, 4, 5, 6, 7);

  for (size of fontsize) {
    $('.FontSize-item').append($(document.createElement('a')).attr('class', 'dropdown-item fontsize').text(size));
  }

  var textstyle = new Array('굴림', '굴림체', '돋움', '돋움체', '바탕', 'Arial', 'Courier', 'Fixedsys', 'Impact', 'Lucida', 'Blackletter');

  for (style of textstyle) {
    $('.fontstyle-item').append($(document.createElement('a')).attr('class', 'dropdown-item fontstyle').text(style));
  }

  $('.fontstyle').on('click', function(event) {
    //event.preventDefault();
    fontstyle = $(this).text();
    $('.fontstyledropdown').text(fontstyle);
    restoreSelection();
    OverLineStyle(function(){document.execCommand("fontName", false, fontstyle)});

  });


  $('.fontsize').on('click', function() {
    //event.preventDefault();
    size = $(this).text() ;
    $('.fontdropdown').text(size);
    restoreSelection();
    // console.log(`"${size}"`);
    OverLineStyle(function(){document.execCommand('fontSize', false, size)});
  });


  $('#overLine').on('click', function() {
    if (selectedRange.collapsed){
      alert('OverLine 영역을 선택하세요');
      return
    }

    var selectedString = selectedRange.toString();
    // var selection = restoreSelection();

    document.execCommand('CreateLink', false, 'tempOverLine');
    var overLine = $('[href = tempOverLine]');
    overLine.attr({
        'href' : '',
        // 'contenteditable' : 'false',
        'class' : `overLinelink${modalnumber}`,
        'data-toggle' : 'modal',
        'data-target' : `#modal${modalnumber}`,
        'data-modalnumber' : `${modalnumber}`,
        'style' : "text-decoration: overline"});

    var selection = restoreSelection();
    selection.collapseToEnd();



    document.execCommand('inserttext', false, ' ');

    restoreSelection();

    Modal = modalGeneration(modalnumber, selectedString);
    tr = OverlineTable(modalnumber, selectedString);
    $('.card_edit').append(Modal);
    $('#tableBody').append(tr);
    $(`#modal${modalnumber}`).modal('show');
    modalnumber++;
  });

  modalGeneration = function(modalnumber, selectedString) {

    modal = `<div class='modal fade' data-modalId = 'modal${modalnumber}' id="modal${modalnumber}" tabindex="-1" role="dialog" aria-labelledby="modalTiele${modalnumber}">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h4 class="modal-title" id="modalTiele${modalnumber}">${selectedString}
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

  OverlineTable = function(modalnumber, selectedString) {

    tr = `<tr data-modalId = 'modal${modalnumber}'>
    <th scope= row>${selectedString}</td>
      <td><a class = 'overLineChange' data-modalId = 'modal${modalnumber}' href="#">수정</a>  <a href="#" class = 'overLineDelete' data-modalId = 'modal${modalnumber}' data-modalnumber ='${modalnumber}' >제거</a></td>
          </tr>`
    return tr;
  }

  $('.tab-content').on('click', '.overLineChange', function(event) {
    targetModal = $(this).attr('data-modalId');
    $(`#${targetModal}`).modal('show');
  })

  $('.tab-content').on('click', '.overLineDelete', function(event) {
    modalnumber = $(this).attr('data-modalnumber');
    $(`.overLinelink${modalnumber}`).remove();

    $(`[data-modalId = modal${modalnumber}]`).remove();
  })


  $('#bcPicker').bcPicker();

  $('.bcPicker-palette').on('click', '.bcPicker-color', function() {
    var color = $(this).css('background-color');
    document.execCommand('forecolor', false, color);
  });

  $('.colorPickButton').on('click', function() {
    color_hexvalue = $(this).attr('hexvalue');

    $('.card_edit').css('background-color', color_hexvalue);
  });


  $('.thumnail-order').sortable();
  $('.thumnail-order').disableSelection();
  $('.thumnail-order').on('click', '.thumnailURL', function(event){
    event.stopPropagation();
  });

  var outsideobserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      $(mutation.removedNodes).each(function(value, index) {
        if ($(this).attr('data-toggle') == 'modal') {
          outsideobserver.disconnect();
          thisclass = $(this).attr('class');
          $(`.${thisclass}`).remove();
          alert('OverLine이 제거됩니다.');
          modalnumber = $(this).attr('data-modalnumber');
          $(`[data-modalId = modal${modalnumber}]`).remove();
          startobserve();
        }
      });
    });
  });

function startobserve(){
  outsideobserver.observe($(".card_edit")[0], config);
}
  var config = {
    attributes: false,
    childList: true,
    subtree: true,
    characterData: true
  };

  startobserve();

  var dragging = false;
  // $('.card_edit').on('mousedown', function(event){
  //   var dragbar = $('#dragbar');
  //   // console.log(dragbar.position().top);
  //   console.log('event.pageY', event.pageY);
  //   console.log('event.offsetY',event.offsetY);
  //   console.log(event.pageY - dragbar.position().top);
  //
  // })
  $('.card_edit').on('mousedown', '#dragbar', function(event) {
    if ($(this).attr('data-directon') == 'col') {
      console.log('col');
      var target = $(this);
      var clicked = event.pageY - $(this).position().top;
      var downheight = $('#downer').position().top + $('#downer').height() - 15;
      $(document).mousemove(function(event) {
        event.preventDefault();
        event.stopPropagation();

        // if (target.position().top < 435 && target.position().top > 90) {
          // console.log(event.pageY - clicked);
          target.css('top', event.pageY - clicked);
          $('#upper').height(event.pageY - clicked-5);
          $('#downer').height(downheight - $('#upper').height());
        // }
        dragging = true;
      });
      $(document).mouseup(function(event) {
        // if (dragging) {
        //   if (target.position().top >= 430) {
        //     $('#upper').css('height' , '438px' );
        //     $('#downer').css('height', '95px');
        //     target.css('top', 429);
        //   } else if (target.position().top <= 90) {
        //     $('#upper').css('height' , '95px' );
        //     $('#downer').css('height', '438px');
        //     console.log('bug');
        //     target.css('top', 91);
        //   }
          $(document).off('mousemove');
          console.log('dragging false');
          dragging = false;
        // }
      })
    } else if ($(this).attr('data-directon') == 'row') {
      var target = $(this);
      var clicked = event.pageX - target.position().left;
      console.log(event.pageX);
      console.log(clicked);
      var rightpart = $('#right');
      var maxwidth = rightpart.position().left + rightpart.width() - 9;
      // console.log(maxheight);
      $(document).mousemove(function(event) {
        event.preventDefault();
        event.stopPropagation();


        // if (target.position().left < 190 && target.position().left > 70) {
        $('#left').width(event.pageX - (clicked));
        target.css('left', event.pageX - clicked);
        rightpart.width(maxwidth - ($('#left').width()) - 9);
        // console.log(target.position().left);
      // }
      dragging = true;
      })
      $(document).mouseup(function(event) {
        // if (dragging) {
        //   if (target.position().left <= 70) {
        //     $('#left').css('width', '80px');
        //     $('#right').css('width', '204px');
        //     target.css('left', 71);
        //   }else if (target.position().left >= 190 ){
        //     $('#left').css('width', '204px');
        //     $('#right').css('width', '80px');
        //     target.css('left', 189);
        //   }
        // }
        $(document).off('mousemove');
        dragging = false;

      })
    }
    // dragging = false
  })



  function OverLineStyle(callback){
      $("[data-toggle = 'modal']").attr('contenteditable' , 'true');
      outsideobserver.disconnect();
      callback();
      $("[data-toggle = 'modal']").attr('contenteditable' , 'false');
      startobserve();
  }

  var cardId = 1;
  $('.plusCardbtn').on('click', (event) => {
    var formData = new FormData();

    formData.append('card' ,$('.card_edit').clone().wrapAll('<div/>').parent().html());
    formData.append('cardId', cardId);
    formData.append('subjectId', 'samplesubject');
    formData.append('workId', 'samplework');
    html2canvas($('.card_edit')[0]).then(function(canvas) {
      const thumnailURL = canvas.toDataURL('image/jpg', 1.0); //해상도 문제 해결 필요
      const blob = dataURItoBlob(thumnailURL);
      formData.append('thumnail', blob);
      Card.cardPartDivider('divid-1');
      $.ajax({
          url: '/cardSave',
          type: 'post',
          enctype:"multipart/form-data",
          data: formData,
          processData: false,
          contentType: false,
        })

        .done(function(response) {
         let thumnail = thumnailGeneration(response.linkThumnail);
         // console.log(thumnail);
         $('.thumnail-order').append(thumnail);
        })
        .fail(function(error) {
          // console.log(error);
        })
    });
    cardId++;
  });
  function thumnailGeneration(thumnailurl){
    let thumnailHtml;
    thumnailHtml = `<li class = 'thumnail-list'><a href='#' class = 'thumnailURL' id = 'cardId${cardId}'><img class = 'thumnailImg' src = '${thumnailurl}'/></a></li>`
    return thumnailHtml;
  }




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
