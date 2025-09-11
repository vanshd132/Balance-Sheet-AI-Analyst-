'use client'

import { useState } from 'react'

export default function DiagramPage() {
  const [activeStep, setActiveStep] = useState(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-1">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-xl font-bold text-gray-800 mb-1">
            AI System Flow Diagram
          </h1>
          <p className="text-xs text-gray-600">
            Balance Sheet AI Analyst Request Processing Flow
          </p>
        </div>

        {/* Main Diagram Container */}
        <div className="bg-white rounded-md shadow-md p-3 mb-2">
          <div className="relative">
            {/* Step 1 - User Request */}
            <div className="flex justify-center mb-1">
              <div
                className={`w-48 p-2 rounded-sm shadow-sm cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  activeStep === 1 ? 'ring-2 ring-yellow-400 scale-105' : ''
                } bg-blue-500 text-white`}
                onClick={() => setActiveStep(activeStep === 1 ? null : 1)}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm">User makes request</h3>
                  <span className="bg-white bg-opacity-20 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                </div>
                <p className="text-xs opacity-90">
                  User submits a query or request to the system
                </p>
              </div>
            </div>

            {/* Arrow Down */}
            <div className="flex justify-center mb-1">
              <div className="w-0.5 h-4 bg-gray-400"></div>
              <div className="absolute w-0 h-0 border-l-2 border-r-2 border-t-3 border-l-transparent border-r-transparent border-t-gray-400"></div>
            </div>

            {/* Step 2 - LLM Receives Request */}
            <div className="flex justify-center mb-1">
              <div
                className={`w-48 p-2 rounded-sm shadow-sm cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  activeStep === 2 ? 'ring-2 ring-yellow-400 scale-105' : ''
                } bg-green-500 text-white`}
                onClick={() => setActiveStep(activeStep === 2 ? null : 2)}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm">LLM receives user request + system prompt</h3>
                  <span className="bg-white bg-opacity-20 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                </div>
                <p className="text-xs opacity-90">
                  The language model processes the user input along with system instructions
                </p>
              </div>
            </div>

            {/* Arrow Down */}
            <div className="flex justify-center mb-1">
              <div className="w-0.5 h-4 bg-gray-400"></div>
              <div className="absolute w-0 h-0 border-l-2 border-r-2 border-t-3 border-l-transparent border-r-transparent border-t-gray-400"></div>
            </div>

            {/* Step 3 - LLM Determines Type */}
            <div className="flex justify-center mb-1">
              <div
                className={`w-48 p-2 rounded-sm shadow-sm cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  activeStep === 3 ? 'ring-2 ring-yellow-400 scale-105' : ''
                } bg-purple-500 text-white`}
                onClick={() => setActiveStep(activeStep === 3 ? null : 3)}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm">LLM determines request type</h3>
                  <span className="bg-white bg-opacity-20 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                </div>
                <p className="text-xs opacity-90">
                  The system analyzes and categorizes the type of request
                </p>
              </div>
            </div>

            {/* Branching Arrows */}
            <div className="flex justify-center mb-1">
              <div className="flex justify-between w-full max-w-xl">
                {/* Left Arrow */}
                <div className="flex flex-col items-center ml-12">
                  <div className="w-16 h-0.5 bg-gray-400 transform -rotate-45 origin-left mb-1"></div>
                  <div className="w-0 h-0 border-t-2 border-b-2 border-l-3 border-t-transparent border-b-transparent border-l-gray-400 transform rotate-45"></div>
                </div>
                {/* Right Arrow */}
                <div className="flex flex-col items-center mr-12">
                  <div className="w-16 h-0.5 bg-gray-400 transform rotate-45 origin-right mb-1"></div>
                  <div className="w-0 h-0 border-t-2 border-b-2 border-r-3 border-t-transparent border-b-transparent border-r-gray-400 transform -rotate-45"></div>
                </div>
              </div>
            </div>

            {/* Branching Steps */}
            <div className="flex justify-between max-w-3xl mx-auto">
              {/* Left Branch - General Response */}
              <div className="w-48">
                <div
                  className={`p-2 rounded-sm shadow-sm cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    activeStep === 4 ? 'ring-2 ring-yellow-400 scale-105' : ''
                  } bg-orange-500 text-white`}
                  onClick={() => setActiveStep(activeStep === 4 ? null : 4)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm">General chatbot response</h3>
                    <span className="bg-white bg-opacity-20 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                  </div>
                  <p className="text-xs opacity-90">
                    For general queries, provides direct AI responses
                  </p>
                </div>
              </div>

              {/* Right Branch - Data Processing */}
              <div className="w-48 space-y-1">
                {/* Step 5 */}
                <div
                  className={`p-2 rounded-sm shadow-sm cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    activeStep === 5 ? 'ring-2 ring-yellow-400 scale-105' : ''
                  } bg-indigo-500 text-white`}
                  onClick={() => setActiveStep(activeStep === 5 ? null : 5)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm">LLM returns response + search instructions</h3>
                    <span className="bg-white bg-opacity-20 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      5
                    </span>
                  </div>
                  <p className="text-xs opacity-90">
                    For data queries, returns response and vector search parameters
                  </p>
                </div>

                {/* Arrow Down */}
                <div className="flex justify-center">
                  <div className="w-0.5 h-3 bg-gray-400"></div>
                  <div className="absolute w-0 h-0 border-l-2 border-r-2 border-t-3 border-l-transparent border-r-transparent border-t-gray-400"></div>
                </div>

                {/* Step 6 */}
                <div
                  className={`p-2 rounded-sm shadow-sm cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    activeStep === 6 ? 'ring-2 ring-yellow-400 scale-105' : ''
                  } bg-teal-500 text-white`}
                  onClick={() => setActiveStep(activeStep === 6 ? null : 6)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm">Context searches vector DB</h3>
                    <span className="bg-white bg-opacity-20 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      6
                    </span>
                  </div>
                  <p className="text-xs opacity-90">
                    System performs semantic search in the vector database
                  </p>
                </div>

                {/* Arrow Down */}
                <div className="flex justify-center">
                  <div className="w-0.5 h-3 bg-gray-400"></div>
                  <div className="absolute w-0 h-0 border-l-2 border-r-2 border-t-3 border-l-transparent border-r-transparent border-t-gray-400"></div>
                </div>

                {/* Step 7 */}
                <div
                  className={`p-2 rounded-sm shadow-sm cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    activeStep === 7 ? 'ring-2 ring-yellow-400 scale-105' : ''
                  } bg-red-500 text-white`}
                  onClick={() => setActiveStep(activeStep === 7 ? null : 7)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm">System generates final reply</h3>
                    <span className="bg-white bg-opacity-20 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      7
                    </span>
                  </div>
                  <p className="text-xs opacity-90">
                    LLM creates the final response using retrieved context
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Legend */}
        <div className="bg-white rounded-md p-2 shadow-md">
          <h4 className="font-bold text-gray-800 mb-1 text-sm">Legend</h4>
          <div className="grid grid-cols-4 gap-1 text-xs">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded mr-1"></div>
              <span>User Input</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded mr-1"></div>
              <span>LLM Processing</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded mr-1"></div>
              <span>Decision Making</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded mr-1"></div>
              <span>Direct Response</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-indigo-500 rounded mr-1"></div>
              <span>Data Processing</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-teal-500 rounded mr-1"></div>
              <span>Vector Search</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded mr-1"></div>
              <span>Final Output</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
