import type {
  NewApplication,
  NewLabel,
  NewPermission,
  NewRole,
  NewRoleToPermission,
  NewUser,
  NewUserToLabel,
  NewUserToRole,
} from '../schema';

import { env } from '@/env';
import { hashPassord } from '@/server/utils/password';
import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';
import { conn, db } from '../db';
import {
  applications,
  labels,
  permissions,
  roles,
  rolesToPermissions,
  users,
  usersToLabels,
  usersToRoles,
} from '../schema';

const seedApplications = async () => {
  await db.delete(applications);

  const values = Array(20)
    .fill('')
    .map(() => ({
      name: faker.word.noun(),
      description: faker.lorem.sentences({ min: 1, max: 5 }),
      clientId: crypto.randomUUID(),
      sercretId: crypto.randomBytes(48).toString('base64url'),
      domain: faker.internet.url(),
      homeUrl: faker.internet.url(),
      loginUrl: faker.internet.url(),
      logoutUrl: faker.internet.url(),
      callbackUrl: faker.internet.url(),
    }))
    .concat([
      {
        name: 'FCF IAM (Dev)',
        description: 'Identity and access management platform (Dev ONLY)',
        clientId: crypto.randomUUID(),
        sercretId: crypto.randomBytes(48).toString('base64url'),
        domain: 'http://localhost:3000',
        homeUrl: 'http://localhost:3000',
        loginUrl: 'http://localhost:3000',
        logoutUrl: 'http://localhost:3000',
        callbackUrl: 'http://localhost:3000/api/auth/callback',
      },
      {
        name: 'FCF IAM (Prod)',
        description: 'Identity and access management platform (Prod ONLY)',
        clientId: crypto.randomUUID(),
        sercretId: crypto.randomBytes(48).toString('base64url'),
        domain: 'https://fcf-iam.brownbear.dev',
        homeUrl: 'https://fcf-iam.brownbear.dev',
        loginUrl: 'https://fcf-iam.brownbear.dev',
        logoutUrl: 'https://fcf-iam.brownbear.dev',
        callbackUrl: 'https://fcf-iam.brownbear.dev/api/auth/callback',
      },
      {
        name: 'FCF Training (Dev)',
        description:
          'Training platform to ease interactions between academies, users and admins (Dev ONLY)',
        clientId: crypto.randomUUID(),
        sercretId: crypto.randomBytes(48).toString('base64url'),
        domain: 'http://localhost:3001',
        homeUrl: 'http://localhost:3001',
        loginUrl: 'http://localhost:3001',
        logoutUrl: 'http://localhost:3001',
        callbackUrl: 'http://localhost:3001/api/auth/callback',
      },
      {
        name: 'FCF Training (Prod)',
        description:
          'Training platform to ease interactions between academies, users and admins (Prod ONLY)',
        clientId: crypto.randomUUID(),
        sercretId: crypto.randomBytes(48).toString('base64url'),
        domain: 'https://fcf-training.brownbear.dev',
        homeUrl: 'https://fcf-training.brownbear.dev',
        loginUrl: 'https://fcf-training.brownbear.dev',
        logoutUrl: 'https://fcf-training.brownbear.dev',
        callbackUrl: 'https://fcf-training.brownbear.dev/api/auth/callback',
      },
    ]) satisfies NewApplication[];

  return db.insert(applications).values(values);
};

const seedPermissions = async () => {
  await db.delete(permissions);

  const actions = ['read', 'create', 'update', 'delete'];
  const resources = [
    'customer',
    'application',
    'user',
    'role',
    'transaction',
    'notification',
    'contact',
    'product',
    'vendor',
    'store',
    'tag',
  ];

  const permissionsKeys = resources
    .map((resource) => actions.map((action) => `${action}:${resource}`))
    .flat();

  const values = (await db.select().from(applications))
    .map((application) => {
      return faker.helpers.arrayElements(permissionsKeys).map((key) => ({
        key,
        name: faker.word.noun(),
        description: faker.lorem.sentences({ min: 1, max: 5 }),
        applicationId: application.id,
      }));
    })
    .flat() satisfies NewPermission[];

  return db.insert(permissions).values(values);
};

const seedRoles = async () => {
  await db.delete(roles);

  const apps = await db.select().from(applications);

  const values = Array(25)
    .fill('')
    .map(() => ({
      name: faker.word.noun(),
      description: faker.lorem.sentences({ min: 1, max: 5 }),
      applicationId: faker.helpers.arrayElement(apps).id,
    })) satisfies NewRole[];

  return db.insert(roles).values(values);
};

const seedLabels = async () => {
  await db.delete(labels);

  const values = ['employee', 'admin', 'company', 'academy'].map((name) => ({
    name,
    description: faker.lorem.sentences(1),
  })) satisfies NewLabel[];

  return db.insert(labels).values(values);
};

const seedUsersToLabels = async () => {
  await db.delete(usersToLabels);

  const us = await db.select().from(users);
  const ls = await db.select().from(labels);

  const values = us
    .map((user) => {
      const start = Math.floor((Math.random() * ls.length) / 2);
      const end = start + ls.length / 2;
      return ls.slice(start, end).map((label) => ({
        userId: user.id,
        labelId: label.id,
      }));
    })
    .flat() satisfies NewUserToLabel[];

  return db.insert(usersToLabels).values(values);
};

const seedUsers = async () => {
  await db.delete(users);

  const passwordHash = await hashPassord('pass123!');

  const values = Array(100)
    .fill('')
    .map(() => ({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      middleName: faker.person.middleName(),
      email: faker.internet.email(),
      password: passwordHash,
      phone: faker.phone.number().trim().replaceAll('.', '').slice(0, 15),
      isActive: true,
      isAdmin: false,
      isSuperAdmin: false,
    }))
    .concat([
      {
        firstName: 'Pedro',
        lastName: 'Medina',
        middleName: 'Pablo',
        email: 'pedrodelilia@gmail.com',
        password: passwordHash,
        phone: faker.phone.number().trim().replaceAll('.', '').slice(0, 15),
        isActive: true,
        isAdmin: true,
        isSuperAdmin: true,
      },
      {
        firstName: 'Carlos',
        lastName: 'Sanchez',
        middleName: '',
        email: 'carlosjosesancheze@gmail.com',
        password: passwordHash,
        phone: faker.phone.number().trim().replaceAll('.', '').slice(0, 15),
        isActive: true,
        isAdmin: true,
        isSuperAdmin: true,
      },
    ]) satisfies NewUser[];

  return db.insert(users).values(values);
};

const seedRolesToPermissions = async () => {
  await db.delete(rolesToPermissions);

  const values = (
    await Promise.all(
      (await db.select().from(roles)).map(async (role) => {
        // Get all permissions related to that role's application
        const appPermissions = await db
          .select()
          .from(permissions)
          .where(eq(permissions.applicationId, role.applicationId));

        return faker.helpers.arrayElements(appPermissions).map((permission) => ({
          roleId: role.id,
          permissionId: permission.id,
        }));
      })
    )
  ).flat() satisfies NewRoleToPermission[];

  return db.insert(rolesToPermissions).values(values);
};

const seedUsersToRoles = async () => {
  await db.delete(usersToRoles);

  const us = await db.select().from(users);
  const rs = await db.select().from(roles);

  const values = us
    .map((user) => {
      const start = Math.floor((Math.random() * rs.length) / 2);
      const end = start + rs.length / 2;
      return rs.slice(start, end).map((role) => ({
        userId: user.id,
        roleId: role.id,
      }));
    })
    .flat() satisfies NewUserToRole[];

  return db.insert(usersToRoles).values(values);
};

async function seed() {
  if (env.NODE_ENV !== 'development') {
    throw new Error('Seeder is a `dev` only script meant for mocking data.');
  }

  console.log('Seeding...');

  await seedApplications();
  await seedPermissions();
  await seedRoles();
  await seedRolesToPermissions();
  await seedUsers();
  await seedLabels();
  await seedUsersToRoles();
  await seedUsersToLabels();
}

seed()
  .catch((e) => {
    console.error(e);
    conn.end();
    process.exit(1);
  })
  .finally(() => {
    console.log('Seeding done!');
    conn.end();
    process.exit(0);
  });
