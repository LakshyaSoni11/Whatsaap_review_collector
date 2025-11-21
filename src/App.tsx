import { useEffect, useState } from 'react';
import { MessageCircle, Loader, CloudOff } from 'lucide-react';
import ReviewsList from './components/ReviewsList';

//defining the structure of the review data
interface Review {
  id: number;
  contact_number: string;
  product_name: string;
  user_name: string;
  product_review: string;
  created_at: string; 
}

interface ApiResponse {
  success: boolean;
  reviews: Review[];
  error?: string; // for the error checking with the backend url
}

function App() {
  //defining the use states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const API_URL = "https://implicit-cammy-thelytokous.ngrok-free.dev/api/reviews";
    
    // fetching the review data
    const fetchReviews = async () => {
      setLoading(true); 
      setError(null);    

      try {
        const res = await fetch(API_URL, {
          headers: {
            "ngrok-skip-browser-warning": "true"
          }
        });

        // debugging the status abd the content type
        console.log("Response Status:", res.status);
        console.log("Content-Type:", res.headers.get("content-type")); //the content type is fixed from html to json which was causing error due to the browser warning 

        if (!res.ok) {
          
          throw new Error(`HTTP error status: ${res.status}`);
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Expected JSON but got:", text.substring(0, 200));
          throw new Error(`API returned ${contentType || "unknown type"} instead of JSON`);
        }

        const data: ApiResponse = await res.json();
        
        if (!data.success) {
          // fior checking the AIP errors
          throw new Error(data.error || "Failed to fetch reviews due to API error");
        }
        setReviews(data.reviews);
        
      } catch (err) {
        // handlign the error
        console.error("Fetch error:", err);
        setError(`Failed to load data. Please check the network and API URL. (${err instanceof Error ? err.message : String(err)})`);
      } finally {
        setLoading(false); 
      }
    };

    fetchReviews();
  }, []); 


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      
      {/* --- header section --- */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            
            {/* title */}
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Product Reviews Dashboard
                </h1>
                <p className="text-sm sm:text-base text-slate-600 mt-0.5">
                  Collected via WhatsApp • Real customer feedback
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- content section --- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* error state for better understanding */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 flex items-start space-x-3 shadow-md">
            <CloudOff className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
                <h3 className="text-lg font-semibold text-red-800 mb-1">Data Fetch Error</h3>
                <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        {loading && !error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-lg border border-slate-100">
            <Loader className="w-10 h-10 text-green-500 animate-spin mb-4" />
            <p className="text-lg text-slate-600 font-medium">Loading Reviews...</p>
            <p className="text-sm text-slate-400 mt-1">Fetching data from the API endpoint.</p>
          </div>
        ) 
                : reviews.length === 0 && !error ? (
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-16 text-center">
            <MessageCircle className="w-14 h-14 text-slate-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Reviews Found</h3>
            <p className="text-slate-600 text-base max-w-md mx-auto">
              It looks like your database is empty. Send a message to your WhatsApp number to get the first review!
            </p>
          </div>
        ) 
        
        // if the error siu resolved
        : (
          <ReviewsList reviews={reviews} />
        )}
      </main>
    </div>
  );
}

export default App;