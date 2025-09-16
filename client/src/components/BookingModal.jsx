// BookingModal.jsx
import { useState } from "react";
import { Plane, Train } from "lucide-react";
import axios from "axios";

const BookingModal = ({ destination }) => {
  const [type, setType] = useState("flight");
  const [origin, setOrigin] = useState("");
  const [date, setDate] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const endpoint = type === "flight" ? "/api/flights" : "/api/trains";
      const response = await axios.get(endpoint, {
        params: { origin, destination, date },
      });
       console.log(response)
      setOptions(response.data);
    } catch (error) {
      console.error("Error fetching options:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (option) => {
    // Redirect to booking link or process payment
    window.open(option.bookingLink, "_blank");
  };

  return (
    <dialog id="booking_modal" className="modal">
      <div className="modal-box max-w-4xl p-8">
        <h3 className="font-bold text-2xl mb-4 flex items-center">
          {type === "flight" ? <Plane className="mr-2" /> : <Train className="mr-2" />}
          Book {type === "flight" ? "Flight" : "Train"}
        </h3>
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setType("flight")}
            className={`btn ${type === "flight" ? "btn-primary" : "btn-outline"}`}
          >
            Flight
          </button>
          <button
            onClick={() => setType("train")}
            className={`btn ${type === "train" ? "btn-primary" : "btn-outline"}`}
          >
            Train
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Origin (e.g., Mumbai)"
            className="input input-bordered"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          />
          <input
            type="text"
            placeholder="Destination"
            className="input input-bordered"
            value={destination}
            readOnly
          />
          <input
            type="date"
            className="input input-bordered"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !origin || !date}
          className="btn btn-primary mb-6"
        >
          {loading ? "Searching..." : "Search"}
        </button>
        <div className="overflow-x-auto">
          {options.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Departure</th>
                  <th>Arrival</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {options.map((option) => (
                  <tr key={option.id}>
                    <td>{option.departure}</td>
                    <td>{option.arrival}</td>
                    <td>{option.price}</td>
                    <td>
                      <button
                        onClick={() => handleBook(option)}
                        className="btn btn-sm btn-success"
                      >
                        Book
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center">No options found. Try adjusting your search.</p>
          )}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>Close</button>
      </form>
    </dialog>
  );
};

export default BookingModal;
