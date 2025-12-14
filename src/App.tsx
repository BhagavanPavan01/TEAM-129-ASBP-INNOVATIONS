import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MessageInput from "./components/ui/MessaggeInput";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          {/* For example, if you want a separate page for MessageInput: */}
          // In App.tsx - Update the route to include props
          <Route
            path="/message-input"
            element={
              <MessageInput
                onSendMessage={async (message) => {
                  // Handle sending message here
                  console.log('Sending:', message);
                  // Add your actual API call logic
                }}
                isLoading={false}
                location="New York"
                weatherData={{ temperature: 25 }}
              />
            }
          />

          {/* Catch-all route - should always be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;