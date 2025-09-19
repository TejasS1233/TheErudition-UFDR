import { useState } from "react";
import {
  Send,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Search,
  Clock,
  User,
  MapPin,
  Phone,
  Image,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function QueryScreen({ data, onQueryResults, onNext, onBack }) {
  const [query, setQuery] = useState("");
  const [queries, setQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQueries = [
    "Show me all chat messages containing cryptocurrency addresses",
    "List communications with foreign phone numbers",
    "Find images taken at specific locations",
    "Show call records during suspicious time periods",
    "Find deleted messages or files",
    "List contacts with multiple phone numbers",
    "Show browser history related to financial transactions",
    "Find encrypted or hidden files",
  ];

  const mockResults = {
    cryptocurrency: [
      {
        type: "chat",
        platform: "WhatsApp",
        contact: "+1-555-0123",
        message: "Send payment to bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        timestamp: "2024-01-15 14:30:22",
        relevance: "high",
      },
      {
        type: "chat",
        platform: "Telegram",
        contact: "@cryptotrader",
        message: "Bitcoin wallet: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        timestamp: "2024-01-14 09:15:10",
        relevance: "high",
      },
    ],
    foreign: [
      {
        type: "call",
        contact: "+44-20-7946-0958 (UK)",
        duration: "00:12:45",
        timestamp: "2024-01-16 18:22:15",
        relevance: "medium",
      },
      {
        type: "chat",
        platform: "WhatsApp",
        contact: "+86-138-0013-8000 (China)",
        message: "Meeting confirmed for tomorrow",
        timestamp: "2024-01-15 22:10:33",
        relevance: "medium",
      },
    ],
    location: [
      {
        type: "image",
        filename: "IMG_20240115_143022.jpg",
        location: "40.7128° N, 74.0060° W (New York, NY)",
        timestamp: "2024-01-15 14:30:22",
        relevance: "high",
      },
    ],
  };

  const handleSubmitQuery = async () => {
    if (!query.trim()) return;

    setIsLoading(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate mock results based on query content
    let results = [];
    const queryLower = query.toLowerCase();

    if (
      queryLower.includes("crypto") ||
      queryLower.includes("bitcoin") ||
      queryLower.includes("wallet")
    ) {
      results = mockResults.cryptocurrency;
    } else if (queryLower.includes("foreign") || queryLower.includes("international")) {
      results = mockResults.foreign;
    } else if (queryLower.includes("location") || queryLower.includes("image")) {
      results = mockResults.location;
    } else {
      // Generic results
      results = [
        {
          type: "chat",
          platform: "WhatsApp",
          contact: "+1-555-0199",
          message: "Related to your query: " + query,
          timestamp: "2024-01-15 16:45:12",
          relevance: "medium",
        },
      ];
    }

    const newQuery = {
      id: Date.now(),
      text: query,
      timestamp: new Date().toISOString(),
      results: results,
      resultCount: results.length,
    };

    setQueries((prev) => [...prev, newQuery]);
    onQueryResults([...queries, newQuery]);
    setQuery("");
    setIsLoading(false);
  };

  const handleSuggestedQuery = (suggestedQuery) => {
    setQuery(suggestedQuery);
  };

  const getRelevanceColor = (relevance) => {
    switch (relevance) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "chat":
        return MessageSquare;
      case "call":
        return Phone;
      case "image":
        return Image;
      default:
        return Search;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">AI-Powered Data Query</h1>
        <p className="text-muted-foreground">
          Use natural language to search through your forensic data. Ask questions about
          communications, locations, contacts, or any specific patterns you're investigating.
        </p>
      </div>

      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Natural Language Query</span>
          </CardTitle>
          <CardDescription>
            Type your question in plain English. The AI will analyze the data and return relevant
            findings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="e.g., Show me all messages containing suspicious financial terms..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSubmitQuery()}
              className="flex-1"
            />
            <Button onClick={handleSubmitQuery} disabled={!query.trim() || isLoading}>
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Queries */}
      {queries.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Suggested Queries</CardTitle>
            <CardDescription>
              Click on any suggestion to get started, or type your own custom query above.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedQueries.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start text-left h-auto p-3"
                  onClick={() => handleSuggestedQuery(suggestion)}
                >
                  <Search className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{suggestion}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Query Results */}
      {queries.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Query Results</h2>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {queries.map((queryItem) => (
                <Card key={queryItem.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{queryItem.text}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                          {queryItem.resultCount} result{queryItem.resultCount !== 1 ? "s" : ""}
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(queryItem.timestamp).toLocaleTimeString()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {queryItem.results.map((result, index) => {
                        const TypeIcon = getTypeIcon(result.type);
                        return (
                          <div key={index} className="border rounded-lg p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <TypeIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium capitalize">{result.type}</span>
                                {result.platform && (
                                  <Badge variant="outline">{result.platform}</Badge>
                                )}
                              </div>
                              <Badge className={getRelevanceColor(result.relevance)}>
                                {result.relevance} relevance
                              </Badge>
                            </div>

                            <div className="space-y-1">
                              {result.contact && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <User className="h-3 w-3 text-muted-foreground" />
                                  <span>{result.contact}</span>
                                </div>
                              )}

                              {result.message && (
                                <div className="text-sm bg-muted p-2 rounded">
                                  <strong>Message:</strong> {result.message}
                                </div>
                              )}

                              {result.filename && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Image className="h-3 w-3 text-muted-foreground" />
                                  <span>{result.filename}</span>
                                </div>
                              )}

                              {result.location && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span>{result.location}</span>
                                </div>
                              )}

                              {result.duration && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span>Duration: {result.duration}</span>
                                </div>
                              )}

                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{result.timestamp}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Analysis Summary */}
      {queries.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Analysis Complete</p>
                <p className="text-sm text-blue-600">
                  Processed {queries.length} quer{queries.length !== 1 ? "ies" : "y"} and found{" "}
                  {queries.reduce((total, q) => total + q.resultCount, 0)} relevant result
                  {queries.reduce((total, q) => total + q.resultCount, 0) !== 1 ? "s" : ""}. Ready
                  to generate investigation summary.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Structure
        </Button>
        <Button onClick={onNext} disabled={queries.length === 0}>
          Generate Summary Report
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
