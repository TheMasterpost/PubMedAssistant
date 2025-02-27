"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Search, FileText, Languages, Download, ArrowRight } from "lucide-react"

interface SearchResponse {
  result: string;
  noResults?: boolean;
  error?: string;
}

type Feature = 'search' | 'details' | 'translate' | 'download';

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<Feature>('search')
  const [streamedResult, setStreamedResult] = useState<string>("")

  const features = [
    { id: 'search' as Feature, icon: Search, label: 'Search Literature' },
    { id: 'details' as Feature, icon: FileText, label: 'Get Document Details' },
    { id: 'translate' as Feature, icon: Languages, label: 'Translated Documents' },
    { id: 'download' as Feature, icon: Download, label: 'Download Literature PDF' },
  ]

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError(null);
    setResults("");
    setStreamedResult("");

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          query: query.trim(),
          feature: selectedFeature 
        }),
      });

      const data: SearchResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute search');
      }

      if (data.noResults) {
        setError(data.result || "No results found. Please try a different search term.");
      } else if (data.result) {
        // Stream the result word by word for better readability
        let currentText = "";
        const words = data.result.split(' ');
        for (let i = 0; i < words.length; i++) {
          currentText += words[i] + ' ';
          setStreamedResult(currentText);
          // Faster delay (20ms) for smoother word-by-word display
          await new Promise(resolve => setTimeout(resolve, 20));
          
          // Add a slightly longer pause at the end of sentences
          if (words[i].endsWith('.') || words[i].endsWith('?') || words[i].endsWith('!')) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        setResults(data.result);
      } else {
        throw new Error('No results returned');
      }
    } catch (error) {
      console.error("Search failed:", error);
      setError(error instanceof Error ? error.message : 'Failed to execute search');
    } finally {
      setLoading(false);
    }
  } 

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12 mt-48">
          <span className="bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
            PubMed Assistant
          </span>
        </h1>
        
        <div className="relative w-full max-w-3xl mx-auto">
          <Input
            placeholder="Search a Topic (e.g., 'cancer treatment 2024')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pr-12 h-12 text-lg w-full"
            disabled={loading}
          />
          <Button 
            onClick={handleSearch} 
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 h-8 w-8"
            variant="ghost"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            ) : (
              <ArrowRight className="h-4 w-4 text-blue-600" />
            )}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-8 max-w-2xl mx-auto">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setSelectedFeature(feature.id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                selectedFeature === feature.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <feature.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium text-center">{feature.label}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-fadeIn">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {(streamedResult || results) && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200 animate-fadeIn">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
              {streamedResult || results}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}