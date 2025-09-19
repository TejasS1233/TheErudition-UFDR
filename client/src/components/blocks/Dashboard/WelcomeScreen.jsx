import { Shield, Upload, Search, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function WelcomeScreen({ onNext }) {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Shield className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">UFDR Investigation Platform</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Advanced AI-powered analysis tool for Universal Forensic Extraction Device Reports.
          Streamline your digital forensic investigations with intelligent data processing and
          natural language queries.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="text-center">
            <Upload className="h-8 w-8 mx-auto text-primary" />
            <CardTitle className="text-lg">Secure Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Upload UFDR files securely with automatic validation and processing
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="text-center">
            <Search className="h-8 w-8 mx-auto text-primary" />
            <CardTitle className="text-lg">AI Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Use natural language to search through complex forensic data
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="text-center">
            <FileText className="h-8 w-8 mx-auto text-primary" />
            <CardTitle className="text-lg">Smart Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Generate comprehensive reports with key findings and evidence
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="text-center">
            <Shield className="h-8 w-8 mx-auto text-primary" />
            <CardTitle className="text-lg">Secure & Compliant</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Built with forensic standards and security protocols in mind
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Investigation Workflow */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-2xl">Investigation Workflow</CardTitle>
          <CardDescription>
            Follow these steps to conduct a thorough digital forensic investigation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">
                1
              </div>
              <h3 className="font-semibold">Upload UFDR</h3>
              <p className="text-sm text-muted-foreground">
                Securely upload your forensic extraction files
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">
                2
              </div>
              <h3 className="font-semibold">Review Structure</h3>
              <p className="text-sm text-muted-foreground">
                Examine the data structure and available information
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">
                3
              </div>
              <h3 className="font-semibold">Query Data</h3>
              <p className="text-sm text-muted-foreground">
                Use AI-powered queries to find relevant evidence
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">
                4
              </div>
              <h3 className="font-semibold">Generate Report</h3>
              <p className="text-sm text-muted-foreground">
                Create comprehensive investigation summary
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">95%</div>
              <p className="text-sm text-muted-foreground">Faster Evidence Discovery</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">24/7</div>
              <p className="text-sm text-muted-foreground">Secure Processing</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100+</div>
              <p className="text-sm text-muted-foreground">Supported File Types</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Start Investigation Button */}
      <div className="text-center">
        <Button onClick={onNext} size="lg" className="text-lg px-8 py-6">
          Start New Investigation
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
