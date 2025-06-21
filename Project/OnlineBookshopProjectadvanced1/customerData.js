let customer_id = null;

function setCustomerID(id){
    customer_id = id;
    console.log(customer_id);
}

function getCustomerID(){
    console.log('Yes');
    return customer_id;
}

module.exports = {
    setCustomerID,
    getCustomerID
};
