# Golf

Proyecto Next.js 14 con App Router para una plataforma SaaS deportiva (gestión de torneos, campos y jugadores).

## Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict, sin `any`)
- **TailwindCSS** (tema oscuro)
- Datos **mocks** (sin backend)

## Estructura

```
/app
  /login          → Página de login
  /(main)         → Rutas con sidebar
    /dashboard
    /tournaments
    /courses
    /players
/components       → Navbar, Sidebar
/features         → Componentes por feature
  /auth
  /tournaments
  /courses
  /players
/lib
/types
/mocks
```

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — Servidor de desarrollo
- `npm run build` — Build de producción
- `npm run start` — Servidor de producción
- `npm run lint` — ESLint
