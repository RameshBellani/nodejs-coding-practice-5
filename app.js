const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const convertDbToResponse = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/movies/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};

convertDbToResponse();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorObjectToResponseObject = (DiObject) => {
  return {
    directorId: DiObject.director_id,
    directorName: DiObject.director_name,
  };
};

//get Returns a list of all movie names in the movie table

app.get("/movies/", async (request, response) => {
  const movieNameQuery = `SELECT movie_name FROM Movie;`;
  const movieName = await db.all(movieNameQuery);
  response.send(
    movieName.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

// post Creates a new movie in the movie table. `movie_id` is auto-incremented

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `INSERT INTO Movie (director_id, movie_name, lead_actor)
    VALUES 
    ('${directorId}', '${movieName}','${leadActor}');`;
  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//Returns a movie based on the movie ID GET

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery = `SELECT * FROM Movie WHERE movie_id = '${movieId}';`;
  const movie1 = await db.get(movieQuery);
  response.send(convertDbObjectToResponseObject(movie1));
});

//Updates the details of a movie in the movie table based on the movie ID

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `UPDATE Movie
  SET 
  director_id = '${directorId}',
  movie_name = '${movieName}',
  lead_actor = '${leadActor}'
  WHERE movie_id = '${movieId}';`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Deletes a movie from the movie table based on the movie ID

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM Movie WHERE movie_id = '${movieId}';`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Returns a list of all directors in the director table

app.get("/directors/", async (request, response) => {
  const directorListQuery = `SELECT * FROM Director;`;
  const directorArray = await db.all(directorListQuery);
  response.send(
    directorArray.map((eachDirector) =>
      convertDirectorObjectToResponseObject(eachDirector)
    )
  );
});

//Returns a list of all movie names directed by a specific director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorMovieQuery = `SELECT movie_name FROM Movie WHERE director_id = '${directorId}';`;
  const movieNamesArray = await db.all(directorMovieQuery);
  response.send(
    movieNamesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
