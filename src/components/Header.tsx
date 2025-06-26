
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gradient">MatchMaker</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
              How It Works
            </a>
            <a href="#success-stories" className="text-gray-600 hover:text-gray-900 transition-colors">
              Success Stories
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </a>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="hidden sm:inline-flex border-gray-300 text-gray-700 hover:bg-gray-50">
              Sign In
            </Button>
            <Button 
              className="gradient-primary border-0 hover:opacity-90 transition-opacity text-white" 
              onClick={() => navigate('/register')}
            >
              Get Started
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
