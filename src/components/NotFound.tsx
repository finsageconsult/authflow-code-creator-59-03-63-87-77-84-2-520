import React from 'react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="relative w-96 h-64 mx-auto">
            {/* Browser window mockup */}
            <div className="absolute inset-0 bg-card border border-border rounded-lg shadow-lg">
              {/* Browser header */}
              <div className="flex items-center gap-2 p-3 border-b border-border">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              
              {/* Content area with geometric shapes */}
              <div className="p-6 h-full relative overflow-hidden">
                {/* Purple geometric elements */}
                <div className="absolute top-4 left-4 w-16 h-16 bg-primary/20 transform rotate-45"></div>
                <div className="absolute top-12 right-8 w-20 h-8 bg-primary rounded-full"></div>
                <div className="absolute bottom-8 left-8 w-24 h-4 bg-primary rounded-full"></div>
                
                {/* Large 404 text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl font-bold text-muted-foreground/20">404</span>
                </div>
              </div>
            </div>
            
            {/* Skateboarding person illustration placeholder */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4">
              <div className="w-24 h-16 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
                <span className="text-xs text-muted-foreground">🛹</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Error message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            This Page Does Not Exist
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Sorry, the page you are looking for could not be found. It's just an accident that was not intentional.
          </p>
          
          <div className="pt-6">
            <button 
              onClick={() => window.history.back()}
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;