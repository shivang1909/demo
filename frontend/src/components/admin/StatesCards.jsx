import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, Clock, CheckCircle } from "lucide-react";

const StatesCards = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientStats = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/client/getall", {
          withCredentials: true,
        });

        const clients = Array.isArray(response.data.clients)
          ? response.data.clients
          : response.data;
        const total = clients.length;
        const pending = clients.filter((c) =>
          ["Not Submitted", "Pending"].includes(c.status)
        ).length;
        const approved = clients.filter((c) => c.status === "Approved").length;

        setStats({ total, pending, approved });
      } catch (error) {
        console.error("Failed to fetch clients:", error);
        setStats({ total: 0, pending: 0, approved: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchClientStats();
  }, []);

  const cardData = [
    {
      id: 1,
      title: "Total Clients",
      value: stats.total,
      description: "All registered clients",
      icon: Users,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      id: 2,
      title: "Pending Clients",
      value: stats.pending,
      description: "Not submitted or pending status",
      icon: Clock,
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
    {
      id: 3,
      title: "Approved Clients",
      value: stats.approved,
      description: "Successfully verified clients",
      icon: CheckCircle,
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="w-full p-6 min-h-fit">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-gray-500">Loading...</div>
          ) : (
            cardData.map((card) => {
              const IconComponent = card.icon;

              return (
                <div
                  key={card.id}
                  className="bg-white rounded-xl shadow-inner border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between">
                    {/* Left Section */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {card.title}
                      </h3>
                      <p className="text-2xl font-bold text-gray-800 mb-2">
                        {card.value}
                      </p>
                      <p className="text-sm text-gray-600">{card.description}</p>
                    </div>

                    {/* Right Section */}
                    <div
                      className={`${card.bgColor} p-3 rounded-lg ml-4 flex-shrink-0`}
                    >
                      <IconComponent
                        className={`w-6 h-6 ${card.iconColor}`}
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default StatesCards;
