var express = require("express");
var router = express.Router();
const authorization = require("../middleware/authorization");
const query = require("../middleware/query");
const parse = require("../middleware/parse");
const send = require("../middleware/send");
const toNumber = require("../utils/types").toNumber;

/**
 * Converts a map of column names to field names into a select query
 * @param map Map of column names to field names
 * @returns An array of strings that can be used in a select query
 */
function selectQueryFromMap(map) {
  return Object.keys(map).map((key) => {
    return `${key} as ${map[key]}`;
  });
}

// Maps the column names from the basics table to the field names in the API
const PERSON_MAP = {
  "names.nconst": "id",
  primaryName: "name",
  birthYear: "birthYear",
  deathYear: "deathYear",
  primaryTitle: "movieName",
  "basics.tconst": "movieId",
  category: "category",
  characters: "characters",
  imdbRating: "imdbRating",
};

/**
 * Gets the data for a person given their ID
 * @param knex The knex instance
 * @param id The ID of the person
 * @returns The data for the person
 */
async function getPersonData({ knex, id }) {
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
    };
  }
  return {
    name: raw[0].name,
    birthYear: raw[0].birthYear,
    deathYear: raw[0].deathYear,
    roles: raw.map((row) => {
      const characters = row.characters
        .replace(/[\[\]"]+/g, "")
        .split(",")
        .filter((character) => character.length > 0);
      return {
        movieName: row.movieName,
        movieId: row.movieId,
        category: row.category,
        characters: characters,
        imdbRating: toNumber(row.imdbRating),
      };
    }),
  };
}

// GET /people/:id endpoint
router.get(
  "/:id",
  authorization,
  parse((req) => {
    if (Object.keys(req.query).length > 0) {
      const query = Object.keys(req.query)
        .map((key) => key)
        .join(", ");
      throw {
        code: 400,
        message: `Invalid query parameters: ${query}. Query parameters are not permitted.`,
      };
    }
    return {
      id: req.params.id,
    };
  }),
  query(getPersonData),
  send
);

module.exports = router;
