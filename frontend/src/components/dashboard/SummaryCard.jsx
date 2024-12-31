import React from 'react'

const SummaryCard = ({icon, text, number, color}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center space-x-4">
            <div className={`${color} bg-opacity-10 rounded-full p-3`}>
                <span className={`text-2xl ${color.replace('bg-', 'text-')}`}>
                    {icon}
                </span>
            </div>
            <div>
                <p className="text-gray-600 font-medium">{text}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{number}</p>
            </div>
        </div>
    </div>
  )
}

export default SummaryCard