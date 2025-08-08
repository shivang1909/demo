import React, { useState } from "react";
import { Mail } from "lucide-react";

const documentsList = [
  "Aadhaar Card",
  "PAN Card",
  "Passport",
  "Utility Bill",
  "Driving License",
  "Bank Statement",
  "Voter ID",
  "Rent Agreement",
  "Birth Certificate",
  "Income Proof",
];

const AddClientForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  referenceBy: "",  // ✅ Added
     documents: [],
  });

  const [isTyping, setIsTyping] = useState(false);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (!isTyping && value.trim() !== "") setIsTyping(true);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocumentToggle = (doc) => {
    setFormData((prev) => {
      const updated = prev.documents.includes(doc)
        ? prev.documents.filter((d) => d !== doc)
        : [...prev.documents, doc];
      return { ...prev, documents: updated };
    });
  };

  const renderInput = (name, label, type = "text", full = false) => (
    <div className={`w-full ${full ? "md:col-span-2" : ""}`}>
      <div className="relative w-full min-w-[200px]">
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          placeholder=" "
          required
          className="peer w-full bg-transparent placeholder:text-transparent text-slate-700 text-md border border-slate-300 rounded-md px-3 py-3 transition-all duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 focus:shadow"
        />
        <label
          htmlFor={name}
          className={`
            absolute bg-white px-1 left-2.5 text-slate-400 text-md transition-all transform origin-left
            peer-focus:-top-2 peer-focus:text-xs peer-focus:scale-90
            peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-md peer-placeholder-shown:scale-100
            ${formData[name] ? "-top-2 text-xs scale-90" : ""}
          `}
        >
          {label}
        </label>
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/client/add", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit form");
      }

      alert("Client added successfully");
      setFormData({
        name: "",
        email: "",
        referenceBy: "",  // ✅ Reset new field
        documents: [],
      });
      setIsTyping(false);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Mobile Preview Toggle */}
      <div className="md:hidden mb-4 text-right">
        <button
          onClick={() => setShowPreviewMobile(!showPreviewMobile)}
          className="bg-gray-200 text-sm px-3 py-1 rounded"
        >
          {showPreviewMobile ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row transition-all duration-500 ease-in-out">
        {/* Form Panel */}
        <form
          onSubmit={handleSubmit}
          className={`bg-white rounded-xl p-6 space-y-6 w-full transition-all duration-500 ${
            isTyping ? "md:w-[50%]" : "md:w-[50%]"
          }`}
        >
          <h2 className="text-2xl font-semibold text-gray-800">
            Add New Client
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {renderInput("name", "Full Name")}
            {renderInput("email", "Email Address", "email")}
            {renderInput("referenceBy", "Referred By")}  {/* ✅ New field added */}
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Select Documents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {documentsList.map((doc) => (
                <label
                  key={doc}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg border border-gray-200 cursor-pointer transition-all hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.documents.includes(doc)}
                    onChange={() => handleDocumentToggle(doc)}
                    className="w-5 h-5 accent-blue-600"
                  />
                  <span className="text-gray-700 text-sm">{doc}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition duration-200"
            >
              Submit
            </button>
          </div>
        </form>

        {/* Preview Panel */}
        <div className="md:block w-full md:w-[50%] transition-all duration-500">
          <div className="bg-white p-6 mt-6 md:mt-0 md:ml-6 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Mail className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Email Preview
              </h3>
            </div>

            <div className="space-y-4">
              {/* Email Header */}
              <div className="">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>
                    To: {formData.email.trim() || "youremail@gmail.com"}
                  </span>
                  <span>
                    {new Date().toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-b border-gray-200 pb-2">
              <h2 className="py-2 font-bold">
                Subject : Onboarding Checklist for an individual investor
              </h2>
            </div>
            <div className="text-sm text-gray-700 space-y-4 leading-relaxed pt-2">
              <div>
                <p className="text-gray-800 font-semibold">
                  <span>Dear {formData.name.trim() || "Client"},</span>
                </p>
              </div>

              <div>
                <span className="text-gray-500">
                  Many thanks for your email
                </span>
              </div>

              <p>
                Please find the below checklist mail which is applicable to NRI
                & foreign nationals, as Indian Residents are not allowed to
                invest into gift funds.
              </p>

              <h4 className="font-semibold text-lg mb-2">Details Required:</h4>
              <table className="w-full text-sm text-gray-800">
                <tbody>
                  {[
                    "Mobile",
                    "Location of Investor",
                    "Residence Address",
                    "Occupation / Business",
                    "Origin of Funds",
                    "Source of Wealth or Income",
                  ].map((item, index) => (
                    <tr key={index} className="align-middle h-10">
                      <td className="w-1/2 font-medium">{item}:</td>
                      <td className="w-1/2">
                        <div className="border-b border-gray-400 w-full h-5"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {formData.documents.length > 0 && (
                <div>
                  <p className="mb-1">
                    You need to submit the following documents:
                  </p>
                  <ul className="flex flex-col gap-2 mt-2">
                    {formData.documents.map((doc) => (
                      <li key={doc} className="text-black text-xs font-medium">
                        ~ {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="pt-4 text-gray-800">
                Regards,
                <br />
                <span className="font-medium">Admin Team</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddClientForm;
