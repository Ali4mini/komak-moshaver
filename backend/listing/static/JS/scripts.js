function send_request(){
    fetch('http://127.0.0.1:8000/')
        .then(response => response.text())
        .then(text => console.log(text))
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