window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response=await fetch('/total_customer/');
        const jsonData=await response.json(); 
        const customerCount=jsonData.customerCount;
        const customerCountElement=document.getElementById('customerCount');
        customerCountElement.textContent=customerCount;

        const response2=await fetch('/total_titles/');
        //console.log("Hello");
        const jsonData2=await response2.json(); 
        const titleCount=jsonData2.titleCount;
        //console.log(titleCount+"mmmmm");
        const titleCountElement=document.getElementById('titlesCount');
        titleCountElement.textContent=titleCount;

        const response3=await fetch('/inventory/');
        const jsonData3=await response3.json(); 
        const inventoryCount=jsonData3.inventory;
        const inventoryCountElement=document.getElementById('inventoryCount');
        inventoryCountElement.textContent=inventoryCount;

        const response4=await fetch('/stockvalue/');
        const jsonData4=await response4.json(); 
        const stockvalue=jsonData4.stockvalue;
        const stockvalueElement=document.getElementById('stockvalue');
        stockvalueElement.textContent=stockvalue;

    } catch(error) {
        console.error("Error:", error);
    }
});
