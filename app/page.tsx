'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Languages, Download, ArrowRight } from "lucide-react";

interface SearchResponse {
  result: string;
  noResults?: boolean;
  error?: string;
  pmid?: string;
}

interface DownloadResponse {
  success: boolean;
  message: string;
  downloadPath: string;
  error?: string;
}

type Feature = 'search' | 'details' | 'translate' | 'download';

const SUPPORTED_LANGUAGES = {
  'French': 'fr',
  'German': 'de',
  'Spanish': 'es',
  'Italian': 'it',
  'Portuguese': 'pt',
  'Russian': 'ru',
  'Chinese': 'zh',
  'Japanese': 'ja',
  'Korean': 'ko'
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature>('search');
  const [streamedResult, setStreamedResult] = useState<string>("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('fr');
  const [isAdvancedSearch, setIsAdvancedSearch] = useState<boolean>(false);

  const features = [
    { id: 'search' as Feature, icon: Search, label: 'Search Literature ' },
    { id: 'translate' as Feature, icon: Languages, label: 'Translated Documents' },
    { id: 'download' as Feature, icon: Download, label: 'Download Literature PDF' },
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setError(null);
    }
  };

  const handleFeatureClick = (featureId: Feature) => {
    if (featureId === selectedFeature) {
      // If it's already selected, don't do anything - wait for double click
      return;
    }
    setSelectedFeature(featureId);
    setIsAdvancedSearch(false); // Reset advanced search on new feature selection
  };

  const handleFeatureDoubleClick = (featureId: Feature) => {
    if (featureId === 'search') {
      setIsAdvancedSearch(true);
      setSelectedFeature(featureId);
    }
  };

  const handleSearch = async () => {
    if (selectedFeature === 'translate' && !selectedFile && !query.trim()) {
      setError("Please either enter text or upload a file to translate");
      return;
    } else if (selectedFeature === 'details' && !query.trim()) {
      setError("Please enter a PubMed ID");
      return;
    } else if (selectedFeature !== 'translate' && !query.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError(null);
    setResults("");
    setStreamedResult("");
    setDownloadUrl(null);
    setDownloadStatus("");

    try {
      let response;
      if (selectedFeature === 'search') {
        // Use different endpoints based on search mode
        const endpoint = isAdvancedSearch ? "/api/advanced-search" : "/api/search";
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            query: query.trim(),
            isAdvancedSearch: isAdvancedSearch 
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to execute search');
        }

        // For search results, display the raw output directly
        setResults(data.result);
        setStreamedResult(""); // Clear any streamed result
        return; // Exit early to prevent additional processing
      } else if (selectedFeature === 'details') {
        response = await fetch("/api/test_metapub", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pmid: query.trim() }), // Send the PubMed ID
        });
      } else if (selectedFeature === 'translate') {
        const formData = new FormData();
        if (selectedFile) {
          formData.append('file', selectedFile);
        } else if (query.trim()) {
          formData.append('text', query.trim());
        } else {
          setError("Please either enter text or upload a file to translate");
          return;
        }
        formData.append('targetLang', selectedLanguage);

        response = await fetch("/api/translate", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Translation failed');
        }

        setResults(data.result);
      } else {
        // Handle regular search or other features
        response = await fetch("/api/query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            query: query.trim(),
            feature: selectedFeature 
          }),
        });
      } 

      const data = await response.json();
        
      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute search');
      }

      if (selectedFeature === 'details') {
        setResults(data.result); // Assuming data.result contains the formatted metadata
      } else if (selectedFeature === 'download') {
        if (!data.pmid) {
          throw new Error('No PMID found for download');
        }

        setDownloadStatus(`PMID ${data.pmid} found, initiating download...`);
        
        const downloadResponse = await fetch("/api/download", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pmid: data.pmid }),
        });

        const downloadData: DownloadResponse = await downloadResponse.json();
        
        if (!downloadResponse.ok) {
          throw new Error(downloadData.error || 'Failed to download PDF');
        }

        setDownloadUrl(downloadData.downloadPath);
        setDownloadStatus(" ");
      } else if (data.noResults) {
        setError(data.result || "No results found. Please try a different search term.");
      } else if (data.result) {
        let currentText = "";
        const words = data.result.split(' ');
        for (let i = 0; i < words.length; i++) {
          currentText += words[i] + ' ';
          setStreamedResult(currentText);
          await new Promise(resolve => setTimeout(resolve, 20));
        }
        setResults(data.result);
      } else {
        throw new Error('No results returned');
      }
    } catch (error) {
      console.error("Operation failed:", error);
      setError(error instanceof Error ? error.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex-1 min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto p-8 space-y-8">
          {/* Professional Title */}
          <div className="text-center text-gray-800 mb-12 mt-48">
            <h1 className="text-5xl font-bold text-gray-800">
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
                PubMed Assistant
              </span>
            </h1>
            <p className="text-gray-600">Your AI-powered research partner</p>
          </div>
          
          {/* Enhanced Search Box with Features */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            {/* Search Input Area - Now First */}
            <div className="p-6">
              <div className="relative flex items-center w-full">
                <Input
                  placeholder={
                    selectedFeature === 'details' 
                      ? "Please enter a PubMed ID: 39979984" 
                      : selectedFeature === 'translate'
                      ? "Enter text to translate or upload a file"
                      : "Enter your search query"
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full h-14 pl-6 pr-28 text-lg bg-white rounded-lg border-2 border-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition-all placeholder:text-gray-400"
                  disabled={loading}
                />
                
                <div className="absolute right-4 flex items-center space-x-3">
                  {selectedFeature === 'translate' && (
                    <>
                      <div className="relative group">
                        <Languages 
                          className="h-5 w-5 text-gray-400 hover:text-blue-500 cursor-pointer" 
                          aria-label="Select Language"
                        />
                        <select
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                          className="absolute right-0 top-0 w-8 h-8 opacity-0 cursor-pointer"
                          disabled={loading}
                        >
                          {Object.entries(SUPPORTED_LANGUAGES).map(([name, code]) => (
                            <option key={code} value={code}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <label className="cursor-pointer">
                        <FileText className="h-5 w-5 text-gray-400 hover:text-blue-500" />
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".txt,.pdf,.doc,.docx"
                          disabled={loading}
                        />
                      </label>
                    </>
                  )}
                  <Button 
                    onClick={handleSearch} 
                    disabled={loading}
                    className="p-2 h-10 w-10 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    ) : (
                      <ArrowRight className="h-5 w-5 text-white" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Features Bar - Now at Bottom */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => handleFeatureClick(feature.id)}
                  onDoubleClick={() => handleFeatureDoubleClick(feature.id)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                    selectedFeature === feature.id
                      ? isAdvancedSearch && feature.id === 'search'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <feature.icon className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    {feature.label}
                    {isAdvancedSearch && feature.id === 'search' && ' (Advanced)'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-fadeIn">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {(streamedResult || results || downloadStatus) && (
            <div className="mt-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200 animate-fadeIn">
              {downloadStatus ? (
                <div className="space-y-4">
                  <p className="text-gray-700">{downloadStatus}</p>
                  {downloadUrl && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <a
                          href={downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Download className="h-5 w-5 mr-2" />
                          Download PDF
                        </a>
                      </div>
                      <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden">
                        <iframe 
                          src={downloadUrl}
                          className="w-full h-full"
                          title="PDF Viewer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedFeature === 'search' ? (
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  {streamedResult || results}
                </pre>
              ) : (
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                  {streamedResult || results}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}