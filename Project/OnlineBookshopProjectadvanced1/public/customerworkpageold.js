const genreDropdown = document.getElementById('genreDropdown');
const searchButton = document.getElementById('searchByGenre');
const customername=localStorage.getItem("customername");
const bookidinput=document.getElementById('book_id');
const bookamountinput=document.getElementById('amount');

//window.myNamespace =window.myNamespace || {}
let customerOrders = JSON.parse(localStorage.getItem('customerOrders')) || {};


let cid;
// Function to fetch genre data and populate the dropdown
async function fetchGenres(){
  try {
    // Fetch genre data from your API endpoint
    const response = await fetch('/genre'); // Make sure this matches your API route
    const data = await response.json();

    // Clear existing dropdown options
    genreDropdown.innerHTML ='<option value="none">None</option>';

    // Add new options based on fetched data
    data.forEach(genre =>{
      const option=document.createElement('option');
      option.value=genre.CATEGORIES; // Replace with the actual property for genre value
      option.textContent=genre.CATEGORIES; // Replace with the actual property for genre text
      genreDropdown.appendChild(option);
    });

    // Show the dropdown
    genreDropdown.style.display = 'block';
  } catch (error) {
    console.error('Error fetching genre data:', error);
  }
}

// Attach the fetchGenres function to the button click event
searchButton.addEventListener('click', () => {
  // Toggle the visibility of the dropdown
  genreDropdown.style.display = genreDropdown.style.display === 'none' ? 'block' : 'none';
  if (genreDropdown.style.display === 'block') {
    fetchGenres(); // Fetch and populate data when showing the dropdown
  }
});

// Function to fetch books by genre and display them
async function fetchBooksByGenre(genreName) {
  try {
    const response = await fetch(`/genre/${genreName}`);
    const books = await response.json();

    // Clear existing content in the "content" div
    const contentDiv = document.querySelector('.content');
    contentDiv.innerHTML = '';

    // Create and append divs for each book
    books.forEach(book => {
      const bookDiv = document.createElement('div');
      bookDiv.className = 'book';
      bookDiv.innerHTML = `
        <img src="../Image/${book.ID}.jpg" alt="Book Image">
        <h3>Id: ${book.ID}</h3>
        <h3>Title: ${book.TITLE}</h3>
        <p>Isbn: ${book.ISBN}</p>
        <p>Genre: ${book.CATEGORIES}</p>
        <p>Publishers: ${book.PUBLISHER}</p>
        <p>Author: ${book.AUTHOR}</p>
        <p>Price: ${book.PRICE} tk</p>
        <p>Stock: ${book.STOCK}</p>
        
      `;
      contentDiv.appendChild(bookDiv);
      //bookDiv.style.marginBottom = '50px !important';
    });
  } catch (error) {
    console.error('Error fetching book data:', error);
  }
}

// Attach the fetchBooksByGenre function to the dropdown change event
genreDropdown.addEventListener('change', () => {
  const selectedGenre = genreDropdown.value;
  if (selectedGenre !== 'none') {
    fetchBooksByGenre(selectedGenre);
  }
});

function addOrder(customerId,bookId,orderedAmount){
  if(!customerOrders[customerId]){
      customerOrders[customerId]=[]; // Create an empty array for the customer's orders if it doesn't exist
  }
  customerOrders[customerId].push([bookId, orderedAmount]); // Add the order as a pair [bookId, orderedAmount]
  localStorage.setItem('customerOrders', JSON.stringify(customerOrders));
}

function clearOrderlist(customerId)
{
  customerOrders[customerId]=[];
  localStorage.setItem('customerOrders', JSON.stringify(customerOrders));
}

function printCustomerOrders(customerId) {
  //for (const customerId in customerOrders) {
    if (customerOrders.hasOwnProperty(customerId)) {
      const orders =customerOrders[customerId];
      console.log(`Customer ID: ${customerId}`);
      orders.forEach(order => {
        const [bookId, orderedAmount] = order;
        console.log(`  Book ID: ${bookId}, Ordered Copies: ${orderedAmount}`);
      });
    }
  //}
}

async function processInput(){
    const book_id = bookidinput.value;
    const book_amount = bookamountinput.value;

    try {
        const response = await fetch(`/customer/${customername}`);
        if (response.ok) {
            const data = await response.json(); // Parse the JSON content
            const customerid = data.customerId; // Assuming the JSON response has a "customerId" property
            cid=customerid;
            //console.log(customerid);
            // You can use customerid here or return it from the function
            //return customerid;
            addOrder(customerid,book_id,book_amount);
            //console.log(customerOrders);
            printCustomerOrders(customerid);
            localStorage.setItem('cid', cid);
            localStorage.setItem('customerOrders', JSON.stringify(customerOrders));
        } else {
            // Handle the case where the fetch request was not successful
            console.log('Error:', response.status);
            throw new Error('Failed to fetch customer ID');
        }
    } catch (error) {
        console.error(error);
        // Handle the error here or re-throw it if necessary
        throw error;
    }
}



function showorder()
{
  window.location.href="/showorder.html";
}

function commitorder()
{
  let customerOrders = {};

  localStorage.setItem('customerOrders', JSON.stringify(customerOrders));

  localStorage.removeItem('cid');

}


