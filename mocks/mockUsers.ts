/**
 * Usuarios de demo: cada uno tiene email y contraseña.
 * Si tienen playerId, al loguearse se guarda ese jugador (para mostrar "Tú" en En vivo).
 * Los admins no tienen playerId (soporte).
 */
export interface MockUser {
  email: string;
  password: string;
  label: string;
  /** Si es jugador, su id en mockPlayers; si es admin, undefined */
  playerId?: string;
}

export const mockUsers: MockUser[] = [
  { email: "admin@gmail.com", password: "123456", label: "Admin (soporte)" },
  { email: "superadmin@gmail.com", password: "123456", label: "Super Admin (soporte)" },
  { email: "carlos@ccm.com", password: "123456", label: "Carlos Méndez", playerId: "p1" },
  { email: "elena@ccm.com", password: "123456", label: "Elena Ruiz", playerId: "p2" },
  { email: "antonio@ccm.com", password: "123456", label: "Antonio Fernández", playerId: "p3" },
  { email: "maria@ccm.com", password: "123456", label: "María López", playerId: "p4" },
];

export function findUserByEmailAndPassword(
  email: string,
  password: string
): MockUser | undefined {
  return mockUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
  );
}
