/** ***************** package Import ******************************************************** */

const express = require("express");

/** ***************** auth , validate from middleware Import ******************************************************** */

const auth = require("../../middleware/auth");
const validate = require("../../middleware/validate");

/** ***************** payRelease Validation from validation Import ******************************************************** */

const payReleaseValidation = require("../../validations/payRelease.validate");

/** ***************** payReleaseController from controller Import ******************************************************** */

const payReleaseController = require("../../controllers/payRelease.controller");

const router = express.Router();

/*
path - /
router to create payRelease and get payRelease
post - to create payrelease from getting payrelease inputs
get - to show the gathered payrelease details to admin or user
function auth - This function is to authenticate the valid payrelease by tokens
function validate - This function is to validate the payrelease input 
function payreleaseController - This function is to create the payrelease after the auth and validation completed

*/
router
  .route("/")
  .post(
    auth("payRelease"),
    validate(payReleaseValidation.createPayRelease),
    payReleaseController.createPayRelease
  )
  .get(
    auth("payRelease"),
    validate(payReleaseValidation.getPayRelease),
    payReleaseController.getPayRelease
  );

module.exports = router;
/**
 *@swagger
 * tags:
 *   name: payRelease
 *   description: Goal management and retrieval
 */

/**
 * @swagger
 * path:
 *  /payRelease:
 *    post:
 *      summary: Create a payRelease
 *      description: Only admins can create other payrelease.
 *      tags: [payRelease]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - amount
 *                - bank
 *                - referenceDetails
 *                - comments
 *              properties:
 *                amount:
 *                  type: number
 *                bank:
 *                  type: string
 *                refernceDetails:
 *                  type: string
 *                comments:
 *                  type: string
 *              example:
 *                referenceDetails: "amounts are paid"
 *                comments: "paid"
 *                paymentRequestId: ["1","2","3"]
 *                projectId: "1"
 *                userId: "1"
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/payRelease'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *
 *    get:
 *      summary: Get all PayRelease
 *      description: Only admins can retrieve all users.
 *      tags: [payRelease]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: userId
 *          schema:
 *            type: string
 *          description: userId
 *        - in: query
 *          name: projectId
 *          schema:
 *            type: string
 *          description: project id
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
 *                      $ref: '#/components/schemas/payRelease'
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
