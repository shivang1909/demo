import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { ArrowLeft, FileText, Check, X } from "lucide-react";
import  { useState, useMemo, useEffect, useRef } from "react";
import {
  Eye,
  
  
  Filter,
  Search,
  ChevronDown,
  ChevronUp,

  User,
  Clock,
  CheckCircle,
  Mail,
  Calendar,
  DownloadIcon,
} from "lucide-react";
import axios from "axios";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
    

const TabButton = ({ isActive, onClick, children, icon: Icon }) => (
    <button
      type="button" // ADD THIS
      onClick={(e) => {
        e.preventDefault(); // ADD THIS
        onClick();
      }}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? "bg-blue-500 text-white shadow-md"
          : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </button>
  );
  const MailPreview = () => {
    const isApproved = approveRejectMode === "approve";

    const rejectedFields = rejected.rejectedfields || [];
    const rejectedDocuments = rejected.rejecteddocuments || [];

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ">
        <div className="flex items-center space-x-2 mb-4">
          <Mail className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
        </div>

        <div className="space-y-4">
          {/* Email Header */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>To: {selectedUser?.email}</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <h4
              className={`text-lg font-semibold ${
                isApproved ? "text-green-700" : "text-red-700"
              }`}
            >
              Account Verification {isApproved ? "Approved" : "Rejected"}
            </h4>
          </div>

          {/* Email Body */}
          <div className="space-y-4 text-sm">
            <p>Dear {selectedUser?.name},</p>

            {isApproved ? (
              <div className="space-y-2">
                <p>
                  Congratulations! Your account verification has been
                  successfully completed. All your submitted information and
                  documents have been approved.
                </p>

                <p>
                  You can now access all features of your account. Welcome
                  aboard!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p>
                  We have reviewed your account verification submission.
                  Unfortunately, some items require attention before we can
                  approve your account.
                </p>

                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="font-medium text-red-800">
                    ❌ Items requiring attention:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-red-700">
                    {rejectedFields.map((field, i) => (
                      <li key={`rejected-field-${i}`}>{field}</li>
                    ))}
                    {rejectedDocuments.map((doc, i) => (
                      <li key={`rejected-doc-${i}`}>{doc}</li>
                    ))}
                  </ul>
                </div>

                <p>
                  Please review and resubmit the highlighted items. Our team
                  will process your updated information within 2–3 business
                  days.
                </p>
              </div>
            )}

            <p>
              If you have any questions, please don't hesitate to contact our
              support team.
            </p>

            <p>
              Best regards,
              <br />
              The Verification Team
            </p>
          </div>

          {/* Email Footer */}
          <div className="border-t border-gray-200 pt-4 text-xs text-gray-500">
            <p>
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderInfoCards = () => {
    if (!selectedUser) return null;

    const rawFields = [
      { key: "mobile", title: "Mobile Number" },
      { key: "locationOfInvestor", title: "Business Location" },
      { key: "occupationOrBusiness", title: "Occupation" },
      { key: "residenceAddress", title: "Residential Address" },
      { key: "originOfFunds", title: "Origin of Funds" },
      { key: "sourceOfWealthOrIncome", title: "Source of Income" },
    ];

    // Filter only fields where isVerified is false
    const unverifiedFields = rawFields
      .filter(({ key }) => selectedUser[key]?.isVerified === false)
      .map(({ key, title }) => ({
        key,
        title,
        value: selectedUser[key]?.value,
      }));

    if (unverifiedFields.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No Data</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {unverifiedFields.map((field,index) => (
          <ReviewCard
            key={index}
            title={field.title}
            value={field.value}
            isSelected={accepted.acceptedfields.some((f) => f === field.key)}
            onToggle={() => handleCardToggle(field.key, "field")}
          />
        ))}
      </div>
    );
  };

  const renderDocumentCards = () => {
    if (!selectedUser) return null;

    // Filter only unverified documents
    const unverifiedDocs =
      selectedUser.documents?.filter((doc) => doc.verified === false) || [];

    if (unverifiedDocs.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No Data</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {unverifiedDocs.map((doc, idx) => {
          const docKey = `document_${idx + 1}`;
          const docName = doc.name;

          return (
            <ReviewCard
              key={docKey}
              title={docName}
              isSelected={accepted.accepteddocuments.some(
                (d) => d === doc.name
              )}
              isDocument={true}
              path={doc.path}
              onToggle={() => handleCardToggle(doc.name, "document")}
            />
          );
        })}
      </div>
    );
  };

const ProgressBar = () => {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-6 left-0 right-2 h-1 bg-gray-200 rounded-full">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Step indicators */}
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div
                key={step.id}
                className="relative flex flex-col items-center"
              >
                <button
                  // onClick={() => handleStepNavigation(index)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-green-500 text-white ring-4 ring-green-100"
                      : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </button>
                <span
                  className={`mt-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-green-600"
                      : isCompleted
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
const StepContent = React.memo(({
  currentStep,
  selectedUser,
  pendingRequestsTab,
  approveRejectMode,
  handleStepNavigation,
  handleRejectedMail,
  handleSaveAndNext,
  renderInfoCards,
  renderDocumentCards,
  closeExpandedView,
  setPendingRequestsTab
}) => {
  if (!selectedUser) return null;

  switch (currentStep) {
    case 0: // Profile
      return (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <div className="w-1/4">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Personal Information
              </h3>
            </div>
            {selectedUser.status !== "Approved" && (
              <div className="w-1/2">
                <ProgressBar />
              </div>
            )}
            {selectedUser.status !== "Approved" && (
              <div className="w-1/4 flex justify-end">
                <button
                  onClick={() => handleStepNavigation(1)}
                  className="flex items-center gap-2 px-5 py-3 text-md cursor-pointer active:scale-95 transition-all duration-300 bg-purple-900 text-white font-medium rounded-full hover:bg-purple-800"
                >
                  Pending Request <FaArrowRight />
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-white h-fit flex justify-between items-start rounded-2xl p-8 shadow-sm border border-gray-100">
            <div>
              <div className="grid grid-cols-1 gap-8">
                {selectedUser.mobile?.isVerified && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Mobile Number
                    </p>
                    <p className="text-xl font-semibold text-gray-900">
                      {selectedUser.mobile.value}
                    </p>
                  </div>
                )}
                {/* Include all other verified fields similarly */}
              </div>
            </div>

            <div className="bg-white w-5xl rounded-2xl p-4">
              <div className="grid grid-cols-2 gap-5 max-h-fit overflow-y-auto">
                {selectedUser.documents?.some(doc => doc.verified === true) ? (
                  selectedUser.documents
                    .filter(doc => doc.verified === true)
                    .map((doc, idx) => (
                      <DocumentCard key={idx} doc={doc} />
                    ))
                ) : (
                  <NoDocumentsPlaceholder />
                )}
              </div>
            </div>
          </div>
        </div>
      );

    case 1: // Pending Requests
      return (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div className="w-full">
              <button
                onClick={() => handleStepNavigation(0)}
                className="flex items-center gap-2 px-5 py-3 text-md cursor-pointer active:scale-95 transition-all duration-300 bg-gray-200 border border-gray-200 text-gray-600 font-medium rounded-full hover:bg-gray-200"
              >
                <ArrowLeft className="w-5 h-5" /> Back to Profile
              </button>
            </div>
            {selectedUser.status !== "Approved" && (
              <div className="w-full">
                <ProgressBar />
              </div>
            )}
            <div className="w-full flex justify-end">
              {approveRejectMode === "reject" ? (
                <button
                  onClick={handleRejectedMail}
                  className="flex items-center gap-2 px-5 py-3 text-md cursor-pointer active:scale-95 transition-all duration-300 bg-purple-900 text-white font-medium rounded-full hover:bg-purple-800"
                >
                  Send Rejected Mail <FaArrowRight />
                </button>
              ) : (
                <button
                  onClick={handleSaveAndNext}
                  className="flex items-center gap-2 px-5 py-3 text-md cursor-pointer active:scale-95 transition-all duration-300 bg-purple-900 text-white font-medium rounded-full hover:bg-purple-800"
                >
                  Save & Next <FaArrowRight />
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border h-full border-gray-100">
            <div className="flex justify-between">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">
                Review Information{" "}
                <span className="text-xs font-medium">
                  (click on the cards for approve/decline data)
                </span>
              </h3>
              <ToggleSwitch />
            </div>

            <div className="flex gap-8 h-full">
              <div className="w-1/2 flex flex-col">
                <div className="flex space-x-2 mb-6">
                  <TabButton
                    type="button"
                    isActive={pendingRequestsTab === "info"}
                    onClick={() => setPendingRequestsTab("info")}
                    icon={User}
                  >
                    Information
                  </TabButton>
                  <TabButton
                    type="button"
                    isActive={pendingRequestsTab === "documents"}
                    onClick={() => setPendingRequestsTab("documents")}
                    icon={FileText}
                  >
                    Documents
                  </TabButton>
                </div>

                <div className="flex-1 overflow-y-auto tiny-scrollbar min-h-0">
                  <div className={pendingRequestsTab === "info" ? "block" : "hidden"}>
                    {renderInfoCards()}
                  </div>
                  <div className={pendingRequestsTab === "documents" ? "block" : "hidden"}>
                    {renderDocumentCards()}
                  </div>
                </div>
              </div>

              <div className="w-1/2 max-h-[400px]">
                <MailPreview />
              </div>
            </div>
          </div>
        </div>
      );

    case 2: // Approval
      setTimeout(() => {
        closeExpandedView();
      }, 3000);
      return (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-8 border-gray-100">
            <div>
              <DotLottieReact
                className="w-44 h-44 mx-auto mb-6"
                src="https://lottie.host/db5765e0-35cf-4ec4-ac98-71f73659d7a2/0OjTMxUof1.lottie"
                autoplay
              />
              <span className="text-center text-2xl font-bold text-green-600 block mb-4">
                Approved Successfully
              </span>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
});

// Helper components
const DocumentCard = ({ doc }) => (
  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 border border-gray-100 hover:border-gray-200">
    <div className="flex items-center space-x-4">
      <div className="p-4 bg-blue-100 rounded-xl">
        <FileText className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <p className="text-lg font-semibold text-gray-900">
          {doc.name || `Document ${idx + 1}`}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Uploaded on {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
    <div className="flex gap-2">
      <DocumentActionButton 
        label="View"
        href={`http://localhost:5000/${doc.path.replace(/\\/g, "/")}`}
      />
      <DocumentActionButton 
        label="Download"
        onClick={async () => {
          // Download logic here
        }}
      />
    </div>
  </div>
);

const NoDocumentsPlaceholder = () => (
  <div className="ml-20 flex flex-col items-center justify-center h-full text-center py-20">
    <div className="bg-indigo-100 text-indigo-600 rounded-full p-4 mb-6">
      <FileText size={40} />
    </div>
    <h2 className="text-2xl font-semibold text-slate-800 mb-2">
      No Data Available
    </h2>
    <p className="text-gray-500 max-w-md">
      You haven't updated any documents yet. Start by Approve/decline pending requests.
    </p>
  </div>
);

export default StepContent;