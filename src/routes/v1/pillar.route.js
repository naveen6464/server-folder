/** ***************** package Import ******************************************************** */

const express = require("express");

/** ***************** auth , validate from middleware Import ******************************************************** */

const auth = require("../../middleware/auth");
const validate = require("../../middleware/validate");

/** ***************** pillar Validation from validation Import ******************************************************** */

const pillarValidation = require("../../validations/pillar.validation");

/** ***************** pillarController from controller Import ******************************************************** */

const pillarController = require("../../controllers/pillar.controller");

const router = express.Router();

/*
path - /
router to create pillar and get pillar
post - to create pillar from getting pillar inputs
get - to show the gathered pillar details to admin or user
function auth - This function is to authenticate the valid pillar by tokens
function validate - This function is to validate the pillar input 
function pillarController - This function is to create the pillar after the auth and validation completed

*/

router
  .route("/")
  .post(
    auth("managePillar"),
    validate(pillarValidation.createPillar),
    pillarController.createPillar
  )
  .get(
    auth("getPillars"),
    validate(pillarValidation.getPillars),
    pillarController.getPillars
  );

/*
path - /:pillarId
router to get pillar by id , update pillar by id and to delete pillar by id
post - to create pillar from getting pillar inputs
get - to show the gathered pillar details to admin or pillar
put - to update the collection 
delete - the delete is used to delete the pillar based on id given
function auth - This function is to authenticate the valid pillar by tokens
function validate - This function is to validate the pillar input 
function pillarController - This function is to create the pillar after the auth and validation completed

*/
router
  .route("/:pillarId")
  .get(
    auth("getPillar"),
    validate(pillarValidation.getPillar),
    pillarController.getPillar
  )
  .put(
    auth("managePillar"),
    validate(pillarValidation.updatePillar),
    pillarController.updatePillar
  )
  .delete(
    auth("managePillar"),
    validate(pillarValidation.deletePillar),
    pillarController.deletePillar
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Pillars
 *   description: pillar management and retrieval
 */

/**
 * @swagger
 * path:
 *  /pillars:
 *    post:
 *      summary: Create a pillar
 *      description: Only admins can create other pillars.
 *      tags: [Pillars]
 *      security:
 *        - bearerAuth: []
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
 *                userId:
 *                  type: string
 *                title:
 *                  type: string
 *                description:
 *                  type: string
 *                projectCount:
 *                  type: number
 *                isActive:
 *                  type: boolean
 *              example:
 *                title: "Corporate Governance"
 *                description: "Corporate Governance (board versus executive management)"
 *                isActive: true
 *
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Pillar'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *
 *    get:
 *      summary: Get all pillars
 *      description: Only admins can retrieve all users.
 *      tags: [Pillars]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: title
 *          schema:
 *            type: string
 *          description: title name
 *        - in: query
 *          name: createdBy
 *          schema:
 *            type: string
 *          description: createdBy
 *        - in: query
 *          name: isActive
 *          schema:
 *            type: string
 *          description: is Active
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
 *                      $ref: '#/components/schemas/Pillar'
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
 *  /pillars/{id}:
 *    get:
 *      summary: Get a pillar
 *      description: Logged in users can fetch only their own user information. Only admins can fetch other users.
 *      tags: [Pillars]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Pillar id
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Pillar'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    put:
 *      summary: Update a pillar
 *      description: Logged in users can only update their own information. Only admins can update other users.
 *      tags: [Pillars]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Pillar id
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
 *                userId:
 *                  type: string
 *                title:
 *                  type: string
 *                description:
 *                  type: string
 *                isActive:
 *                  type: boolean
 *              example:
 *                title: "Corporate Governance"
 *                description: "Corporate Governance (board versus executive management)"
 *                isActive: true
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Pillar'
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
 *      summary: Delete a pillar
 *      description: Logged in users can delete only themselves. Only admins can delete other users.
 *      tags: [Pillars]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Pillar id
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
