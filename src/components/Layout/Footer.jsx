import React from 'react';
import { GithubIcon, Linkedin} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold mb-2 text-indigo-400">dkmanga</h3>
          </div>

          <div className="flex space-x-6 mb-2 md:mb-0">
            <h1 className="text-indigo-400">About</h1>
            <h1 className="text-indigo-400">Contact</h1>
            <h1 className="text-indigo-400">Privacy Policy</h1>
          </div>

          <div className="flex space-x-4">
            <a href="https://github.com/dishantk9799" className="hover:text-indigo-400 transition-colors">
              <GithubIcon size={20} />
            </a>
            <a href="https://linkedin.com/in/dishant-kumawat-0a1598373" className="hover:text-indigo-400 transition-colors">
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} dkmanga. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;