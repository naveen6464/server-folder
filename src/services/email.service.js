const nodemailer = require("nodemailer");
const inlineBase64 = require("nodemailer-plugin-inline-base64");
const fs = require("fs");
const handlebars = require("handlebars");
const { promisify } = require("util");
const config = require("../config");
const logger = require("../config/logger");

const readFile = promisify(fs.readFile);
const transport = nodemailer.createTransport(config.email.smtp);
if (config.env !== "local") {
  transport
    .verify()
    .then(() => logger.info("Connected to email server"))
    .catch(() =>
      logger.warn(
        "Unable to connect to email server. Make sure you have configured the SMTP options in .env"
      )
    );
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const nonProductionUser = [
  "ram.balaraman@gmail.com",
  "aravindmani@gmail.com",
  "manojkumar.programmer@gmail.com",
];
const localUser = [
  "arun.s.applogiq@gmail.com",
  "praveenkumar.s.applogiq@gmail.com",
];
const localAdmin = [
  "arun.s.applogiq@gmail.com",
  "praveenkumar.s.applogiq@gmail.com",
];
const nonProductionAdmin = [
  "ram.balaraman@gmail.com",
  "aravindmani@gmail.com",
  "manojkumar.developer@gmail.com",
];

const sendEmail = async (to, subject, text, html) => {
  transport.use("compile", inlineBase64());
  if (
    config.env !== "production" &&
    config.env !== "local" &&
    config.env !== "heroku"
  ) {
    if (text === "user") {
      let msg;
      const testSubject = `[PIMG User - ${to}].${subject}`;
      nonProductionUser.forEach(async (email) => {
        msg = {
          from: config.email.from,
          to: email,
          subject: testSubject,
          text,
          html,
        };

        try {
          await transport.sendMail(msg);
        } catch (e) {
          logger.error(e);
        }
      });
    }

    if (text === "admin") {
      let msg;
      const testSubject = `[PIMG Admin - ${to}].${subject}`;
      nonProductionAdmin.forEach(async (email) => {
        msg = {
          from: config.email.from,
          to: email,
          subject: testSubject,
          text,
          html,
        };

        try {
          await transport.sendMail(msg);
        } catch (e) {
          logger.error(e);
        }
      });
    }

    if (text === "sponsor") {
      let msg;
      const testSubject = `[PIMG Sponsor - ${to}].${subject}`;
      nonProductionAdmin.forEach(async (email) => {
        msg = {
          from: config.email.from,
          to: `${email}`,
          subject: testSubject,
          text,
          html,
        };
        try {
          await transport.sendMail(msg);
        } catch (e) {
          logger.error(e);
        }
      });
    }
  } else if (config.env === "local") {
    if (text === "user") {
      let msg;
      const testSubject = `[PIMG Users - ${to}].${subject}`;
      localUser.forEach(async (email) => {
        msg = {
          from: config.email.from,
          to: `${email}`,
          subject: testSubject,
          text,
          html,
        };
        try {
          await transport.sendMail(msg);
        } catch (e) {
          logger.error(e);
        }
      });
    } else if (text === "admin") {
      let msg;
      const testSubject = `[PIMG Admin - ${to}].${subject}`;
      localAdmin.forEach(async (email) => {
        msg = {
          from: config.email.from,
          to: `${email}`,
          subject: testSubject,
          text,
          html,
        };
        try {
          await transport.sendMail(msg);
        } catch (e) {
          logger.error(e);
        }
      });
    }

    if (text === "sponsor") {
      let msg;
      const testSubject = `[PIMG Sponsor - ${to}].${subject}`;
      localAdmin.forEach(async (email) => {
        msg = {
          from: config.email.from,
          to: `${email}`,
          subject: testSubject,
          text,
          html,
        };
        try {
          await transport.sendMail(msg);
        } catch (e) {
          logger.error(e);
        }
      });
    }
  } else if (config.env === "heroku") {
    let msg;
    const testSubject = `[PIMG User - ${to}].${subject}`;
    localUser.forEach(async (email) => {
      msg = {
        from: config.email.from,
        to: `${email}`,
        subject: testSubject,
        text,
        html,
      };
      try {
        await transport.sendMail(msg);
      } catch (e) {
        logger.error(e);
      }
    });
  } else {
    const msg = { from: config.email.from, to, subject, text, html };
    try {
      await transport.sendMail(msg);
    } catch (e) {
      logger.error(e);
    }
  }
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = "Reset password";
  const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
  const text = `Dear user,
  To reset your password, click on this link: ${resetPasswordUrl}
  If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};
const sendServiceApprovedEmail = async (to, emailData) => {
  let userSubject = "";
  let userBody = "";
  let tableValue = "";
  let image = "";
  if (emailData.type === "sign_up") {
    if (emailData.status === "approved") {
      userSubject = `Pillar – your new sign up request was approved`;
      userBody = `<h3>Your new project or committee <b>sign up</b> request was <span style="color:green;">approved</span>.</h3> 
    <h3>As you complete your work, you may submit hours (in Pillar) to request payment.</h3>`;
      tableValue = `<table>
									
    <colgroup>
      <col span="1" style="background-color:#58b1ec;">
      </colgroup>
    <tr>
      <th style="width:100px">Project</th>
      <td style="width:500px"><b>${emailData.projectTitle}</b></td>
    </tr>
   
  </table>`;
      image = `${config.url}/icons/approved.png`;
    } else if (emailData.status === "rejected") {
      userSubject = `Pillar – Your new sign up request was denied`;
      userBody = `<h3>Sorry, your new project or committee <b>sign up</b> request was <span style="color:red;">denied</span>.</h3>
       <h3>Please reach out to PIMG leadership if you think this was in error or if we can help you to modify your request.</h3>`;
      tableValue = `<table>
									
       <colgroup>
         <col span="1" style="background-color:#9ACAD6;">
         </colgroup>
       <tr>
         <th style="width:150px">Project</th>
         <td style="width:500px"><b>${emailData.projectTitle}</b></td>
       </tr>
       <tr>
       <th style="width:150px">Reason</th>
       <td style="width:500px"><b>${emailData.reason}</b></td>
     </tr>
     </table>`;
      image = `${config.url}/icons/reject.png`;
    }
  } else if (emailData.type === "payment") {
    if (emailData.status === "approved") {
      userSubject = `Pillar – Your payment request was approved`;
      userBody = `<h3>Your <b>payment</b> request was received and was <span style="color:green;">approved</span>.</h3>
    <h3>Payments are made at the end of each quarter, but you can track the status of pending payments in Pillar.</h3> `;
      tableValue = `<table>
									
    <colgroup>
      <col span="1" style="background-color:#9ACAD6;">
      </colgroup>
    <tr>
      <th style="width:150px">Project</th>
      <td style="width:500px"><b>${emailData.projectTitle}</b></td>
    </tr>
    <tr>
    <th style="width:150px">Hours submitted</th>
    <td style="width:500px"><b>${emailData.hours}</b></td>
  </tr>
  <tr>
  <th style="width:150px">Amount</th>
  <td style="width:500px"><b>$${emailData.amount}</b></td>
</tr>
  </table>`;
      image = `${config.url}/icons/approved.png`;
    } else if (emailData.status === "rejected") {
      userSubject = `Pillar – Your payment request was denied`;
      userBody = `<h3>Your <b>payment</b>  request was <span style="color:red;">denied</span>.</h3>
    <h3>Please reach out to PIMG leadership if you think this was in error or if we can help you to modify your request.</h3>`;
      tableValue = `<table>
									
    <colgroup>
      <col span="1" style="background-color:#9ACAD6;">
      </colgroup>
    <tr>
      <th style="width:150px">Project</th>
      <td style="width:500px"><b>${emailData.projectTitle}</b></td>
    </tr>
    <tr>
    <th style="width:150px">Reason</th>
    <td style="width:500px"><b>${emailData.reason}</b></td>
  </tr>
  </table>`;
      image = `${config.url}/icons/reject.png"`;
    }
  } else if (emailData.type === "add_hours") {
    if (emailData.status === "approved") {
      userSubject = `Pillar – Your add hours request was approved`;
      userBody = `<h3>Your request to <b>add hours</b> for a project or committee has been <span style="color:green;">approved</span>.</h3>
      <h3>As you complete your work, you may submit hours (in Pillar) to request payment.</h3> `;
      tableValue = `<table>
                    
      <colgroup>
        <col span="1" style="background-color:#9ACAD6;">
        </colgroup>
      <tr>
        <th style="width:150px">Project</th>
        <td style="width:500px"><b>${emailData.projectTitle}</b></td>
      </tr>
      <tr>
      <th style="width:150px">Additional Hours Approved</th>
      <td style="width:500px"><b>${emailData.hours}</b></td>
    </tr>
    </table>`;
      image = `${config.url}/icons/approved.png`;
    } else if (emailData.status === "rejected") {
      userSubject = `Pillar – Your add hours request was denied`;
      userBody = `<h3>Your request to <b>add hours</b> for a project or committee has been <span style="color:red;">denied</span>.</h3>
      <h3>Please reach out to PIMG leadership if you think this was in error or if we can help you to modify your request.</h3>`;
      tableValue = `<table>
                    
      <colgroup>
        <col span="1" style="background-color:#9ACAD6;">
        </colgroup>
      <tr>
        <th style="width:150px">Project</th>
        <td style="width:500px"><b>${emailData.projectTitle}</b></td>
      </tr>
      <tr>
      <th style="width:150px">Reason</th>
      <td style="width:500px"><b>${emailData.reason}</b></td>
    </tr>
    </table>`;
      image = `${config.url}/icons/reject.png`;
    }
  } else if (emailData.type === "leave") {
    userSubject = `Pillar – You have left this project`;
    userBody = `<h3>Your request to <b>leave</b> from a project or committee has been <span style="color:green;">approved</span>.</h3>`;
  }

  const text = "user";
  const html = await readFile("./src/emailpage/newEmailTemplate1.hbs", "utf8");
  const template = handlebars.compile(html);
  let color = "red";
  let reason = "";
  if (emailData.status === "approved") color = "green";
  if (emailData.status === "rejected") reason = `Reason: ${emailData.reason}`;
  const data = {
    type: emailData.type,
    body: userBody,
    status: emailData.status,
    title: emailData.title,
    table: tableValue,
    color,
    reason,
    image,
    pillarUrl: `${config.url}`,
  };
  const result = template(data);
  await sendEmail(to, userSubject, text, result);
};

const sendSignupCreatedEmail = async (to, emailData) => {
  let subject = "";
  let bodyData = "";
  let sponsorSubject = "";
  let sponsorBodyData = "";
  if (emailData.type === "sign_up") {
    bodyData = `<h3>A new request to <b> sign up </b> for a project or committee has been received and is <b>awaiting</b> your approval.</h3>`;
    subject = `Pillar - New sign up request`;
    sponsorBodyData = `<h3>Someone has made a new request to <b> sign up </b> for a project or committee you are sponsoring. It is <b>awaiting</b> administrative approval.</h3>`;
    sponsorSubject = `Pillar - New sign up request`;
  }

  const html = await readFile("./src/emailpage/newEmailTemplate1.hbs", "utf8");
  const template = handlebars.compile(html, { strict: true });
  let adminData = {};
  let sponsorData = {};
  emailData.adminName.forEach(async (mail) => {
    adminData = {
      name: mail.corematicaName,
      body: bodyData,
      hours: emailData.hours,
      projectTitle: emailData.projectTitle,
      table: `<table>        
    <colgroup>
      <col span="1" style="background-color:#9ACAD6;">
      </colgroup>
    <tr>
      <th style="width:100px">Project</th>
      <td style="width:500px"><b>${emailData.projectTitle}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Name</th>
      <td style="width:500px"><b style="text-transform: capitalize">${emailData.lastName}, ${emailData.firstName}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Hours</th>
      <td style="width:500px"><b>${emailData.hours}</b></td>
    </tr>
  </table>`,
      image: `${config.url}/icons/clock.png`,
      pillarUrl: `${config.url}`,
    };
    const result = template(adminData);
    await sendEmail(mail.email, subject, "admin", result);
  });

  emailData.sponsor.forEach(async (mail) => {
    sponsorData = {
      name: mail.corematicaName,
      body: sponsorBodyData,
      hours: emailData.hours,
      projectTitle: emailData.projectTitle,
      table: `<table>        
    <colgroup>
      <col span="1" style="background-color:#9ACAD6;">
      </colgroup>
    <tr>
      <th style="width:100px">Project</th>
      <td style="width:500px"><b>${emailData.projectTitle}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Name</th>
      <td style="width:500px"><b style="text-transform: capitalize">${emailData.lastName}, ${emailData.firstName}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Hours</th>
      <td style="width:500px"><b>${emailData.hours}</b></td>
    </tr>
  </table>`,
      image: `${config.url}/icons/clock.png`,
      pillarUrl: `${config.url}`,
    };
    const result = template(sponsorData);
    await sendEmail(mail.email, sponsorSubject, "sponsor", result);
  });

  let userSubject = "";
  let userBody = "";
  let tableValue = "";
  if (emailData.type === "sign_up") {
    userSubject = `Pillar – Your new sign up request`;
    userBody = `<h3>Your new project or committee <b>sign up</b> request was received and is awaiting <b>approval</b>. You will be notified by email when it is approved.</h3>
    <h3>Once approved and as you complete your work, you may submit hours (in Pillar) to request <b>payment</b>.</h3>`;
    tableValue = `<table>
									
    <colgroup>
      <col span="1" style="background-color:#9ACAD6;">
      </colgroup>
    <tr>
      <th style="width:100px">Project</th>
      <td style="width:500px"><b>${emailData.projectTitle}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Hours</th>
      <td style="width:500px"><b>${emailData.hours}</b></td>
    </tr>
  </table>`;
  }

  const userHtml = await readFile(
    "./src/emailpage/newEmailTemplate1.hbs",
    "utf8"
  );
  const userTemplate = handlebars.compile(userHtml);

  const userData = {
    type: emailData.type,
    body: userBody,
    request: emailData.adminRequest,
    projectTitle: emailData.projectTitle,
    table: tableValue,
    image: `${config.url}/icons/clock.png`,
    pillarUrl: `${config.url}`,
  };

  const userResult = userTemplate(userData);
  await sendEmail(to, userSubject, "user", userResult);
};

const sendPaymentCreatedEmail = async (to, emailData) => {
  let subject = "";
  let bodyData = "";
  let sponsorBodyData = "";
  let sponsorSubject = "";
  if (emailData.type === "payment") {
    bodyData = `<h3>A new <b>payment</b> request has been received and is <b>awaiting</b> your approval.</h3>`;
    subject = `Pillar - New payment request`;
    sponsorBodyData = `<h3>A new <b> payment </b> request has been received for a project you are sponsoring. It is <b>awaiting</b> administrative approval.</h3>`;
    sponsorSubject = `Pillar - New payment request`;
  }

  const html = await readFile("./src/emailpage/newEmailTemplate1.hbs", "utf8");
  const template = handlebars.compile(html, { strict: true });
  let adminData = {};
  emailData.adminName.forEach(async (mail) => {
    adminData = {
      name: mail.corematicaName,
      body: bodyData,
      hours: emailData.hours,
      projectTitle: emailData.projectTitle,
      table: `<table>
                  
    <colgroup>
      <col span="1" style="background-color:#9ACAD6;">
      </colgroup>
    <tr>
      <th style="width:100px">Project</th>
      <td style="width:500px"><b>${emailData.projectTitle}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Name</th>
      <td style="width:500px"><b style="text-transform: capitalize">${emailData.lastName}, ${emailData.firstName}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Hours</th>
      <td style="width:500px"><b>${emailData.hours}</b></td>
    </tr>
  </table>`,
      image: `${config.url}/icons/clock.png`,
      pillarUrl: `${config.url}`,
    };
    const result = template(adminData);
    await sendEmail(mail.email, subject, "admin", result);
  });

  let sponsorData = {};
  emailData.sponsor.forEach(async (mail) => {
    sponsorData = {
      name: mail.corematicaName,
      body: sponsorBodyData,
      hours: emailData.hours,
      projectTitle: emailData.projectTitle,
      table: `<table>
                  
    <colgroup>
      <col span="1" style="background-color:#9ACAD6;">
      </colgroup>
    <tr>
      <th style="width:100px">Project</th>
      <td style="width:500px"><b>${emailData.projectTitle}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Name</th>
      <td style="width:500px"><b style="text-transform: capitalize">${emailData.lastName}, ${emailData.firstName}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Hours</th>
      <td style="width:500px"><b>${emailData.hours}</b></td>
    </tr>
  </table>`,
      image: `${config.url}/icons/clock.png`,
      pillarUrl: `${config.url}`,
    };
    const result = template(sponsorData);
    await sendEmail(mail.email, sponsorSubject, "sponsor", result);
  });

  let userSubject = "";
  let userBody = "";
  let tableValue = "";
  if (emailData.type === "payment") {
    userSubject = `Pillar – Your payment request`;
    userBody = `<h3>Your <b>payment</b> request was received and is awaiting <b>approval</b>. You will be notified by email when it is approved.</h3>
    <h3>Payments are made at the end of each quarter, but you can track the status of approved and pending payments in Pillar.</h3>`;
    tableValue = `<table>
									
    <colgroup>
      <col span="1" style="background-color:#9ACAD6;">
      </colgroup>
    <tr>
      <th style="width:100px">Project</th>
      <td style="width:500px"><b>${emailData.projectTitle}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Hours submitted</th>
      <td style="width:500px"><b>${emailData.hours}</b></td>
    </tr>
    <tr>
    <th style="width:100px">Amount</th>
    <td style="width:500px"><b>$${emailData.amount}</b></td>
  </tr>
  </table>`;
  }

  const userHtml = await readFile(
    "./src/emailpage/newEmailTemplate1.hbs",
    "utf8"
  );
  const userTemplate = handlebars.compile(userHtml);

  const userData = {
    type: emailData.type,
    body: userBody,
    request: emailData.adminRequest,
    projectTitle: emailData.projectTitle,
    table: tableValue,
    image: `${config.url}/icons/clock.png`,
    pillarUrl: `${config.url}`,
  };

  const userResult = userTemplate(userData);
  await sendEmail(to, userSubject, "user", userResult);
};

const sendAddHoursCreatedEmail = async (to, emailData) => {
  let subject = "";
  let bodyData = "";
  let sponsorBodyData = "";
  let sponsorSubject = "";
  if (emailData.type === "add_hours") {
    bodyData = `<h3>A new request to <b>add hours</b> for a project or committee has been received and is <b>awaiting</b> your approval.</h3>`;
    subject = `Pillar – Add hours request`;
    sponsorBodyData = `<h3>A new request to <b>add hours</b> has been received for a project you are sponsoring. It is <b>awaiting</b> approval.</h3>`;
    sponsorSubject = `Pillar - New add hours request`;
  }

  const html = await readFile("./src/emailpage/newEmailTemplate1.hbs", "utf8");
  const template = handlebars.compile(html, { strict: true });
  let adminData = {};
  emailData.adminName.forEach(async (mail) => {
    adminData = {
      name: mail.corematicaName,
      body: bodyData,
      hours: emailData.hours,
      projectTitle: emailData.projectTitle,
      table: `<table>
                  
    <colgroup>
      <col span="1" style="background-color:#9ACAD6;">
      </colgroup>
    <tr>
      <th style="width:100px">Project</th>
      <td style="width:500px"><b>${emailData.projectTitle}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Name</th>
      <td style="width:500px"><b style="text-transform: capitalize">${emailData.lastName}, ${emailData.firstName}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Hours</th>
      <td style="width:500px"><b>${emailData.hours}</b></td>
    </tr>
  </table>`,
      image: `${config.url}/icons/clock.png`,
      pillarUrl: `${config.url}`,
    };
    const result = template(adminData);
    await sendEmail(mail.email, subject, "admin", result);
  });

  let sponsorData = {};
  emailData.sponsor.forEach(async (mail) => {
    sponsorData = {
      name: mail.corematicaName,
      body: sponsorBodyData,
      hours: emailData.hours,
      projectTitle: emailData.projectTitle,
      table: `<table>
                  
    <colgroup>
      <col span="1" style="background-color:#9ACAD6;">
      </colgroup>
    <tr>
      <th style="width:100px">Project</th>
      <td style="width:500px"><b>${emailData.projectTitle}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Name</th>
      <td style="width:500px"><b style="text-transform: capitalize">${emailData.lastName}, ${emailData.firstName}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Hours</th>
      <td style="width:500px"><b>${emailData.hours}</b></td>
    </tr>
  </table>`,
      image: `${config.url}/icons/clock.png`,
      pillarUrl: `${config.url}`,
    };
    const result = template(sponsorData);
    await sendEmail(mail.email, sponsorSubject, "sponsor", result);
  });

  let userSubject = "";
  let userBody = "";
  let tableValue = "";
  if (emailData.type === "add_hours") {
    userSubject = `Pillar – Your add hours request`;
    userBody = `<h3>Your request to <b>add hours</b> for a project or committee has been received and is <b>awaiting</b> approval. </h3>
    <h3>You will be notified by email when it is approved.</h3>`;
    tableValue = `<table>
									
    <colgroup>
      <col span="1" style="background-color:#9ACAD6;">
      </colgroup>
    <tr>
      <th style="width:100px">Project</th>
      <td style="width:500px"><b>${emailData.projectTitle}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Hours submitted</th>
      <td style="width:500px"><b>${emailData.hours}</b></td>
    </tr>
  </table>`;
  }
  const userHtml = await readFile(
    "./src/emailpage/newEmailTemplate1.hbs",
    "utf8"
  );
  const userTemplate = handlebars.compile(userHtml);

  const userData = {
    type: emailData.type,
    body: userBody,
    request: emailData.adminRequest,
    projectTitle: emailData.projectTitle,
    table: tableValue,
    image: `${config.url}/icons/clock.png`,
    pillarUrl: `${config.url}`,
  };

  const userResult = userTemplate(userData);
  await sendEmail(to, userSubject, "user", userResult);
};

const sendProposedProjectCreatedEmail = async (to, emailData) => {
  let subject = "";
  let bodyData = "";
  if (emailData.type === "proposedProject") {
    bodyData = `<h3>A new <b>project</b> has been proposed and is <b>awaiting</b> your approval.</h3>`;
    subject = `Pillar - New proposed project`;
  }

  const html = await readFile("./src/emailpage/newEmailTemplate1.hbs", "utf8");
  const template = handlebars.compile(html, { strict: true });
  let adminData = {};
  emailData.adminName.forEach(async (mail) => {
    adminData = {
      name: mail.corematicaName,
      body: bodyData,
      userId: emailData.userId,
      proposedProject: emailData.proposedProject,
      table: `<table>
                  
    <colgroup>
      <col span="1" style="background-color:#9ACAD6;">
      </colgroup>
    <tr>
      <th style="width:100px">Proposed Project</th>
      <td style="width:500px"><b>${emailData.proposedProject}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Name</th>
      <td style="width:500px"><b style="text-transform: capitalize">${emailData.lastName}, ${emailData.firstName}</b></td>
    </tr>
    <tr>
      <th style="width:100px">user Id</th>
      <td style="width:500px"><b>${emailData.userId}</b></td>
    </tr>
  </table>`,
      image: `${config.url}/icons/clock.png`,
      pillarUrl: `${config.url}`,
    };
    const result = template(adminData);
    await sendEmail(mail.email, subject, "admin", result);
  });
};

const sendLeaveRequestEmail = async (to, emailData) => {
  let subject = "";
  let bodyData = "";
  let sponsorBodyData = ``;
  let sponsorSubject = ``;
  if (emailData.type === "leave") {
    bodyData = `<h3>An employee has stopped working on a project or committee.</h3>`;
    subject = `Pillar – Leave request`;
    sponsorBodyData = `<h3>An employee has stopped working on a project or committee.</h3>`;
    sponsorSubject = `Pillar - Leave request`;
  }

  const html = await readFile("./src/emailpage/leaveEmail.hbs", "utf8");
  const template = handlebars.compile(html, { strict: true });
  let adminData = {};
  emailData.adminName.forEach(async (mail) => {
    adminData = {
      name: mail.corematicaName,
      body: bodyData,
      projectTitle: emailData.projectTitle,
      table: `<table>
                  
    <colgroup>
      <col span="1" style="background-color:#9ACAD6;">
      </colgroup>
    <tr>
      <th style="width:100px">Project</th>
      <td style="width:500px"><b>${emailData.projectTitle}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Name</th>
      <td style="width:500px"><b style="text-transform: capitalize">${emailData.lastName}, ${emailData.firstName}</b></td>
    </tr>
  </table>`,
      image: `${config.url}/icons/leave.png`,
      pillarUrl: `${config.url}`,
    };
    const result = template(adminData);
    await sendEmail(mail.email, subject, "admin", result);
  });
  let sponsorData = {};
  emailData.sponsor.forEach(async (mail) => {
    sponsorData = {
      name: mail.corematicaName,
      body: sponsorBodyData,
      projectTitle: emailData.projectTitle,
      table: `<table>
                  
    <colgroup>
      <col span="1" style="background-color:#9ACAD6;">
      </colgroup>
    <tr>
      <th style="width:100px">Project</th>
      <td style="width:500px"><b>${emailData.projectTitle}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Name</th>
      <td style="width:500px"><b style="text-transform: capitalize">${emailData.lastName}, ${emailData.firstName}</b></td>
    </tr>
  </table>`,
      image: `${config.url}/icons/leave.png`,
      pillarUrl: `${config.url}`,
    };
    const result = template(sponsorData);
    await sendEmail(mail.email, sponsorSubject, "sponsor", result);
  });

  let userSubject = "";
  let userBody = "";
  if (emailData.type === "leave") {
    userSubject = `Pillar – You have left this project`;
    userBody = `<h3>Your request to leave from a project or committee has been <span style="color:green;">approved</span>.</h3>`;
  }
  const userHtml = await readFile("./src/emailpage/leaveEmail.hbs", "utf8");
  const userTemplate = handlebars.compile(userHtml);

  const data = {
    type: emailData.type,
    body: userBody,
    status: emailData.status,
    title: emailData.projectTitle,
    table: `<table>
                  
    <colgroup>
      <col span="1" style="background-color:#9ACAD6;">
      </colgroup>
    <tr>
      <th style="width:100px">Project</th>
      <td style="width:500px"><b>${emailData.projectTitle}</b></td>
    </tr>
  </table>`,
    image: `${config.url}/icons/leave.png`,
    pillarUrl: `${config.url}`,
  };
  const userResult = userTemplate(data);
  await sendEmail(to, userSubject, "user", userResult);
};

const sendClosingEmail = async (emailData) => {
  let resourceSubjectData = "";
  let resourceBodyData = "";
  let sponsorBodyData = ``;
  let sponsorSubject = ``;

  resourceBodyData = `<h3>Your project is going to close in 30 days. Make sure you complete all payment (or add hours) requests before it closes.</h3>`;
  resourceSubjectData = `Pillar – Project closing`;
  sponsorBodyData = `<h3>Your project is going to close in 30 days</h3>`;
  sponsorSubject = `Pillar - Project closing`;

  const html = await readFile("./src/emailpage/closingEmail.hbs", "utf8");
  const template = handlebars.compile(html, { strict: true });
  let resourceData = {};
  emailData.resource.forEach(async (mail) => {
    resourceData = {
      name: mail.corematicaName,
      body: resourceBodyData,
      projectTitle: emailData.projectTitle,
      table: `<table>
                  
    <colgroup>
      <col span="1" style="background-color:#9ACAD6;">
      </colgroup>
    <tr>
      <th style="width:100px">Project</th>
      <td style="width:500px"><b>${emailData.projectTitle}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Name</th>
      <td style="width:500px"><b style="text-transform: capitalize">${mail.lastName}, ${mail.firstName}</b></td>
    </tr>
  </table>`,
      image: `${config.url}/icons/clock.png`,
      pillarUrl: `${config.url}`,
    };
    const result = template(resourceData);
    await sendEmail(mail.email, resourceSubjectData, "user", result);
  });
  let sponsorData = {};
  emailData.sponsor.forEach(async (mail) => {
    sponsorData = {
      name: mail.corematicaName,
      body: sponsorBodyData,
      projectTitle: emailData.projectTitle,
      table: `<table>
                  
    <colgroup>
      <col span="1" style="background-color:#9ACAD6;">
      </colgroup>
    <tr>
      <th style="width:100px">Project</th>
      <td style="width:500px"><b>${emailData.projectTitle}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Name</th>
      <td style="width:500px"><b style="text-transform: capitalize">${mail.lastName}, ${mail.firstName}</b></td>
    </tr>
  </table>`,
      image: `${config.url}/icons/clock.png`,
      pillarUrl: `${config.url}`,
    };
    const result = template(sponsorData);
    await sendEmail(mail.email, sponsorSubject, "sponsor", result);
  });
};

const sendClosedEmail = async (emailData) => {
  const configUrl = config.url;
  let resourceSubjectData = "";
  let resourceBodyData = "";
  let sponsorBodyData = ``;
  let sponsorSubject = ``;
  resourceBodyData = `<h3>Your project is now closed and you can no longer make any payment requests for it.</h3>`;
  resourceSubjectData = `Pillar – Project closed`;
  sponsorBodyData = `<h3>Your project is closed</h3>`;
  sponsorSubject = `Pillar - Project closed`;

  const html = await readFile("./src/emailpage/closedEmail.hbs", "utf8");
  const template = handlebars.compile(html, { strict: true });
  let resourceData = {};
  emailData.resource.forEach(async (mail) => {
    resourceData = {
      name: mail.corematicaName,
      body: resourceBodyData,
      projectTitle: emailData.projectTitle,
      table: `<table>
                  
    <colgroup>
      <col span="1" style="background-color:#9ACAD6;">
      </colgroup>
    <tr>
      <th style="width:100px">Project</th>
      <td style="width:500px"><b>${emailData.projectTitle}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Name</th>
      <td style="width:500px"><b style="text-transform: capitalize">${mail.lastName}, ${mail.firstName}</b></td>
    </tr>
  </table>`,
      image: `${configUrl}/icons/closed.png`,
      pillarUrl: `${configUrl}`,
    };
    const result = template(resourceData);
    await sendEmail(mail.email, resourceSubjectData, "user", result);
  });
  let sponsorData = {};
  emailData.sponsor.forEach(async (mail) => {
    sponsorData = {
      name: mail.corematicaName,
      body: sponsorBodyData,
      projectTitle: emailData.projectTitle,
      table: `<table>
                  
    <colgroup>
      <col span="1" style="background-color:#9ACAD6;">
      </colgroup>
    <tr>
      <th style="width:100px">Project</th>
      <td style="width:500px"><b>${emailData.projectTitle}</b></td>
    </tr>
    <tr>
      <th style="width:100px">Name</th>
      <td style="width:500px"><b style="text-transform: capitalize">${mail.lastName}, ${mail.firstName}</b></td>
    </tr>
  </table>`,
      image: `${configUrl}/icons/closed.png`,
      pillarUrl: `${configUrl}`,
    };
    const result = template(sponsorData);
    await sendEmail(mail.email, sponsorSubject, "sponsor", result);
  });
};

module.exports = {
  sendEmail,
  sendResetPasswordEmail,
  sendServiceApprovedEmail,
  sendSignupCreatedEmail,
  sendPaymentCreatedEmail,
  sendAddHoursCreatedEmail,
  sendProposedProjectCreatedEmail,
  sendLeaveRequestEmail,
  sendClosingEmail,
  sendClosedEmail,
};
