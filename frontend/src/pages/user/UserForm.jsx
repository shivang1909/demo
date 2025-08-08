import React, { useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

const UserForm = () => {
  const { token } = useParams();
  const [clientData, setClientData] = useState([]);
  const [linkexpired, setislinkexpired] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    businessLocation: "",
    residentialAddress: "",
    occupation: "",
    fundOrigin: "",
    sourceOfWealth: "",
  });
  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/client/getdetails/${token}`
        );

        const data = await response.json();

        // Explicit 401 handling
        if (response.status === 401) {
          
          setislinkexpired((prev) => !prev);
          // throw new Error("Your link is already used or expired.");
        }

        

        setClientData(data);
        setFormData((prev) => ({
          ...prev,
          name: data.name || "",
          email: data.email || "",
          // mobile: data.mobile || "",
        }));

        const unverifiedDocs = (data.documents || []).filter(
          (doc) => doc.verified !== true
        );
        setRequiredDocs(unverifiedDocs);
      } catch (err) {
        
        console.error("Error loading client data:", err.message);
     
        // Show user-facing error message and avoid showing form
        setClientData(null);
        setFormData(null);
        setRequiredDocs([]);
    
      }
    };

    fetchClientDetails();
  }, [token]);

  const [requiredDocs, setRequiredDocs] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const updated = [...requiredDocs];
      updated[index].file = file;
      setRequiredDocs(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

  // ✅ Validate requiredDocs
  const allFilesUploaded = requiredDocs.every((doc) => doc.file);
  if (!allFilesUploaded) {
    
    setSubmitError("Please upload all required documents.");
    setIsSubmitting(false);
    return;
  }
    try {
      const formDataToSend = new FormData();

      // Append form data
      formDataToSend.append("mobile", formData.mobile);
      formDataToSend.append("locationOfInvestor", formData.businessLocation);
      formDataToSend.append("residenceAddress", formData.residentialAddress);
      formDataToSend.append("occupationOrBusiness", formData.occupation);
      formDataToSend.append("originOfFunds", formData.fundOrigin);
      formDataToSend.append("sourceOfWealthOrIncome", formData.sourceOfWealth);

      // Append files
      requiredDocs.forEach((doc) => {
        if (doc.file) {
          formDataToSend.append(doc.name, doc.file);
        }
      });

      const response = await fetch(
        `http://localhost:5000/api/client/update/${token}`,
        {
          method: "PUT",
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit form");
      }

      setSubmitSuccess(true);
      setShowSuccessModal(true); // Show success modal
    } catch (err) {
      console.error("Form submission error:", err);
      setSubmitError(err.message || "Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  };
const showAddressBusinessInfo =
  (clientData.locationOfInvestor?.isVerified === null) ||
  (clientData.occupationOrBusiness?.isVerified === null) ||
  (clientData.residenceAddress?.isVerified === null);

const showFinancialInfo =
  (clientData.originOfFunds?.isVerified === null) ||
  (clientData.sourceOfWealthOrIncome?.isVerified === null);
  
  return linkexpired ? (
    
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full text-center bg-white p-6 rounded-lg shadow border">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Link Expired</h1>
        <p className="text-gray-700">
          This link has already been used or is no longer valid.
        </p>
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              User Information Form
            </h1>
            <p className="text-slate-600">
              Please review and complete your information below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Personal Information Section */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Personal Information
                </h2>

                <div className="flex flex-col gap-6">
                  <div className="relative w-full min-w-[200px]">
                    <input
                      type="text"
                      name="name"
                      value={formData["name"]}
                      placeholder=" "
                      required
                      disabled={true}
                      className={`peer w-full  border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed placeholder:text-transparent  text-md border rounded-md px-3 py-3 transition-all duration-300 ease focus:outline-none focus:shadow `}
                    />
                    <label
                      htmlFor="name"
                      className={`absolute bg-white px-1 left-2.5 text-slate-400 text-md transition-all transform origin-left peer-focus:-top-2 peer-focus:text-xs peer-focus:scale-90 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-md peer-placeholder-shown:scale-100 pointer-events-none ${
                        formData["name"] ? "-top-2 text-xs scale-90" : ""
                      } `}
                    >
                      {"Name"}
                      {/* {required && <span className="text-red-500 ml-1">*</span>} */}
                    </label>
                  </div>
                  {/* <PeerFocusInput name="name" label="Full Name" disabled /> */}
                  <div className="relative w-full min-w-[200px]">
                    <input
                      type="text"
                      name="email"
                      value={formData["email"]}
                      placeholder=" "
                      required
                      disabled={true}
                      className={`peer w-full  border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed placeholder:text-transparent  text-md border rounded-md px-3 py-3 transition-all duration-300 ease focus:outline-none focus:shadow `}
                    />
                    <label
                      htmlFor="email"
                      className={`absolute bg-white px-1 left-2.5 text-slate-400 text-md transition-all transform origin-left peer-focus:-top-2 peer-focus:text-xs peer-focus:scale-90 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-md peer-placeholder-shown:scale-100 pointer-events-none ${
                        formData["email"] ? "-top-2 text-xs scale-90" : ""
                      } `}
                    >
                      {"Email"}
                      {/* {required && <span className="text-red-500 ml-1">*</span>} */}
                    </label>
                  </div>

                  {clientData.mobile &&
                    clientData.mobile.isVerified === null && (
                      <div className="relative w-full min-w-[200px]">
                        <input
                          type="text"
                          name="mobile"
                          value={formData["mobile"]}
                          placeholder=" "
                          required
                          disabled={false}
                          onChange={handleInputChange}
                          className={`peer w-full border-slate-300 hover:border-slate-400 focus:border-slate-500 placeholder:text-transparent text-md border rounded-md px-3 py-3 transition-all duration-300 ease focus:outline-none focus:shadow`}
                        />
                        <label
                          htmlFor="mobile"
                          className={`absolute bg-white px-1 left-2.5 text-slate-400 text-md transition-all transform origin-left peer-focus:-top-2 peer-focus:text-xs peer-focus:scale-90 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-md peer-placeholder-shown:scale-100 pointer-events-none ${
                            formData["mobile"]
                              ? "-top-2 text-xs scale-90"
                              : ""
                          }`}
                        >
                          {"Mobile Number"}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                      </div>
                    )}
                </div>
              </div>

              {/* Address & Business Information */}

              {showAddressBusinessInfo && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Address & Business Information
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {clientData.locationOfInvestor &&
                    clientData.locationOfInvestor.isVerified === null && (
                      <div className="relative w-full min-w-[200px]">
                        <input
                          type="text"
                          name="businessLocation"
                          value={formData["businessLocation"]}
                          placeholder=" "
                          required
                          disabled={false}
                          onChange={handleInputChange}
                          className={`peer w-full border-slate-300 hover:border-slate-400 focus:border-slate-500 placeholder:text-transparent text-md border rounded-md px-3 py-3 transition-all duration-300 ease focus:outline-none focus:shadow`}
                        />
                        <label
                          htmlFor="businessLocation"
                          className={`absolute bg-white px-1 left-2.5 text-slate-400 text-md transition-all transform origin-left peer-focus:-top-2 peer-focus:text-xs peer-focus:scale-90 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-md peer-placeholder-shown:scale-100 pointer-events-none ${
                            formData["businessLocation"]
                              ? "-top-2 text-xs scale-90"
                              : ""
                          }`}
                        >
                          {"Business Location"}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                      </div>
                    )}

                  {clientData.occupationOrBusiness &&
                    clientData.occupationOrBusiness.isVerified === null && (
                      <div className="relative w-full min-w-[200px]">
                        <input
                          type="text"
                          name="occupation"
                          value={formData["occupation"]}
                          placeholder=" "
                          required
                          disabled={false}
                          onChange={handleInputChange}
                          className={`peer w-full border-slate-300 hover:border-slate-400 focus:border-slate-500 placeholder:text-transparent text-md border rounded-md px-3 py-3 transition-all duration-300 ease focus:outline-none focus:shadow`}
                        />
                        <label
                          htmlFor="occupation"
                          className={`absolute bg-white px-1 left-2.5 text-slate-400 text-md transition-all transform origin-left peer-focus:-top-2 peer-focus:text-xs peer-focus:scale-90 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-md peer-placeholder-shown:scale-100 pointer-events-none ${
                            formData["occupation"]
                              ? "-top-2 text-xs scale-90"
                              : ""
                          }`}
                        >
                          {"Occupation / Business"}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                      </div>
                    )}
                </div>

                <div className="mb-6">
                  {clientData.residenceAddress &&
                    clientData.residenceAddress.isVerified === null && (
                      <div className="relative w-full min-w-[200px]">
                        <input
                          type="text"
                          name="residentialAddress"
                          value={formData["residentialAddress"]}
                          placeholder=" "
                          required
                          disabled={false}
                          onChange={handleInputChange}
                          className={`peer w-full border-slate-300 hover:border-slate-400 focus:border-slate-500 placeholder:text-transparent text-md border rounded-md px-3 py-3 transition-all duration-300 ease focus:outline-none focus:shadow`}
                        />
                        <label
                          htmlFor="residentialAddress"
                          className={`absolute bg-white px-1 left-2.5 text-slate-400 text-md transition-all transform origin-left peer-focus:-top-2 peer-focus:text-xs peer-focus:scale-90 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-md peer-placeholder-shown:scale-100 pointer-events-none ${
                            formData["residentialAddress"]
                              ? "-top-2 text-xs scale-90"
                              : ""
                          }`}
                        >
                          {"Residential Address"}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                      </div>
                    )}
                </div>
              </div>
              )}
              {/* Financial Information */}
              {showFinancialInfo && (

              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                  Financial Information
                </h2>

                <div className="grid grid-cols-1 gap-6">
                  {clientData.originOfFunds &&
                    clientData.originOfFunds.isVerified === null && (
                      <div className="relative w-full min-w-[200px]">
                        <input
                          type="text"
                          name="fundOrigin"
                          value={formData["fundOrigin"]}
                          placeholder=" "
                          required
                          disabled={false}
                          onChange={handleInputChange}
                          className={`peer w-full border-slate-300 hover:border-slate-400 focus:border-slate-500 placeholder:text-transparent text-md border rounded-md px-3 py-3 transition-all duration-300 ease focus:outline-none focus:shadow`}
                        />
                        <label
                          htmlFor="fundOrigin"
                          className={`absolute bg-white px-1 left-2.5 text-slate-400 text-md transition-all transform origin-left peer-focus:-top-2 peer-focus:text-xs peer-focus:scale-90 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-md peer-placeholder-shown:scale-100 pointer-events-none ${
                            formData["fundOrigin"]
                              ? "-top-2 text-xs scale-90"
                              : ""
                          }`}
                        >
                          Origin of Funds
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                      </div>
                    )}

                  {clientData.sourceOfWealthOrIncome &&
                    clientData.sourceOfWealthOrIncome.isVerified === null && (
                      <div className="relative w-full min-w-[200px]">
                        <input
                          type="text"
                          name="sourceOfWealth"
                          value={formData["sourceOfWealth"]}
                          placeholder=" "
                          required
                          disabled={false}
                          onChange={handleInputChange}
                          className={`peer w-full border-slate-300 hover:border-slate-400 focus:border-slate-500 placeholder:text-transparent text-md border rounded-md px-3 py-3 transition-all duration-300 ease focus:outline-none focus:shadow`}
                        />
                        <label
                          htmlFor="sourceOfWealth"
                          className={`absolute bg-white px-1 left-2.5 text-slate-400 text-md transition-all transform origin-left peer-focus:-top-2 peer-focus:text-xs peer-focus:scale-90 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-md peer-placeholder-shown:scale-100 pointer-events-none ${
                            formData["sourceOfWealth"]
                              ? "-top-2 text-xs scale-90"
                              : ""
                          }`}
                        >
                          Source of Wealth or Income
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                      </div>
                    )}
                </div>
              </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Upload Required Documents
                </h2>

                <div className="space-y-6">
                  {requiredDocs.map((doc, index) => (
                    <div key={doc.id || index} className="space-y-1">
                      <label className="text-sm font-medium text-slate-700 block">
                        {doc.name}
                        <span className="text-red-500 ml-1">*</span>
                      </label>

                      <div className="flex gap-4 items-center">
                        {/* Show file name if uploaded, otherwise show placeholder */}
                        {requiredDocs[index]?.file ? (
                          <label htmlFor={requiredDocs[index].file.name} className="flex-1 px-3 py-2 text-sm text-slate-700 bg-green-50 border border-green-200 rounded-md overflow-hidden whitespace-nowrap text-ellipsis">
                            📄 {requiredDocs[index].file.name}
                          </label>
                        ) : (
                          <label className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-400 italic">
                            No file selected
                          </label>
                        )}

                        <label className="cursor-pointer inline-block px-4 py-2 text-sm font-medium bg-blue-600 text-white border border-blue-700 rounded-md hover:bg-blue-700 transition duration-200">
                          Upload
                          <input
                            type="file"
                            name={doc.name}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => handleFileChange(index, e)}
                          />
                        </label>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>


          <div className="flex justify-between items-center mt-8 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            {/* Status messages */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {submitError}
            </div>
          )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-fit px-8 py-3 justify-self-end bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-sm disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit form"}
            </button>
          </div>
        </form>
      </div>
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <h2 className="text-xl font-semibold text-green-600 mb-4">
              Success!
            </h2>
            <p className="mb-6">Form submitted successfully.</p>
            <button
              onClick={() => {
                setislinkexpired(true)
                setShowSuccessModal(false); // Hide modal
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserForm;
