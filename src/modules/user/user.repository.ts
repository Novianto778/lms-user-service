import { PrismaClient, User } from '@prisma/client';
import { RegisterUser } from './user.types';
import prisma from '../../config/prisma';

export class UserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findAllAsync() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async findByIdAsync(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async findByIdsAsync(ids: string[]): Promise<User[]> {
    return await prisma.user.findMany({
      where: { id: { in: ids } },
    });
  }

  async findByEmailAsync(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async createAsync(data: RegisterUser): Promise<User> {
    return await prisma.user.create({
      data: {
        ...data,
      },
    });
  }

  async updatePassword(data: { where: { id: string }; data: { password: string } }): Promise<User> {
    return await prisma.user.update(data);
  }
}

export const userRepository = new UserRepository();
