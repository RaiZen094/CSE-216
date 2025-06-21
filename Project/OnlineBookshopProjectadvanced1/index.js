const oracledb = require ('oracledb');
const express=require ('express');
const bodyParser = require('body-parser');
const multer = require ('multer'); // for handling file uploads
const session = require ('express-session');
const customerData = require ('./customerData'); // Assuming both files are in the same directory
const path=require ('path');
const app=express();
const fs = require ('fs'); // Import the fs module
const PORT=3005;
const upload = multer({ dest: 'uploads/' }); // specify the upload directory

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

oracledb.outFormat=oracledb.OUT_FORMAT_OBJECT;
//app.use(express.static('public'));
app.use(express.static(path.join(__dirname,'public')));
app.use('/Image', express.static('Image'));
app.use(express.json());
const crypto = require('crypto');
const { error, Console } = require('console');

const secretKey = crypto.randomBytes(32).toString('hex');
//console.log('Generated Secret Key:',secretKey);


async function runQuery(query,params){
    const connection = await oracledb.getConnection({
        user: "c##bookstore",
        password: "bookstore",
        connectString: "localhost/ORCL"
    });

    try {
        const result = await connection.execute(query, params);
        await connection.commit();
        return result;
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    } finally {
        await connection.close(); // Always close connections
    }
}

app.use(session({
    secret: secretKey, 
    resave: false,
    saveUninitialized: true
  }));


app.get('/startpage',(req,res)=>{
    console.log("someone connected");
    //res.sendFile(path.join(__dirname,'public','index.html'));
    res.sendFile(path.join(__dirname,'public','start.html'));
});

app.get('/firstpage',(req,res)=>{
    console.log("someone connected");
    //res.sendFile(path.join(__dirname,'public','index.html'));
    res.sendFile(path.join(__dirname,'public','Firstpage.html'));
});

app.get('/customer',(req,res)=>{
    res.send("Hello Customer. You have entered in online bookshop.");
});

app.get('/submitRatingAndComment/:bookId/:rating/:comment', async (req, res) => {
  const bookId=req.params.bookId;
  const rating=req.params.rating;
  const comment1=req.params.comment;
  const customer_id = req.session.customer_id;
  console.log(customer_id+typeof customer_id);
  console.log(bookId+typeof bookId);
  console.log(rating+typeof rating);
  console.log(comment1+typeof comment1);

  try {
    const query = `INSERT INTO FEEDBACK VALUES (:bookId, :customer_id, :rating, :comment1)`;
    const params = { bookId, customer_id, rating, comment1 };

    // Assuming you have a function called 'runQuery' to execute the query
    const data = await runQuery(query, params);

    res.json({ message: 'Rating and comment submitted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while submitting the rating and comment.' });
  }
});

app.get('/deactivatecustomerid/:passward', async (req, res) => {
  const passward = req.params.passward;
  const customer_id = req.session.customer_id;
  try {
    const query = `SELECT * FROM CUSTOMER WHERE CUSTOMER_ID = :customer_id`;
    const params = { customer_id };
    const data = await runQuery(query, params);
    console.log(data.rows);

    if (data.rows.length > 0) {
      const extractedPassward = data.rows[0].PASSWARD;
      if (passward === extractedPassward) {
        try {
          const query1 = `DELETE FROM CUSTOMER WHERE CUSTOMER_ID = :customer_id`;
          const params1 = { customer_id };
          const data1 = await runQuery(query1, params1);
          console.log('Customer account deleted successfully.');
          res.json({ success: true }); 
        } catch (error) {
          console.error(error);
          res.json({ success: false }); 
        }
      } else {
        console.log('Incorrect password. Account deactivation failed.');
        res.json({ success: false }); 
      }
    } else {
      console.log('Customer not found.');
      res.json({ success: false }); // Send a failure response
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false }); // Send a failure response
  }
});




app.get('/customer/:username/:passward', async (req, res) => { // Add 'async' here
    const username = req.params.username;
    const passward=req.params.passward;
    console.log(username);
    console.log(passward);

    try {
        const query = 'SELECT * FROM CUSTOMER WHERE USERNAME = :username AND PASSWARD = :passward';
        const params = {username,passward}; // Parameterized values

        const data = await runQuery(query, params);
        if (data.rows.length === 0) {
            res.status(401).send({ error:"Username not found"});
        } else {
            const customer_id = data.rows[0].CUSTOMER_ID;
            //console.log(customer_id);
            //customerData.setCustomerID(customer_id);
            //customerData.getCustomerID();
            req.session.customer_id = customer_id; // Store customer ID in session
            res.send(data.rows);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving customer data");
    }
});

app.get('/unavailablebooks/', async (req, res) =>{
  try {
      const query = `SELECT * FROM OUT_OF_STOCK_BOOKS`;
      const params = {};
      const data = await runQuery(query, params);
      console.log(data.rows);
      res.status(200).json(data.rows); 
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' }); 
  }
});

app.get('/discountedbooks/',async(req,res)=>{
  try{
    const query = `SELECT * FROM DISCOUNTEDBOOKS`;
    const params = {};
    const data = await runQuery(query, params);
    //console.log(data.rows);
    res.status(200).json(data.rows);
  }catch{
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/newcustomers/', async (req, res) => {
  try {
      const query = `SELECT * FROM  NEW_CUSTOMER NATURAL JOIN CUSTOMER 
      WHERE SYSDATE - NEW_CUSTOMER.SIGN_IN_DATE <= 3`;
    ///  const query=`SELECT * FROM NEW_CUSTOMER NATURAL JOIN CUSTOMER NATURAL JOIN CUSTOMER_CONTACT`;
      const params = {};
      const data = await runQuery(query, params);
      console.log(data.rows);
      res.status(200).json(data.rows);
  } catch (error) {
      console.log(error); 
      res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/deleteorder/:order_id', async (req, res) => {
  const order_id = req.params.order_id;
  console.log("Hello there"+order_id);
  try {
      //console.log(order_id);
      const query = 'DELETE FROM ORDERS WHERE ORDER_ID = :order_id';
      const params = { order_id };
      const data = await runQuery(query, params);
      if (data.success) {
          res.status(200).json({ message: 'Order deleted successfully' });
      } else {
          res.status(400).json({ error: 'Order not found' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
  }
});


app.get('/customerInfo/',async(req,res)=>{
    const customer_id=req.session.customer_id;
    //console.log('I am Fool');
    try{
      const query = `
      SELECT CUSTOMER.CUSTOMER_ID AS CUSTOMER_ID,
             CUSTOMER.USERNAME AS USERNAME,
             CUSTOMER.PASSWARD AS PASSWARD,
             CUSTOMER.EMAIL AS EMAIL,
             CUSTOMER.ADDRESS AS ADDRESS,
             CUSTOMER_CONTACT.PHONE_NO AS PHONE_NO
      FROM CUSTOMER
      LEFT OUTER JOIN CUSTOMER_CONTACT ON CUSTOMER.CUSTOMER_ID = CUSTOMER_CONTACT.CUSTOMER_ID
      WHERE CUSTOMER.CUSTOMER_ID = :customer_id`;
        const params={customer_id};
        const data=await runQuery(query,params);
        console.log(data.rows);
        res.json(data.rows);
    }catch{
      console.log(error);
    }
});

app.get('/customerpasswardchange/:passward',async(req,res)=>{
    const customer_id=req.session.customer_id;
    const passward=req.params.passward;
    try{
        const query='UPDATE CUSTOMER SET PASSWARD=:passward WHERE CUSTOMER_ID=:customer_id';
        const params={passward,customer_id};
        const data=await runQuery(query,params);
        res.status(200).json({ message: 'passward updated successfully' });
    }catch{
      console.log(error);
    }
});

app.get('/customeremailchange/:email',async(req,res)=>{
  const customer_id=req.session.customer_id;
  const email=req.params.email;
  try{
      const query='UPDATE CUSTOMER SET EMAIL=:email WHERE CUSTOMER_ID=:customer_id';
      const params={email,customer_id};
      const data=await runQuery(query,params);
      res.status(200).json({ message: 'email updated successfully' });
  }catch{
    console.log(error);
  }
});

app.get('/customeraddresschange/:address',async(req,res)=>{
  const customer_id=req.session.customer_id;
  const address=req.params.address;
  try{
      const query='UPDATE CUSTOMER SET ADDRESS=:address WHERE CUSTOMER_ID=:customer_id';
      const params={address,customer_id};
      const data=await runQuery(query,params);
      res.status(200).json({ message: 'address updated successfully' });
  }catch{
    console.log(error);
  }
});

app.get('/customerphonenochange/:phoneno',async(req,res)=>{
  const customer_id=req.session.customer_id;
  const phoneno=req.params.phoneno;
  console.log(phoneno);
  try{
      const query='UPDATE CUSTOMER_CONTACT SET PHONE_NO=:phoneno WHERE CUSTOMER_ID=:customer_id';
      const params={phoneno,customer_id};
      const data=await runQuery(query,params);
      res.status(200).json({ message: 'phoneno updated successfully' });
  }catch{
    console.log(error);
  }
});

app.get('/customerphonenoinsert/:phoneno', async (req, res) => {
  const customer_id = req.session.customer_id;
  const phoneno = req.params.phoneno;
  //console.log(phoneno);
  try {
      const query = 'INSERT INTO CUSTOMER_CONTACT (CUSTOMER_ID, PHONE_NO) VALUES (:customer_id, :phoneno)';
      const params = { customer_id, phoneno }; // Corrected variable name to 'phoneno'
      const data = await runQuery(query, params);
      res.status(200).json({ message: 'phoneno inserted successfully' });
  } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'An error occurred while inserting phoneno' });
  }
});

app.get('/customerphonedelete',async (req,res)=>{
    const customer_id = req.session.customer_id;
    try{
        const query=`DELETE FROM CUSTOMER_CONTACT WHERE CUSTOMER_ID=:customer_id`;
        const params={customer_id};
        const data=await runQuery(query,params);
        res.status(200).json({ message: 'phoneno deleted successfully'});
    }catch{
        console.log(error);
    }

});

app.get('/showOrders',async (req,res)=>{
    const customer_id = req.session.customer_id;
    try{
        const query=`SELECT * FROM ORDERS NATURAL JOIN EMPLOYEES WHERE CUSTOMER_ID=:customer_id`;
        const params={customer_id};
        const data=await runQuery(query,params);
        res.json(data.rows);
    }catch{
        console.log(error);
    }
});

app.get('/showorderdetails/:orderid', async (req, res) => {
  try {
      const customer_id = req.session.customer_id;
      const orderid = req.params.orderid;
      //console.log("Hello"); // This should be logged

      const query = `SELECT * FROM ORDERDETAILS WHERE ORDER_ID = :orderid`;
      const params = { orderid };
      const data = await runQuery(query, params);

      //console.log(data.rows);
      res.json(data.rows);
  } catch (error) {
      console.error('Error:', error); // Log the error
      res.status(500).json({ error: 'Internal Server Error' }); // Respond with an error status
  }
});

app.post('/employee', async (req, res) => {
  console.log(req.body);
  const name = req.body.name;
  const phoneno = req.body.phoneno;
  const email = req.body.email;
  const salary = req.body.salary;
  console.log(name+ typeof name);
  console.log(phoneno+ typeof phoneno);
  console.log(email+ typeof email);
  try {
    // Step 1: Fetch the current employee count
    const countQuery = 'SELECT COUNT(*) AS employeeCount FROM EMPLOYEES';
    const countParams = {}; // You may need to pass parameters here if required by your database library
    const countData = await runQuery(countQuery, countParams);

    if (countData.rows && countData.rows.length > 0) {
      const employeeCount = parseInt(countData.rows[0].EMPLOYEECOUNT);

      // Step 2: Insert a new employee with the next available employee ID
      const insertEmployeeQuery = 'INSERT INTO EMPLOYEES (EMPLOYEE_ID, NAME, PHONE_NO, EMAIL, HIRE_DATE) VALUES (:employeeId, :name, :phone_no, :email, SYSDATE)';
      const insertEmployeeParams = {
        employeeId: employeeCount + 1, // Increment the employee count for the next ID
        name: name,
        phone_no: phoneno,
        email: email
      };

      // Execute the insert employee query
      await runQuery(insertEmployeeQuery, insertEmployeeParams);

      // Step 3: Insert the employee salary
      const insertSalaryQuery = 'INSERT INTO EMPLOYEE_SALARY (EMPLOYEE_ID, SALARY) VALUES (:employeeId, :salary)';
      const insertSalaryParams = {
        employeeId: employeeCount + 1, // Use the same employee ID for salary as for employee
        salary: salary
      };

      // Execute the insert salary query
      await runQuery(insertSalaryQuery, insertSalaryParams);

      res.status(200).json({ message: 'Employee and salary inserted successfully' });
    } else {
      res.status(500).json({ error: 'No employee count data found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while inserting the employee and salary' });
  }
});


async function getBookIdFromProcedure(){
  let connection;
  try {
      // Establish a connection to the database
      connection = await oracledb.getConnection(dbConfig);

      // Create a PL/SQL block with the procedure call
      const plsql = `
          DECLARE
              v_book_id NUMBER;
          BEGIN
              GET_NEXT_BOOK_ID(:id);
          END;
      `;

      // Bind the out parameter
      const result = await connection.execute(plsql, {
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      });

      // Extract the Book ID from the output
      const bookId = result.outBinds.id;
      return bookId;
  } catch (error) {
      throw error;
  } finally {
      if (connection) {
          try {
              await connection.close();
          } catch (error) {
              console.error(error);
          }
      }
  }
}


app.get('/customersignin/:username/:password/:email/:address', async (req, res) => {
    const username = req.params.username;
    const password = req.params.password;
    const email = req.params.email;
    const address = req.params.address;

    //console.log(username);
    //console.log(password);
    //console.log(email);
    //console.log(address);

    try{
        // Check if the given username already exists in the database
        const checkQuery='SELECT COUNT(*) AS count FROM CUSTOMER WHERE USERNAME = :username';
        const checkParams={username:{val:username,dir: oracledb.BIND_IN, type: oracledb.STRING } };
        const checkResult=await runQuery(checkQuery,checkParams);

        const existingUsernameCount=checkResult.rows[0].COUNT;
        //console.log(existingUsernameCount);
        
        if(existingUsernameCount>0) {
            res.status(409).json({ success: false, message: "Username already exists" });
            return;
        }
        // Construct the SQL INSERT statement with named parameters
        const query = `
            INSERT INTO CUSTOMER(USERNAME, PASSWARD, EMAIL, ADDRESS, CUSTOMER_ID) 
            VALUES (:username, :password, :email, :address, :customer_id)`;

        // Calculate the new customer ID based on the total count in the CUSTOMER table
        const query1 = 'SELECT MAX(CUSTOMER_ID) AS MAX_CUSTOMER_ID FROM CUSTOMER';
        const params1 = {};
        const tot_customer = await runQuery(query1, params1);
        const maxCustomerId = tot_customer.rows[0]['MAX_CUSTOMER_ID'];
        
        let customer_id;
        if (isNaN(maxCustomerId)) {
          // If maxCustomerId is not a number, stop and send an error response
          console.error('Error: MAX_CUSTOMER_ID is not a number');
          res.status(500).send("Error adding new customer");
          return; // Stop further execution
        }
        if (maxCustomerId !== null) {
          customer_id = maxCustomerId + 1;
        } 
        console.log(customer_id);
        
        // Set up params object with key-value pairs
        const params = {
            username: { val: username, dir: oracledb.BIND_IN, type: oracledb.STRING },
            password: { val: password, dir: oracledb.BIND_IN, type: oracledb.STRING },
            email: { val: email, dir: oracledb.BIND_IN, type: oracledb.STRING },
            address: { val: address, dir: oracledb.BIND_IN, type: oracledb.STRING },
            customer_id: { val: customer_id, dir: oracledb.BIND_IN, type: oracledb.NUMBER }
        };

        // Execute the INSERT statement using the runQuery function
        const result = await runQuery(query, params);

        console.log('New customer added:', result);

        // Send a success response
        res.status(200).json({ success: true, message: "New customer added successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error adding new customer");
    }
});

app.get('/bookbypublisher',async(req,res)=>{
    try{
        //console.log('I am here');
        const query='SELECT DISTINCT(PUBLISHER),COUNT(*)TOTAL_BOOKS FROM BOOKS GROUP BY PUBLISHER';
        const params={}; // An empty object for consistency
        const data=await runQuery(query,params);
        //console.log('hhh');
        //console.log(data.rows);
        res.json(data.rows);
    }catch(error){
        console.error(error);
        res.status(500).send("Error retrieving book data"); // You can customize the error message
    }
});

app.get('/bookbyauthor',async(req,res)=>{
    try{
        //console.log('I am here');
        const query='SELECT DISTINCT(AUTHOR),COUNT(*)TOTAL_BOOKS FROM BOOKS GROUP BY AUTHOR';
        const params={}; // An empty object for consistency
        const data=await runQuery(query,params);
        //console.log('hhh');
        //console.log(data.rows);
        res.json(data.rows);
    }catch(error){
        console.error(error);
        res.status(500).send("Error retrieving book data"); // You can customize the error message
    }
});
  

app.get('/author',async(req,res)=>{
    try{
        //console.log('I am here');
        const query='SELECT DISTINCT(AUTHOR) FROM BOOKS ';
        const params={}; // An empty object for consistency
        const data=await runQuery(query,params);
        //console.log('hhh');
        //console.log(data.rows);
        res.json(data.rows);
    }catch(error){
        console.error(error);
        res.status(500).send("Error retrieving book data"); // You can customize the error message
    }
});

app.get('/publisher',async(req,res)=>{
    try{
        //console.log('I am here');
        const query='SELECT DISTINCT(PUBLISHER) FROM BOOKS ';
        const params={}; // An empty object for consistency
        const data=await runQuery(query,params);
        //console.log('hhh');
        //console.log(data.rows);
        res.json(data.rows);
    }catch(error){
        console.error(error);
        res.status(500).send("Error retrieving book data"); // You can customize the error message
    }
});

app.get('/genre',async(req,res)=>{
    try{
        //console.log('I am here');
        const query='SELECT DISTINCT(CATEGORIES) FROM BOOKS ';
        const params={}; // An empty object for consistency
        const data=await runQuery(query,params);
        //console.log('hhh');
        console.log(data.rows);
        res.json(data.rows);
    }catch(error){
        console.error(error);
        res.status(500).send("Error retrieving book data"); // You can customize the error message
    }
});

app.get('/genre/:genrename',async(req,res)=>{
    const genrename=req.params.genrename;
    try{
        const query = 'SELECT * FROM BOOKS WHERE ID IN(SELECT ID FROM BOOKS WHERE CATEGORIES=:genrename) ';
        const params = {genrename}; // An empty object for consistency
        const data = await runQuery(query,params);
        console.log(data.rows);
        res.json(data.rows);
    }catch(error){
        console.error(error);
        res.status(500).send("Error retrieving book data"); // You can customize the error message
    }
});


app.get('/author/:authorname',async(req,res)=>{
    const authorname= req.params.authorname;
    //console.log(authorname+" mnb ");
    try{
        const query = 'SELECT * FROM BOOKS WHERE AUTHOR=:authorname ORDER BY AUTHOR DESC ';
        const params = {authorname}; // An empty object for consistency
        const data = await runQuery(query,params);
        console.log(data.rows);
        res.json(data.rows);
    }catch(error){
        console.error(error);
        res.status(500).send("Error retrieving book data"); // You can customize the error message
    }
});

app.get('/publisher/:publishername',async(req,res)=>{
    const publishername= req.params.publishername;
    //console.log(authorname+" mnb ");
    try{
        const query='SELECT * FROM BOOKS WHERE PUBLISHER=:publishername ORDER BY PUBLISHER DESC ';
        const params={publishername}; // An empty object for consistency
        const data=await runQuery(query,params);
        //console.log(data.rows);
        res.json(data.rows);
    }catch(error){
        console.error(error);
        res.status(500).send("Error retrieving book data"); // You can customize the error message
    }
});

app.get('/manager/:username/:passward', async (req,res)=>{ // Add 'async' here
    const username = req.params.username;
    const passward=req.params.passward;
    console.log(username);
    console.log(passward);

    try {
        const query = 'SELECT * FROM MANAGER WHERE USERNAME = :username AND PASSWARD = :passward';
        const params = { username, passward }; // Parameterized values
        const data = await runQuery(query, params);
        if (data.rows.length === 0) {
            res.status(401).send({ error: "Username not found" });
        } else {
            res.send(data.rows);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving MANAGER data");
    }
});

app.get('/books',async(req, res)=>{
    try{
        const query = 'SELECT * FROM BOOKS';
        const params = {}; // An empty object for consistency
        const data = await runQuery(query,params);
        res.json(data.rows);
    }catch(error){
        console.error(error);
        res.status(500).send("Error retrieving book data"); // You can customize the error message
    }
});

app.get('/buyoldbooks/:id/:totalcopy', async (req, res)=>{
    const id=req.params.id;
    const totalcopy=parseInt(req.params.totalcopy);
    console.log(id);
    console.log(totalcopy);
    
    try{
        const query='SELECT STOCK FROM BOOKS WHERE ID=:id';
        const params ={id};
        const prev_stock_result=await runQuery(query, params);
        const stockRow = prev_stock_result.rows[0];
        console.log(typeof stockRow.STOCK);
        //console.log(stockRow.STOCK);
        const prev_stock = parseInt(stockRow.STOCK);
        console.log(typeof prev_stock);
        //console.log(prev_stock);
        const present_stock = prev_stock +totalcopy;
        console.log(present_stock);
        const query1='UPDATE BOOKS SET STOCK=:present_stock WHERE ID=:id';
        const params1={present_stock,id};
        const data = await runQuery(query1,params1);
        res.status(200).json({ success: true, message: "old books added successfully" });
    } catch(error){
        console.error(error);
        res.status(500).send("Error retrieving customer data");
    }
});

//Look at here
const dbConfig ={
    user: "c##bookstore",
    password: "bookstore",
    connectString: "localhost/ORCL"
};

app.post("/sendCustomerOrders", async (req, res) => { // Make the function asynchronous
    console.log(req.body);
    if (req.body) {
      const receivedData = req.body;
 
    const employeeid =await  assignEmployeefromfunction();
      //console.log(employeeid+" now here empl "+typeof employeeid);
      const orderid =await getorderidfromfunction();
      //console.log(orderid+" now here"+typeof orderid);
      const customerIDD=req.session.customer_id;
      InsertIntoOrders(orderid,parseInt(customerIDD),employeeid,1.00);
      for (const customerId in receivedData) {
        if (Object.hasOwnProperty.call(receivedData, customerId)) {
          const orders = receivedData[customerId];
          //console.log(`Customer ID: ${customerId}`);
          let totalprice=0.00;
          
          for (const order of orders) {
            const { bookId, orderedAmount } = order;
            //console.log(`Book ID: ${bookId}, Ordered Amount: ${orderedAmount}`);
            try{
              // Use await here to wait for the asynchronous function to complete
                const bookInfo = await getBookSellInfo(bookId);
                const stock=bookInfo.stock;
                const price=bookInfo.price;
                const discount=bookInfo.discount;
                //console.log(discount+"di");
                let cangivenbook=parseInt(orderedAmount);
                let nextstock=stock-orderedAmount;
                if(stock<orderedAmount)
                {
                    cangivenbook=stock;
                    nextstock=0;
                }
                totalprice=totalprice+(price-price*discount/100)*cangivenbook;
                updateBookStock(bookId,nextstock);
                //console.log(typeof orderid+"orderid  "+bookId+" "+orderedAmount+" "+cangivenbook);
                InsertIntoOrderDetails(orderid,bookId,orderedAmount,cangivenbook);
                
              //console.log(`Book Stock: ${stock}, Price: ${price}, Discount: ${discount}`);
            } catch (error) {
              console.error(`Error getting book information for Book ID ${bookId}: ${error.message}`);
            }
          }
          try{
            //InsertIntoOrders(parseInt(orderid),parseInt(customerId),parseInt(employeeid),totalprice);
            addTotalPrice(orderid,totalprice);
        }catch{
          console.log(error);
      }
        }
      }
  
      res.json({ message: "Data received successfully." });
    } else {
      console.error("Received Data is empty or not in the expected format.");
      res.status(400).json({ error: "Invalid data format." });
    }
  });

  async function addTotalPrice(p_order_Id, p_price) {
    let connection;
  
    try {
      // Get a connection to the Oracle database
      connection = await oracledb.getConnection(dbConfig);
  
      // Create a PL/SQL block to call the procedure
      const plsql = `
        BEGIN
          ADD_TOTAL_PRICE(:p_order_id, :p_price);
        END;
      `;
  
      // Bind input parameters
      const bindParams = {
        p_order_id: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: p_order_Id },
        p_price: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: p_price },
        
      };
  
      // Execute the PL/SQL block
      await connection.execute(plsql, bindParams);
  
      // Commit the transaction (optional)
      await connection.commit();
  
      console.log('Procedure ADD_TOTAL_PRICE executed successfully.');
    } catch (error) {
      console.error('Error executing PL/SQL procedure:', error);
    } finally {
      if (connection) {
        try {
          // Release the database connection
          await connection.close();
        } catch (error) {
          console.error('Error closing the database connection:', error);
        }
      }
    }
  }

async function getBookSellInfo(bookId){
    let connection;
    try{
      // Establish a database connection
      connection = await oracledb.getConnection(dbConfig);
      // Define the PL/SQL block to call the procedure
      const plsql = `
        BEGIN
          BOOK_SELL_REQUIRED_INFO(:bookId, :bStock, :bPrice, :bDiscount);
        END;`;
  
      // Bind the input and output variables
      /*const bindVars={
        bookId: bookId,
        bStock: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        bPrice: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        bDiscount: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      };*/
  
      // Execute the PL/SQL block
      const result = await connection.execute(plsql, {
        bookId: bookId,
        bStock: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        bPrice: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        bDiscount: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
    });
  
      // Retrieve the output values
      const bStock = result.outBinds.bStock; // Access the first element
        const bPrice = result.outBinds.bPrice;
        const bDiscount = result.outBinds.bDiscount;
      console.log("bbvb"+result.outBinds.bPrice);
      return { stock: bStock, price: bPrice, discount: bDiscount };
    } catch (error) {
      console.error('Error:', error.message);
      throw error;
    } finally {
      if (connection) {
        try {
          // Release the database connection
          await connection.close();
        } catch (error) {
          console.error('Error closing connection:', error.message);
        }
      }
    }
  }

  async function assignEmployeefromfunction() {
    let connection;
    try {
      // Establish a connection to the database
      connection = await oracledb.getConnection(dbConfig);
  
      // Generate a random seed value
      const randomSeed = Math.floor(Math.random() * 1000000); // You can adjust the range as needed
  
      const plsql = `
        DECLARE
          v_employee_id NUMBER;
          v_seed NUMBER := :seed; -- Bind the random seed
        BEGIN
          -- Seed the random number generator with the provided seed
          DBMS_RANDOM.SEED(v_seed);
          v_employee_id := TO_NUMBER(ASSIGN_EMPLOYEE);
          :result := v_employee_id;
        END;
      `;
  
      // Bind the out parameter and the seed parameter
      const bindVars = {
        result: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        seed: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: randomSeed } // Bind the random seed
      };
  
      // Execute the PL/SQL block
      const result = await connection.execute(plsql, bindVars);
  
      // Extract the employee ID from the output
      const employeeId = result.outBinds.result;
  
      return employeeId;
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error(error);
        }
      }
    }
  }
  

  async function getorderidfromfunction() {
    let connection;
    try {
        // Establish a connection to the database
        connection = await oracledb.getConnection(dbConfig);

        // Create a PL/SQL block with the procedure call
        const plsql = `
        DECLARE
            v_order_id NUMBER;
        BEGIN
            -- Call the function to get the next order ID and assign it to v_order_id
            v_order_id := TO_NUMBER(GET_NEXT_ORDER_ID);  -- Assuming GET_NEXT_ORDER_ID is a function
            :result := v_order_id;
        END;
        `;

        // Bind the out parameter
        const bindVars = {
            result: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        // Execute the PL/SQL block
        const result = await connection.execute(plsql, bindVars);

        // Extract the Book ID from the output
        const orderid = result.outBinds.result;

        // Check if orderid is null or a valid value
        if (orderid === null) {
            console.log("Order ID is NULL.");
        } else {
            console.log("Order ID: " + orderid);
        }

        return orderid;
    } catch (error) {
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error(error);
            }
        }
    }
}


async function InsertIntoOrders(p_order_id, p_customer_id, p_employee_id, p_totalprice) {
    let connection;
    try {
      connection = await oracledb.getConnection(dbConfig);
      const plsql = `
        BEGIN
          INSERT_INTO_ORDERS(:p_order_id, :p_customer_id, :p_employee_id, :p_totalprice);
        END;
      `;
      console.log(p_order_id+typeof p_order_id);
      console.log(p_customer_id+typeof p_customer_id);
      console.log(p_employee_id+typeof p_employee_id);
        console.log(p_totalprice+typeof p_totalprice);
      //Bind input parameters with appropriate types and directions
      const bindParams = {
        p_order_id: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: p_order_id },
        p_customer_id: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: p_customer_id },
        p_employee_id: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: p_employee_id },
        p_totalprice: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: p_totalprice, scale: 2 }, // Use DB_TYPE_NUMBER with scale
      };
  
      // Execute the PL/SQL procedure
      await connection.execute(plsql, bindParams);
  
      // Commit the transaction
      await connection.commit();
      console.log('PL/SQL procedure executed successfully');
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error(error);
        }
      }
    }
  }
  
  

  async function InsertIntoOrderDetails(p_order_id, p_book_id, p_requested_copy, p_given_copy) {
    let connection;
    try {
      connection = await oracledb.getConnection(dbConfig);
      const plsql = `
        BEGIN
        INSERT_INTO_ORDERDETAILS(:p_order_id, :p_book_id, :p_requested_copy, :p_given_copy);
        END;
      `;
  
      // Bind input parameters
      const bindParams = {
        p_order_id: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: parseInt(p_order_id) },
        p_book_id: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: parseInt(p_book_id) },
        p_requested_copy: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: parseInt(p_requested_copy) },
        p_given_copy: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: parseInt(p_given_copy) },
      };
  
      // Execute the PL/SQL procedure
      await connection.execute(plsql, bindParams);
  
      // Commit the transaction
      await connection.commit();
      console.log('PL/SQL procedure has executed successfully');
    } catch (error) {
      console.error(`Error executing PL/SQL procedure: ${error.message}`);
      // Handle the error or log it as needed.
      throw error; // Rethrow the error if necessary.
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error(error);
        }
      }
    }
  }
  

async function updateBookStock( p_book_id,p_stock) {
    let connection;
    try {
      connection = await oracledb.getConnection(dbConfig);
      const plsql = `
        BEGIN
          UPDATE_BOOK_STOCK(:p_book_id, :p_stock);
        END;
      `;
  
      // Bind input parameters
      const bindParams = {
        p_book_id: p_book_id,
        p_stock: p_stock
      };
      // Execute the PL/SQL procedure
      await connection.execute(plsql, bindParams);
  
      // Commit the transaction
      await connection.commit();
      console.log('PL/SQL procedure executed successfully');
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error(error);
        }
      }
    }
  }
app.get('/book/:id', async (req, res) => {
    const id = req.params.id;
    try {
      const params = { id }; // Bind the 'id' value to the 'id' bind variable
      const query = 'SELECT * FROM BOOKS WHERE ID = :id'; // Define the SQL query with the ':id' bind variable
      const data = await runQuery(query, params); // Execute the query with the 'params' object
    //  console.log(data.rows);
      res.json(data.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving book data"); // Customize the error message
    }
  });
  app.get('/feedback/:id', async (req, res) => {
    const id = req.params.id;
    try {
      // Define the SQL query with a placeholder ":id" for binding
      const query = 'SELECT * FROM FEEDBACK WHERE BOOK_ID = :id';
  
      // Execute the query by passing the "id" parameter
      const data = await runQuery(query, { id });
  
      // Assuming "data.rows" contains the results from the database
      console.log(data.rows);
      console.log('Hi');
      // Send the results as a JSON response
      res.json(data.rows);
    } catch (error) {
      console.error(error);
  
      // Customize the error message and set a 500 Internal Server Error status
      res.status(500).send("Error retrieving book data");
    }
  });
  
async function getCustomerIdFromFunction(customername) {
    let connection;
    try {
        // Establish a connection to the database
        connection = await oracledb.getConnection(dbConfig);

        // Create a PL/SQL block with the function call
        const plsql = `
            DECLARE
                customer_id NUMBER;
            BEGIN
                customer_id := GET_CUSTOMER_ID(:customername);
                :result := customer_id; -- Returning the value into :result
            END;
        `;

        // Define an object to bind the input and output parameters
        const bindVars = {
            customername: customername,
            result: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        // Execute the PL/SQL block
        const result = await connection.execute(plsql, bindVars);
        // Extract the Customer ID from the output
        const customerId = result.outBinds.result;
        //console.log(customerId + "jjjjj");
        return customerId;
    } catch (error) {
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error(error);
            }
        }
    }
}

app.get('/customer/:customername', async (req, res) => {
    const customername = req.params.customername;
    console.log(customername + "108");
    try {
        const customerid = await getCustomerIdFromFunction(customername);
        const customerIdNumber = parseInt(customerid); // Convert to an integer

        // Send the customer ID as a JSON response
        res.status(200).json({ customerId: customerIdNumber }); // Use the appropriate status code and format
    } catch (error) {
        console.error(error);
        // Handle the error and send an appropriate error response
        res.status(500).json({ error: 'An error occurred while retrieving the customer ID.' }); // JSON error response
    }
});

async function handleImageUpload(uploadedImage, bookId){
    try {
        // Get the original file name and extension
        const originalFileName = uploadedImage.originalname;
        const imageExtension = path.extname(originalFileName);

        // Generate a unique filename for the image (e.g., book_id.jpg)
        const newImageName = `${bookId}${imageExtension}`;

        // Path to the Image folder
        const imagePath = path.join(__dirname, 'Image');

        // Move the uploaded image to the Image folder with the new name
        const newImagePath = path.join(imagePath, newImageName);
        fs.renameSync(uploadedImage.path, newImagePath);

        // Optionally, you might want to store the image data in your database
        //const imageId = await storeImageDataInDatabase(newImageName);

        // Return imageId for reference (modify this based on your database schema)
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Error handling image" };
    }
}

app.post('/uploadimage', upload.single('image'), async (req, res) => {
    try {
        // Step 1: Get the Book ID from your procedure or source
        const bookId = await getBookIdFromProcedure();

        if (!bookId) {
            res.status(400).json({ success: false, message: "Book ID not available" });
            return;
        }

        // Step 2: Handle image upload using the handleImageUpload function
        //const uploadedImage = req.file;
        //const imageUploadResult = await handleImageUpload(uploadedImage, bookId);

        /*if (!imageUploadResult.success) {
            res.status(500).json({ success: false, message: "Error handling image" });
            return;
        }*/

        // Step 3: Respond with success
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error handling image" });
    }
});

app.post('/addnewbooks', upload.single('image'), async (req, res) => {
    const title = req.body.title;
    console.log(title+"kjh");
    const isbn = req.body.isbn;
    console.log(isbn+"jkj");
    const categories = req.body.categories;
    const author = req.body.author;
    const publisher = req.body.publisher;
    const price = parseInt(req.body.price);
    const stock = parseInt(req.body.stock);
    const id=await getBookIdFromProcedure();
    console.log(id+"kjhgfdddd");

    try {
        // Handle image upload here
        if (!req.file) {
            res.status(400).json({ success: false, message: "Image file not provided" });
            return;
        }
        console.log(title+"kjh");
        

        //const imageId = imageUploadResult.imageId; // Modify this based on your image handling

        // Proceed with book information insertion
        const query2 = `INSERT INTO BOOKS(ID, TITLE, ISBN, CATEGORIES, AUTHOR, PUBLISHER, PRICE, STOCK)
                        VALUES(:id, :title, :isbn, :categories, :author, :publisher, :price, :stock)`;

        const params2 = {
            id: { val: id, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            title: { val: title, dir: oracledb.BIND_IN, type: oracledb.STRING },
            isbn: { val: isbn, dir: oracledb.BIND_IN, type: oracledb.STRING },
            categories: { val: categories, dir: oracledb.BIND_IN, type: oracledb.STRING },
            author: { val: author, dir: oracledb.BIND_IN, type: oracledb.STRING },
            publisher: { val: publisher, dir: oracledb.BIND_IN, type: oracledb.STRING },
            price: { val: price, dir: oracledb.BIND_IN, type: oracledb.NUMBER, precision: 10, scale: 2 },
            stock: { val: stock, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
            
        };

        await runQuery(query2, params2);
        const uploadedImage = req.file;

        const imageUploadResult = await handleImageUpload(uploadedImage,id);

        if (!imageUploadResult.success){
            res.status(500).json({ success: false, message: "Error uploading image" });
            return;
        }

        res.status(200).json({ success: true, message: "New book added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error inserting new book" });
    }
});

app.get('/offerdiscount/:id/:discount', async (req, res)=>{
    const id=parseInt(req.params.id);
    const discount=parseInt(req.params.discount);
    console.log(id);
    console.log(discount);
    try{
        const query='SELECT * FROM BOOKS WHERE ID=:id';
        const params={id};
        const data=await runQuery(query,params);
        if(data.rows==0)
        {
            console.log("Invalid Id");
            return;
        }
        const query1='UPDATE BOOKS SET DISCOUNT=:discount WHERE ID=:id';
        const params1={discount,id};
        const data1 = await runQuery(query1,params1);
        res.status(200).json({ success: true, message: "old books added successfully" });
    } catch(error){
        console.error(error);
        res.status(500).send("Error retrieving customer data");
    }
});

app.get('/total_customer/',async(req,res)=>{
    const plsqlblock=`
                        DECLARE TOTAL_NUM NUMBER;
                        BEGIN 
                        SELECT COUNT(*)INTO TOTAL_NUM  FROM CUSTOMER;
                        :result := TOTAL_NUM;
                    END;                    
    `;
    const bindParams ={
        result: {dir: oracledb.BIND_OUT, type: oracledb.NUMBER } // Binding for the result variable
    };

    try{
        const data=await runQuery(plsqlblock,bindParams);
        console.log(data.outBinds.result);
        res.send({customerCount: data.outBinds.result});
    }catch(error)
    {
        console.log(error);
    }
});

app.get('/total_titles/',async(req,res)=>{
    const plsqlblock=`
                        DECLARE TOTAL_TITLES NUMBER;
                        BEGIN 
                        SELECT COUNT(DISTINCT TITLE)INTO TOTAL_TITLES  FROM BOOKS;
                        :result := TOTAL_TITLES;
                    END;                    
    `;
    const bindParams ={
        result: {dir: oracledb.BIND_OUT, type: oracledb.NUMBER } // Binding for the result variable
    };

    try{
        const data=await runQuery(plsqlblock,bindParams);
        console.log(data.outBinds.result);
        res.send({titleCount: data.outBinds.result});
    }catch(error)
    {
        console.log(error);
    }
});

app.get('/inventory/',async(req,res)=>{
    const plsqlblock=`
                        DECLARE TOTAL_NUM NUMBER;
                        BEGIN 
                        SELECT SUM(STOCK) INTO TOTAL_NUM  FROM BOOKS;
                        :result := TOTAL_NUM;
                    END;                    
    `;
    const bindParams ={
        result: {dir: oracledb.BIND_OUT, type: oracledb.NUMBER } // Binding for the result variable
    };

    try{
        const data=await runQuery(plsqlblock,bindParams);
        console.log(data.outBinds.result);
        res.send({inventory: data.outBinds.result});
    }catch(error)
    {
        console.log(error);
    }
});

app.get('/stockvalue/',async(req,res)=>{
    const plsqlblock=`
                        DECLARE TOTAL_value NUMBER;
                        BEGIN 
                        SELECT SUM(STOCK*PRICE) INTO TOTAL_value  FROM BOOKS;
                        :result := TOTAL_value;
                    END;                    
    `;
    const bindParams ={
        result: {dir: oracledb.BIND_OUT, type: oracledb.NUMBER } // Binding for the result variable
    };

    try{
        const data=await runQuery(plsqlblock,bindParams);
        console.log(data.outBinds.result);
        res.send({stockvalue: data.outBinds.result});
    }catch(error)
    {
        console.log(error);
    }
});

app.get('/employeeinfo/',async(req,res)=>{
  try{
      const query=`SELECT * FROM EMPLOYEES NATURAL JOIN EMPLOYEE_SALARY`;
      const params={};
      const data=await runQuery(query,params);
      //console.log(data.rows);
      res.json(data.rows);
  }catch{
    console.log(error);
  }
});

app.get('/experiencedemployee/',async(req,res)=>{
  try{
      const query=`SELECT EMPLOYEE_ID FROM EMPLOYEES 
      WHERE MONTHS_BETWEEN(SYSDATE, HIRE_DATE) > 6 
      INTERSECT 
      SELECT EMPLOYEE_ID FROM ORDERS 
      GROUP BY EMPLOYEE_ID
      HAVING COUNT(*) >= 3
      `;
    const params={};
    const data=await runQuery(query,params);
    res.json(data.rows);
  }catch{
    console.log(error);
  }
});

app.get('/maxsalary/',async(req,res)=>{
  try{
      const query=`SELECT SALARY FROM EMPLOYEE_SALARY WHERE SALARY>=ALL(SELECT SALARY FROM EMPLOYEE_SALARY)`;
      const params={};
      const data=await runQuery(query,params);
      res.json(data.rows);
  }catch{
    console.log(error);
  }
  
});

app.get('/minsalary/',async(req,res)=>{
  try{
      const query=`SELECT SALARY FROM EMPLOYEE_SALARY WHERE SALARY<=ALL(SELECT SALARY FROM EMPLOYEE_SALARY)`;
      const params={};
      const data=await runQuery(query,params);
      res.json(data.rows);
  }catch{
    console.log(error);
  }
});

app.get('/employee/:employeeid', async (req, res) => {
  const employeeid = req.params.employeeid;
  //console.log(employeeid);
  try {
    const query = 'SELECT * FROM EMPLOYEES WHERE EMPLOYEE_ID = :employeeid';
    const params = { employeeid };
    const data = await runQuery(query, params);
    //console.log(data.rows);
    res.json(data.rows);
  } catch (error) {
    console.log(error);
  }
});

app.put('/updatesalary/:employee_id/salary', async (req, res) => {
  const newSal = req.body.salary; // Assuming you're sending the new salary in the request body
  const employee_id = req.params.employee_id;
  try{
    const query = 'UPDATE EMPLOYEE_SALARY SET SALARY = :newSal WHERE EMPLOYEE_ID = :employee_id';
    const params = { newSal, employee_id };
    const data = await runQuery(query, params);
    if (data) {
      res.status(200).json({ success: true, message: "Salary updated successfully" });
    } else {
      res.status(404).json({ success: false, message: "Employee not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});



app.listen(3005,()=>{
        console.log("Server connected");
});

//module.exports = app;