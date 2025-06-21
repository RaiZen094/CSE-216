async function processBook()
{
    console.log("why why why ");
    try {
        const response = await fetch(`/books`);
        const data = await response.json();
        if(response.status === 401) {
            console.log("book not found");
            
        }else{
            //window.location.href = "/customerpage.html";
            // Process and display data as needed
            console.log(data);
        }
    } catch (error){
        console.error(error);
        // Handle error, e.g., display an error message to the user
    }
}