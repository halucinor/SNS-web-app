(function(){

  $('.subject-plus-btn').on('click', function(){
    if($('.subject-input').val() === ''){
      alert('subject Title을 입력하세요!');
      return;
    }else
      subjectUpload();
      $('.subject-input').val('');
  });
  function subjectTitleGen(subject,workId){
    let subjectTitleTag =
    `<li class='work-subject list-group-item title-list'>
      <div class = 'subjcet-link-wrapper'>
        <a class='subject-link' href='/View?subjectId=${subject.subjectId}'>${subject.subjectTitle}</a>
      </div>
      <a class='btn btn-success subject-edit-link-btn' href='/cardEditor?workId=${workId}&subjectId=${subject.subjectId}' role = 'button'>편집</a>
      <button class="btn dropdown-toggle caret-off" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> <img class="kebab-horizontal" src="/image/svg/kebab-horizontal.svg"></button>
      <div class="dropdown-menu dropdown-menu-right">
        <button class="dropdown-item subject-update-btn" data-title=${subject.subjectTitle} data-subjectid=${subject.subjectId}>수정</button>
        <a class="dropdown-item" href="/subjectDelete/${workId}/${subject.subjectId}">삭제</a>
      </div>`
    return subjectTitleTag;
  };

  function subjectUpload(){

    let subjectName = $('.subject-input').val();
    let currentWorkId = getParameterByName('workId');

    $.ajax({
      type : 'post',
      url : '/subjectUpload',
      data : {subjectName, currentWorkId},
      // dataType : 'json',
    }).done(function(response){
      console.log(response);
      let subTitleTag = subjectTitleGen(response, currentWorkId);
      $('.work-subject-list').append(subTitleTag);
    }).fail(function(error){
      alert('서버와 연결이 실패 하였습니다.');

    }).always(function(response){

    })
  }

  $('.workUpdateBtn').on('click', function(event){
    let data = $(this).data();
    $('#updateWorkTitleInput').val(data.title);
    $('#workDescriptionInput').val(data.description);
    $('#workIdInput').val(data.workid);
    $('#workUpdateModal').modal('show');
  })

  $('.subject-update-btn').on('click', function(event){
    let data = $(this).data();
    $('#updateSubjectTitleInput').val(data.title);
    $('#subjectIdInput').val(data.subjectid);
    $('#subjectUpdateModal').modal('show');
  })

  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

})()
