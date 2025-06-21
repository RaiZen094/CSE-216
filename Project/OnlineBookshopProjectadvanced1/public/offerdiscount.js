const bookidInput=document.getElementById('bookid');
const discountInput=document.getElementById('discount');

async function processInput(){
    const bookid =parseInt( bookidInput.value);
    const discount=parseInt(discountInput.value);
    try{
        fetchAndDisplayBookInfo();
        const response = await fetch(`/offerdiscount/${bookid}/${discount}`);
        if(response.status===401){
            console.log("error!!!");
            ///////window.location.href="/falsecustomer.html";
        }else{  
            window.location.href = "/managerworkpage.html";
            // Process and display data as needed
        }
    }catch(error){
        console.error(error);
        // Handle error, e.g., display an error message to the user
    }
}

async function fetchAndDisplayBookInfo(){
    try{
        const response=await fetch("/books"); 
        const bookData=await response.json();
        //console.log(bookData);
        bookData.forEach(book=>{
            const row=booktTable.insertRow();
            row.insertCell().textContent=book.ID; 
            row.insertCell().textContent=book.TITLE; 
            //row.insertCell().textContent=book.ISBN; 
            row.insertCell().textContent=book.CATEGORIES; 
            row.insertCell().textContent=book.AUTHOR; 
            row.insertCell().textContent=book.PUBLISHER;
            row.insertCell().textContent=book.PRICE; 
            row.insertCell().textContent=book.DISCOUNT;
            //row.insertCell().textContent=book.STOCK; 
            //row.insertCell().textContent=book.SHORTINFOLINK; 
        });
    } catch (error) {
        console.error("Error fetching book information:", error);
    }
}

fetchAndDisplayBookInfo();

const backButton= document.getElementById("backButton");
        backButton.addEventListener("click", () => {
            window.location.href = "managerworkpage.html";
        });