// Add client logic here
import Client from "../models/Client.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sendMail } from "../utils/sendMail.js";
import { generateToken } from "../helper/generateToken.js";

// // Get __dirname in ES6
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// ✅ 1. Add Client + Send Upload Link
export const addClient = async (req, res) => {
  try {
    const { name, email, referenceBy, documents } = req.body;

    const newClient = new Client({
      name,
      email,
      referenceBy,
      locationOfInvestor: {},
      residenceAddress: {},
      occupationOrBusiness: {},
      originOfFunds: {},
      sourceOfWealthOrIncome: {},
      mobile: {}, // init as empty object as per schema (type: fieldSchema)
      documents: documents.map((doc) => ({
        name: doc,
        path: "",
        verified: false,
      })),
    });

    const savedClient = await newClient.save();

    const token = generateToken(savedClient._id);
    savedClient.token = token;
    await savedClient.save();

    const uploadLink = `http://localhost:5173/user/form/${token}`;

    const html = `
      <p>Dear ${savedClient.name},</p>

      <p>Many thanks for your registration.</p>

      <p>Please find below checklist which is applicable to NRI & Foreign Nationals, as Indian Residents are not allowed to invest into Gift Fund.</p>

      <h4>Details Required:</h4>
      <ul style="list-style: none; padding: 0;">
        <li><strong>Name:</strong> ____________________________</li>
        <li><strong>Email ID:</strong> ____________________________</li>
        <li><strong>Mobile:</strong> ____________________________</li>
        <li><strong>Location of Investor:</strong> ____________________________</li>
        <li><strong>Residence Address:</strong> ____________________________</li>
        <li><strong>Occupation/Business:</strong> ____________________________</li>
        <li><strong>Origin of Funds:</strong> ____________________________</li>
        <li><strong>Source of Wealth or Income:</strong> ____________________________</li>
      </ul>


      <h4>Documents Required:</h4>
      <p>Please provide <strong>Notarized</strong> copies of the documents listed below:</p>
      <ul>
        ${savedClient.documents.map((doc) => `<li>${doc.name}</li>`).join("")}
      </ul>
      <p>Notarization can be done by a lawyer, bank official, notary, actuary, accountant, or director.</p>

      <p>Kindly upload the documents using the link below:</p>
      <p><a href="${uploadLink}">Click here to submit your form</a></p>

      <p>Thank you!</p>
    `;

    await sendMail(
      email,
      "Onboarding Checklist for an Individual Investor",
      html
    );

    res
      .status(201)
      .json({ message: "Client added and mail sent", client: savedClient });
  } catch (error) {
    console.error("Add client error:", error);
    res.status(500).json({ message: "Error adding client" });
  }
};

// ✅ 2. Get All Clients
export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch clients" });
  }
};

// ✅ 3. Get Single Client
export const getClient = async (req, res) => {
  try {
    let clientId = req.params.id;
    if (clientId === undefined) {
      clientId = req.id;
    }

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.status(200).json(client);
  } catch (error) {
    console.error("Get client error:", error);
    res.status(500).json({ message: "Failed to fetch client" });
  }
};

// ✅ 4. Delete Client + Files
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });

    const folderPath = path.join(
      __dirname,
      `../uploads/${client.name}_${client._id}`
    );
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
    }

    await Client.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Client and files deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting client" });
  }
};

// ✅ 5. Update Client and Documents
export const updateClientAndDocuments = async (req, res) => {
  try {
    const clientId = req.id;
    const files = req.files;

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: "Client not found" });

    client.status = "Pending"; // Reset status on update

    let uploadedDocsList = [];

    // Update document paths if files are uploaded
    if (files && files.length > 0) {
      const updatedDocuments = client.documents.map((doc) => {

        const matchingFile = files.find((file) => file.fieldname === doc.name);
        if (matchingFile) {
          // Delete old file if it exists
         
          uploadedDocsList.push(doc.name); // Add to email list

          return {
            ...doc.toObject(),
            path: matchingFile.path,
            verified: false,
          };
        }
        return doc;
      });

      client.documents = updatedDocuments;
    }

    // Update other client fields
    const {
      mobile,
      locationOfInvestor,
      residenceAddress,
      occupationOrBusiness,
      originOfFunds,
      sourceOfWealthOrIncome,
    } = req.body;
    
    if (mobile) {
      client.mobile = { value: mobile, isVerified: false };
    }

    if (locationOfInvestor) {
      client.locationOfInvestor = { value: locationOfInvestor, isVerified: false };
    }
    if (residenceAddress) {
      client.residenceAddress = { value: residenceAddress, isVerified: false };
    }
    if (occupationOrBusiness) {
      client.occupationOrBusiness = {
        value: occupationOrBusiness,
        isVerified: false,
      };
    }
    if (originOfFunds) {
      client.originOfFunds = { value: originOfFunds, isVerified: false };
    }
    if (sourceOfWealthOrIncome) {
      client.sourceOfWealthOrIncome = {
        value: sourceOfWealthOrIncome,
        isVerified: false,
      };
    }

    client.token = null;
    await client.save();
    // === Send confirmation email ===
    const subject = "Confirmation: Documents Submitted Successfully";

    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Hello ${client.name || "Client"},</h2>
        <p>Thank you for submitting your details. We have received the following documents:</p>
        <ul>
          ${
            uploadedDocsList.length > 0
              ? uploadedDocsList.map((doc) => `<li>${doc}</li>`).join("")
              : "<li>No documents uploaded</li>"
          }
        </ul>
        <p>We will review your submission shortly.</p>
        <p>Best regards,<br/>Your Company Team</p>
      </div>
    `;

    await sendMail(client.email, subject, html, client._id);

    // === Return response ===
    res.status(200).json({
      message: "Client updated successfully. Confirmation email sent.",
      client,
    });
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({
      message: "Failed to update client",
      error: error.message,
    });
  }
};

// ✅ 3. Resend Upload Link for Rejected Fields & Documents
export const resendUploadLink = async (req, res) => {
  try {
    const clientId = req.body.clientId;
    const { rejected, accepted } = req.body;

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: "Client not found" });

    // Handle accepted fields
    if (accepted.acceptedFields.length > 0) {
      accepted.acceptedFields.forEach((field) => {
        if (field in client) {
          client[field].isVerified = true;
        }
      });
    }    
    // Handle accepted documents
    if (accepted.acceptedDocs.length > 0) {
      accepted.acceptedDocs.forEach((docName) => {
        const doc = client.documents.find((d) => d.name === docName);
        if (doc) {
          doc.verified = true;
        }
      });
    }

    // Handle rejected fields
    if (rejected.rejectedFields.length > 0) {
      rejected.rejectedFields.forEach((field) => {
        if (field in client) {
          client[field].isVerified = null;
        }
      });
    }

    // Handle rejected documents
    if (rejected.rejectedDocs.length > 0) {
      rejected.rejectedDocs.forEach((docName) => {
        const doc = client.documents.find((d) => d.name === docName);
        if (doc) {
          doc.verified = null;
        }
      });
    }

    // Update client status based on presence of rejections
    const hasRejections =
      rejected.rejectedFields.length > 0 || rejected.rejectedDocs.length > 0;
    client.status = hasRejections ? "Not Submitted" : "Approved";

    const token = generateToken(client._id);
    client.token = token;
    await client.save();

    const uploadLink = `http://localhost:5173/user/form/${token}`;

    let html = "";

    if (hasRejections) {
      const fieldList = rejected.rejectedFields
        .map((f) => `<li>${f}</li>`)
        .join("");
      const docList = rejected.rejectedDocs
        .map((d) => `<li>${d}</li>`)
        .join("");

      let htmlSections = [`<h2>Hello ${client.name},</h2>`];

      if (fieldList) {
        htmlSections.push(`
          <p>The following fields need to be re-entered:</p>
          <ul>${fieldList}</ul>
        `);
      }

      if (docList) {
        htmlSections.push(`
          <p>The following documents need to be re-uploaded:</p>
          <ul>${docList}</ul>
        `);
      }

      htmlSections.push(`
        <p>Please complete the missing items using the following link:</p>
        <a href="${uploadLink}">Click here to re-submit your form</a>
        <p>Regards,<br/>Admin Team</p>
      `);

      const html = htmlSections.join("\n");

      await sendMail(client.email, "Re-Submission Required", html);
    } else {
      const html = `
        <h2>Hello ${client.name},</h2>
        <p>Congratulations! Your account verification has been successfully completed.</p>
        <p>All your submitted information and documents have been approved.</p>
        <p>You can now access all features of your account.</p>
        <p>Regards,<br/>Admin Team</p>
      `;

      await sendMail(client.email, "Account Verification Approved", html);
    }

    res
      .status(200)
      .json({ message: "Email sent to client", status: client.status });
  } catch (error) {
    console.error("Resend upload link error:", error);
    res.status(500).json({ message: "Failed to resend email" });
  }
};
