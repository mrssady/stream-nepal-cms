/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/unbound-method */
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';

import { PrismaService } from '../../prisma/prisma.service';

import { OrganizationsService } from './organizations.service';

const mockOrganization = (overrides: Record<string, unknown> = {}) => ({
  id: 'org_1',
  name: 'Stream Nepal',
  slug: 'stream-nepal',
  logo: null,
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
  updatedAt: new Date('2025-01-01T00:00:00.000Z'),
  ...overrides,
});

function buildPrisma(): jest.Mocked<PrismaService> {
  const prisma = {
    organization: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
  } as unknown as jest.Mocked<PrismaService>;

  return prisma;
}

function requestWith(header?: string): Request {
  const headers: Record<string, string> = {};

  if (header) {
    headers['x-organization-id'] = header;
  }

  return { headers } as unknown as Request;
}

describe('OrganizationsService-resolve', () => {
  let service: OrganizationsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = buildPrisma();
    service = new OrganizationsService(prisma);
  });

  it('resolves the default organization by slug', async () => {
    prisma.organization.findUnique.mockResolvedValue(mockOrganization());

    await expect(service.resolveDefault()).resolves.toMatchObject({
      slug: 'stream-nepal',
    });
  });

  it('throws when the default organization is missing', async () => {
    prisma.organization.findUnique.mockResolvedValue(null);

    await expect(service.resolveDefault()).rejects.toThrow(NotFoundException);
  });

  it('uses the x-organization-id header when present', async () => {
    prisma.organization.findUnique.mockResolvedValue(
      mockOrganization({ id: 'org_2', slug: 'demo-org' }),
    );

    const result = await service.resolveRequest(requestWith('org_2'));

    expect(result.slug).toBe('demo-org');
    expect(prisma.organization.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'org_2',
      },
    });
  });

  it('falls back to the default organization without a header', async () => {
    prisma.organization.findUnique.mockResolvedValue(mockOrganization());

    const result = await service.resolveRequest(requestWith());

    expect(result.slug).toBe('stream-nepal');
  });

  it('throws when a resolved organization id does not exist', async () => {
    prisma.organization.findUnique.mockResolvedValue(null);

    await expect(service.resolveById('missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});

describe('OrganizationsService-create', () => {
  let service: OrganizationsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = buildPrisma();
    service = new OrganizationsService(prisma);
  });

  it('rejects a duplicate slug', async () => {
    prisma.organization.findUnique.mockResolvedValue(mockOrganization());

    await expect(
      service.create({
        name: 'Duplicate',
        slug: 'stream-nepal',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('creates a new organization', async () => {
    prisma.organization.findUnique.mockResolvedValue(null);
    prisma.organization.create.mockResolvedValue(
      mockOrganization({ id: 'org_3', name: 'Demo', slug: 'demo-org' }),
    );

    await expect(
      service.create({ name: 'Demo', slug: 'demo-org' }),
    ).resolves.toMatchObject({ slug: 'demo-org' });
  });
});

describe('OrganizationsService-remove', () => {
  let service: OrganizationsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = buildPrisma();
    service = new OrganizationsService(prisma);
  });

  it('blocks deletion of the default organization', async () => {
    prisma.organization.findUnique.mockResolvedValue(mockOrganization());

    await expect(service.remove('org_1')).rejects.toThrow(BadRequestException);
  });

  it('blocks deletion when users are still assigned', async () => {
    prisma.organization.findUnique.mockResolvedValue(
      mockOrganization({ slug: 'demo-org' }),
    );
    prisma.user.count.mockResolvedValue(2);

    await expect(service.remove('org_2')).rejects.toThrow(BadRequestException);
  });

  it('deletes an empty non-default organization', async () => {
    prisma.organization.findUnique.mockResolvedValue(
      mockOrganization({ slug: 'demo-org' }),
    );
    prisma.user.count.mockResolvedValue(0);
    prisma.organization.delete.mockResolvedValue(mockOrganization());

    await expect(service.remove('org_2')).resolves.toBeDefined();
    expect(prisma.organization.delete).toHaveBeenCalledWith({
      where: {
        id: 'org_2',
      },
    });
  });
});
