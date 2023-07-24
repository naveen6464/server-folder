/** ***************** package Import ******************************************************** */

const express = require("express");

/** ***************** auth , validate from middleware Import ******************************************************** */

const auth = require("../../middleware/auth");
const validate = require("../../middleware/validate");

/** ***************** location Validation from validation Import ******************************************************** */

const locationValidation = require("../../validations/location.validation");

/** ***************** locationController from controller Import ******************************************************** */

const locationController = require("../../controllers/location.controller");

const router = express.Router();

/*
path - /
router to create location and get location
post - to create location from getting location inputs
get - to show the gathered location details to admin or user
function auth - This function is to authenticate the valid location by tokens
function validate - This function is to validate the location input 
function locationController - This function is to create the location after the auth and validation completed

*/

router
  .route("/")
  .post(
    auth("manageLocation"),
    validate(locationValidation.createLocation),
    locationController.createLocation
  )
  .get(
    auth("getLocations"),
    validate(locationValidation.getLocations),
    locationController.getLocations
  );

/*
path - /:locationId
router to get location by id , update location by id and to delete location by id
post - to create location from getting location inputs
get - to show the gathered location details to admin or location
put - to update the collection 
delete - the delete is used to delete the location based on id given
function auth - This function is to authenticate the valid location by tokens
function validate - This function is to validate the location input 
function locationController - This function is to create the location after the auth and validation completed
*/
router
  .route("/:locationId")
  .get(
    auth("getLocation"),
    validate(locationValidation.getLocation),
    locationController.getLocation
  )
  .put(
    auth("manageLocation"),
    validate(locationValidation.updateLocation),
    locationController.updateLocation
  )
  .delete(
    auth("manageLocation"),
    validate(locationValidation.deleteLocation),
    locationController.deleteLocation
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: location management and retrieval
 */

/**
 * @swagger
 * path:
 *  /location:
 *    post:
 *      summary: Create a location
 *      description: Only admins can create other locations.
 *      tags: [Locations]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - location
 *                - isActive
 *              properties:
 *                location:
 *                  type: string
 *                isActive:
 *                  type: boolean
 *              example:
 *                location: "VNC"
 *                isActive: true
 *
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Location'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *
 *    get:
 *      summary: Get all locations
 *      description: Only admins can retrieve all users.
 *      tags: [Locations]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: location
 *          schema:
 *            type: string
 *          description: location
 *        - in: query
 *          name: sortBy
 *          schema:
 *            type: string
 *          description: sort by query in the form of field:desc/asc (ex. name:asc)
 *        - in: query
 *          name: limit
 *          schema:
 *            type: integer
 *            minimum: 1
 *          default: 10
 *          description: Maximum number of users
 *        - in: query
 *          name: page
 *          schema:
 *            type: integer
 *            minimum: 1
 *            default: 1
 *          description: Page number
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  results:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/Location'
 *                  page:
 *                    type: integer
 *                    example: 1
 *                  limit:
 *                    type: integer
 *                    example: 10
 *                  totalPages:
 *                    type: integer
 *                    example: 1
 *                  totalResults:
 *                    type: integer
 *                    example: 1
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * path:
 *  /location/{id}:
 *    get:
 *      summary: Get a location
 *      description: Logged in users can fetch only their own user information. Only admins can fetch other users.
 *      tags: [Locations]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Location id
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Location'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    put:
 *      summary: Update a location
 *      description: Logged in users can only update their own information. Only admins can update other users.
 *      tags: [Locations]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Location id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - userId
 *                - title
 *                - isActive
 *              properties:
 *                location:
 *                  type: string
 *                isActive:
 *                  type: boolean
 *              example:
 *                location: "VNC"
 *                isActive: true
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Location'
 *        "400":
 *          $ref: '#/components/responses/DuplicateEmail'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    delete:
 *      summary: Delete a location
 *      description: Logged in users can delete only themselves. Only admins can delete other users.
 *      tags: [Locations]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Location id
 *      responses:
 *        "200":
 *          description: No content
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */
