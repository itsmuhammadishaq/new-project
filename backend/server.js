const express = require("express")
const notes=require("./data/notes")
const dotenv=require('dotenv')
const app  = express();
dotenv.config()

app.get("/",(req,resp)=>{
    resp.send("api is runing")
})
app.get('/api/notes',(req,resp)=>{
    resp.json(notes)
})
app.get('/api/notes/:id',(req,resp)=>{
    const note=notes.find((n)=>n._id===req.params.id)
    resp.send(note)
})
const port=process.env.port ||5000;
app.listen(port,console.log(`hey this is new file ${port}`))