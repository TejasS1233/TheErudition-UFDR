import { useState } from "react";
import { AppSidebar } from "@/components/blocks/Dashboard/AppSidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation, Link } from "react-router-dom";
import { WelcomeScreen } from "@/components/blocks/Dashboard/WelcomeScreen";
import { UploadScreen } from "@/components/blocks/Dashboard/UploadScreen";
import { DataStructureScreen } from "@/components/blocks/Dashboard/DataStructureScreen";
import { QueryScreen } from "@/components/blocks/Dashboard/QueryScreen";
import { SummaryScreen } from "@/components/blocks/Dashboard/SummaryScreen";

export default function Page() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const [currentScreen, setCurrentScreen] = useState("welcome");
  const [uploadedData, setUploadedData] = useState(null);
  const [queryResults, setQueryResults] = useState([]);

  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return <WelcomeScreen onNext={() => setCurrentScreen("upload")} />;
      case "upload":
        return (
          <UploadScreen
            onUpload={(data) => {
              setUploadedData(data);
              setCurrentScreen("structure");
            }}
            onBack={() => setCurrentScreen("welcome")}
          />
        );
      case "structure":
        return (
          <DataStructureScreen
            data={uploadedData}
            onNext={() => setCurrentScreen("query")}
            onBack={() => setCurrentScreen("upload")}
          />
        );
      case "query":
        return (
          <QueryScreen
            data={uploadedData}
            onQueryResults={(results) => setQueryResults(results)}
            onNext={() => setCurrentScreen("summary")}
            onBack={() => setCurrentScreen("structure")}
          />
        );
      case "summary":
        return (
          <SummaryScreen
            data={uploadedData}
            queryResults={queryResults}
            onBack={() => setCurrentScreen("query")}
            onNewInvestigation={() => {
              setCurrentScreen("welcome");
              setUploadedData(null);
              setQueryResults([]);
            }}
          />
        );
      default:
        return <WelcomeScreen onNext={() => setCurrentScreen("upload")} />;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {pathSegments.map((segment, index) => {
                  const href = "/" + pathSegments.slice(0, index + 1).join("/");
                  const isLast = index === pathSegments.length - 1;
                  return (
                    <BreadcrumbItem key={href}>
                      {isLast ? (
                        <BreadcrumbPage>
                          {segment.charAt(0).toUpperCase() + segment.slice(1)}
                        </BreadcrumbPage>
                      ) : (
                        <>
                          <BreadcrumbLink asChild>
                            <Link to={href}>
                              {segment.charAt(0).toUpperCase() + segment.slice(1)}
                            </Link>
                          </BreadcrumbLink>
                          <BreadcrumbSeparator />
                        </>
                      )}
                    </BreadcrumbItem>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{renderScreen()}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
