import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaMapMarkerAlt, FaClock, FaSun, FaLandmark, FaMap, FaBuilding } from "react-icons/fa";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTrip } from "../components/context/TripContext";
import useAxios from "../components/Axios/axios";
import Loader from "../components/Other/Loader";
import TripWeather from "./TripWeather";

const TripPlanDisplay = () => {
  const { tripId } = useParams();
  const { tripPlan, setTripPlan } = useTrip();
  const [loading, setLoading] = useState(true);
  const [openDay, setOpenDay] = useState(null);
  const navigate = useNavigate();
  const axiosInstance = useAxios();



  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const response = await axiosInstance.get(`/tripplan/${tripId}`);

        const { trip } = response.data;

        setTripPlan({
          generatedPlan: trip.generatedPlan,
          tripDetails: {
            location: trip.destination,
            duration: trip.days + " days",
            travelers: trip.travelGroup,
            budget: trip.budget,
          },
        });
      } catch (error) {
        console.error("Error fetching trip details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();

  }, [tripId, setTripPlan, navigate]);



  const downloadItinerary = () => {
    if (!tripPlan || !tripPlan.generatedPlan) return;

    const { tripDetails, generatedPlan } = tripPlan;
    const { itinerary, hotelOptions } = generatedPlan;

    let fileContent = `Trip to ${tripDetails.location}\n`;
    fileContent += `Duration: ${tripDetails.duration}\n`;
    fileContent += `Travelers: ${tripDetails.travelers}\n`;
    fileContent += `Budget: ${tripDetails.budget}\n`;
    fileContent += `\n========================================\n\n`;

    // Add Hotel Options
    if (hotelOptions && hotelOptions.length > 0) {
        fileContent += `🏨 Hotel Options:\n\n`;
        hotelOptions.forEach((hotel, index) => {
            fileContent += `${index + 1}. ${hotel.hotelName}\n`;
            fileContent += `   Address: ${hotel.hotelAddress || 'N/A'}\n`;
            fileContent += `   Price: ${hotel.price || 'N/A'}\n`;
            fileContent += `   Rating: ${hotel.rating || 'N/A'} / 5\n`;
            fileContent += `   Description: ${hotel.description || 'N/A'}\n\n`;
        });
        fileContent += `========================================\n\n`;
    }

    // Add Itinerary
    if (itinerary && Object.keys(itinerary).length > 0) {
        fileContent += `📅 Your Itinerary:\n`;
        Object.entries(itinerary).forEach(([day, details]) => {
            fileContent += `\n--- ${day.toUpperCase()} - Theme: ${details.theme} ---\n`;
            fileContent += `Best Time to Visit: ${details.bestTimeToVisit}\n\n`;
            fileContent += `Plan for the day:\n`;
            if (details.plan && details.plan.length > 0) {
                details.plan.forEach((activity, index) => {
                    fileContent += `  ${index + 1}. ${activity.placeName}\n`;
                    fileContent += `     Details: ${activity.placeDetails || 'N/A'}\n`;
                    fileContent += `     Ticket Price: ${activity.ticketPricing || 'N/A'}\n`;
                    fileContent += `     Rating: ${activity.rating || 'N/A'} / 5\n`;
                    fileContent += `     Suggested Time: ${activity.timeTravel || 'N/A'}\n\n`;
                });
            } else {
                fileContent += "  No plans for this day.\n\n";
            }
        });
    } else {
        fileContent += "No itinerary available.\n";
    }

    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Itinerary_${tripDetails.location.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };



  // Animation Variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30, rotate: 1 },
    visible: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.5, ease: "easeOut" } },
    hover: { scale: 1.02, boxShadow: "0 8px 16px rgba(0,0,0,0.1)", transition: { duration: 0.3 } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } },
  };

  const buttonVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  };

  if (loading) {
    return <Loader tripDetails={tripPlan?.tripDetails} />;

  }

  if (!tripPlan || !tripPlan.tripDetails || !tripPlan.generatedPlan) {
    return <p className="text-center text-base-content">No trip data available.</p>;
  }

  const { tripDetails, generatedPlan } = tripPlan;
  const { hotelOptions, itinerary } = generatedPlan;

  const formatToINR = (priceStr) => {
    if (typeof priceStr !== 'string') {
      return 'Price not available';
    }

    const matches = priceStr.replace(/,/g, '').match(/(\d+(\.\d+)?)/);

    if (!matches) {
      return 'Price not specified';
    }

    const numericPrice = parseFloat(matches[0]);

    if (isNaN(numericPrice)) {
      return 'Invalid price format';
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0, // Hides the paise part for cleaner display
    }).format(numericPrice);
  };
  
  return (
    <div className="max-h-screen overflow-x-hidden relative">
      <div className="max-w-7xl mt-15 mx-auto py-12 px-6">



        {/* Trip Details */}
        <motion.section
          className="card bg-base-100 shadow-2xl mb-10 rounded-2xl border border-base-300 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="card-body p-8">
            <h2 className="text-4xl font-extrabold mb-6 flex items-center">
              <FaMapMarkerAlt className="mr-3" /> Your Adventure ✈
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-2">
                <span className="badge bg-base-300">Destination</span>
                <p className="font-semibold">{tripDetails?.location || "N/A"}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="badge bg-base-300">Duration</span>
                <p className="font-semibold">{tripDetails?.duration || "N/A"}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="badge bg-base-300">Travelers</span>
                <p className="font-semibold">{tripDetails?.travelers || "N/A"}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="badge bg-base-300">Budget</span>
                <p className="font-semibold">{tripDetails?.budget || "N/A"}</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Weather */}
        <motion.section
          className="card bg-base-100 shadow-2xl mb-10 rounded-2xl border border-base-300 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <TripWeather tripId={tripId} tripPlan={tripPlan} setTripPlan={setTripPlan} />
        </motion.section>

        {/* Hotel Options */}
        <section className="mb-12">
          <h2 className="text-4xl font-extrabold mb-8 flex items-center">
            <FaStar className="mr-3" /> Luxurious Stays 🏨
          </h2>
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3   gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {hotelOptions?.length > 0 ? (
              hotelOptions.map((hotel, index) => (
                <motion.div
                  key={index}
                  className="card bg-base-100 shadow-xl rounded-2xl overflow-hidden border border-base-300"
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <figure className="relative">
                    <img
                      src={hotel.hotelImageUrl || "https://via.placeholder.com/150?text=Image+Not+Available"}
                      alt={hotel.hotelName || "Hotel"}
                      className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => (e.target.src = "https://via.placeholder.com/150?text=Image+Not+Available")}
                    />
                    <div className="absolute top-4 right-4 badge bg-base-300">
                      {hotel.rating || "N/A"} <FaStar className="ml-1" />
                    </div>
                  </figure>
                  <div className="card-body px-6">
                    <h3 className="text-2xl font-bold">{hotel.hotelName || "Unknown Hotel"}</h3>
                    <p className="flex items-center ">
                      <FaMapMarkerAlt className="mr-2" /> {hotel.hotelAddress || "N/A"}
                    </p>
                    <p className="font-semibold text-lg  flex items-center">
                      {formatToINR(hotel.price)}
                    </p>
                    <p className="text-sm  line-clamp-2">{hotel.description || "No description available"}</p>
                    <div className="card-actions flex justify-between">
                      <motion.button
                        className="btn bg-base-300 rounded-full px-6"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        onClick={() => {
                          const searchString = encodeURIComponent(`${hotel.hotelName}, ${tripDetails.location}`);
                          window.open(`https://www.booking.com/searchresults.en-gb.html?ss=${searchString}`, "_blank");
                        }}
                      >

                        Book Now
                      </motion.button>
                      <motion.button
                        className="btn bg-base-300 rounded-full px-6"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        onClick={() => {
                          const address = encodeURIComponent(hotel.hotelAddress || tripDetails.location);
                          window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, "_blank");
                        }}
                      >
                        <FaMap className="mr-2" /> View Map
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-base-content">No hotel options available.</p>
            )}
          </motion.div>
        </section>
        
        {/* Itinerary */}
        <section>
          <div className="md:flex items-center justify-between ">
            <h2 className="text-4xl font-extrabold mb-8 flex items-center">
              <FaClock className="mr-3" /> Your Itinerary 📅
            </h2>
            {itinerary &&
              <motion.button
                onClick={downloadItinerary}
                variants={buttonVariants}
                whileTap="tap"
                className="btn bg-primary/20 hover:scale-105 transition-all duration-200 animate-bounce  mt-4"
              >
                Download Itinerary 📄
              </motion.button>
            }
          </div>
          {itinerary && Object.keys(itinerary).length > 0 ? (
            Object.keys(itinerary).map((day) => {
              const { theme, bestTimeToVisit, plan } = itinerary[day];
              return (
                <motion.div
                  key={day}
                  className="collapse bg-base-100 shadow-xl mb-6 rounded-2xl border border-base-300"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <input
                    type="checkbox"
                    checked={openDay === day}
                    onChange={() => setOpenDay(openDay === day ? null : day)}
                  />
                  <div className="collapse-title bg-base-200 text-2xl font-semibold flex justify-between items-center p-6">
                    <span className="flex items-center">
                      {theme === "Beach and Relaxation" ? (
                        <FaSun className="mr-2" />
                      ) : (
                        <FaLandmark className="mr-2" />
                      )}
                      Day {day}: {theme || "N/A"}
                    </span>
                    <span className="badge bg-base-300">
                      {openDay === day ? "Collapse" : "Expand"}
                    </span>
                  </div>
                  <AnimatePresence>
                    {openDay === day && (
                      <motion.div
                        className="collapse-content p-6"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      >
                        <p className="mb-6 font-semibold">
                          <strong>Best Time to Visit:</strong> {bestTimeToVisit || "N/A"}
                        </p>
                        <ul className="timeline timeline-vertical">
                          {plan?.length > 0 ? (
                            plan.map((place, index) => (
                              <li key={index} className="relative">
                                <div className="timeline-middle">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="h-6 w-6 text-base-content"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                                <motion.div
                                  className={`timeline-${index % 2 === 0 ? "start" : "end"
                                    } card bg-base-100 shadow-lg rounded-xl p-5 hover:bg-base-200 transition-colors w-full max-w-md lg:max-w-lg mx-4 my-2`}
                                  variants={cardVariants}
                                  initial="hidden"
                                  animate="visible"
                                >
                                  <div className="flex items-start space-x-4">
                                    <img
                                      src={place.placeImageUrl || "https://via.placeholder.com/150?text=Image+Not+Available"}
                                      alt={place.placeName || "Place"}
                                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                                      onError={(e) => (e.target.src = "https://via.placeholder.com/150?text=Image+Not+Available")}
                                    />
                                    <div className="flex-1">
                                      <h4 className="text-lg font-semibold">{place.placeName || "Unknown Place"}</h4>
                                      <p className="text-sm mt-1 line-clamp-2">{place.placeDetails || "No details available"}</p>
                                      <div className="flex items-center space-x-3 mt-2">
                                        <span className="badge bg-base-300 text-sm" style={{ whiteSpace: 'nowrap', padding: '0.5em 1em' }}>
                                          {place.ticketPricing || "N/A"}
                                        </span>
                                        <span className="badge bg-base-300 flex items-center text-sm">
                                          {[...Array(5)].map((_, i) => (
                                            <FaStar
                                              key={i}
                                              className={`h-3 w-3 ${i < Math.round(place.rating || 0) ? "" : "opacity-30"}`}
                                            />
                                          ))}
                                          <span className="ml-1">({place.rating || "N/A"})</span>
                                        </span>
                                      </div>
                                      <p className="text-sm flex items-center mt-2">
                                        <FaClock className="mr-2" /> Travel Time: {place.timeTravel || "N/A"}
                                      </p>
                                      <motion.button
                                        className="btn bg-base-300 rounded-full px-4 mt-3 text-sm"
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        onClick={() => {
                                          const address = encodeURIComponent(place.placeName || tripDetails.location);
                                          window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, "_blank");
                                        }}
                                      >
                                        <FaMap className="mr-2" /> View Map
                                      </motion.button>

                                    </div>
                                  </div>
                                </motion.div>
                                {index < plan.length - 1 && (
                                  <hr className="bg-base-300 h-1 w-1/2 mx-auto" />
                                )}
                              </li>
                            ))
                          ) : (
                            <p className="text-base-content">No itinerary plans available.</p>
                          )}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : (
            <p className="text-base-content">No itinerary available.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default TripPlanDisplay;
