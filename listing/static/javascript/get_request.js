function send_request(){
    fetch('http://127.0.0.1:8000/')
        .then(response => response.text())
        .then(text => console.log(text))
}