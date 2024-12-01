import express from "express";
const app = express();
import cors from "cors"

const PORT = 5000;

let remainingSeconds = 0;

app.use(cors());
app.use(express.json());

app.get("/timer", (req, res) => {
    res.json({remainingSeconds})
});

app.post("/timer", (req, res) => {
    const { seconds } = req.body;
    if (typeof seconds === 'number') {
        remainingSeconds = seconds;
        console.log(remainingSeconds);
        res.json({ remainingSeconds });  // Send back the updated timer state as JSON
    } else {
        res.status(400).json({ error: "Invalid input" });  // Send a JSON error response
    }
});



app.listen(PORT, (error) =>{
    if(!error)
        console.log(`Server is running at http://localhost:${PORT}/`);
    else
        console.log("Error occurred, server can't start", error);
})
