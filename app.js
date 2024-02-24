const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'moviesData.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const convertDbObjectTOResponseObject = dbobject => {
  return {
    movieId: dbobject.movie_id,
    directorId: dbobject.director_id,
    movieName: dbobject.movie_name,
    leadActor: dbobject.lead_actor,
  }
}

const convertObjectToResponseObject = dbObjects => {
  return {
    directorID: dbObjects.director_id,
    directorName: dbObjects.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getMovieQuery = `
  SELECT
  *
  FROM
  movie;`
  const moviesArray = await database.all(getMovieQuery)
  response.send(
    moviesArray.map(eachMovie => convertDbObjectTOResponseObject(eachMovie)),
  )
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
  SELECT
  *
  FROM
    movie
  WHERE 
  movie_id = '${movieId}';`
  const movies = await database.all(getMovieQuery)
  response.send(convertDbObjectTOResponseObject(movies))
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMoviesQuery = `
  INSERT INTO
    movie (director_id,movie_name,lead_actor)
  VALUES
    (${directorId}, '${movieName}', '${leadActor}');`
  const movies = await database.run(postMoviesQuery)
  response.send('Movie Successfully Added')
})

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const updateMovieQuery = `
  
  UPDATE 
    movie
  SET
    director_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
  WHERE
    movie_id = ${movieId};`

  await database.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
    DELETE FROM 
      movie
    WHERE 
      movie_id = ${movieId};`
  await database.run(deleteMovieQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getDirectorQuery = `
  SELECT
  *
  FROM
  director;`
  const directorArray = await database.all(getDirectorQuery)
  response.send(
    directorArray.map(eachDirector =>
      convertObjectToResponseObject(eachDirector),
    ),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorID} = request.params
  const getDirectorQuery = `
  SELECT
  *
  FROM
    movie
  WHERE 
    director_id = ${directorID};`
  const directorArray = await database.all(getDirectorQuery)
  response.send(convertObjectToResponseObject(directorArray))
})

module.exports = app
