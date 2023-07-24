/** ***************** package Import ******************************************************** */

const express = require("express");

/** ***************** auth , validate from middleware Import ******************************************************** */

const auth = require("../../middleware/auth");
const validate = require("../../middleware/validate");

/** ***************** projects Validation from validation Import ******************************************************** */

const projectValidation = require("../../validations/project.validation");

/** ***************** projectsController from controller Import ******************************************************** */

const projectController = require("../../controllers/project.controller");

const router = express.Router();

/*
path - /
router to create projects and get projects
post - to create projects from getting projects inputs
get - to show the gathered projects details to admin or user
function auth - This function is to authenticate the valid projects by tokens
function validate - This function is to validate the projects input 
function projectsController - This function is to create the projects after the auth and validation completed

*/

router
  .route("/myProjects/")
  .get(
    auth("getProject"),
    validate(projectValidation.getRoleProject),
    projectController.getRoleProject
  );

router
  .route("/projectFilter/")
  .post(
    auth("filterProject"),
    validate(projectValidation.projectFilter),
    projectController.projectFilter
  );

router
  .route("/")
  .post(
    auth("manageProject"),
    validate(projectValidation.createProject),
    projectController.createProject
  )
  .get(
    auth("getProjects"),
    validate(projectValidation.getProjects),
    projectController.getProjects
  );

/*
path - /:projectsId
router to get projects by id , update projects by id and to delete projects by id
post - to create projects from getting projects inputs
get - to show the gathered projects details to admin or projects
put - to update the collection 
delete - the delete is used to delete the projects based on id given
function auth - This function is to authenticate the valid projects by tokens
function validate - This function is to validate the projects input 
function projectsController - This function is to create the projects after the auth and validation completed

*/

router
  .route("/:projectId")
  .get(
    auth("getProject"),
    validate(projectValidation.getProject),
    projectController.getProject
  )
  .put(
    auth("manageProject"),
    validate(projectValidation.updateProject),
    projectController.updateProject
  )
  .delete(
    auth("manageProject"),
    validate(projectValidation.deleteProject),
    projectController.deleteProject
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management and retrieval
 */

/**
 * @swagger
 * path:
 *  /projects:
 *    post:
 *      summary: Create a Project
 *      description: Only admins can create other goal.
 *      tags: [Projects]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - pillarId
 *                - goalId
 *                - type
 *                - title
 *                - levelOfEffort
 *                - rateOfPay
 *                - isActive
 *              properties:
 *                pillarId:
 *                  type: array
 *                goalId:
 *                  type: array
 *                sponsorId:
 *                  type: string
 *                resourceId:
 *                  type: string
 *                type:
 *                  type: array
 *                title:
 *                   type: string
 *                description:
 *                  type: string
 *                location:
 *                  type: string
 *                levelOfEffort:
 *                  type: boolean
 *                rateOfPay:
 *                  type: Number
 *                isActive:
 *                  type: boolean
 *              example:
 *                pillarId: ["1","2"]
 *                goalId: ["1","2","3"]
 *                type: "project"
 *                title: "Develop program for board member orientation"
 *                description: member orientation held at texas.
 *                location: somewhere
 *                levelOfEffort: "2"
 *                rateOfPay: 125
 *                allocatedFund: 2000
 *                isActive: true
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Project'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *
 *    get:
 *      summary: Get all project
 *      description: Only admins can retrieve all users.
 *      tags: [Projects]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: search
 *          schema:
 *            type: string
 *        - in: query
 *          name: title
 *          schema:
 *            type: string
 *        - in: query
 *          name: description
 *          schema:
 *            type: string
 *        - in: query
 *          name: location
 *          schema:
 *            type: string
 *        - in: query
 *          name: type
 *          schema:
 *            type: string
 *        - in: query
 *          name: createdBy
 *          schema:
 *            type: string
 *        - in: query
 *          name: goalId
 *          schema:
 *            type: string
 *        - in: query
 *          name: pillarId
 *          schema:
 *            type: string
 *        - in: query
 *          name: from
 *          schema:
 *            type: string
 *        - in: query
 *          name: to
 *          schema:
 *            type: string
 *        - in: query
 *          name: isActive
 *          schema:
 *            type: boolean
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
 *                      $ref: '#/components/schemas/Project'
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
 *  /projects/{id}:
 *    get:
 *      summary: Get project
 *      description: Logged in users can fetch only their own user information. Only admins can fetch other users.
 *      tags: [Projects]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: project id
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Project'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    put:
 *      summary: Update a project
 *      description: Logged in users can only update their own information. Only admins can update other users.
 *      tags: [Projects]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: project id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - pillarId
 *                - goalId
 *                - userId
 *                - title
 *                - levelOfEffort
 *                - rateOfPay
 *                - isActive
 *              properties:
 *                pillarId:
 *                  type: array
 *                goalId:
 *                  type: array
 *                sponsorId:
 *                  type: string
 *                resourceId:
 *                  type: string
 *                title:
 *                   type: string
 *                description:
 *                  type: string
 *                levelOfEffort:
 *                  type: boolean
 *                rateOfPay:
 *                  type: Number
 *                isActive:
 *                  type: boolean
 *              example:
 *                pillarId: ["1","2"]
 *                goalId: ["1","2","3"]
 *                type: "project"
 *                title: "Develop program for board member orientation"
 *                description: member orientation held at texas.
 *                levelOfEffort: "2"
 *                rateOfPay: 125
 *                allocatedFund: 2000
 *                isActive: true
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Project'
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
 *      summary: Delete a project
 *      description: Logged in users can delete only themselves. Only admins can delete other users.
 *      tags: [Projects]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Project id
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

/**
 * @swagger
 * path:
 *  /projects/myProjects/:
 *    get:
 *      summary: Get project
 *      description: Logged in users can fetch only their own user information. Only admins can fetch other users.
 *      tags: [Projects]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: search
 *          schema:
 *            type: string
 *        - in: query
 *          name: role
 *          schema:
 *            type: string
 *            description: role
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
 *                      $ref: '#/components/schemas/Project'
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
 *  /projects/projectFilter/:
 *    post:
 *      summary: filter a request
 *      description: Only admins can create other pillars.
 *      tags: [Projects]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                type:
 *                  type: string
 *                location:
 *                  type: array
 *                sponsor:
 *                  type: array
 *                resource:
 *                  type: array
 *              example:
 *                type: "Project"
 *                location: ["VNC","PHYS"]
 *                sponsor: ["1","2"]
 *                resource: ["1","2"]
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
 *                      $ref: '#/components/schemas/Project'
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
