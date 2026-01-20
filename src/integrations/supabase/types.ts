export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string
          id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          student_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          description: string
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          student_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          id: string
          institution_id: string
          level: string
          name: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          institution_id: string
          level: string
          name: string
          year?: number
        }
        Update: {
          created_at?: string
          id?: string
          institution_id?: string
          level?: string
          name?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "courses_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      file_access_logs: {
        Row: {
          changed_by: string
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["file_access_status"]
          previous_status:
            | Database["public"]["Enums"]["file_access_status"]
            | null
          reason: string | null
          student_file_id: string
        }
        Insert: {
          changed_by: string
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["file_access_status"]
          previous_status?:
            | Database["public"]["Enums"]["file_access_status"]
            | null
          reason?: string | null
          student_file_id: string
        }
        Update: {
          changed_by?: string
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["file_access_status"]
          previous_status?:
            | Database["public"]["Enums"]["file_access_status"]
            | null
          reason?: string | null
          student_file_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_access_logs_student_file_id_fkey"
            columns: ["student_file_id"]
            isOneToOne: false
            referencedRelation: "student_files"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          institution_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          institution_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          institution_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      student_courses: {
        Row: {
          course_id: string
          created_at: string
          id: string
          student_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          student_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_courses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_files: {
        Row: {
          access_status: Database["public"]["Enums"]["file_access_status"]
          created_at: string
          id: string
          restricted_reason: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          access_status?: Database["public"]["Enums"]["file_access_status"]
          created_at?: string
          id?: string
          restricted_reason?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          access_status?: Database["public"]["Enums"]["file_access_status"]
          created_at?: string
          id?: string
          restricted_reason?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_files_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_courses: {
        Row: {
          course_id: string
          created_at: string
          id: string
          teacher_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          teacher_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_courses_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_evaluations: {
        Row: {
          created_at: string
          evaluated_at: string
          evaluation_level: string
          id: string
          observations: string | null
          student_id: string
          teacher_id: string
        }
        Insert: {
          created_at?: string
          evaluated_at?: string
          evaluation_level: string
          id?: string
          observations?: string | null
          student_id: string
          teacher_id: string
        }
        Update: {
          created_at?: string
          evaluated_at?: string
          evaluation_level?: string
          id?: string
          observations?: string | null
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_evaluations_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_student_access: {
        Row: {
          access_level: string
          expires_at: string | null
          granted_at: string
          granted_by: string
          id: string
          student_id: string
          teacher_id: string
        }
        Insert: {
          access_level?: string
          expires_at?: string | null
          granted_at?: string
          granted_by: string
          id?: string
          student_id: string
          teacher_id: string
        }
        Update: {
          access_level?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string
          id?: string
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_student_access_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_student_access_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean
          id: string
          notifications_enabled: boolean
          theme: string
          updated_at: string
          user_id: string
          weekly_summary: boolean
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          notifications_enabled?: boolean
          theme?: string
          updated_at?: string
          user_id: string
          weekly_summary?: boolean
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          notifications_enabled?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
          weekly_summary?: boolean
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wellbeing_records: {
        Row: {
          anxiety_level: number | null
          comment: string | null
          created_at: string
          emotions: string[] | null
          id: string
          recorded_at: string
          stress_level: number | null
          student_id: string
          wellbeing_level: number
        }
        Insert: {
          anxiety_level?: number | null
          comment?: string | null
          created_at?: string
          emotions?: string[] | null
          id?: string
          recorded_at?: string
          stress_level?: number | null
          student_id: string
          wellbeing_level: number
        }
        Update: {
          anxiety_level?: number | null
          comment?: string | null
          created_at?: string
          emotions?: string[] | null
          id?: string
          recorded_at?: string
          stress_level?: number | null
          student_id?: string
          wellbeing_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "wellbeing_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_institution_id: { Args: { _user_id: string }; Returns: string }
      get_profile_id: { Args: { _user_id: string }; Returns: string }
      get_student_file_status: {
        Args: { _student_profile_id: string }
        Returns: Database["public"]["Enums"]["file_access_status"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_dupla: { Args: { _user_id: string }; Returns: boolean }
      is_student: { Args: { _user_id: string }; Returns: boolean }
      is_teacher: { Args: { _user_id: string }; Returns: boolean }
      teacher_has_extended_access: {
        Args: { _student_profile_id: string; _teacher_user_id: string }
        Returns: boolean
      }
      teacher_has_student_access: {
        Args: { _student_profile_id: string; _teacher_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "administrador"
        | "psicologo"
        | "trabajador_social"
        | "docente"
        | "estudiante"
      file_access_status: "abierta" | "restringida" | "confidencial"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "administrador",
        "psicologo",
        "trabajador_social",
        "docente",
        "estudiante",
      ],
      file_access_status: ["abierta", "restringida", "confidencial"],
    },
  },
} as const
