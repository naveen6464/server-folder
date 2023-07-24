/** ***************** package Import ******************************************************** */

const express = require("express");

/** ***************** auth , validate from middleware Import ******************************************************** */

const auth = require("../../middleware/auth");

/** ***************** projectsController from controller Import ******************************************************** */

const dashboardController = require("../../controllers/dashboard.controller");

const router = express.Router();

/*
  path - /
  Dashboard route will give an data based on role 
  method - get
  dashboardController - This function is used to count the dashboard data.

*/
router.route("/").get(auth("userDashboard"), dashboardController.getCount);

router
  .route("/paymentAmount/:userId")
  .get(auth("userDashboard"), dashboardController.getPaymentAmount);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Project management and retrieval
 */

/**
 * @swagger
 * path:
 *  /dashboard/:
 *    get:
 *      summary: Get dahboards
 *      description: Get dashboard data based on  logged user.
 *      tags: [Dashboard]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: role
 *          schema:
 *            type: string
 *      responses:
 *        "200":
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                items:
 *                  $ref: '#/components/schemas/dashboard'
 */

/**
 * @swagger
 * path:
 *  /dashboard/paymentAmount/{userId}:
 *    get:
 *      summary: Get dahboards
 *      description: get payment amount by user Id.
 *      tags: [Dashboard]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: userId
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
 *                      $ref: '#/components/schemas/dashboard'
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
