// function show_modal(params) {
        
// }

// function confirmation(owner_name, owner_phone) {
//     if (confirm('این فایل حذف شود؟ ${owner_name} & ${owner_phone}')){

//     }    
// }
function close_modal(){
    const modal = document.getElementById('modal');
    modal.classList.remove('is-active');
}

function send_modal() {
    const modal = document.getElementById('modal');
    modal.setAttribute('class', 'modal is-active is-clipped');
    window.scrollTo(0,0);
}


function rent_filter(evt){
    if (evt){
        const rentOption = document.getElementById('rent').value
        if (rentOption == evt.value){
            document.getElementById('sell_filter').style.display = 'none'
            document.getElementById('rent_filter').style.display = 'block'
        } else{
            document.getElementById('rent_filter').style.display = 'none'
            document.getElementById('sell_filter').style.display = 'block'
        }
    }
}