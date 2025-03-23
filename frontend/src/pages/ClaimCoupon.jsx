import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ClaimCoupon = () => {
  const [message, setMessage] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [myCoupons, setMyCoupons] = useState([]);
  const [showMyCoupons, setShowMyCoupons] = useState(false);

  // Get token from localStorage if available
  const token = localStorage.getItem("token");

  // Fetch available coupons
  useEffect(() => {
    const fetchAvailableCoupons = async () => {
      try {
        setLoadingCoupons(true);

        // Use the public endpoint for all coupons instead of the claim endpoint
        const response = await axios.get(
          "https://coupon-app-w9gt.onrender.com/api/coupons/all"
        );

        // Filter only active and unclaimed coupons for display
        const activeCoupons = response.data.filter(
          (coupon) => coupon.isActive && !coupon.claimedBy
        );

        setAvailableCoupons(activeCoupons);

        // Get previously claimed coupons from localStorage
        const savedCoupons = localStorage.getItem("myCoupons");
        if (savedCoupons) {
          setMyCoupons(JSON.parse(savedCoupons));
        }
      } catch (error) {
        console.error("Error fetching coupons:", error);
        setMessage("Failed to load available coupons");
        setIsError(true);
      } finally {
        setLoadingCoupons(false);
      }
    };

    fetchAvailableCoupons();
  }, []);

  // Claim a specific coupon by ID
  // Claim a specific coupon by ID
  const claimCoupon = async (couponId) => {
    try {
      setIsLoading(true);
      setMessage("");
      setIsSuccess(false);
      setIsError(false);

      // Change the request from GET to POST and modify the endpoint
      const res = await axios.post(
        `https://coupon-app-w9gt.onrender.com/api/coupons/claim`,
        {
          couponId: couponId,
        }
      );

      setIsSuccess(true);
      const claimedCode = res.data.coupon?.code || "";
      setCouponCode(claimedCode);
      setMessage(res.data.message || "Coupon claimed successfully!");

      // Remove the claimed coupon from the list
      setAvailableCoupons(
        availableCoupons.filter((coupon) => coupon._id !== couponId)
      );

      // Save to myCoupons
      const claimedCoupon = availableCoupons.find((c) => c._id === couponId);
      if (claimedCoupon) {
        const updated = [
          ...myCoupons,
          {
            ...claimedCoupon,
            claimedAt: new Date().toISOString(),
          },
        ];
        setMyCoupons(updated);
        localStorage.setItem("myCoupons", JSON.stringify(updated));
      }
    } catch (error) {
      setIsError(true);
      setMessage(
        error.response?.data?.message ||
          (error.response?.status === 429
            ? "Too many claim attempts. Please try again later."
            : "Something went wrong")
      );
    } finally {
      setIsLoading(false);
    }
  };
  // Filter coupons based on search term
  const filteredCoupons = availableCoupons.filter(
    (coupon) =>
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coupon.description &&
        coupon.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">
                  CouponApp
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setShowMyCoupons(false)}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    !showMyCoupons
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  Available Coupons
                </button>
                <button
                  onClick={() => setShowMyCoupons(true)}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    showMyCoupons
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  My Coupons ({myCoupons.length})
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                to="/login"
                className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow px-4 py-8">
        <div className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            {showMyCoupons ? "My Coupons" : "Available Coupons"}
          </h2>

          {!showMyCoupons && (
            <p className="text-gray-600 mb-8 text-center">
              Select a coupon below to claim it. Each device can claim one
              coupon.
            </p>
          )}

          {/* Search Bar (only for available coupons) */}
          {!showMyCoupons && (
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search coupons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
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
            </div>
          )}

          {/* Mobile Tab Selector */}
          <div className="sm:hidden mb-6">
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={showMyCoupons ? "my" : "available"}
              onChange={(e) => setShowMyCoupons(e.target.value === "my")}
            >
              <option value="available">Available Coupons</option>
              <option value="my">My Coupons ({myCoupons.length})</option>
            </select>
          </div>

          {/* Display message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                isError
                  ? "bg-red-50 text-red-800"
                  : isSuccess
                  ? "bg-green-50 text-green-800"
                  : "bg-blue-50 text-blue-800"
              }`}
            >
              {message}
            </div>
          )}

          {/* Show claimed coupon */}
          {couponCode && isSuccess && !showMyCoupons && (
            <div className="mb-8 p-4 bg-gray-100 rounded-lg text-center">
              <p className="text-sm text-gray-500 mb-1">
                Your claimed coupon code:
              </p>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl font-mono font-bold tracking-wider text-gray-800">
                  {couponCode}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(couponCode);
                  }}
                  className="p-1 text-gray-500 hover:text-blue-600"
                  title="Copy to clipboard"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* My Coupons List */}
          {showMyCoupons && (
            <div className="space-y-4">
              {myCoupons.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  You haven't claimed any coupons yet.
                </div>
              ) : (
                myCoupons.map((coupon, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg bg-white"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">{coupon.code}</h3>
                        <p className="text-sm text-gray-500">
                          {coupon.description || "Promotional offer"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Claimed:{" "}
                          {new Date(coupon.claimedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(coupon.code);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 border border-gray-200 rounded-md"
                        title="Copy to clipboard"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Available Coupons List */}
          {!showMyCoupons && (
            <div className="space-y-4">
              {loadingCoupons ? (
                <div className="flex justify-center py-10">
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
                <div className="text-center py-8 text-gray-500">
                  {searchTerm
                    ? "No coupons match your search."
                    : isSuccess
                    ? "No more coupons available."
                    : "There are no available coupons at this time."}
                </div>
              ) : (
                filteredCoupons.map((coupon) => (
                  <div
                    key={coupon._id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">{coupon.code}</h3>
                        <p className="text-sm text-gray-500">
                          {coupon.description ||
                            "Limited-time promotional offer"}
                        </p>
                        {coupon.expiresAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            Expires:{" "}
                            {new Date(coupon.expiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => claimCoupon(coupon._id)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-md shadow transition duration-200"
                      >
                        {isLoading ? "Claiming..." : "Claim"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>You can claim one coupon per device.</p>
            <p className="mt-1">
              Coupon codes are distributed on a first-come, first-served basis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimCoupon;
