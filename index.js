import express from "express";
import { nanoid } from "nanoid";
import { readFile, writeFile } from "node:fs/promises";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server en puerto: http://localhost:${PORT}`);
});

app.get("/", async (req, res) => {
  const path = "index.html";
  const fsRes = await readFile(`${path}`, "utf-8");
  res.send(fsRes);
});

app.get("/canciones", async (req, res) => {
  const fsResponse = await readFile("repertoire.json", "utf-8");
  res.send(fsResponse);
});

app.get("/canciones/:id", async (req, res) => {
  const { id } = req.params;
  const fsResponse = await readFile(`repertoire.json`, "utf-8");
  const json = JSON.parse(fsResponse);
  const song = json.find((song) => song.id === id);
  if (song) {
    res.send(song);
  } else {
    res.status(404).send("Canción no encontrada");
  }
});

app.post("/canciones", async (req, res) => {
  const { title, artist, tone } = req.body; /* Extraccion de datos body */

  const newSong = {
    id: nanoid(),
    title,
    artist,
    tone,
  };

  const fsRes = await readFile("repertoire.json", "utf-8"),
    data = JSON.parse(fsRes);

  data.push(newSong);
  await writeFile("repertoire.json", JSON.stringify(data));
  res.status(200).json({
    ok: true,
    msg: "Canción añadida",
    cancion: newSong,
  });
});

app.delete("/canciones/:id", async (req, res) => {
  const fsRes = await readFile("repertoire.json", "utf-8");
  const data = JSON.parse(fsRes);
  const id = req.params.id;
  const song = data.filter((song) => song.id !== id);
  await writeFile("repertoire.json", JSON.stringify(song));
  res.status(200).json({
    ok: true,
    msg: "Canción eliminada",
    cancion: song,
  });
});

app.put("/canciones/:id", async (req, res) => {
  const id = req.params.id;
  const { title, artist, tone } = req.body;

  if (!title || !artist || !tone) {
    return res
      .status(400)
      .json({ ok: false, msg: "Por favor, complete todos los datos" });
  }

  const fsRes = await readFile("repertoire.json", "utf-8");
  const data = JSON.parse(fsRes);
  const newSong = data.map((song) => {
    if (song.id === id) {
      return {
        ...song,
        title,
        artist,
        tone,
      };
    } else {
      return song;
    }
  });
  await writeFile("repertoire.json", JSON.stringify(newSong));
  res.status(201).json({
    ok: true,
    msg: "Canción editada",
    cancion: newSong,
  });
});
