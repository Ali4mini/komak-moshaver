
function rent_select(evt){
    console.log('in rent_select');
    if (evt){
        const rentOption = document.getElementById('rent').value;
        if (rentOption == evt.value){
            document.getElementById('sell_cusotmer').style.display = 'none';
            document.getElementById('rent_customer').style.display = 'block';
        } else{
            document.getElementById('rent_customer').style.display = 'none';
            document.getElementById('sell_cusotmer').style.display = 'block';
        }
    }
}