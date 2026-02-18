/**
 * View layer: serialize User entities for API responses.
 * Keeps response shape in one place (MVC View).
 */

export function userPublic(user: {
  id: string
  username: string
  email: string | null
  name: string
}) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
  }
}

export function userWithGroup(user: {
  id: string
  username: string
  email: string | null
  name: string
  userGroup?: { id: string; name: string } | null
}) {
  return {
    ...userPublic(user),
    ...(user.userGroup && { userGroup: user.userGroup }),
  }
}

export function authResponse(user: Parameters<typeof userPublic>[0], token: string) {
  return {
    user: userPublic(user),
    token,
  }
}
