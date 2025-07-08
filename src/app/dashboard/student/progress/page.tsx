import StudentProgress from "@/components/StudentProgress";

// Define PageProps with searchParams as a Promise
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Server Component with async/await for searchParams
export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams; // Await the Promise
  const classIdParam = resolvedSearchParams.classId;
  const classId = Array.isArray(classIdParam) ? classIdParam[0] : classIdParam;

  return <StudentProgress classId={classId} />;
}