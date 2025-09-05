import { AuthProvider } from "@/hooks/useAuth";
import Image from "next/image";

export default function TeacherRegisterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <div className="flex justify-center flex-col gap-4 items-center h-screen w-full">
        <div className="flex items-center space-x-3 justify-center">
          <Image src="/logo.png" alt="logo" height={50} width={50} />
          <h1 className="text-xl sm:text-2xl font-bold gradient-text">
            StenoMaster
          </h1>
        </div>
        {children}
      </div>
    </AuthProvider>
  );
}
