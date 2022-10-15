function logout() {
    window.location.href = '/logout';
    socket.emit('logout', {
        id: '<%- session.id %>',
        username: '<%- session.username %>'
    });
}

function addContact(id, type = 'add') {
    var url = ''
    if (type == 'add') url = '/add_contact'
    else url = '/remove_contact'

    $.ajax({
        url: url,
        type: 'JSON',
        method: 'POST',
        data: { id: id },
        success: function (resp) {
            console.log(resp)
        },
        error: function (resp) {
            console.log(resp)
        }
    })
}

function showEmojis() {
    $('div#content_emojis').toggle();
    if($('.div_icons_footer_bar_emojis').hasClass( "active" )){
        $('.div_icons_footer_bar_emojis').removeClass( "active" );
    }else{
        $('.div_icons_footer_bar_emojis').addClass( "active" );
    }
}

function clearMessage(id) {
    $.ajax({
        url: '/clear_message',
        type: 'JSON',
        method: 'POST',
        data: { id: id },
        success: function (resp) {
            console.log(resp)
        },
        error: function (resp) {
            console.log(resp)
        }
    })
}

function removeIconsCall() {
    $('#icon_call_video').empty()
    $('#icon_call_voice').empty()
}

function moreOptionsContacts(e) {
    console.log('chegou aqui')
    $(e).children('.action_menu').toggle()
}

function loadIconsCall(id, username) {
    $('#icon_call_video').attr('onclick', `prepareTransmissionVideo('${id}', '<%- session.id %>', '${username}', '<%- session.username %>')`)
    $('#icon_call_voice').attr('onclick', `prepareTransmissionAudio('${id}', '<%- session.id %>', '${username}', '<%- session.username %>')`)
    $('#icon_call_video').html(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#aebac1" class="px-1 bi bi-camera-video-fill" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"/>
                  </svg>`)
    $('#icon_call_voice').html(`                          
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#aebac1" class="px-1 bi bi-telephone-fill" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
                  </svg>
    `)
}

function showSlideEditProfile(){
    $('#show_profile').toggle('1000');
    $('.navbar-brand').toggle('1000');    
}

function enableInputEdit(e){
    var input = $(e).prev();
    $(input).removeAttr('disabled').focus()
    $(e).attr('onclick', 'saveEditInput(this)');
    $(e).html(`
        <svg viewBox="0 0 24 24" height="24" width="24" x="0px" y="0px" enable-background="new 0 0 24 24" xml:space="preserve"><path fill="#aebac1" d="M9,17.2l-4-4l-1.4,1.3L9,19.9L20.4,8.5L19,7.1L9,17.2z"></path></svg>
    `)
}

function saveEditInput(e){
    var input = $(e).prev();
    $(input).attr('disabled', 'disabled')
    $(e).html(`
    <svg viewBox="0 0 24 24" height="24" width="24" x="0px" y="0px" enable-background="new 0 0 24 24" xml:space="preserve"><path fill="#aebac1" d="M3.95,16.7v3.4h3.4l9.8-9.9l-3.4-3.4L3.95,16.7z M19.75,7.6c0.4-0.4,0.4-0.9,0-1.3 l-2.1-2.1c-0.4-0.4-0.9-0.4-1.3,0l-1.6,1.6l3.4,3.4L19.75,7.6z"></path></svg>
    `)
}