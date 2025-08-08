import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Eye,
  Info,
  FileText,
  X,
  Filter,
  Search,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Check,
  User,
  Clock,
  CheckCircle,
  Mail,
  Calendar,
  DownloadIcon,
} from "lucide-react";
import axios from "axios";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { FaArrowRight } from "react-icons/fa6";

import { toast } from "react-hot-toast";
import { handleDownloadDocuments } from "../../helper/downloaddocs";
const FilterPanel = ({ filters, setFilters, resetFilters }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-2 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Filter className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.name}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Search by name or reference..."
            />
          </div>
        </div>

        <div className="">
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Not Submitted">Not Submitted</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

        <button
          onClick={resetFilters}
          className="text-sm rounded-lg transition-all duration-300 active:scale-95 border border-dashed hover:bg-purple-50 text-purple-800 hover:text-purple-800 cursor-pointer font-medium"
        >
          Reset All
        </button>
      </div>
    </div>
  );
};
const ProfessionalTable = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [currentStep, setCurrentStep] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const [filters, setFilters] = useState({
    name: "",
    status: "all",
  });

  // Toggle for approve/reject mode
  const [approveRejectMode, setApproveRejectMode] = useState("approve"); // 'approve' or 'reject'

  const [pendingRequestsTab, setPendingRequestsTab] = useState("info");

  const [cardSelections, setCardSelections] = useState({});
  // Card selections for pending requests

  const tableProfileRefs = useRef({});
  const expandedProfileRef = useRef(null);
  const animatingProfileRef = useRef(null);
  const expandedViewRef = useRef(null);
  const tableContainerRef = useRef(null);

  // Sample data with additional status field
  const [data, setdata] = useState([]);

  const steps = [
    { id: 0, name: "Profile", icon: User },
    { id: 1, name: "Pending Requests", icon: Clock },
    { id: 2, name: "Approval", icon: CheckCircle },
  ];

  useEffect(() => {
    if (isExpanded) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => document.body.classList.remove("no-scroll");
  }, [isExpanded]);

  const fetchClients = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/client/getall",
        {
          withCredentials: true, // IMPORTANT: if your backend is checking cookies for auth
        }
      );
      setdata(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };
  const [rejected, setRejected] = useState({
    rejectedfields: [],
    rejecteddocuments: [],
  });

  const [accepted, setAccepted] = useState({
    acceptedfields: [],
    accepteddocuments: [],
  });
  useEffect(() => {
    if (!selectedUser) return;

    if (selectedUser.status === "Pending") {
      setCurrentStep((prev) => prev + 1);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (
      rejected.rejectedfields.length > 0 ||
      rejected.rejecteddocuments.length > 0
    ) {
      setApproveRejectMode("reject");
    } else {
      setApproveRejectMode("approve");
    }
  }, [rejected]);

  const handleCardToggle = (field, type) => {
    if (type === "document") {
      // Find the matching document object based on the name
      const matchedDoc = accepted.accepteddocuments.find(
        (doc) => doc === field
      );

      if (matchedDoc) {
        // Move to rejected
        setAccepted((prev) => ({
          ...prev,
          accepteddocuments: prev.accepteddocuments.filter(
            (doc) => doc !== field
          ),
        }));
        setRejected((prev) => ({
          ...prev,
          rejecteddocuments: [...prev.rejecteddocuments, matchedDoc],
        }));
      } else {
        // If it's in rejected, move it back to accepted
        const matchedRejectedDoc = rejected.rejecteddocuments.find(
          (doc) => doc === field
        );

        if (matchedRejectedDoc) {
          setRejected((prev) => ({
            ...prev,
            rejecteddocuments: prev.rejecteddocuments.filter(
              (doc) => doc !== field
            ),
          }));
          setAccepted((prev) => ({
            ...prev,
            accepteddocuments: [...prev.accepteddocuments, matchedRejectedDoc],
          }));
        }
      }
    } else {
      const inAccepted = accepted.acceptedfields.includes(field);

      if (inAccepted) {
        // Move to rejected
        setAccepted((prev) => ({
          ...prev,
          acceptedfields: prev.acceptedfields.filter((key) => key !== field),
        }));
        setRejected((prev) => ({
          ...prev,
          rejectedfields: [...prev.rejectedfields, field],
        }));
      } else {
        // Move to accepted
        setRejected((prev) => ({
          ...prev,
          rejectedfields: prev.rejectedfields.filter((key) => key !== field),
        }));
        setAccepted((prev) => ({
          ...prev,
          acceptedfields: [...prev.acceptedfields, field],
        }));
      }
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleViewDetails = (user, event) => {
    if (isExpanded) return;

    const tableProfileElement = tableProfileRefs.current[user.id];

    if (tableProfileElement) {
      const rect = tableProfileElement.getBoundingClientRect();
      setAnimationData({
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
        userId: user.id,
      });
    }
    const infoFields = [
      "mobile",
      "locationOfInvestor",
      "occupationOrBusiness",
      "residenceAddress",
      "originOfFunds",
      "sourceOfWealthOrIncome",
    ];

    setAccepted({
      acceptedfields: infoFields.filter(
        (field) => user[field]?.isVerified === false
      ),
      accepteddocuments: user.documents
        .filter((doc) => doc.verified === false)
        .map((doc) => doc.name),
    });

    setSelectedUser(user);
    setIsAnimating(true);
    setCurrentStep(0);

    setTimeout(() => {
      setIsExpanded(true);
    }, 50);
  };

  const closeExpandedView = () => {
    fetchClients();
    setAccepted({ acceptedfields: [], accepteddocuments: [] });
    setRejected({ rejectedfields: [], rejecteddocuments: [] });
    setApproveRejectMode("approve");
    setSelectedUser(null);
    setTimeout(() => {
      setAnimationData(null);
      // Reset selections
    }, 600);

    setIsAnimating(false);
    setIsExpanded(false);
    setCurrentStep(0);
    setCurrentStep((prev) => prev + 0);
  };

  const handleStepNavigation = (stepIndex) => {
    if (selectedUser.status === "Not Submitted") {
      toast.error("Client has not submitted any documents.");
      return;
    }
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };
  const handleRejectedMail = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/client/resend", // same endpoint as Save & Next
        {
          clientId: selectedUser._id,
          accepted: {
            acceptedFields: accepted.acceptedfields,
            acceptedDocs: accepted.accepteddocuments,
          },
          rejected: {
            rejectedFields: rejected.rejectedfields,
            rejectedDocs: rejected.rejecteddocuments,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      closeExpandedView(); // close view after sending
      // Optional: toast.success("Rejected mail sent!")
    } catch (error) {
      if (error.response) {
        console.error("❌ Server error:", error.response.data);
      } else if (error.request) {
        console.error("❌ No response:", error.request);
      } else {
        console.error("❌ Request error:", error.message);
      }
      // Optional: toast.error("Failed to send rejected mail.");
    }
  };

  const handleSaveAndNext = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/client/resend",
        {
          clientId: selectedUser._id,
          accepted: {
            acceptedFields: accepted.acceptedfields,
            acceptedDocs: accepted.accepteddocuments,
          },
          rejected: {
            rejectedFields: rejected.rejectedfields,
            rejectedDocs: rejected.rejecteddocuments,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            // You can include Authorization token here if needed
            // Authorization: `Bearer ${token}`,
          },
          withCredentials: true, // Sends cookies with request
        }
      );

      // ✅ Optional: success action
      selectedUser.status = "Approved"; // Update status to Pending
      setCurrentStep((prev) => prev + 1);
      // You can show a success toast or move to next step here
      // e.g., toast.success('Saved successfully!');
    } catch (error) {
      // ❌ Handle errors
      if (error.response) {
        console.error(
          "❌ Server responded with an error:",
          error.response.data
        );
      } else if (error.request) {
        console.error("❌ No response received:", error.request);
      } else {
        console.error("❌ Error setting up request:", error.message);
      }
    }
  };

  // Close expanded view on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isExpanded) {
        closeExpandedView();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isExpanded]);

  // Handle animation completion
  useEffect(() => {
    if (isExpanded && isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 800); // Animation duration + buffer

      return () => clearTimeout(timer);
    }
  }, [isExpanded, isAnimating]);

  const resetFilters = () => {
    setFilters({
      name: "",
      status: "all",
    });
  };

  // Filter logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const nameOrRefMatch =
        item.name?.toLowerCase().includes(filters.name.toLowerCase()) ||
        item.referenceBy?.toLowerCase().includes(filters.name.toLowerCase());

      const statusMatch =
        filters.status === "all" || item.status === filters.status;

      return nameOrRefMatch && statusMatch;
    });
  }, [data, filters]);

  // Generate avatar color based on name
  const getAvatarColor = (name) => {
    const colors = [
      "#ef4444",
      "#f97316",
      "#f59e0b",
      "#eab308",
      "#84cc16",
      "#22c55e",
      "#10b981",
      "#14b8a6",
      "#06b6d4",
      "#0ea5e9",
      "#3b82f6",
      "#6366f1",
      "#8b5cf6",
      "#a855f7",
      "#d946ef",
      "#ec4899",
      "#f43f5e",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const ProfileAvatar = ({
    name,
    size = "large",
    className = "",
    isRef = false,
    userId = null,
  }) => {
    const sizeClasses = {
      small: "w-8 h-8 text-sm",
      medium: "w-12 h-12 text-lg",
      large: "w-20 h-20 text-2xl",
      xlarge: "w-32 h-32 text-4xl",
    };

    const refProps =
      isRef && userId
        ? {
            ref: (el) => {
              if (el) tableProfileRefs.current[userId] = el;
            },
          }
        : {};

    return (
      <div
        {...refProps}
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-bold shadow-lg ${className}`}
        style={{ backgroundColor: getAvatarColor(name) }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  };

  // Animated profile component with enhanced animation
  const AnimatedProfile = () => {
    if (!isAnimating || !animationData || !selectedUser) return null;

    const getEndPosition = () => {
      if (expandedProfileRef.current) {
        const rect = expandedProfileRef.current.getBoundingClientRect();
        return {
          endX: rect.left + rect.width / 2,
          endY: rect.top + rect.height / 2,
        };
      }
      return { endX: 200, endY: 200 }; // Fallback position
    };

    const { endX, endY } = getEndPosition();

    return (
      <div
        ref={animatingProfileRef}
        className="fixed z-50 pointer-events-none"
        style={{
          left: animationData.startX - 16, // Center the 32px avatar
          top: animationData.startY - 16,
          transform: isExpanded
            ? `translate(${endX - animationData.startX}px, ${
                endY - animationData.startY
              }px) scale(4)`
            : "translate(0px, 0px) scale(1)",
          transition: "all 0.8s cubic-bezier(0.23, 1, 0.32, 1)",
          zIndex: 9999,
        }}
      >
        <ProfileAvatar
          name={selectedUser.name}
          size="small"
          className="shadow-2xl"
        />
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

  const ToggleSwitch = () => {
    return (
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center bg-gray-100 rounded-full p-1">
          <button
            type="button" // ADD THIS
            onClick={(e) => {
              e.preventDefault(); // ADD THIS
            }}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
              approveRejectMode === "reject"
                ? "bg-red-500 text-white shadow-lg"
                : "text-gray-600 hover:text-red-500"
            }`}
          >
            Reject
          </button>
          <button
            type="button" // ADD THIS
            onClick={(e) => {
              e.preventDefault(); // ADD THIS
            }}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
              approveRejectMode === "approve"
                ? "bg-green-500 text-white shadow-lg"
                : "text-gray-600 hover:text-green-500"
            }`}
          >
            Approve
          </button>
        </div>
      </div>
    );
  };

  const ReviewCard = ({
    title,
    value,
    isSelected,
    onToggle,
    isDocument = false,
    path = null,
  }) => {
    return (
      <div
        onClick={(e) => {
          e.preventDefault(); // ADD THIS
          onToggle();
        }}
        className={`relative p-6 rounded-xl border shadow-md transition-all duration-300 group hover:shadow-lg cursor-pointer ${
          isSelected
            ? "border-green-400 bg-green-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        {/* Status badge */}
        <div className="absolute top-4 right-4">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
              isSelected ? "bg-green-500" : "bg-gray-400"
            }`}
          >
            {isSelected ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </div>
        </div>

        {/* Content layout */}
        <div className="flex items-start gap-4">
          {/* Icon */}
          {isDocument && (
            <div className="w-10 h-10 flex items-center justify-center bg-white text-gray-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          )}

          {/* Text content */}
          <div className="flex flex-col flex-1 space-y-1">
            <h4 className="text-sm text-gray-500 font-medium uppercase tracking-wide">
              {title}
            </h4>

            <p className="text-lg font-semibold text-gray-900">{value}</p>

            {isDocument && (
              <div className="pt-2">
                <a
                  href={`http://localhost:5000/${path.replace(/\\/g, "/")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-block text-sm font-semibold text-gray-600 hover:text-gray-800 border border-green-100 px-3 py-1.5 rounded-md bg-white hover:bg-gray-100 transition-all active:scale-95 duration-200"
                >
                  View Document
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

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
        {unverifiedFields.map((field) => (
          <ReviewCard
            key={field.key}
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

  const renderStepContent = () => {
    if (!selectedUser) return null;

    switch (currentStep) {
      case 0: // Profile
        return (
          <>
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
              {/* PERSONAL INFORMATION */}
              <div className="bg-white h-fit flex justify-between items-start rounded-2xl p-8 shadow-sm border border-gray-100">
                <div>
                  <div className="grid grid-cols-1  gap-8">
                    {/* Verified Fields */}
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
                    {selectedUser.locationOfInvestor?.isVerified && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Location of Investor
                        </p>
                        <p className="text-xl font-semibold text-gray-900">
                          {selectedUser.locationOfInvestor.value}
                        </p>
                      </div>
                    )}
                    {selectedUser.residenceAddress?.isVerified && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Residential Address
                        </p>
                        <p className="text-xl font-semibold text-gray-900">
                          {selectedUser.residenceAddress.value}
                        </p>
                      </div>
                    )}
                    {selectedUser.occupationOrBusiness?.isVerified && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Occupation / Business
                        </p>
                        <p className="text-xl font-semibold text-gray-900">
                          {selectedUser.occupationOrBusiness.value}
                        </p>
                      </div>
                    )}
                    {selectedUser.originOfFunds?.isVerified && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Origin of Funds
                        </p>
                        <p className="text-xl font-semibold text-gray-900">
                          {selectedUser.originOfFunds.value}
                        </p>
                      </div>
                    )}
                    {selectedUser.sourceOfWealthOrIncome?.isVerified && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Source of Wealth or Income
                        </p>
                        <p className="text-xl font-semibold text-gray-900">
                          {selectedUser.sourceOfWealthOrIncome.value}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* DOCUMENTS */}
                <div className="bg-white w-5xl rounded-2xl p-4 ">
                  <div className="grid grid-cols-2 gap-5 max-h-fit overflow-y-auto">
                    {selectedUser.documents?.some(
                      (doc) => doc.verified === true
                    ) ? (
                      selectedUser.documents
                        .filter((doc) => doc.verified === true)
                        .map((doc, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 border border-gray-100 hover:border-gray-200"
                          >
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
                            <a
                              href={`http://localhost:5000/${doc.path.replace(
                                /\\/g,
                                "/"
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              View
                            </a>
                            <button
                              onClick={async () => {
                                const fileUrl = `http://localhost:5000/${doc.path.replace(
                                  /\\/g,
                                  "/"
                                )}`;
                                const response = await fetch(fileUrl, {
                                  credentials: "include", // if cookie-based auth is used
                                });
                                const blob = await response.blob();
                                const downloadUrl =
                                  window.URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = downloadUrl;
                                a.download = doc.name || `Document-${idx + 1}`; // set default filename
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                window.URL.revokeObjectURL(downloadUrl);
                              }}
                              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              Download
                            </button>
                          </div>
                        ))
                    ) : (
                      <div className="ml-20 flex flex-col items-center justify-center h-full text-center py-20">
                        {/* Icon */}
                        <div className="bg-indigo-100 text-indigo-600 rounded-full p-4 mb-6">
                          <FileText size={40} />
                        </div>

                        {/* Main Heading */}
                        <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                          No Data Available
                        </h2>

                        {/* Description */}
                        <p className="text-gray-500 max-w-md">
                          You haven’t updated any documents yet. Start by
                          Approve/decline pending requestes.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* NEXT BUTTON */}
            </div>
          </>
        );

      case 1: // Pending Requests
        return (
          <>
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

              <div className="bg-white rounded-2xl p-8 shadow-sm border h-full border-gray-100 ">
                <div className="flex justify-between ">
                  <h3 className="text-2xl font-bold text-gray-900 mb-8">
                    Review Information{" "}
                    <span className="text-xs font-medium">
                      (click on the cards for approve/decline data)
                    </span>
                  </h3>
                  <ToggleSwitch />
                </div>

                <div className="flex gap-8 h-full ">
                  {/* Left Section - Tabs and Cards */}
                  <div className="w-1/2 flex flex-col max-h-[400px]">
                    {/* Tab Navigation */}
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

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto tiny-scrollbar">
                     <div className="flex-1 overflow-y-auto tiny-scrollbar">
  <div className={pendingRequestsTab === "info" ? "block" : "hidden"}>
    {renderInfoCards()}
  </div>
  <div className={pendingRequestsTab === "documents" ? "block" : "hidden"}>
    {renderDocumentCards()}
  </div>
</div>
                    </div>
                  </div>

                  {/* Right Section - Mail Preview */}
                  <div className="w-1/2 max-h-[400px]">
                    <MailPreview />
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 2: // Approval
        setTimeout(() => {
          closeExpandedView();
        }, 3000);
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8   border-gray-100">
              <div>
                <DotLottieReact
                  className="w-44 h-44 mx-auto mb-6"
                  src="https://lottie.host/db5765e0-35cf-4ec4-ac98-71f73659d7a2/0OjTMxUof1.lottie"
                  autoplay
                />
                <span className="text-center text-2xl font-bold text-green-600 block mb-4">
                  Aprroved Successfully
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const ExpandedView = React.memo(()=>{
    if (!selectedUser) return null;

    {console.log("render expandview")}
    return (
      <div
        ref={expandedViewRef}
        className={`fixed inset-0 z-40 bg-white transform transition-all duration-700 ease-out ${
          isExpanded
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0"
        }`}
      >


        <div className="h-full overflow-y-auto">
          {/* Hero Section */}
            <div className="absolute z-1 right-5 top-2">
              <button
                onClick={closeExpandedView}
                className="flex items-center space-x-2 p-2 hover:cursor-pointer hover:scale-110 active:scale-95 transition-all   rounded-full duration-300"
              >
                   <X className="w-12 h-12 text-gray-600 bg-white rounded-full p-3 shadow-md" />
              </button>
            </div>
 
            <div className="relative w-full  bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100 px-6 py-2">
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col items-center text-center space-y-4 mt-5 mb-8">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-bold text-gray-900">
                      {selectedUser.name}
                    </h2>
                    <p className="text-xl text-gray-600">
                      {selectedUser.email} | Ref: {selectedUser.referenceBy}
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                        selectedUser.status === "Not Submitted"
                          ? "bg-red-100 text-red-800 ring-2 ring-red-200"
                          : selectedUser.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800 ring-2 ring-yellow-200"
                          : "bg-green-100 text-green-800 ring-2 ring-green-200"
                      }`}
                    >
                      {selectedUser.status.charAt(0).toUpperCase() +
                        selectedUser.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>


          {/* Content */}
          <div className="mx-auto px-6 py-8">{renderStepContent()}</div>
        </div>
      </div>
    );
  });

  // Close expanded view on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isExpanded) {
        closeExpandedView();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isExpanded]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-32">
      {/* Main Table View */}
      <div
        className={`w-full p-10 space-y-4 transition-all duration-700 ${
          isExpanded ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
        />

        <div
          ref={tableContainerRef}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
        >
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                User Management Dashboard
              </h2>
              <p className="text-sm text-gray-600">
                Showing {filteredData.length} of {data.length} users
              </p>
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-screen">
            <table className="w-full" role="table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Index
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Profile
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Document Count
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ref. By
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    View Details
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Download
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-purple-50 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ProfileAvatar
                        name={item.name}
                        size="small"
                        isRef={true}
                        userId={item.id}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {
                          item.documents.filter((doc) => doc.verified === true)
                            .length
                        }{" "}
                        / {item.documents.length} Documents
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.referenceBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center justify-center">
                      {item.status}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(item);
                        }}
                        className="inline-flex items-center px-3 cursor-pointer  py-1.5 border border-purple-300 rounded-lg text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors group-hover:bg-purple-200 active:scale-95 duration-300"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                    </td>

                    <td
                      className={`px-6 py-4 flex items-center justify-center ${
                        item.documents.filter((doc) => doc.verified === true)
                          .length === 0
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      }`}
                      onClick={
                        item.documents?.length === 0
                          ? null
                          : () =>
                              handleDownloadDocuments(
                                item.documents,
                                item._id,
                                item.name
                              )
                      }
                    >
                      <DownloadIcon className="text-blue-600" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No users found matching your filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-2 text-purple-600 hover:text-purple-800 font-medium cursor-pointer"
                >
                  Reset filters to show all users
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animated Profile */}
      <AnimatedProfile />

      {/* Expanded View */}
      <ExpandedView />
    </div>
  );
};

export default ProfessionalTable;
