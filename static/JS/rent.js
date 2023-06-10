function showRentDiv(element)
{
    if (element.value == 'rent'){
        document.getElementById('sell_file').style.display = 'none'
        document.getElementById('rent_file').style.display = 'block';
    } else {
        document.getElementById('rent_file').style.display = 'none'
        document.getElementById('sell_file').style.display = 'block';
    }
}