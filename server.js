const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
const app = express();
const PORT = 3000;


// PostgreSQL configuration
const pool = new Pool({
  user: "ilja",
  host: "localhost",
  database: "airbnb",
  password: "password",
  port: 5432, // default PostgreSQL port
});

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    console.log(email)
    try {
      // Insert the new user into the users table
      const query = "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)";
      await pool.query(query, [name, email, password]);
  
      res.status(200).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "An error occurred while registering the user" });
    }
  });

  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
  
    try {
      // Use the PostgreSQL client to execute a query
      const query = "SELECT * FROM users WHERE email = $1";
      const result = await pool.query(query, [email]);
  
      if (result.rows.length === 0) {
        // User not found
        res.status(404).json({ message: "User not found." });
      } else {
        const user = result.rows[0];
  
        if (user.password === password) {
          // Passwords match
          res.status(200).json({ message: "Password is correct.", user: user });
        } else {
          // Passwords do not match
          res.status(401).json({ message: "Incorrect password." });
        }
      }
    } catch (error) {
      console.error("Error checking user:", error);
      res.status(500).json({ message: "An error occurred while checking the user." });
    }
  });
  
  app.post("/getuserdata", async (req, res) => {
    const { email } = req.body;
  console.log(email)
    try {
      // Find the user by email in the users table
      const query = "SELECT name FROM users WHERE email = $1";
      const result = await pool.query(query, [email]);
  
      if (result.rows.length === 0) {
        res.status(404).json({ message: "User not found" });
      } else {
        const name = result.rows[0].name;
        res.status(200).json({ name });
      }
    } catch (error) {
      console.error("Error retrieving user:", error);
      res.status(500).json({ message: "An error occurred while retrieving the user" });
    }
  });

// POST request handler for retrieving property data by propertyId
app.post("/property", async (req, res) => {
  try {
    const propertyId = req.body.id;
    console.log(propertyId)
    // Query to retrieve property data by propertyId
    const query = 'SELECT * FROM properties WHERE id = $1';
    const values = [propertyId];

    // Execute the query
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = result.rows[0];
    console.log(property)
    return res.json(property);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/reservation', (req, res) => {
    const { checkinDate, checkoutDate, numberOfGuests, useremail, username } = req.body;
    console.log(checkinDate, checkoutDate, numberOfGuests, useremail, username)
    // Insert the data into the 'requests' table
    const query = 'INSERT INTO requests (checkindate, checkoutdate, numberofguests, useremail, username) VALUES ($1, $2, $3, $4, $5)';
    const values = [checkinDate, checkoutDate, numberOfGuests, useremail, username];
    console.log(values)
    pool.query(query, values, (error) => {
      if (error) {
        console.error('Error inserting data into the table:', error);
        res.sendStatus(500);
      } else {
        console.log('Data inserted successfully');
        res.sendStatus(200);
      }
    });
  });

  app.get('/properties', async (req, res) => {
    try {
      // Query to retrieve id and pricepernight of all properties
      const query = 'SELECT id, pricepernight FROM properties';
  
      // Execute the query
      const result = await pool.query(query);
  
      const properties = result.rows;
  
      res.status(200).json(properties);
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

  app.post('/images', (req, res) => {
    const { id } = req.body;
    console.log(id)
  
    // Check if the ID is valid (you can add your own validation logic here)
    if (!id) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
  
    const imagePath = path.join(__dirname, `${id}.jpeg`);
  
    // Send the image file
    res.sendFile(imagePath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  });

  app.get('/images/:id', (req, res) => {
    const { id } = req.params;
    console.log(id)
  
    // Check if the ID is valid (you can add your own validation logic here)
    if (!id) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
  
    const imagePath = path.join(__dirname, `${id}.jpeg`);
  
    // Send the image file
    res.sendFile(imagePath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  });

  app.get('/properties/:id', async (req, res) => {
    const { id } = req.params;
    try {
      // Query the PostgreSQL table to retrieve property data by ID
      const query = 'SELECT * FROM properties WHERE id = $1';
      const result = await pool.query(query, [id]);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Property not found' });
      }
  
      // Return the property data to the frontend
      const property = result.rows[0];
      res.json(property);
    } catch (error) {
      console.error('Error retrieving property data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
