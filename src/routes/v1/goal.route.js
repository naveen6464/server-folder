/** ***************** package Import ******************************************************** */

const express = require("express");

/** ***************** auth , validate from middleware Import ******************************************************** */

const auth = require("../../middleware/auth");
const validate = require("../../middleware/validate");

/** ***************** goal Validation from validation Import ******************************************************** */

const goalValidation = require("../../validations/goal.validation");

/** ***************** goalController from controller Import ******************************************************** */

const goalController = require("../../controllers/goal.controller");

const router = express.Router();

/*
path - /
router to create goal and get goal
post - to create goal from getting goal inputs
get - to show the gathered goal details to admin or user
function auth - This function is to authenticate the valid goal by tokens
function validate - This function is to validate the goal input 
function goalController - This function is to create the goal after the auth and validation completed

*/
router
  .route("/")
  .post(
    auth("manageGoal"),
    validate(goalValidation.createGoal),
    goalController.createGoal
  )
  .get(
    auth("getGoals"),
    validate(goalValidation.getGoals),
    goalController.getGoals
  );

/*
path - /:goalId
router to get goal by id , update goal by id and to delete goal by id
post - to create goal from getting goal inputs
get - to show the gathered goal details to admin or goal
put - to update the collection 
delete - the delete is used to delete the goal based on id given
function auth - This function is to authenticate the valid goal by tokens
function validate - This function is to validate the goal input 
function goalController - This function is to create the goal after the auth and validation completed

*/

router
  .route("/:goalId")
  .get(
    auth("getGoal"),
    validate(goalValidation.getGoal),
    goalController.getGoal
  )
  .put(
    auth("manageGoal"),
    validate(goalValidation.updateGoal),
    goalController.updateGoal
  )
  .delete(
    auth("manageGoal"),
    validate(goalValidation.deleteGoal),
    goalController.deleteGoal
  );

// router
//   .route("/getGoals/:pillarId")
//   .get(auth("getGoal"), goalController.getGoalsByPillar);

module.exports = router;
/**
 *@swagger
 * tags:
 *   name: Goals
 *   description: Goal management and retrieval
 */

/**
 * @swagger
 * path:
 *  /goals:
 *    post:
 *      summary: Create a goal
 *      description: Only admins can create other goal.
 *      tags: [Goals]
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
 *                - pillarId
 *                - title
 *                - goalDate
 *                - isActive
 *              properties:
 *                userId:
 *                  type: string
 *                title:
 *                  type: string
 *                projectCount:
 *                  type: number
 *                goalDate:
 *                  type: string
 *                isActive:
 *                  type: boolean
 *                description:
 *                  type: string
 *              example:
 *                title: "Role clarity"
 *                description: "Role clarity (board versus executive management)"
 *                goalDate: "2020-10-08T10:44:38.087Z"
 *                isActive: true

 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Goal'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *
 *    get:
 *      summary: Get all Goals
 *      description: Only admins can retrieve all users.
 *      tags: [Goals]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: title
 *          schema:
 *            type: string
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
 *                      $ref: '#/components/schemas/Goal'
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
 *  /goals/{id}:
 *    get:
 *      summary: Get Goal
 *      description: Logged in users can fetch only their own user information. Only admins can fetch other users.
 *      tags: [Goals]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          description: Goal id
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Goal'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    put:
 *      summary: Update a goal
 *      description: Logged in users can only update their own information. Only admins can update other users.
 *      tags: [Goals]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Goal id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - userId
 *                - pillarId
 *                - title
 *                - goalDate
 *                - isActive
 *              properties:
 *                userId:
 *                  type: string
 *                pillarId:
 *                  type: string
 *                title:
 *                  type: string
 *                goalDate:
 *                  type: string
 *                isActive:
 *                  type: boolean
 *                description:
 *                  type: string
 *              example:
 *                title: "Role clarity"
 *                goalDate: "2020-10-08T10:44:38.087Z"
 *                isActive: true
 *                description: "Role clarity (board versus executive management)"
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Goal'
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
 *      summary: Delete a goal
 *      description: Logged in users can delete only themselves. Only admins can delete other users.
 *      tags: [Goals]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Goal id
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

// /**
//  * @swagger
//  * path:
//  *  /goals/getGoals/{pillarId}:
//  *    get:
//  *      summary: Get project
//  *      description: Logged in users can fetch only their own user information. Only admins can fetch other users.
//  *      tags: [Goals]
//  *      security:
//  *        - bearerAuth: []
//  *      parameters:
//  *        - in: path
//  *          name: pillarId
//  *          required: true
//  *          schema:
//  *            type: string
//  *          description: pillar id
//  *      responses:
//  *        "200":
//  *          description: OK
//  *          content:
//  *            application/json:
//  *              schema:
//  *                 $ref: '#/components/schemas/Project'
//  *        "401":
//  *          $ref: '#/components/responses/Unauthorized'
//  *        "403":
//  *          $ref: '#/components/responses/Forbidden'
//  *        "404":
//  *          $ref: '#/components/responses/NotFound'
//  */
