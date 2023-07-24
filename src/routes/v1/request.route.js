/** ***************** package Import ******************************************************** */

const express = require("express");

/** ***************** auth , validate from middleware Import ******************************************************** */

const auth = require("../../middleware/auth");
const validate = require("../../middleware/validate");

/** ***************** request Validation from validation Import ******************************************************** */

const requestValidation = require("../../validations/request.validation");

/** ***************** requestController from controller Import ******************************************************** */

const requestController = require("../../controllers/request.controller");

const router = express.Router();

/*
path - /
router to create request and get request
post - to create request from getting request inputs
get - to show the gathered request details to admin or user
function auth - This function is to authenticate the valid request by tokens
function validate - This function is to validate the request input 
function requestController - This function is to create the request after the auth and validation completed

*/

router
  .route("/search/")
  .post(
    auth("filterRequest"),
    validate(requestValidation.getRequestBySearch),
    requestController.getBySearch
  );

router
  .route("/requestFilter/")
  .post(
    auth("filterRequest"),
    validate(requestValidation.requestFilter),
    requestController.requestFilter
  );
router
  .route("/downloadCsv/")
  .get(
    auth("downloadCsv"),
    validate(requestValidation.downloadCsv),
    requestController.getCsv
  );
router
  .route("/myServices/")
  .get(
    auth("manageSignup"),
    validate(requestValidation.myRequests),
    requestController.getRoleRequests
  );
router
  .route("/myPayments/")
  .get(
    auth("manageSignup"),
    validate(requestValidation.myPayments),
    requestController.getRolePayments
  );

router
  .route("/")
  .post(
    auth("manageSignup"),
    validate(requestValidation.createRequest),
    requestController.createRequest
  )
  .get(
    auth("manageSignup"),
    validate(requestValidation.getRequest),
    requestController.getRequest
  );

/*
path - /:requestId
router to get Request by id , update Request by id and to delete Request by id
post - to create Request from getting Request inputs
get - to show the gathered Request details to admin or Request
put - to update the collection 
delete - the delete is used to delete the Request based on id given
function auth - This function is to authenticate the valid Request by tokens
function validate - This function is to validate the Request input 
function Request - This function is to create the Request after the auth and validation completed

*/

router
  .route("/:requestId")
  .get(
    auth("manageSignup"),
    validate(requestValidation.getRequestById),
    requestController.getRequestById
  )
  .put(
    auth("manageSignup"),
    validate(requestValidation.updateRequest),
    requestController.updateRequest
  )
  .delete(
    auth("manageSignup"),
    validate(requestValidation.deleteRequest),
    requestController.deleteRequest
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: Request management and retrieval
 */

/**
* @swagger
* path:
*  /request:
*    post:
*      summary: Create a Request
*      description: Only admins can create other pillars.
*      tags: [Requests]
*      security:
*        - bearerAuth: []
*      requestBody:
*        required: true
*        content:
*          application/json:
*            schema:
*              type: object
*              required:
*                - title
*                - userId
*                - requestId
*                - status
*                - requestorEmail
*                - bodyOfWork
*                - hours
*                - title
*                - userId
*                - projectId
*                - title
*                - description
*                - duration
*                - is_Active
*                - is_deleted
*              properties:
*                id:
*                  type: string
*                requestId:
*                  type: string
*                projectId:
*                  type: string
*                userId:
*                  type: string
*                requestOrEmail:
*                  type: string
*                bodyOfWork:
*                  type: string
*                description:
*                  type: string
*                duration:
*                  type: string
*                hours:
*                  type: string
*                title:
*                  type: string
*                grantedHours:
*                   type: string


*              example:
*                type: "sign_up"
*                projectId: "2"
*                userId: "1"
*                duration: "2"
*                grantedHours: "24"
*                status: "approved"
*                description: "It will completed on time"
*                amountToPay: 1500
*                requestorEmail: "praveen@example.com"
*                bodyOfWork: "Discussion with Doctors"
*                hoursToAdd: 22
*                
*      responses:
*        "201":
*          description: Created
*          content:
*            application/json:
*              schema:
*                 $ref: '#/components/schemas/Request'
*        "401":
*          $ref: '#/components/responses/Unauthorized'
*        "403":
*          $ref: '#/components/responses/Forbidden'
*
*    get:
*      summary: Get all Request
*      description: Only admins can retrieve all users.
*      tags: [Requests]
*      security:
*        - bearerAuth: []
*      parameters:
*        - in: query
*          name: type
*          schema:
*            type: string
*          description: type
*        - in: query
*          name: status
*          schema:
*            type: string
*          description:  status
*        - in: query
*          name: inProject
*          schema:
*            type: string
*          description: in project
*        - in: query
*          name: requestorEmail
*          schema:
*            type: string
*          description: requestorEmail
*        - in: query
*          name: projectId
*          schema:
*            type: string
*          description: project id
*        - in: query
*          name: userId
*          schema:
*            type: string
*          description: user id
*        - in: query
*          name: requestId
*          schema:
*            type: string
*          description: requestId
*        - in: query
*          name: from
*          schema:
*            type: string
*          description: from date
*        - in: query
*          name: to
*          schema:
*            type: string
*          description: to date
*        - in: query
*          name: search
*          schema:
*            type: string
*          description: search project
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
*                      $ref: '#/components/schemas/Request'
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
*  /request/{id}:
*    get:
*      summary: Get a Request
*      description: Logged in users can fetch only their own user information. Only admins can fetch other users.
*      tags: [Requests]
*      security:
*        - bearerAuth: []
*      parameters:
*        - in: path
*          name: id
*          required: true
*          schema:
*            type: string
*          description: request id
*      responses:
*        "200":
*          description: OK
*          content:
*            application/json:
*              schema:
*                 $ref: '#/components/schemas/Request'
*        "401":
*          $ref: '#/components/responses/Unauthorized'
*        "403":
*          $ref: '#/components/responses/Forbidden'
*        "404":
*          $ref: '#/components/responses/NotFound'
*
*    put:
*      summary: Update a Request
*      description: Logged in users can only update their own information. Only admins can update other users.
*      tags: [Requests]
*      security:
*        - bearerAuth: []
*      parameters:
*        - in: path
*          name: id
*          required: true
*          schema:
*            type: string
*          description: request id
*      requestBody:
*        required: true
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                projectId:
*                  type: string
*                statusId:
*                  type: string
*                title:
*                  type: string
*                description:
*                  type: string
*                hours:
*                  type: string
*                isActive:
*                  type: boolean      
*                isDeleted:
*                   type: boolean


*              example:                
*                type: "sign_up"
*                userId: "1"
*                projectId: "2"
*                requestId: "1"
*                description: It will completed on time
*                duration: "2"
*                grantedHours: "24"
*                status: "approved"
*                amountToPay: 1500
*                requestorEmail: praveen@example.com
*                bodyOfWork: Discussion with Doctors
*                hoursToAdd: 22




*      responses:
*        "200":
*          description: OK
*          content:
*            application/json:
*              schema:
*                 $ref: '#/components/schemas/Request'
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
*      summary: Delete a Request
*      description: Logged in users can delete only themselves. Only admins can delete other users.
*      tags: [Requests]
*      security:
*        - bearerAuth: []
*      parameters:
*        - in: path
*          name: id
*          required: true
*          schema:
*            type: string
*          description: request id
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
 *  /request/myServices/:
 *    get:
 *      summary: Get project
 *      description: Logged in users can fetch only their own user information. Only admins can fetch other users.
 *      tags: [Requests]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: status
 *          schema:
 *            type: string
 *          description: status
 *        - in: query
 *          name: userId
 *          schema:
 *            type: userId
 *        - in: query
 *          name: role
 *          schema:
 *            type: string
 *          description: role
 *        - in: query
 *          name: search
 *          schema:
 *            type: string
 *          description: search
 *        - in: query
 *          name: from
 *          schema:
 *            type: string
 *        - in: query
 *          name: to
 *          schema:
 *            type: string
 *          description: to date
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Request'
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
 *  /request/myPayments/:
 *    get:
 *      summary: Get project
 *      description: Logged in users can fetch only their own user information. Only admins can fetch other users.
 *      tags: [Requests]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: requestorEmail
 *          schema:
 *            type: string
 *          description: payments by role
 *        - in: query
 *          name: from
 *          schema:
 *            type: string
 *          description: from date
 *        - in: query
 *          name: to
 *          schema:
 *            type: string
 *          description: to date
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Request'
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
 *  /request/search/:
 *    post:
 *      summary: Create a Request
 *      description: Only admins can create other pillars.
 *      tags: [Requests]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - title
 *                - userId
 *                - requestId
 *                - status
 *              properties:
 *                id:
 *                  type: string
 *                requestId:
 *                  type: string
 *              example:
 *                type: "sign_up"
 *                userId: "1"
 *                status: ["pending","approved"]
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
 *                      $ref: '#/components/schemas/Request'
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
 *  /request/requestFilter/:
 *    post:
 *      summary: filter a request
 *      description: Only admins can create other pillars.
 *      tags: [Requests]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - title
 *                - userId
 *                - requestId
 *                - status
 *              properties:
 *                userId:
 *                  type: string
 *                projectId:
 *                  type: string
 *                type:
 *                  type: string
 *                location:
 *                  type: string
 *                projectType:
 *                  type: string
 *                generate:
 *                  type: boolean
 *                requestHistory:
 *                  type: boolean
 *              example:
 *                type: "payment"
 *                userId: ["1"]
 *                projectId: ["2"]
 *                status: ["pending","approved"]
 *                location: ["VNC","PHYS"]
 *                projectType: ["Project"]
 *                generate: false
 *                requestHistory: false
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
 *                      $ref: '#/components/schemas/Request'
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
/*    get:
 *      summary: Get all request
 *      description: Only admins can retrieve all users.
 *      tags: [Requests]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: type
 *          schema:
 *            type: string
 *          description: type
 *        - in: query
 *          name: status
 *          schema:
 *            type: string
 *          description:  status
 *        - in: query
 *          name: userId
 *          schema:
 *            type: string
 *          description: user Id
 *        - in: query
 *          name: projectId
 *          schema:
 *            type: string
 *          description: project id
 *        - in: query
 *          name: location
 *          schema:
 *            type: string
 *          description: location
 *        - in: query
 *          name: projectType
 *          schema:
 *            type: string
 *          description: type of project
 *        - in: query
 *          name: from
 *          schema:
 *            type: string
 *          description: from date
 *        - in: query
 *          name: to
 *          schema:
 *            type: string
 *          description: to date
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
 *                      $ref: '#/components/schemas/Request'
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
 *  /request/downloadCsv/:
 *    get:
 *      summary: Get all request
 *      description: Only admins can retrieve all users.
 *      tags: [Requests]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: type
 *          schema:
 *            type: string
 *        - in: query
 *          name: fileName
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
 *                      $ref: '#/components/schemas/Request'
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

/* /
 *    get:
 *      summary: filter project
 *      description:  users.
 *      tags: [Requests]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: type
 *          schema:
 *            type: string
 *          description: type
 *        - in: query
 *          name: userId
 *          schema:
 *            type: string
 *          description: userId
 *        - in: query
 *          name: projectId
 *          schema:
 *            type: string
 *          description: projectId
 *        - in: query
 *          name: location
 *          schema:
 *            type: string
 *          description: location
 *        - in: query
 *          name: projectType
 *          schema:
 *            type: string
 *          description: project type
 *        - in: query
 *          name: status
 *          schema:
 *            type: string
 *          description: status
 *        - in: query
 *          name: from
 *          schema:
 *            type: string
 *          description: from date
 *        - in: query
 *          name: to
 *          schema:
 *            type: string
 *          description: to date
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Request'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */
