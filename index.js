const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const port = process.env.PORT || 9000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
app.use(express.json());
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7jyxnen.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let taskCollection;

async function run() {
  try {

    console.log("Connected to MongoDB");

    taskCollection = client.db('TaskList').collection('tasklist');
    console.log("Database and collection are ready.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

app.post('/tasklist', async (req, res) => {
  try {
    const newTask = req.body;
    const result = await taskCollection.insertOne(newTask);
    res.send(result)
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get('/tasklist',async(req,res)=>{
    const cursor = taskCollection.find();
    const result = await cursor.toArray()
    res.send(result)


})

// Update a task by ID
app.put('/tasklist/:id', async (req, res) => {
  const id = new ObjectId(req.params.id);
  const body = req.body;

  // Remove the _id field from the update, as it cannot be modified
  delete body._id;

  const updateProduct = {
    $set: body,
  };

  const result = await taskCollection.updateOne({ _id: id }, updateProduct);

  console.log(body);
  res.send(result);
});


// Delete a task by ID
app.delete('/tasklist/:id', async (req, res) => {
  try {
    const taskId = req.params.id;

    const result = await taskCollection.deleteOne({ _id: new ObjectId(taskId)});

    if (result.deletedCount > 0) {
      res.send("Task deleted successfully");
    } else {
      res.status(404).send("Task not found");
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).send("Internal Server Error");
  }
});
// get by id
app.get('/tasklist/:id', async(req,res)=>{
  try{
    const id = req.params.id;
    const query = await taskCollection.findOne({_id:new ObjectId(id)})
    res.send(query)
  }catch(error){
    console.log('Error getting task by id : ', error);
  }
})
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
