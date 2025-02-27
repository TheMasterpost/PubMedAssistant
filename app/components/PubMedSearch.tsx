"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, ChangeEvent } from "react"
import { Search, FileText, Languages, Download, ArrowRight } from "lucide-react"

interface SearchResponse {
  result: string[];
  noResults?: boolean;
  error?: string;
  details?: string;
}

type Feature = 'search' | 'details' | 'translate' | 'download';

export default function PubMedSearch() {
  const [searchParams, setSearchParams] = useState({
    journal: "",
    author1: "",
    year: "",
    keyword: "",
    query: ""
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature>('search');

  const features = [
    { id: 'search' as Feature, icon: Search, label: 'Search Literature' },
    { id: 'details' as Feature, icon: FileText, label: 'Get Document Details' },
    { id: 'translate' as Feature, icon: Languages, label: 'Translated Documents' },
    { id: 'download' as Feature, icon: Download, label: 'Download Literature PDF' },
  ];

  const handleSearch = async () => {
    // Check if at least one search parameter is provided
    const hasSearchParams = Object.values(searchParams).some(param => param.trim() !== "");
    
    if (!hasSearchParams) {
      setError("Please enter at least one search parameter");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch("/api/pubmed/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });

      const data: SearchResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute search');
      }

      if (data.noResults) {
        setError("No results found. Please try different search terms.");
      } else if (data.result) {
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
  };

  const handleInputChange = (field: string) => (e: ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
        <span className="bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
          PubMed Assistant
        </span>
      </h1>
      
      <div className="space-y-4">
        <Input
          placeholder="Journal name"
          value={searchParams.journal}
          onChange={handleInputChange('journal')}
          className="h-12 text-lg"
          disabled={loading}
        />
        <Input
          placeholder="Author name"
          value={searchParams.author1}
          onChange={handleInputChange('author1')}
          className="h-12 text-lg"
          disabled={loading}
        />
        <Input
          placeholder="Publication year"
          value={searchParams.year}
          onChange={handleInputChange('year')}
          className="h-12 text-lg"
          disabled={loading}
          type="number"
        />
        <Input
          placeholder="Keyword"
          value={searchParams.keyword}
          onChange={handleInputChange('keyword')}
          className="h-12 text-lg"
          disabled={loading}
        />
        <div className="relative">
          <Input
            placeholder="Or enter a traditional PubMed query string"
            value={searchParams.query}
            onChange={handleInputChange('query')}
            className="pr-12 h-12 text-lg"
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
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => setSelectedFeature(feature.id)}
            className={`flex flex-col items-center p-4 rounded-lg transition-all ${
              selectedFeature === feature.id
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <feature.icon className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium text-center">{feature.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Search Results (PMIDs)</h2>
          <ul className="space-y-2">
            {results.map((pmid, index) => (
              <li key={index} className="text-sm">
                <a 
                  href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {pmid}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}