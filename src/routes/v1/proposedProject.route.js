/** ***************** package Import ******************************************************** */

const express = require("express");

/** ***************** auth , validate from middleware Import ******************************************************** */

const auth = require("../../middleware/auth");
const validate = require("../../middleware/validate");

/** ***************** pillar Validation from validation Import ******************************************************** */

const proposedProjectValidation = require("../../validations/proposedProject.validation");

/** ***************** pillarController from controller Import ******************************************************** */

const proposedProjectController = require("../../controllers/proposedProject.controller");

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
    auth("manageProposedProject"),
    validate(proposedProjectValidation.createProposedProject),
    proposedProjectController.createProposedProject
  )
  .get(
    auth("getProposedProject"),
    validate(proposedProjectValidation.getProposedProject),
    proposedProjectController.getProposedProjects
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
  .route("/:proposedId")
  // .get(
  //   auth("getPillar"),
  //   validate(proposedProjectValidation.getPillar),
  //   proposedProjectController.getPillar
  // )
  .put(
    auth("manageProposedProject"),
    validate(proposedProjectValidation.updateProposedProject),
    proposedProjectController.updateProposedProject
  );
// .delete(
//   auth("managePillar"),
//   validate(proposedProjectValidation.deletePillar),
//   proposedProjectController.deletePillar
// );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: ProposedProject
 *   description: proposedProject management and retrieval
 */

/**
 * @swagger
 * path:
 *  /proposedProject:
 *    post:
 *      summary: Create a pillar
 *      description: Only admins can create other pillars.
 *      tags: [ProposedProject]
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
 *                proposedProject:
 *                  type: string
 *                status:
 *                  type: string
 *                createdBy:
 *                  type: string
 *                updatedBy:
 *                  type: number
 *                isActive:
 *                  type: boolean
 *              example:
 *                userId: "1"
 *                proposedProject: "project 1"
 *                description: "project description"
 *                status: "pending"
 *                isActive: true
 *
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/proposedProject'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *
 *    get:
 *      summary: Get all pillars
 *      description: Only admins can retrieve all users.
 *      tags: [ProposedProject]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: userId
 *          schema:
 *            type: string
 *          description: userId
 *        - in: query
 *          name: proposedProject
 *          schema:
 *            type: string
 *          description: proposed project
 *        - in: query
 *          name: status
 *          schema:
 *            type: string
 *          description: status
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
 *                      $ref: '#/components/schemas/proposedProject'
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
 *  /proposedProject/{id}:
 *
 *    put:
 *      summary: Update a pillar
 *      description: Logged in users can only update their own information. Only admins can update other users.
 *      tags: [ProposedProject]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: proposed id
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
 *                proposedProject:
 *                  type: string
 *                description:
 *                  type: string
 *                isActive:
 *                  type: boolean
 *              example:
 *                userId: "1"
 *                proposedProject: "project 1"
 *                description: "project description"
 *                status: "pending"
 *                isActive: true
 *
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/proposedProject'
 *        "400":
 *          $ref: '#/components/responses/DuplicateEmail'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 */
