import Image from "next/image";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";

const Logo = ({
  height = 50,
  width = 50,
  isColumn = false,
}: {
  height?: number;
  width?: number;
  isColumn?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { colorScheme } = useTheme();
  return (
    <div
      className={`flex items-center space-x-3 justify-center ${
        isColumn && "flex-col"
      }`}
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isHovered ? (
          <Button
            style={{ height: height, width: width }}
            className={`rounded-xl cursor-pointer ${
              colorScheme == "dark"
                ? "bg-slate-700 hover:bg-slate-800"
                : "bg-slate-200 hover:bg-slate-300"
            }`}
            variant="default"
            onClick={() => window.history.back()}
          >
            <ArrowLeft />
          </Button>
        ) : (
          <Image src="/logo.png" alt="logo" height={height} width={width} />
        )}
      </div>
      <h1 className="text-xl sm:text-2xl font-bold gradient-text">
        StenoMaster
      </h1>
    </div>
  );
};

export default Logo;
