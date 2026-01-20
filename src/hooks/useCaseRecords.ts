import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CaseRecord {
  id: string;
  student_id: string;
  record_type: string;
  title: string;
  description: string | null;
  date_recorded: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SharedAccess {
  id: string;
  student_id: string;
  granted_to: string;
  granted_by: string;
  access_type: string;
  expires_at: string | null;
  created_at: string;
  profile?: { full_name: string } | null;
}

export function useCaseRecords(studentId?: string) {
  const { isDupla, isAdmin, profile } = useAuth();
  const hasAccess = isDupla || isAdmin;
  const [records, setRecords] = useState<CaseRecord[]>([]);
  const [sharedAccess, setSharedAccess] = useState<SharedAccess[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    if (!studentId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("student_case_records")
        .select("*")
        .eq("student_id", studentId)
        .order("date_recorded", { ascending: false });

      if (error) throw error;
      setRecords(data || []);

      // Fetch shared access if dupla or admin
      if (hasAccess) {
        const { data: accessData } = await supabase
          .from("shared_case_access")
          .select("*")
          .eq("student_id", studentId);

        setSharedAccess(accessData || []);
      }
    } catch (error) {
      console.error("Error fetching case records:", error);
    } finally {
      setLoading(false);
    }
  }, [studentId, hasAccess]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const addRecord = async (data: {
    record_type: string;
    title: string;
    description?: string;
    date_recorded?: string;
  }) => {
    if (!studentId || !profile?.id) return null;

    try {
      const { data: newRecord, error } = await supabase
        .from("student_case_records")
        .insert({
          student_id: studentId,
          record_type: data.record_type,
          title: data.title,
          description: data.description || null,
          date_recorded: data.date_recorded || new Date().toISOString().split("T")[0],
          created_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchRecords();
      return newRecord;
    } catch (error) {
      console.error("Error adding case record:", error);
      return null;
    }
  };

  const updateRecord = async (recordId: string, data: Partial<CaseRecord>) => {
    try {
      const { error } = await supabase
        .from("student_case_records")
        .update(data)
        .eq("id", recordId);

      if (error) throw error;
      await fetchRecords();
      return true;
    } catch (error) {
      console.error("Error updating case record:", error);
      return false;
    }
  };

  const deleteRecord = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from("student_case_records")
        .delete()
        .eq("id", recordId);

      if (error) throw error;
      await fetchRecords();
      return true;
    } catch (error) {
      console.error("Error deleting case record:", error);
      return false;
    }
  };

  const grantAccess = async (grantedToProfileId: string, accessType: string = "view") => {
    if (!studentId || !profile?.id) return false;

    try {
      const { error } = await supabase
        .from("shared_case_access")
        .upsert({
          student_id: studentId,
          granted_to: grantedToProfileId,
          granted_by: profile.id,
          access_type: accessType,
        });

      if (error) throw error;
      await fetchRecords();
      return true;
    } catch (error) {
      console.error("Error granting access:", error);
      return false;
    }
  };

  const revokeAccess = async (accessId: string) => {
    try {
      const { error } = await supabase
        .from("shared_case_access")
        .delete()
        .eq("id", accessId);

      if (error) throw error;
      await fetchRecords();
      return true;
    } catch (error) {
      console.error("Error revoking access:", error);
      return false;
    }
  };

  return {
    records,
    sharedAccess,
    loading,
    addRecord,
    updateRecord,
    deleteRecord,
    grantAccess,
    revokeAccess,
    refetch: fetchRecords,
  };
}
