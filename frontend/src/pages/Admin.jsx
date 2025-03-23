import React, { useEffect, useState } from "react";
import axios from "axios";

const Admin = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCoupon, setNewCoupon] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");

  const token = localStorage.getItem("token"); // ✅ Use consistent token

  // Fetch Coupons
  const fetchCoupons = async () => {
    if (!token) {
      setError("Unauthorized: No admin token found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        "https://coupon-app-w9gt.onrender.com/api/coupons/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCoupons(res.data);
      setError(null);
    } catch (err) {
      setError(
        `Failed to load coupons: ${err.response?.data?.message || err.message}`
      );
      console.error("Fetch Coupons Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add Coupon
  const addCoupon = async () => {
    if (!newCoupon.trim()) return;
    if (!token) {
      setError("Unauthorized: No admin token found.");
      return;
    }

    try {
      setIsAdding(true);
      await axios.post(
        "https://coupon-app-w9gt.onrender.com/api/coupons/add",
        { code: newCoupon },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewCoupon("");
      fetchCoupons(); // ✅ Refresh list after adding
    } catch (err) {
      console.error("Add Coupon Error:", err.response?.data || err.message);
      setError(
        `Failed to add coupon: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setIsAdding(false);
    }
  };

  // Toggle Coupon Status
  const toggleCouponStatus = async (id, currentStatus) => {
    if (!token) {
      setError("Unauthorized: No admin token found.");
      return;
    }

    try {
      await axios.patch(
        `https://coupon-app-w9gt.onrender.com/api/coupons/${id}`,
        { isActive: !currentStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchCoupons();
    } catch (err) {
      setError("Failed to update coupon status.");
      console.error("Toggle Status Error:", err.response?.data || err.message);
    }
  };

  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Add this: Filter coupons based on search term and selected tab
  const filteredCoupons = coupons.filter((coupon) => {
    // Filter by search term
    const matchesSearch = coupon.code
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Filter by tab selection
    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "active" && coupon.isActive) ||
      (selectedTab === "inactive" && !coupon.isActive) ||
      (selectedTab === "claimed" && coupon.claimedBy) ||
      (selectedTab === "unclaimed" && !coupon.claimedBy);

    return matchesSearch && matchesTab;
  });

  // Add this: useEffect to fetch coupons when component mounts
  useEffect(() => {
    fetchCoupons();
  }, []); // Empty dependency array means this runs once on mount
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Admin Dashboard
        </h2>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
            {error}
            <button
              className="ml-2 text-red-600 hover:text-red-800"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Add new coupon section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Add New Coupon
          </h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newCoupon}
              onChange={(e) => setNewCoupon(e.target.value)}
              placeholder="Enter coupon code"
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addCoupon}
              disabled={isAdding || !newCoupon.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isAdding ? "Adding..." : "Add Coupon"}
            </button>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex space-x-1 mb-4 md:mb-0">
            <button
              onClick={() => setSelectedTab("all")}
              className={`px-3 py-1 rounded-lg ${
                selectedTab === "all"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedTab("active")}
              className={`px-3 py-1 rounded-lg ${
                selectedTab === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setSelectedTab("inactive")}
              className={`px-3 py-1 rounded-lg ${
                selectedTab === "inactive"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Inactive
            </button>
            <button
              onClick={() => setSelectedTab("claimed")}
              className={`px-3 py-1 rounded-lg ${
                selectedTab === "claimed"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Claimed
            </button>
            <button
              onClick={() => setSelectedTab("unclaimed")}
              className={`px-3 py-1 rounded-lg ${
                selectedTab === "unclaimed"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Unclaimed
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-lg pl-10 pr-4 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Coupons table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <svg
                className="animate-spin h-8 w-8 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No coupons found matching your criteria.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Code
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Claimed By
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Claimed At
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {coupon.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          coupon.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {coupon.claimedBy ? (
                        <div>
                          <div>IP: {coupon.claimedBy.ip}</div>
                          <div className="text-xs text-gray-400">
                            Session:{" "}
                            {coupon.claimedBy.sessionId?.substring(0, 10)}...
                          </div>
                        </div>
                      ) : (
                        <span className="text-yellow-600">Unclaimed</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {coupon.claimedBy
                        ? formatDate(coupon.claimedBy.timestamp)
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() =>
                          toggleCouponStatus(coupon._id, coupon.isActive)
                        }
                        className={`${
                          coupon.isActive
                            ? "text-red-600 hover:text-red-900"
                            : "text-green-600 hover:text-green-900"
                        }`}
                      >
                        {coupon.isActive ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Stats summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Coupons</h3>
          <p className="text-2xl font-bold text-gray-800">{coupons.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Coupons</h3>
          <p className="text-2xl font-bold text-green-600">
            {coupons.filter((c) => c.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Claimed Coupons</h3>
          <p className="text-2xl font-bold text-blue-600">
            {coupons.filter((c) => c.claimedBy).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Claim Rate</h3>
          <p className="text-2xl font-bold text-purple-600">
            {coupons.length > 0
              ? `${Math.round(
                  (coupons.filter((c) => c.claimedBy).length / coupons.length) *
                    100
                )}%`
              : "0%"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
