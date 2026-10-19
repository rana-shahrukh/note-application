const express = require("express");
const mongoose = require("mongoose");

const app = express();

const PORT = process.env.PORT || 3000;

const MONGO_URI =
    process.env.MONGO_URI || "mongodb://localhost:27017/notesdb";

app.use(express.json());

// Define the note schema
const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            default: "",
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Note = mongoose.model("Note", noteSchema);

// Home endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Docker Notes API is running",
        endpoints: [
            "GET /health",
            "GET /api/notes",
            "POST /api/notes",
            "GET /api/notes/:id",
            "DELETE /api/notes/:id"
        ]
    });
});

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok"
    });
});

// Get all notes
app.get("/api/notes", async (req, res, next) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });

        res.json(notes);
    } catch (error) {
        next(error);
    }
});

// Create a note
app.post("/api/notes", async (req, res, next) => {
    try {
        const title =
            typeof req.body.title === "string"
                ? req.body.title.trim()
                : "";

        const content =
            typeof req.body.content === "string"
                ? req.body.content.trim()
                : "";

        if (!title) {
            return res.status(400).json({
                error: "title is required"
            });
        }

        const note = await Note.create({
            title,
            content
        });

        res.status(201).json(note);
    } catch (error) {
        next(error);
    }
});


//  For hello world


app.post("/hello", (req, res) => {
  res.send("Hello World!");
});


// Get a specific note
app.get("/api/notes/:id", async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                error: "Invalid note ID"
            });
        }

        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                error: "Note not found"
            });
        }

        res.json(note);
    } catch (error) {
        next(error);
    }
});

// Delete a note
app.delete("/api/notes/:id", async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                error: "Invalid note ID"
            });
        }

        const note = await Note.findByIdAndDelete(req.params.id);

        if (!note) {
            return res.status(404).json({
                error: "Note not found"
            });
        }

        res.json({
            message: "Note deleted"
        });
    } catch (error) {
        next(error);
    }
});

// Error handler
app.use((error, req, res, next) => {
    console.error(error);

    res.status(500).json({
        error: "Internal server error"
    });
});

// Connect to MongoDB and start the server
async function start() {
    await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000
    });

    console.log("Connected to MongoDB");

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Application running on port ${PORT}`);
    });
}

start().catch((error) => {
    console.error("Could not connect to MongoDB:", error.message);
    process.exit(1);
});
