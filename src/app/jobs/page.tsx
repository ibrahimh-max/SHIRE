'use client';

import Navigation from '@/components/Navigation';

export default function Jobs() {
  const jobs = [
    {
      id: 1,
      title: "Front Desk Receptionist",
      company: "Grand Hotel",
      location: "New York, NY",
      description: "Looking for an experienced front desk receptionist to manage guest check-ins, reservations, and customer service.",
      pay: "$18/hour",
      type: "Full-time"
    },
    {
      id: 2,
      title: "Restaurant Server",
      company: "The Bistro",
      location: "Los Angeles, CA",
      description: "Seeking friendly servers with experience in fine dining. Must be able to work evenings and weekends.",
      pay: "$15/hour + tips",
      type: "Part-time"
    },
    {
      id: 3,
      title: "Housekeeping Supervisor",
      company: "Luxury Suites",
      location: "Miami, FL",
      description: "Experienced housekeeping supervisor needed to manage cleaning staff and ensure quality standards.",
      pay: "$22/hour",
      type: "Full-time"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Hospitality Jobs</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
              <p className="text-gray-600 mb-1">{job.company}</p>
              <p className="text-gray-500 text-sm mb-3">{job.location}</p>
              
              <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-green-600 font-semibold">{job.pay}</span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{job.type}</span>
              </div>
              
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
