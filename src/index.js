import dotenv from "dotenv"
import app from "./app.js"
import connectDB from "./db/index.js"

dotenv.config({
    path:"./.env"
})



const port = process.env.PORT ||3000

// When the database succesfully get connected then and only run the "then" cmd
connectDB()
  .then(()=>{
    app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})
  })
  .catch((err) =>{
    console.log("MongoDB Connection Error",err);
    process.exit(1)
    
  })





