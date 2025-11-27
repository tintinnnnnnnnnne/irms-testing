import React, { useState } from 'react';
import { Star, Send, User, MessageSquare, ShieldCheck, CheckCircle2, BarChart3, Quote } from 'lucide-react';

// Fonts injection
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
    
    .font-serif-display { font-family: 'Playfair Display', serif; }
    .font-body { font-family: 'Lato', sans-serif; }
    
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #fed7aa; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #fdba74; }
  `}</style>
);

export default function App() {
  // --- STATE MANAGEMENT ---
  const [reviews, setReviews] = useState([
    { 
      id: 1, 
      name: "Maria Clara", 
      ratings: { service: 5, cleanliness: 5, amenities: 5, food: 4 }, 
      average: 4.8,
      comment: "Absolutely stunning sunset view! The ambiance matches the premium feel of the cabins.", 
      date: "Nov 01, 2023" 
    },
    { 
      id: 2, 
      name: "Crisostomo Ibarra", 
      ratings: { service: 4, cleanliness: 3, amenities: 5, food: 3 }, 
      average: 3.8,
      comment: "The amenities are top-notch, exactly as advertised. Housekeeping could be faster though.", 
      date: "Oct 28, 2023" 
    },
    { 
      id: 3, 
      name: "Padre Damaso", 
      ratings: { service: 2, cleanliness: 5, amenities: 4, food: 5 }, 
      average: 4.0,
      comment: "Food was exquisite, but the staff needs more training on hospitality.", 
      date: "Oct 25, 2023" 
    },
  ]);

  const [formData, setFormData] = useState({ 
    name: '', 
    ratings: { service: 0, cleanliness: 0, amenities: 0, food: 0 }, 
    comment: '' 
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // --- HELPERS & HANDLERS ---
  const getCurrentFormAverage = () => {
    const values = Object.values(formData.ratings);
    const total = values.reduce((acc, curr) => acc + curr, 0);
    return values.length > 0 ? (total / values.length).toFixed(1) : 0;
  };

  const getCategoryAverage = (category) => {
    const total = reviews.reduce((acc, review) => acc + review.ratings[category], 0);
    return (total / reviews.length).toFixed(1);
  };

  const getOverallAverage = () => {
    const total = reviews.reduce((acc, review) => acc + parseFloat(review.average), 0);
    return (total / reviews.length).toFixed(1);
  };

  const handleRatingChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      ratings: { ...prev.ratings, [category]: value }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const unrated = Object.values(formData.ratings).some(r => r === 0);
    if (unrated) {
      alert("Please rate all categories first.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const values = Object.values(formData.ratings);
      const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);

      const newReview = {
        id: reviews.length + 1,
        name: formData.name || "Anonymous Guest",
        ratings: formData.ratings,
        average: avg,
        comment: formData.comment,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      setReviews([newReview, ...reviews]);
      setFormData({ 
        name: '', 
        ratings: { service: 0, cleanliness: 0, amenities: 0, food: 0 }, 
        comment: '' 
      });
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const categories = [
    { id: 'service', label: 'Service' },
    { id: 'cleanliness', label: 'Cleanliness' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'food', label: 'Food & Dining' }
  ];

  return (
    <div className="min-h-screen bg-orange-50/30 font-body text-slate-700">
      <FontStyles />
      
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#ea580c] rounded-lg flex items-center justify-center text-white font-serif-display font-bold text-xl shadow-orange-200 shadow-lg">
              IP
            </div>
            <div>
              <h1 className="text-xl font-serif-display font-bold text-[#ea580c] leading-tight">
                Isla Paraiso
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Luxury Resort</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <span className="hover:text-[#ea580c] cursor-pointer transition-colors">Home</span>
            <span className="hover:text-[#ea580c] cursor-pointer transition-colors">Accommodations</span>
            <span className="text-[#ea580c] border-b-2 border-[#ea580c]">Feedback</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="max-w-6xl mx-auto px-4 relative z-10 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-serif-display font-bold mb-4">Guest Experience</h2>
          <p className="text-orange-50 text-lg max-w-2xl font-light">
            We value your thoughts. Help us maintain our standards of excellence by sharing your experience at Isla Paraiso.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 -mt-8 relative z-20">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: SUBMISSION FORM */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-orange-100">
              
              {/* Form Header */}
              <div className="bg-orange-50 p-6 border-b border-orange-100 flex justify-between items-center">
                <div>
                  <h3 className="font-serif-display font-bold text-2xl text-[#c2410c]">
                    Write a Review
                  </h3>
                  <p className="text-slate-500 text-xs uppercase tracking-wider mt-1">Share your story</p>
                </div>
                {getCurrentFormAverage() > 0 && (
                  <div className="bg-[#ea580c] text-white px-3 py-1 rounded-full shadow-sm">
                    <span className="font-bold font-serif-display">{getCurrentFormAverage()}</span>
                    <span className="text-[10px] uppercase ml-1">Avg</span>
                  </div>
                )}
              </div>

              <div className="p-6 md:p-8 relative">
                
                {/* FIX: Success Overlay - Ginawang solid white at tinaasan ang z-index */}
                {showSuccess && (
                  <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center text-center p-8 rounded-b-xl animate-in fade-in duration-200">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                      <CheckCircle2 size={40} className="text-green-600" />
                    </div>
                    <h4 className="text-3xl font-serif-display font-bold text-[#ea580c] mb-3">Thank You!</h4>
                    <p className="text-slate-600 text-lg">Your feedback has been securely submitted.</p>
                    <p className="text-slate-400 text-sm mt-2">Redirecting you shortly...</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* STEP 1: CATEGORY RATINGS */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                      1. Rate Your Experience
                    </label>
                    <div className="space-y-4">
                      {categories.map((cat) => (
                        <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center justify-between group">
                          <span className="text-sm font-semibold text-slate-700 w-32 mb-1 sm:mb-0 group-hover:text-[#ea580c] transition-colors">{cat.label}</span>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleRatingChange(cat.id, star)}
                                className="focus:outline-none transition-all hover:scale-110"
                              >
                                <Star
                                  size={22}
                                  fill={star <= formData.ratings[cat.id] ? "#f59e0b" : "#e2e8f0"}
                                  className={star <= formData.ratings[cat.id] ? "text-[#f59e0b]" : "text-slate-200"}
                                  strokeWidth={star <= formData.ratings[cat.id] ? 0 : 1.5}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* STEP 2: DETAILS */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                      2. Tell us more
                    </label>
                    <div className="space-y-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Your Name (Optional)"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#ea580c] focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <textarea
                          rows="4"
                          placeholder="What did you love about your stay? How can we improve?"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#ea580c] focus:border-transparent outline-none transition-all resize-none placeholder:text-slate-400"
                          value={formData.comment}
                          onChange={(e) => setFormData({...formData, comment: e.target.value})}
                          required
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* STEP 3: SUBMIT */}
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl hover:shadow-orange-200 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="animate-pulse">Processing...</span>
                      ) : (
                        <>
                          Submit Review <Send size={18} />
                        </>
                      )}
                    </button>
                    
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400 opacity-80">
                      <ShieldCheck size={12} />
                      <span>Encrypted & Secure Submission</span>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ANALYTICS & REVIEWS */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-8">
            
            {/* ANALYTICS CARD */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-orange-100">
              <h3 className="text-xl font-serif-display font-bold text-[#c2410c] mb-6 flex items-center gap-2">
                <BarChart3 size={24} className="text-[#ea580c]" />
                Overall Performance
              </h3>
              
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="relative flex items-center justify-center w-40 h-40">
                   <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="70" stroke="#fff7ed" strokeWidth="8" fill="transparent" />
                      <circle 
                        cx="80" cy="80" r="70" 
                        stroke="#ea580c" strokeWidth="8" fill="transparent" 
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * getOverallAverage()) / 5}
                        className="transition-all duration-1000 ease-out"
                      />
                   </svg>
                   <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-serif-display font-bold text-[#c2410c]">{getOverallAverage()}</span>
                      <div className="flex text-[#f59e0b] text-[10px]">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} size={10} fill={i <= Math.round(getOverallAverage()) ? "currentColor" : "none"} />
                        ))}
                      </div>
                   </div>
                </div>

                <div className="flex-1 w-full space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.id} className="group">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-slate-600">{cat.label}</span>
                        <span className="font-bold text-[#c2410c]">{getCategoryAverage(cat.id)}</span>
                      </div>
                      <div className="h-2 w-full bg-orange-50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#ea580c] rounded-full transition-all duration-1000 group-hover:bg-[#f97316]"
                          style={{ width: `${(getCategoryAverage(cat.id) / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <h3 className="text-xl font-serif-display font-bold text-[#c2410c]">
                Recent Guest Reviews
              </h3>
              <span className="text-sm text-slate-500">{reviews.length} Verified Reviews</span>
            </div>

            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-xl border border-orange-50 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <Quote className="absolute top-4 right-4 text-orange-50 w-12 h-12 transform rotate-180 group-hover:text-orange-100 transition-colors" />
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#ea580c] rounded-full flex items-center justify-center text-white font-serif-display font-bold text-lg shadow-md shadow-orange-200">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[#c2410c] text-sm">{review.name}</p>
                        <p className="text-xs text-slate-400">{review.date}</p>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={14} 
                            fill={star <= Math.round(review.average) ? "#f59e0b" : "none"}
                            className={star <= Math.round(review.average) ? "text-[#f59e0b]" : "text-slate-300"} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed relative z-10 italic">
                    "{review.comment}"
                  </p>
                  
                  <div className="mt-4 flex gap-2 flex-wrap relative z-10">
                    {Object.entries(review.ratings).map(([key, value]) => (
                      value >= 5 && (
                        <span key={key} className="text-[10px] uppercase font-bold text-[#c2410c] bg-orange-50 px-2 py-1 rounded flex items-center gap-1">
                           <CheckCircle2 size={10} /> {key}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}