import { Loader } from "lucide-react";
import React from "react";

const Loading = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <ul className="flex items-center space-x-2">
        <li>
          <Loader className="animate-spin h-6 w-6 text-blue-500" />
        </li>
        <li className="text-lg font-semibold">Loading...</li>
      </ul>
    </div>
  );
};

export default Loading;
