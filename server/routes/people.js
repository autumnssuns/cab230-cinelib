var express = require("express");
var router = express.Router();
const authorization = require("../middleware/authorization");
const query = require("../middleware/query");
const parse = require("../middleware/parse");
const send = require("../middleware/send");
const toNumber = require("../utils/types").toNumber;

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

async function getPersonData({knex, id}){
  console.log("getPersonData", id);
  const selectFields = selectQueryFromMap(PERSON_MAP);
  const raw = await knex("names")
    .join("principals", "principals.nconst", "names.nconst")
    .join("basics", "principals.tconst", "basics.tconst")
    .select(selectFields)
    .where("names.nconst", id);
  
  if (raw.length === 0) {
    throw {
      code: 404,
      message: "No record exists of a person with this ID",
    }
  }

  return {
    name: raw[0].name,
    birthYear: raw[0].birthYear,
    deathYear: raw[0].deathYear,
    roles: raw.map((row) => {
      const characters = row.characters
      .replace(/[\[\]"]+/g, "")
      .split(",")
      .filter(character => character.length > 0);
      return {
        movieName: row.movieName,
        movieId: row.movieId,
        category: row.category,
        characters: characters,
        imdbRating: toNumber(row.imdbRating),
      };
    })
  }
}

router.get("/:id", authorization, parse((req) => {
  if (Object.keys(req.query).length > 0) {
    const query = Object.keys(req.query).map(key => key).join(", ");
    throw {
      code: 400,
      message: `Invalid query parameters: ${query}. Query parameters are not permitted.`
    }
  }
  return {
    id: req.params.id,
  };
}), query(getPersonData), send)

module.exports = router;
