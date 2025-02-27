"use client"

import React from "react"
import { Github } from "lucide-react"

export default function Sidebar() {
  return (
    <div className="fixed left-0 top-0 h-screen w-16 bg-white border-r border-gray-200 flex flex-col items-center py-8">
      {/* Your existing sidebar items */}
      
      {/* GitHub Link - Fixed at bottom */}
      <a 
        href="https://github.com/hint-lab/pubmed-agent"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-8 text-gray-600 hover:text-blue-600 transition-colors"
        title="View on GitHub"
      >
        <Github className="h-6 w-6" />
      </a>
    </div>
  )
} 