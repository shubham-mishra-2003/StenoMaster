import Image from "next/image";
import React from "react";

const Logo = ({
  height = 50,
  width = 50,
  isColumn = false,
}: {
  height?: number;
  width?: number;
  isColumn?: boolean;
}) => {
  return (
    <div
      className={`flex items-center space-x-3 justify-center ${
        isColumn && "flex-col"
      }`}
    >
      <Image src="/logo.png" alt="logo" height={height} width={width} />
      <h1 className="text-xl sm:text-2xl font-bold gradient-text">
        StenoMaster
      </h1>
    </div>
  );
};

export default Logo;
