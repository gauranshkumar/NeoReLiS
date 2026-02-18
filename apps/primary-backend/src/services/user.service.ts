import { prisma } from '@neorelis/db'
import { hashPassword, verifyPassword } from '../utils/password'

const DEFAULT_GROUP_NAME = 'default'

export async function getOrCreateDefaultUserGroup() {
  let userGroup = await prisma.userGroup.findUnique({
    where: { name: DEFAULT_GROUP_NAME },
  })
  if (!userGroup) {
    userGroup = await prisma.userGroup.create({
      data: {
        name: DEFAULT_GROUP_NAME,
        description: 'Default user group',
        active: 1,
      },
    })
  }
  return userGroup
}

export async function findUserByEmailOrUsername(email?: string, username?: string) {
  if (!email && !username) return null
  return prisma.user.findFirst({
    where: {
      OR: [
        ...(email ? [{ email }] : []),
        ...(username ? [{ username }] : []),
      ],
    },
    include: {
      userGroup: { select: { id: true, name: true } },
    },
  })
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      active: true,
      state: true,
    },
  })
}

export async function createUser(params: {
  email: string
  username: string
  name: string
  password: string
}) {
  const userGroup = await getOrCreateDefaultUserGroup()
  const passwordHash = await hashPassword(params.password)

  return prisma.user.create({
    data: {
      username: params.username,
      email: params.email,
      name: params.name,
      passwordHash,
      userGroupId: userGroup.id,
      state: 1,
      active: 1,
    },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      createdAt: true,
    },
  })
}

export async function validateCredentials(email?: string, username?: string, password?: string) {
  const user = await findUserByEmailOrUsername(email, username)
  if (!user?.passwordHash || !password) return null
  const valid = await verifyPassword(password, user.passwordHash)
  return valid ? user : null
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}
