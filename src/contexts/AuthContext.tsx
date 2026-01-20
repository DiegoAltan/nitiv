import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "administrador" | "psicologo" | "trabajador_social" | "docente" | "estudiante";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  institution_id: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  activeRole: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, role: AppRole) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  switchRole: (role: AppRole) => void;
  canSwitchRole: boolean;
  isAdmin: boolean;
  isDupla: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = "selectedRole";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch roles
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (rolesData) {
        const userRoles = rolesData.map((r) => r.role as AppRole);
        setRoles(userRoles);
        
        // Restore selected role from storage.
        // In DEV we allow overriding to any role for testing.
        const storedRole = sessionStorage.getItem(ROLE_STORAGE_KEY) as AppRole | null;
        const canUseStored = import.meta.env.DEV
          ? Boolean(storedRole)
          : Boolean(storedRole && userRoles.includes(storedRole));

        if (canUseStored && storedRole) {
          setSelectedRole(storedRole);
        } else if (userRoles.length > 0) {
          // Default to first role if no valid stored role
          setSelectedRole(userRoles[0]);
        } else {
          setSelectedRole(null);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlock
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
          setSelectedRole(null);
          sessionStorage.removeItem(ROLE_STORAGE_KEY);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string, role: AppRole) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) {
      return { error: error as Error };
    }

    // If signup successful, create profile and assign role
    if (data.user) {
      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: data.user.id,
        full_name: fullName,
        email: email,
      });

      if (profileError) {
        console.error("Error creating profile:", profileError);
      }

      // Assign role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: data.user.id,
        role: role,
      });

      if (roleError) {
        console.error("Error assigning role:", roleError);
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRoles([]);
    setSelectedRole(null);
    sessionStorage.removeItem(ROLE_STORAGE_KEY);
  };

  // Dev mode: Switch role for testing - persists in sessionStorage
  const switchRole = (role: AppRole) => {
    if (!import.meta.env.DEV) return;
    setSelectedRole(role);
    sessionStorage.setItem(ROLE_STORAGE_KEY, role);
  };

  // Use selectedRole for permission checks (if set), fallback to checking all roles
  const activeRole = selectedRole || roles[0];
  const canSwitchRole = import.meta.env.DEV;
  const isAdmin = activeRole === "administrador";
  const isDupla = activeRole === "psicologo" || activeRole === "trabajador_social";
  const isTeacher = activeRole === "docente";
  const isStudent = activeRole === "estudiante";

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        activeRole: activeRole ?? null,
        loading,
        signIn,
        signUp,
        signOut,
        switchRole,
        canSwitchRole,
        isAdmin,
        isDupla,
        isTeacher,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
