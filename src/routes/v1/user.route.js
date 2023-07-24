/** ***************** package Import ******************************************************** */

const express = require("express");

/** ***************** auth , validate from middleware Import ******************************************************** */

const auth = require("../../middleware/auth");
const validate = require("../../middleware/validate");

/** ***************** user Validation from validation Import ******************************************************** */

const userValidation = require("../../validations/user.validation");

/** ***************** userController from controller Import ******************************************************** */

const userController = require("../../controllers/user.controller");

const router = express.Router();

/*
path - /
router to create user and get user
post - to create user from getting user inputs
get - to show the gathered user details to admin or user
function auth - This function is to authenticate the valid user by tokens
function validate - This function is to validate the user input 
function userController - This function is to create the user after the auth and validation completed

*/

router
  .route("/")
  .post(
    auth("manageUsers"),
    validate(userValidation.createUser),
    userController.createUser
  )
  .get(
    auth("getUsers"),
    validate(userValidation.getUsers),
    userController.getUsers
  );

/*
path - /:userId
router to get user by id , update user by id and to delete user by id
post - to create user from getting user inputs
get - to show the gathered user details to admin or user
put - to update the collection 
delete - the delete is used to delete the user based on id given
function auth - This function is to authenticate the valid user by tokens
function validate - This function is to validate the user input 
function userController - This function is to create the user after the auth and validation completed

*/

router
  .route("/activeStatus")
  .get(auth("activeStatus"), userController.activeStatus);
router
  .route("/userResource")
  .get(auth("getResourceUser"), userController.getUserByResource);
router
  .route("/userSponsor")
  .get(auth("getSponsorUser"), userController.getUserBySponsor);
router
  .route("/sponsoredUser")
  .get(auth("sponsor"), userController.getSponsoredUser);

router
  .route("/:userId")
  .get(
    auth("getUsers"),
    validate(userValidation.getUser),
    userController.getUser
  )
  .put(
    auth("manageUsers"),
    validate(userValidation.updateUser),
    userController.updateUser
  )
  .delete(
    auth("manageUsers"),
    validate(userValidation.deleteUser),
    userController.deleteUser
  );

router
  .route("/sponsor")
  .post(auth("sponsor"), userController.postSponsorDetails);

router
  .route("/sponsor/:projectId")
  .get(auth("sponsor"), userController.getSponsorDetails);

router
  .route("/resource")
  .post(auth("resource"), userController.postResourceDetails);

router
  .route("/resource/:projectId")
  .get(auth("resource"), userController.getResourceDetails)
  .put(auth("resource"), userController.updateResource);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and retrieval
 */

/**
 * @swagger
 * path:
 *  /users:
 *    post:
 *      summary: Create a user
 *      description: Only admins can create other users.
 *      tags: [Users]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - corematicaName
 *                - email
 *                - password
 *                - role
 *                - firstName
 *                - lastName
 *                - mobileNumber
 *                - street
 *                - city
 *                - location
 *                - isActive
 *                - isDeleted
 *                - createdBy
 *                - updatedBy
 *                - role
 *              properties:
 *                corematicaName:
 *                  type: string
 *                email:
 *                  type: string
 *                  format: email
 *                  description: must be unique
 *                password:
 *                  type: string
 *                  format: password
 *                  minLength: 8
 *                  description: At least one number and one letter
 *                role:
 *                   type: string
 *                   enum: [user, admin, sponsor, resource, approver, lead]
 *                mobileNumber:
 *                   type: string
 *                street:
 *                   type: string
 *                city:
 *                   type: string
 *                state:
 *                   type: string
 *                location:
 *                   type: string
 *              example:
 *                firstName: praveen
 *                lastName: s
 *                email: praveen@example.com
 *                password: password1
 *                role: ["user"]
 *                mobileNumber: "1234567890"
 *                street: 2311  Sundown Lane
 *                city: Austin
 *                state: Texas
 *                location: location

 *
 *
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  user:
 *                    $ref: '#/components/schemas/User'
 *        "400":
 *          $ref: '#/components/responses/DuplicateEmail'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *
 *    get:
 *      summary: Get all users
 *      description: Only admins can retrieve all users.
 *      tags: [Users]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: corematicaName
 *          schema:
 *            type: string
 *          description: corematicaName
 *        - in: query
 *          name: role
 *          schema:
 *            type: string
 *          description: User role
 *        - in: query
 *          name: isLoggedIn
 *          schema:
 *            type: boolean
 *          description: isLoggedIn
 *        - in: query
 *          name: lastSeen
 *          schema:
 *            type: date
 *          description: lastSeen
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
 *                      $ref: '#/components/schemas/User'
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
 *  /users/{id}:
 *    get:
 *      summary: Get a user
 *      description: Logged in users can fetch only their own user information. Only admins can fetch other users.
 *      tags: [Users]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: User id
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/User'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    put:
 *      summary: Update a user
 *      description: Logged in users can only update their own information. Only admins can update other users.
 *      tags: [Users]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: User id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - name
 *                - email
 *                - password
 *                - role
 *                - corematicaName
 *                - firstName
 *                - lastName
 *                - mobileNumber
 *                - street
 *                - city
 *                - location
 *                - isActive
 *                - isDeleted
 *                - createdBy
 *                - updatedBy
 *              properties:
 *                name:
 *                  type: string
 *                email:
 *                  type: string
 *                  format: email
 *                  description: must be unique
 *                password:
 *                  type: string
 *                  format: password
 *                  minLength: 8
 *                  description: At least one number and one letter
 *                role:
 *                   type: string
 *                   enum: [user, admin, sponsor, resource, approver, lead]
 *                mobileNumber:
 *                   type: string
 *                street:
 *                   type: string
 * 
 *                city:
 *                   type: string
 *                state:
 *                   type: string
 *                location:
 *                   type: string
 *              example:
 *                corematicaName: fake name
 *                email: fake@example.com
 *                firstName: robbin
 *                lastName: singh
 *                password: password1
 *                role: ["user"]
 *                mobileNumber: "9999999999"
 *                street: aaaa
 *                city: bbbb
 *                state: cccc
 *                location: dddd


 *
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/User'
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
 *      summary: Delete a user
 *      description: Logged in users can delete only themselves. Only admins can delete other users.
 *      tags: [Users]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: User id
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
 *  /users/userResource:
 *    get:
 *      summary: Get user
 *      description: Only admins can retrieve all users.
 *      tags: [Users]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: role
 *          schema:
 *            type: string
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
 *  /users/userSponsor:
 *    get:
 *      summary: Get userSponsor
 *      description: Only admins can retrieve all users.
 *      tags: [Users]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: role
 *          schema:
 *            type: string
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
 *  /users/sponsor:
 *    post:
 *      summary: Create a sponsor
 *      description: Only admins can create other goal.
 *      tags: [Users]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - projectId
 *                - sponsorId
 *              properties:
 *                projectId:
 *                  type: string
 *                sponsorId:
 *                  type: string
 *              example:
 *                projectId: "1"
 *                sponsorId: "1"
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/sponsorDetails'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * path:
 *  /users/sponsor/{projectId}:
 *    get:
 *      summary: Get a sponsor by id
 *      description: Logged in users can fetch only their own user information. Only admins can fetch other users.
 *      tags: [Users]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: projectId
 *          required: true
 *          schema:
 *            type: string
 *          description: projectId
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
 *                      $ref: '#/components/schemas/sponsorDetails'
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
 *  /users/resource:
 *    post:
 *      summary: Create a Resource
 *      description: Only admins can create other goal.
 *      tags: [Users]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - projectId
 *                - requestId
 *                - userId
 *              properties:
 *                projectId:
 *                  type: string
 *                requestId:
 *                  type: string
 *              example:
 *                projectId: "1"
 *                requestId: "1"
 *                userId: "1"
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/approvedService'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * path:
 *  /users/resource/{projectId}:
 *    get:
 *      summary: Get a Resource by projectId
 *      description: Logged in users can fetch only their own user information. Only admins can fetch other users.
 *      tags: [Users]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: projectId
 *          required: true
 *          schema:
 *            type: string
 *          description: projectId
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
 *                      $ref: '#/components/schemas/approvedService'
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
 *
 *
 *    put:
 *      summary: Update a resource
 *      description: Logged in users can only update their own information. Only admins can update other users.
 *      tags: [Users]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: projectId
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
 *                - projectId
 *                - requestId
 *                - userId
 *              properties:
 *                projectId:
 *                  type: string
 *                requestId:
 *                  type: string
 *              example:
 *                projectId: "1"
 *                requestId: "1"
 *                userId: "1"
 *                Active: false
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/approvedService'
 *        "400":
 *          $ref: '#/components/responses/DuplicateEmail'
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
 *  /users/sponsoredUser:
 *    get:
 *      summary: Get user
 *      description: Only admins can retrieve all users.
 *      tags: [Users]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: role
 *          schema:
 *            type: string
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
 *  /users/activeStatus:
 *    get:
 *      summary: Get a active status of user
 *      description: Logged in users can fetch only their own user information. Only admins can fetch other users.
 *      tags: [Users]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: _id
 *          schema:
 *            type: string
 *          description: User id
 *        - in: query
 *          name: isLoggedIn
 *          schema:
 *            type: boolean
 *          description: IsLoggedIn
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/User'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */
