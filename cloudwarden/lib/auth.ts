// Simple mock auth system for demo purposes
// In production, use a proper auth library like NextAuth.js or Auth.js

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "viewer";
  avatar?: string;
}

const MOCK_USERS: (User & { password: string })[] = [
  {
    id: "usr_1",
    email: "admin@cloudwarden.io",
    password: "admin123",
    name: "Prudhvi Dasari",
    role: "admin",
  },
  {
    id: "usr_2",
    email: "viewer@cloudwarden.io",
    password: "viewer123",
    name: "Demo Viewer",
    role: "viewer",
  },
];

// Simple base64 "token" for demo (NOT secure - demo only)
export function createToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24h
  };
  return btoa(JSON.stringify(payload));
}

export function verifyToken(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) return null;
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export function authenticateUser(
  email: string,
  password: string
): { user: User; token: string } | null {
  const found = MOCK_USERS.find(
    (u) => u.email === email && u.password === password
  );
  if (!found) return null;
  const { password: _, ...user } = found;
  return { user, token: createToken(user) };
}

export function registerUser(
  email: string,
  password: string,
  name: string
): { user: User; token: string } | null {
  if (MOCK_USERS.find((u) => u.email === email)) return null;
  const user: User = {
    id: `usr_${Date.now()}`,
    email,
    name,
    role: "viewer",
  };
  MOCK_USERS.push({ ...user, password });
  return { user, token: createToken(user) };
}
