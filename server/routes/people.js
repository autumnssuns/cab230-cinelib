var express = require("express");
var router = express.Router();
const authorization = require("../middleware/authorization");

function selectQueryFromMap(map) {
  return Object.keys(map).map((key) => {
    return `${key} as ${map[key]}`;
  });
}

const PERSON_MAP = {
  "names.nconst": "id",
  primaryName: "name",
  birthYear: "birthYear",
  deathYear: "deathYear",
  primaryTitle:"movieName",
  "basics.tconst":"movieId",
  category:"category",
  characters:"characters",
  imdbRating:"imdbRating",
}

async function getPersonData(knex, id){
  const selectFields = selectQueryFromMap(PERSON_MAP);
  const raw = await knex("names")
    .join("principals", "principals.nconst", "names.nconst")
    .join("basics", "principals.tconst", "basics.tconst")
    .select(selectFields)
    .where("names.nconst", id);
  
  if (raw.length === 0) {
    throw new Error("No record exists of a person with this ID");
  }

  return {
    name: raw[0].name,
    birthYear: raw[0].birthYear,
    deathYear: raw[0].deathYear,
    roles: raw.map((row) => {
      return {
        movieName: row.movieName,
        movieId: row.movieId,
        category: row.category,
        characters: row.characters.split(","),
        imdbRating: row.imdbRating,
      };
    })
  }
}

router.get("/:id", authorization, function (req, res, next) {
  const id = req.params.id;
  const knex = req.db;
  getPersonData(knex, id).then((data) => {
    res.json(data);
  }).catch((error) => {
    res.status(400).json({ error: true, message: error.message });
  });
})

module.exports = router;
