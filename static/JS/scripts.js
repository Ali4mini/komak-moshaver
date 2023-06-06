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

function expend_image(imgs) {
    // Get the expanded image
    var expandImg = document.getElementById("expandedImg");
    // Get the image text
    var imgText = document.getElementById("imgtext");
    // Use the same src in the expanded image as the image being clicked on from the grid
    expandImg.src = imgs.src;
    // Use the value of the alt attribute of the clickable image as text inside the expanded image
    imgText.innerHTML = imgs.alt;
    // Show the container element (hidden with CSS)
    expandImg.parentElement.style.display = "block";
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