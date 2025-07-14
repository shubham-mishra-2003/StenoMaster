import { useState } from "react";
import { Assignment } from "@/types";
import { toast } from "@/hooks/use-toast";
import moment from "moment";

interface AssignmentFormData {
  title: string;
  deadline: string;
  correctText: string;
  classId: string;
  imageFile?: File | null;
  imageUrl?: string;
}

interface UseAssignmentReturn {
  assignments: Assignment[];
  loading: boolean;
  createAssignment: (formData: AssignmentFormData) => Promise<void>;
  updateAssignment: (
    assignmentId: string,
    formData: Partial<AssignmentFormData>
  ) => Promise<void>;
  toggleAssignmentStatus: (assignmentId: string) => Promise<void>;
  deleteAssignment: (assignmentId: string) => Promise<void>;
}

export const useAssignment = (): UseAssignmentReturn => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  const CLOUDINARY_CLOUD_NAME = "duqkxqaij";
  const CLOUDINARY_UPLOAD_PRESET = "stenomaster";

  const uploadToCloudinary = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const text = await response.text();
      const result = text
        ? JSON.parse(text)
        : { status: "error", message: "Empty response from Cloudinary" };

      if (!response.ok) {
        console.error("[useAssignment] Cloudinary error:", result.message);
        toast({
          title: "Error",
          description: result.message || "Failed to upload image to Cloudinary",
          variant: "destructive",
        });
        return null;
      }

      return result.secure_url;
    } catch (error) {
      console.error("[useAssignment] Cloudinary upload error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during image upload.",
        variant: "destructive",
      });
      return null;
    }
  };

  // const fetchAssignments = async (classId?: string) => {
  //   setLoading(true);
  //   try {
  //     const token = localStorage.getItem("StenoMaster-token");
  //     if (!token || typeof token !== "string" || token.trim() === "") {
  //       console.error("[useAssignment] Invalid token in localStorage");
  //       // toast({
  //       //   title: "Error",
  //       //   description: "Invalid session. Please log in again.",
  //       //   variant: "destructive",
  //       // });
  //       return;
  //     }

  //     const body = classId ? { token, classId } : { token };
  //     const response = await fetch("/api/assignment/fetch", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(body),
  //       signal: AbortSignal.timeout(5000),
  //     });

  //     const text = await response.text();
  //     const result = text
  //       ? JSON.parse(text)
  //       : { status: "error", message: "Empty response from server" };

  //     if (response.ok && result.status === "success") {
  //       const now = new Date();
  //       const formattedAssignments = result.data.map(
  //         (assignment: Assignment) => ({
  //           ...assignment,
  //           createdAt: new Date(assignment.createdAt),
  //         })
  //       );

  //       for (const assignment of formattedAssignments) {
  //         const endDate = moment(
  //           assignment.deadline,
  //           "DD/MM/YYYY, hh:mm A"
  //         ).toDate();
  //         if (assignment.isActive && endDate < now) {
  //           await toggleAssignmentStatus(assignment.id);
  //         }
  //       }

  //       const refetchResponse = await fetch("/api/assignment/fetch", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(body),
  //         signal: AbortSignal.timeout(5000),
  //       });

  //       const refetchText = await refetchResponse.text();
  //       const refetchResult = refetchText
  //         ? JSON.parse(refetchText)
  //         : { status: "error", message: "Empty response from server" };

  //       if (refetchResponse.ok && refetchResult.status === "success") {
  //         setAssignments(
  //           refetchResult.data.map((assignment: Assignment) => ({
  //             ...assignment,
  //             createdAt: new Date(assignment.createdAt),
  //           }))
  //         );
  //       } else {
  //         console.error(
  //           "[useAssignment] Refetch assignments error:",
  //           refetchResult.message
  //         );
  //         toast({
  //           title: "Error",
  //           description:
  //             refetchResult.message || "Failed to refetch assignments",
  //           variant: "destructive",
  //         });
  //       }
  //     } else {
  //       console.error(
  //         "[useAssignment] Fetch assignments error:",
  //         result.message
  //       );
  //       toast({
  //         title: "Error",
  //         description: result.message || "Failed to fetch assignments",
  //         variant: "destructive",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("[useAssignment] Fetch assignments error:", error);
  //     toast({
  //       title: "Error",
  //       description: "An unexpected error occurred while fetching assignments.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const createAssignment = async (formData: AssignmentFormData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("StenoMaster-token");
      if (!token || typeof token !== "string" || token.trim() === "") {
        console.error("[useAssignment] Invalid token in localStorage");
        return;
      }

      if (
        !formData.title.trim() ||
        !formData.correctText.trim() ||
        !formData.classId ||
        !formData.deadline
      ) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      let imageUrl = formData.imageUrl;
      if (formData.imageFile) {
        const uploadedUrl = await uploadToCloudinary(formData.imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          return;
        }
      }

      const response = await fetch("/api/assignment/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          deadline: formData.deadline,
          imageUrl: imageUrl || "",
          correctText: formData.correctText,
          classId: formData.classId,
          token,
        }),
        signal: AbortSignal.timeout(5000),
      });

      const text = await response.text();
      const result = text
        ? JSON.parse(text)
        : { status: "error", message: "Empty response from server" };

      if (response.ok && result.status === "success") {
        setAssignments((prev) => [
          ...prev,
          {
            ...result.data,
            createdAt: new Date(result.data.createdAt),
          },
        ]);
        toast({
          title: "Success",
          description: "Assignment created successfully.",
        });
      } else {
        return;
        // toast({
        //   title: "Error",
        //   description: result.message || "Failed to create assignment",
        //   variant: "destructive",
        // });
      }
    } catch (error) {
      console.error("[useAssignment] Create assignment error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAssignment = async (
    assignmentId: string,
    formData: Partial<AssignmentFormData>
  ) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("StenoMaster-token");
      if (!token || typeof token !== "string" || token.trim() === "") {
        console.error("[useAssignment] Invalid token in localStorage");
        return;
      }

      if (
        !formData.title?.trim() ||
        !formData.correctText?.trim() ||
        !formData.classId
      ) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      let imageUrl = formData.imageUrl;
      if (formData.imageFile) {
        const uploadedUrl = await uploadToCloudinary(formData.imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          return;
        }
      }

      const body: any = { assignmentId, token };
      if (formData.title) body.title = formData.title;
      if (formData.deadline) body.deadline = formData.deadline;
      if (formData.correctText) body.correctText = formData.correctText;
      if (formData.classId) body.classId = formData.classId;
      if (imageUrl) body.imageUrl = imageUrl;

      if (imageUrl) {
        const response = await fetch("/api/assignment/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(5000),
        });

        const text = await response.text();
        const result = text
          ? JSON.parse(text)
          : { status: "error", message: "Empty response from server" };

        if (response.ok && result.status === "success") {
          setAssignments((prev) =>
            prev.map((a) =>
              a.id === assignmentId
                ? {
                    ...result.data,
                    createdAt: new Date(result.data.createdAt),
                  }
                : a
            )
          );
          toast({
            title: "Success",
            description: "Assignment updated successfully.",
          });
        } else {
          console.error(
            "[useAssignment] Update assignment error:",
            result.message
          );
        }
      } else {
        return;
      }
    } catch (error) {
      console.error("[useAssignment] Update assignment error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAssignmentStatus = async (assignmentId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("StenoMaster-token");
      if (!token || typeof token !== "string" || token.trim() === "") {
        console.error("[useAssignment] Invalid token in localStorage");
        return;
      }

      const response = await fetch("/api/assignment/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, token }),
        signal: AbortSignal.timeout(5000),
      });

      const text = await response.text();
      const result = text
        ? JSON.parse(text)
        : { status: "error", message: "Empty response from server" };

      if (response.ok && result.status === "success") {
        setAssignments((prev) =>
          prev.map((a) =>
            a.id === assignmentId
              ? {
                  ...result.data,
                  createdAt: new Date(result.data.createdAt),
                }
              : a
          )
        );
        toast({
          title: "Success",
          description: `Assignment ${
            result.data.isActive ? "activated" : "deactivated"
          } successfully.`,
        });
      } else {
        console.error(
          "[useAssignment] Toggle assignment error:",
          result.message
        );
      }
    } catch (error) {
      console.error("[useAssignment] Toggle assignment error:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async (assignmentId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("StenoMaster-token");
      if (!token || typeof token !== "string" || token.trim() === "") {
        console.error("[useAssignment] Invalid token in localStorage");
        return;
      }

      const response = await fetch("/api/assignment/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, token }),
        signal: AbortSignal.timeout(5000),
      });

      const text = await response.text();
      const result = text
        ? JSON.parse(text)
        : { status: "error", message: "Empty response from server" };

      if (response.ok && result.status === "success") {
        setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
        toast({
          title: "Success",
          description: "Assignment deleted successfully.",
        });
      } else {
        console.error(
          "[useAssignment] Delete assignment error:",
          result.message
        );
        toast({
          title: "Error",
          description: result.message || "Failed to delete assignment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[useAssignment] Delete assignment error:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    assignments,
    loading,
    createAssignment,
    updateAssignment,
    toggleAssignmentStatus,
    deleteAssignment,
  };
};
