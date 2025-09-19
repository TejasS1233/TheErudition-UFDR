import {
  MessageSquare,
  Phone,
  Image,
  Users,
  MapPin,
  Smartphone,
  Globe,
  ArrowLeft,
  ArrowRight,
  FileText,
  Video,
  Mic,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function DataStructureScreen({ data, onNext, onBack }) {
  const getIcon = (type) => {
    const icons = {
      chats: MessageSquare,
      calls: Phone,
      media: Image,
      contacts: Users,
      locations: MapPin,
      applications: Smartphone,
      browserHistory: Globe,
    };
    return icons[type] || FileText;
  };

  const getChatIcon = (platform) => {
    return MessageSquare; // In a real app, you'd have specific icons for each platform
  };

  const getMediaIcon = (type) => {
    const icons = {
      images: Image,
      videos: Video,
      audio: Mic,
      documents: FileText,
    };
    return icons[type] || FileText;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Data Structure Analysis</h1>
        <p className="text-muted-foreground">
          Review the extracted data structure from your UFDR files. Total records:{" "}
          {data.totalRecords.toLocaleString()}
        </p>
      </div>

      {/* Case Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Case Number</p>
              <p className="text-lg font-semibold">{data.caseNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Investigating Officer</p>
              <p className="text-lg font-semibold">{data.officerName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Upload Date</p>
              <p className="text-lg font-semibold">
                {new Date(data.uploadDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(data.structure).map(([category, value]) => {
          const Icon = getIcon(category);
          const count =
            typeof value === "object" ? Object.values(value).reduce((a, b) => a + b, 0) : value;

          return (
            <Card key={category} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <Icon className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{count.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {category.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Communications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Communications</span>
            </CardTitle>
            <CardDescription>Chat messages and call records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Chat Platforms</h4>
              <div className="space-y-2">
                {Object.entries(data.structure.chats).map(([platform, count]) => {
                  const Icon = getChatIcon(platform);
                  return (
                    <div key={platform} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{platform}</span>
                      </div>
                      <Badge variant="secondary">{count.toLocaleString()}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Call Records</h4>
              <div className="space-y-2">
                {Object.entries(data.structure.calls).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{type}</span>
                    </div>
                    <Badge variant="secondary">{count.toLocaleString()}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media & Files */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Image className="h-5 w-5" />
              <span>Media & Files</span>
            </CardTitle>
            <CardDescription>Images, videos, documents and other files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Media Files</h4>
              <div className="space-y-2">
                {Object.entries(data.structure.media).map(([type, count]) => {
                  const Icon = getMediaIcon(type);
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{type}</span>
                      </div>
                      <Badge variant="secondary">{count.toLocaleString()}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <span>Device Data</span>
            </CardTitle>
            <CardDescription>Applications and system information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <span>Installed Applications</span>
                </div>
                <Badge variant="secondary">{data.structure.applications}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>Browser History</span>
                </div>
                <Badge variant="secondary">{data.structure.browserHistory.toLocaleString()}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location & Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Contacts & Location</span>
            </CardTitle>
            <CardDescription>Contact information and location data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Contacts</span>
                </div>
                <Badge variant="secondary">{data.structure.contacts.toLocaleString()}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Location Points</span>
                </div>
                <Badge variant="secondary">{data.structure.locations.toLocaleString()}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Summary */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
              ✓
            </div>
            <div>
              <p className="font-medium text-green-800">Data Processing Complete</p>
              <p className="text-sm text-green-600">
                Successfully processed {data.files.length} UFDR file(s) containing{" "}
                {data.totalRecords.toLocaleString()} total records. Ready for AI-powered analysis
                and querying.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Upload
        </Button>
        <Button onClick={onNext}>
          Start Querying Data
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
