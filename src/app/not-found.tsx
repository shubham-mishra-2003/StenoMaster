"use client";

import Image from "next/image";
import { useTheme } from "../hooks/ThemeProvider";
import { useRouter } from "next/navigation";

const page = () => {
  const { colorScheme } = useTheme();
  const router = useRouter();

  return (
    <div className="flex size-full flex-col h-screen">
      <div className="flex justify-center items-center size-full">
        <div
          className={`rounded-md p-10 md:w-[50vw] md:h-[70vh] w-[90vw] gap-3 h-[80vh] relative border-2 flex justify-center items-center flex-col ${
            colorScheme == "dark"
              ? "bg-slate-800/20 border-gray-400"
              : "bg-slate-200/20 border-gray-500"
          }`}
        >
          <h1 className="text-8xl text-center font-bold">404</h1>
          <h1 className="text-5xl text-center font-semibold">Page not found</h1>
          <div className="p-0 absolute bottom-0 left-0">
            <Image
              src="/not-found.png"
              alt="Not found image"
              height={200}
              width={200}
            />
          </div>
          <button
            onClick={() => {
              router.push("/");
            }}
            className="text-xl font-bold border p-2 rounded-xl cursor-pointer"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default page;
